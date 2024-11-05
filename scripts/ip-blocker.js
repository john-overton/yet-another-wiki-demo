const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');

// Configuration
const CONFIG = {
    BLOCKED_IPS_FILE: path.join(__dirname, '../nginx/conf.d/blocked_ips.conf'),
    NGINX_ACCESS_LOG: '/var/log/nginx/access.log',
    THRESHOLDS: {
        FAILED_LOGINS: 5,        // Number of failed login attempts before blocking
        RATE_LIMIT_HITS: 10,     // Number of rate limit hits before blocking
        TIME_WINDOW: 5 * 60000,  // 5 minutes in milliseconds
        BLOCK_DURATION: 24 * 60 * 60000 // 24 hours in milliseconds
    }
};

// Store suspicious activity in memory
const suspiciousIPs = new Map();
const blockedIPs = new Set();

async function loadExistingBlockedIPs() {
    try {
        const content = await fs.readFile(CONFIG.BLOCKED_IPS_FILE, 'utf8');
        const ipRegex = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\s+1;/gm;
        let match;
        while ((match = ipRegex.exec(content)) !== null) {
            blockedIPs.add(match[1]);
        }
    } catch (error) {
        console.error('Error loading blocked IPs:', error);
    }
}

async function blockIP(ip) {
    if (blockedIPs.has(ip)) return;

    try {
        const content = `${ip} 1;\n`;
        await fs.appendFile(CONFIG.BLOCKED_IPS_FILE, content);
        blockedIPs.add(ip);
        
        // Reload Nginx configuration
        exec('docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload', (error) => {
            if (error) {
                console.error('Error reloading Nginx:', error);
            } else {
                console.log(`Successfully blocked IP: ${ip}`);
            }
        });
    } catch (error) {
        console.error('Error blocking IP:', error);
    }
}

function recordSuspiciousActivity(ip, type) {
    const now = Date.now();
    
    if (!suspiciousIPs.has(ip)) {
        suspiciousIPs.set(ip, {
            failedLogins: 0,
            rateLimitHits: 0,
            firstSeen: now,
            lastSeen: now
        });
    }

    const record = suspiciousIPs.get(ip);
    record.lastSeen = now;

    // Update counts based on activity type
    if (type === 'failed_login') {
        record.failedLogins++;
    } else if (type === 'rate_limit') {
        record.rateLimitHits++;
    }

    // Check if IP should be blocked
    if (shouldBlockIP(record)) {
        blockIP(ip);
        suspiciousIPs.delete(ip);
    }
}

function shouldBlockIP(record) {
    const now = Date.now();
    const timeWindow = now - record.firstSeen;

    // Only consider activities within the configured time window
    if (timeWindow <= CONFIG.THRESHOLDS.TIME_WINDOW) {
        return record.failedLogins >= CONFIG.THRESHOLDS.FAILED_LOGINS ||
               record.rateLimitHits >= CONFIG.THRESHOLDS.RATE_LIMIT_HITS;
    }

    // Reset record if outside time window
    record.failedLogins = 0;
    record.rateLimitHits = 0;
    record.firstSeen = now;
    return false;
}

async function cleanupOldBlocks() {
    try {
        const content = await fs.readFile(CONFIG.BLOCKED_IPS_FILE, 'utf8');
        const lines = content.split('\n');
        const now = Date.now();
        
        // Filter out comments and empty lines, keep track of timestamps
        const activeBlocks = lines.filter(line => {
            if (line.trim().startsWith('#') || !line.trim()) return true;
            
            const [ip, timestamp] = line.split('#').map(s => s.trim());
            if (!timestamp) return true;
            
            const blockTime = parseInt(timestamp);
            return !isNaN(blockTime) && (now - blockTime) < CONFIG.THRESHOLDS.BLOCK_DURATION;
        });

        await fs.writeFile(CONFIG.BLOCKED_IPS_FILE, activeBlocks.join('\n'));
        
        // Reload Nginx after cleanup
        exec('docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload');
    } catch (error) {
        console.error('Error cleaning up old blocks:', error);
    }
}

// Example usage in your Next.js API route for failed logins
async function handleFailedLogin(req, res) {
    const ip = req.headers['x-real-ip'] || req.connection.remoteAddress;
    recordSuspiciousActivity(ip, 'failed_login');
    // ... rest of your login failure handling
}

// Initialize and run periodic cleanup
async function initialize() {
    await loadExistingBlockedIPs();
    
    // Run cleanup every hour
    setInterval(cleanupOldBlocks, 60 * 60000);
    
    // Log initialization
    console.log('IP Blocker initialized with configuration:', {
        ...CONFIG.THRESHOLDS,
        CURRENT_BLOCKED_IPS: blockedIPs.size
    });
}

module.exports = {
    recordSuspiciousActivity,
    handleFailedLogin,
    initialize
};
