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

async function createConfigFiles() {
    const configDir = 'config/settings';
    
    try {
        await fs.access(configDir);
    } catch {
        await fs.mkdir(configDir, { recursive: true });
    }

    // Create licensing.json if it doesn't exist
    try {
        await fs.access(`${configDir}/licensing.json`);
        console.log('licensing.json already exists');
    } catch {
        const licensingContent = {
            email: "",
            key: "",
            isValid: false,
            token: "",
            licenseType: "",
            lastVerified: "",
            lastCheck: ""
        };
        await fs.writeFile(`${configDir}/licensing.json`, JSON.stringify(licensingContent, null, 2));
        console.log('licensing.json created successfully');
    }

    // Create theming.json if it doesn't exist
    try {
        await fs.access(`${configDir}/theming.json`);
        console.log('theming.json already exists');
    } catch {
        const themingContent = {
            font: "Open Sans",
            theme: "light",
            headerLogo: "",
            footerLogo: "",
            links: [
                {
                    text: "Home",
                    hoverText: "Home",
                    url: "http://localhost:3000",
                    id: Date.now(),
                    newTab: false
                }
            ],
            footerLinks: {
                column1: {
                    header: "Documentation",
                    links: [
                        {
                            text: "Documentation",
                            hoverText: "View Documentation",
                            url: "/docs",
                            id: Date.now() + 1,
                            newTab: false
                        },
                        {
                            text: "Getting Started",
                            hoverText: "Get Started Guide",
                            url: "/docs/getting-started",
                            id: Date.now() + 2,
                            newTab: false
                        }
                    ]
                },
                column2: {
                    header: "Support",
                    links: [
                        {
                            text: "Support",
                            hoverText: "Get Help",
                            url: "/support",
                            id: Date.now() + 3,
                            newTab: false
                        }
                    ]
                }
            },
            footerSettings: {
                customCopyrightText: "",
                hidePoweredByText: false
            }
        };
        await fs.writeFile(`${configDir}/theming.json`, JSON.stringify(themingContent, null, 2));
        console.log('theming.json created successfully');
    }

    // Create generalsettings.json if it doesn't exist
    try {
        await fs.access(`${configDir}/generalsettings.json`);
        console.log('generalsettings.json already exists');
    } catch {
        const generalSettingsContent = {
            preventUserRegistration: false
        };
        await fs.writeFile(`${configDir}/generalsettings.json`, JSON.stringify(generalSettingsContent, null, 2));
        console.log('generalsettings.json created successfully');
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function runCommand(command, args, retries = 3, delay = 1000) {
    return new Promise(async (resolve, reject) => {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const proc = spawn(command, args, {
                    stdio: 'inherit',
                    shell: true
                });

                await new Promise((res, rej) => {
                    proc.on('close', (code) => {
                        if (code === 0) {
                            res();
                        } else {
                            rej(new Error(`Command failed with code ${code}`));
                        }
                    });
                });

                return resolve();
            } catch (error) {
                if (attempt === retries) {
                    return reject(error);
                }
                console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
                await sleep(delay);
            }
        }
    });
}

async function cleanPrismaClient() {
    const prismaClientPath = path.join('node_modules', '.prisma', 'client');
    try {
        const exists = await fs.access(prismaClientPath).then(() => true).catch(() => false);
        if (exists) {
            // Instead of deleting, try renaming first
            const tempPath = path.join('node_modules', '.prisma', `client_${Date.now()}`);
            await fs.rename(prismaClientPath, tempPath);
            // Then delete the renamed directory
            await fs.rm(tempPath, { recursive: true, force: true }).catch(() => {});
        }
    } catch (error) {
        console.log('Note: Could not clean Prisma client, continuing anyway...');
    }
}

async function setupDatabase() {
    try {
        console.log('Checking database status...');
        
        // Check if database file exists
        try {
            await fs.access('db/yetanotherwiki.db');
            console.log('Database already exists, skipping database setup');
            return;
        } catch {
            console.log('Database not found, proceeding with setup...');
        }
        
        // Ensure db directory exists
        await fs.mkdir('db', { recursive: true });
        
        // Clean up Prisma client
        await cleanPrismaClient();
        
        // Create initial migration if it doesn't exist
        console.log('Creating initial migration...');
        try {
            await fs.access('prisma/migrations');
        } catch {
            await runCommand('npx', ['prisma', 'migrate', 'dev', '--name', 'init', '--create-only']);
        }
        
        // Generate Prisma Client with retries
        console.log('Generating Prisma Client...');
        await runCommand('npx', ['prisma', 'generate'], 3, 1000);
        
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
        await createConfigFiles();
        await setupDatabase();
        console.log('Setup completed successfully');
    } catch (error) {
        console.error('Setup failed:', error);
        process.exit(1);
    }
}

setup();
