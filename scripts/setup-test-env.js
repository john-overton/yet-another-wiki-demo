const { execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

const TEST_USER = {
    email: 'test@example.com',
    password: 'test123',
    name: 'Test User',
    role: 'Admin',
    auth_type: 'credentials',
    is_active: true,
    active: 1,
    voting_rights: true
};

async function ensureNginxConfig() {
    const nginxDir = path.join(__dirname, '../nginx/conf.d');
    const blockedIpsPath = path.join(nginxDir, 'blocked_ips.conf');

    try {
        await fs.access(nginxDir);
    } catch {
        await fs.mkdir(nginxDir, { recursive: true });
    }

    try {
        await fs.access(blockedIpsPath);
    } catch {
        await fs.writeFile(blockedIpsPath, '# Blocked IPs\n');
    }

    console.log('✓ Nginx configuration files ready');
}

async function createEnvFile() {
    const envContent = `NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET="${Buffer.from(Math.random().toString()).toString('base64')}"
DATABASE_URL="file:../db/yetanotherwiki.db"`;

    await fs.writeFile(path.join(__dirname, '../.env'), envContent);
    console.log('✓ Created .env file');
}

async function setupDatabase() {
    try {
        // Ensure db directory exists
        const dbDir = path.join(__dirname, '../db');
        try {
            await fs.access(dbDir);
        } catch {
            await fs.mkdir(dbDir);
        }

        // Run migrations
        console.log('Running database migrations...');
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
        
        // Generate Prisma client
        console.log('Generating Prisma client...');
        execSync('npx prisma generate', { stdio: 'inherit' });

        // Create test user
        console.log('Creating test user...');
        const hashedPassword = await bcrypt.hash(TEST_USER.password, 10);
        
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        try {
            // Check if user exists
            const existingUser = await prisma.user.findUnique({
                where: { email: TEST_USER.email }
            });

            if (existingUser) {
                console.log('✓ Test user already exists');
            } else {
                const user = await prisma.user.create({
                    data: {
                        ...TEST_USER,
                        password: hashedPassword,
                        created_at: new Date(),
                        updated_at: new Date()
                    }
                });

                console.log('✓ Test user created:', {
                    id: user.id,
                    email: user.email,
                    role: user.role
                });
            }

            // Seed secret questions
            console.log('Seeding secret questions...');
            execSync('node prisma/seed.js', { stdio: 'inherit' });
            
            console.log('✓ Database setup completed');
        } finally {
            // Always disconnect from the database
            await prisma.$disconnect();
        }
    } catch (error) {
        console.error('Database setup failed:', error);
        throw error;
    }
}

async function setupTestEnvironment() {
    console.log('🔧 Setting up test environment...\n');

    try {
        // Create .env file first
        await createEnvFile();

        // Setup database and create test user
        await setupDatabase();

        // Setup Nginx configuration
        await ensureNginxConfig();

        console.log('\n✨ Test environment setup complete!');
        console.log('\nTest Credentials:');
        console.log('----------------');
        console.log(`Email: ${TEST_USER.email}`);
        console.log(`Password: ${TEST_USER.password}`);
        console.log('\nYou can now run the tests using:');
        console.log('pnpm test:auth');

    } catch (error) {
        console.error('\n❌ Test environment setup failed:', error);
        process.exit(1);
    }
}

// Run setup
setupTestEnvironment().catch(console.error);