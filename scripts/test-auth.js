const fetch = require('node-fetch');
const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

const CONFIG = {
    BASE_URL: 'http://localhost:3000',
    TEST_USER: {
        email: 'test@example.com',
        password: 'test123'
    },
    BLOCKED_IPS_FILE: path.join(__dirname, '../nginx/conf.d/blocked_ips.conf')
};

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function startServer() {
    console.log('Starting Next.js development server...');
    
    return new Promise((resolve, reject) => {
        const server = spawn('pnpm', ['dev'], {
            stdio: ['ignore', 'pipe', 'pipe'],
            shell: true
        });

        let ready = false;
        let output = '';

        server.stdout.on('data', (data) => {
            const text = data.toString();
            output += text;
            process.stdout.write(text);

            if (!ready && (
                text.includes('ready started server') || 
                text.includes('Ready in') ||
                text.includes('Local:')
            )) {
                ready = true;
                resolve(server);
            }
        });

        server.stderr.on('data', (data) => {
            const text = data.toString();
            if (!text.includes('NEXT_REDIRECT')) {
                process.stderr.write(text);
            }
        });

        server.on('error', (err) => {
            reject(err);
        });

        const timeout = setTimeout(() => {
            if (!ready) {
                server.kill();
                reject(new Error('Server failed to start within timeout'));
            }
        }, 30000);

        server.once('ready', () => {
            clearTimeout(timeout);
        });
    });
}

async function checkBlockedIPs() {
    try {
        const content = await fs.readFile(CONFIG.BLOCKED_IPS_FILE, 'utf8');
        const blockedIPs = content.split('\n')
            .filter(line => !line.startsWith('#') && line.trim())
            .map(line => line.split(' ')[0]);
        return blockedIPs;
    } catch (error) {
        console.error('Error reading blocked IPs:', error);
        return [];
    }
}

async function attemptLogin(credentials, attempt = 1) {
    try {
        const response = await fetch(`${CONFIG.BASE_URL}/api/auth/callback/credentials`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Real-IP': '192.168.1.1' // Test IP
            },
            body: JSON.stringify(credentials)
        });

        const result = {
            status: response.status,
            success: response.ok,
            attempt,
            blocked: response.status === 403
        };

        if (!response.ok) {
            const text = await response.text();
            console.log(`Response for attempt ${attempt}:`, text);
        }

        return result;
    } catch (error) {
        console.error(`Login attempt ${attempt} failed:`, error);
        return {
            status: 500,
            success: false,
            attempt,
            error: error.message,
            blocked: false
        };
    }
}

async function testFailedLoginBlocking() {
    console.log('\n🔒 Testing failed login IP blocking...');
    
    const initialBlockedIPs = await checkBlockedIPs();
    console.log(`Initial blocked IPs: ${initialBlockedIPs.length}`);

    // Attempt multiple failed logins
    const attempts = [];
    for (let i = 1; i <= 6; i++) {
        const result = await attemptLogin({
            email: 'wrong@example.com',
            password: 'wrongpass'
        }, i);
        
        attempts.push(result);
        console.log(`Attempt ${i}: Status ${result.status}`);
        
        if (result.blocked) {
            console.log('✓ IP was blocked after failed attempts');
            break;
        }

        await delay(1000); // Wait between attempts
    }

    // Check if any attempts were blocked
    const wasBlocked = attempts.some(attempt => attempt.blocked);
    
    console.log('\nResults:');
    console.log(`✓ Failed login attempts: ${attempts.length}`);
    console.log(`✓ IP was blocked: ${wasBlocked}`);
    console.log(`✓ Total blocked IPs: ${initialBlockedIPs.length}`);

    return wasBlocked;
}

async function testRateLimiting() {
    console.log('\n🚦 Testing rate limiting...');
    
    const requests = [];
    for (let i = 1; i <= 15; i++) {
        try {
            const start = Date.now();
            const response = await fetch(`${CONFIG.BASE_URL}/api/auth/signin`, {
                headers: {
                    'X-Real-IP': '192.168.1.2' // Different test IP
                }
            });
            const duration = Date.now() - start;

            const result = {
                attempt: i,
                status: response.status,
                duration,
                rateLimited: response.status === 429
            };

            requests.push(result);

            console.log(`Request ${i}: Status ${response.status}, Duration: ${duration}ms`);
            
            if (result.rateLimited) {
                console.log('✓ Rate limiting detected');
                break;
            }

            await delay(100); // Small delay between requests
        } catch (error) {
            console.error(`Request ${i} failed:`, error);
        }
    }

    const rateLimited = requests.some(r => r.rateLimited);
    console.log(`\n✓ Rate limiting active: ${rateLimited}`);

    return rateLimited;
}

async function testSuccessfulLogin() {
    console.log('\n🔑 Testing successful login...');
    
    const result = await attemptLogin(CONFIG.TEST_USER);
    
    console.log(`✓ Login status: ${result.status}`);
    console.log(`✓ Login successful: ${result.success}`);

    return result.success;
}

async function waitForServer() {
    console.log('Waiting for server to be ready...');
    for (let i = 0; i < 30; i++) {
        try {
            const response = await fetch(CONFIG.BASE_URL);
            if (response.ok || response.status === 307) {
                console.log('✓ Server is responding');
                return true;
            }
        } catch (error) {
            await delay(1000);
        }
    }
    throw new Error('Server failed to respond within timeout');
}

async function runTests() {
    console.log('🧪 Starting authentication and security tests...\n');
    let server;

    try {
        // Start the server
        server = await startServer();
        
        // Wait for server to be ready
        await waitForServer();

        // Test successful login
        const loginSuccess = await testSuccessfulLogin();
        
        // Test failed login blocking
        const blockingWorks = await testFailedLoginBlocking();
        
        // Test rate limiting
        const rateLimitingWorks = await testRateLimiting();

        console.log('\n📊 Test Summary:');
        console.log('================');
        console.log(`✓ Authentication: ${loginSuccess ? 'PASSED' : 'FAILED'}`);
        console.log(`✓ IP Blocking: ${blockingWorks ? 'PASSED' : 'FAILED'}`);
        console.log(`✓ Rate Limiting: ${rateLimitingWorks ? 'PASSED' : 'FAILED'}`);
        
        const overallSuccess = loginSuccess && blockingWorks && rateLimitingWorks;
        console.log(`\n🎯 Overall Result: ${overallSuccess ? 'PASSED' : 'FAILED'}`);

    } catch (error) {
        console.error('\n❌ Test execution failed:', error);
    } finally {
        if (server) {
            console.log('\nShutting down server...');
            // Kill the entire process tree
            process.platform === 'win32' ? 
                spawn('taskkill', ['/pid', server.pid, '/f', '/t']) :
                process.kill(-server.pid);
        }
    }
}

// Run the tests
runTests().catch(console.error);
