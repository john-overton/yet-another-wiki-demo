const fs = require('fs').promises;
const crypto = require('crypto');
const { spawn } = require('child_process');
const path = require('path');

async function generateNextAuthSecret() {
    return crypto.randomBytes(32).toString('base64');
}

async function createEnvFile() {
    try {
        await fs.access('.env');
        console.log('.env file already exists');
    } catch {
        const secret = await generateNextAuthSecret();
        const envContent = `NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET="${secret}"
DATABASE_URL="file:../db/yetanotherwiki.db"`;
        
        await fs.writeFile('.env', envContent);
        console.log('.env file created successfully');
    }
}

function runCommand(command, args) {
    return new Promise((resolve, reject) => {
        const proc = spawn(command, args, {
            stdio: 'inherit',
            shell: true
        });

        proc.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command failed with code ${code}`));
            }
        });
    });
}

async function setupDatabase() {
    try {
        console.log('Setting up database...');
        
        // Ensure db directory exists
        await fs.mkdir('db', { recursive: true });
        
        try {
            // Try to delete the existing Prisma client if it exists
            await fs.rm('node_modules/.prisma', { recursive: true, force: true });
        } catch (error) {
            // Ignore errors if directory doesn't exist
        }
        
        // Generate Prisma Client
        console.log('Generating Prisma Client...');
        await runCommand('npx', ['prisma', 'generate']);
        
        // Run migrations
        console.log('Running database migrations...');
        await runCommand('npx', ['prisma', 'migrate', 'deploy']);
        
        // Seed the database
        console.log('Seeding database with secret questions...');
        await runCommand('node', ['prisma/seed.js']);
        
        console.log('Database setup completed successfully');
    } catch (error) {
        console.error('Database setup failed:', error);
        throw error;
    }
}

async function setup() {
    try {
        console.log('Starting setup process...');
        await createEnvFile();
        await setupDatabase();
        console.log('Setup completed successfully');
    } catch (error) {
        console.error('Setup failed:', error);
        process.exit(1);
    }
}

setup();