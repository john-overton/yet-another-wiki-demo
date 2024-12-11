#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Configuration
const CONFIG = {
    APP_NAME: 'yet-another-wiki',
    PM2_APP_NAME: 'yaw-prod',
    NGINX_SITES_PATH: '/etc/nginx/conf.d',
    CERTBOT_PATH: '/var/www/certbot',
    DB_PATH: 'db',
    ENV_FILE: '.env.production'
};

async function generateProductionEnv(domain) {
    console.log('Generating production environment file...');
    const secret = crypto.randomBytes(32).toString('base64');
    const envContent = `NEXTAUTH_URL=https://${domain}
NEXTAUTH_SECRET="${secret}"
DATABASE_URL="file:../db/yetanotherwiki.db"
NODE_ENV=production`;

    await fs.writeFile(CONFIG.ENV_FILE, envContent);
    console.log('✓ Production environment file created');
}

async function setupSSL(domain) {
    console.log('\nSetting up SSL certificates...');
    try {
        // Ensure certbot directory exists
        await fs.mkdir(CONFIG.CERTBOT_PATH, { recursive: true });

        // Check if certificates already exist
        const certPath = `/etc/letsencrypt/live/${domain}/fullchain.pem`;
        try {
            await fs.access(certPath);
            console.log('✓ SSL certificates already exist');
        } catch {
            // Generate new certificates
            console.log('Generating new SSL certificates...');
            execSync(`certbot certonly --webroot -w ${CONFIG.CERTBOT_PATH} -d ${domain} --agree-tos -m admin@${domain} --non-interactive`, { stdio: 'inherit' });
            console.log('✓ SSL certificates generated');
        }
    } catch (error) {
        console.error('Error setting up SSL:', error);
        throw error;
    }
}

async function setupNginx(domain) {
    console.log('\nSetting up Nginx configuration...');
    try {
        // Copy Nginx configuration
        const nginxConfigPath = path.join(CONFIG.NGINX_SITES_PATH, 'app.conf');
        const nginxConfig = await fs.readFile(path.join(__dirname, '../nginx/conf.d/app.conf'), 'utf8');
        
        // Replace domain placeholder
        const updatedConfig = nginxConfig.replace(/yourdomain\.com/g, domain);
        
        await fs.writeFile(nginxConfigPath, updatedConfig);
        console.log('✓ Nginx configuration updated');

        // Test Nginx configuration
        execSync('nginx -t', { stdio: 'inherit' });
        console.log('✓ Nginx configuration test passed');

        // Reload Nginx
        execSync('systemctl reload nginx', { stdio: 'inherit' });
        console.log('✓ Nginx reloaded');
    } catch (error) {
        console.error('Error setting up Nginx:', error);
        throw error;
    }
}

async function setupDatabase() {
    console.log('\nSetting up database...');
    try {
        // Ensure database directory exists
        await fs.mkdir(CONFIG.DB_PATH, { recursive: true });

        // Run database migrations
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
        console.log('✓ Database migrations applied');

        // Generate Prisma client
        execSync('npx prisma generate', { stdio: 'inherit' });
        console.log('✓ Prisma client generated');

        // Run database seeds if needed
        execSync('node prisma/seed.js', { stdio: 'inherit' });
        console.log('✓ Database seeded');
    } catch (error) {
        console.error('Error setting up database:', error);
        throw error;
    }
}

async function buildApplication() {
    console.log('\nBuilding application...');
    try {
        // Install production dependencies
        execSync('pnpm install --production', { stdio: 'inherit' });
        console.log('✓ Production dependencies installed');

        // Build Next.js application
        execSync('pnpm build', { stdio: 'inherit' });
        console.log('✓ Application built');
    } catch (error) {
        console.error('Error building application:', error);
        throw error;
    }
}

async function setupPM2() {
    console.log('\nSetting up PM2 process manager...');
    try {
        // Check if PM2 is installed globally
        try {
            execSync('pm2 --version');
        } catch {
            console.log('Installing PM2...');
            execSync('npm install -g pm2', { stdio: 'inherit' });
        }

        // Stop existing process if running
        try {
            execSync(`pm2 stop ${CONFIG.PM2_APP_NAME}`);
            execSync(`pm2 delete ${CONFIG.PM2_APP_NAME}`);
        } catch {
            // Process might not exist, continue
        }

        // Start application with PM2
        execSync(`pm2 start npm --name "${CONFIG.PM2_APP_NAME}" -- start`, { stdio: 'inherit' });
        console.log('✓ Application started with PM2');

        // Save PM2 process list
        execSync('pm2 save', { stdio: 'inherit' });
        console.log('✓ PM2 process list saved');

        // Setup PM2 startup script
        execSync('pm2 startup', { stdio: 'inherit' });
        console.log('✓ PM2 startup script installed');
    } catch (error) {
        console.error('Error setting up PM2:', error);
        throw error;
    }
}

async function deploy(domain) {
    console.log('🚀 Starting production deployment...\n');

    try {
        // Generate production environment file
        await generateProductionEnv(domain);

        // Setup SSL certificates
        await setupSSL(domain);

        // Setup Nginx
        await setupNginx(domain);

        // Setup database
        await setupDatabase();

        // Build application
        await buildApplication();

        // Setup PM2
        await setupPM2();

        console.log('\n✨ Deployment completed successfully!');
        console.log(`\nYour application is now running at https://${domain}`);
        console.log('\nTo monitor the application:');
        console.log('- PM2 status: pm2 status');
        console.log('- PM2 logs: pm2 logs');
        console.log('- Nginx logs: tail -f /var/log/nginx/access.log');
    } catch (error) {
        console.error('\n❌ Deployment failed:', error);
        process.exit(1);
    }
}

// Check if domain argument is provided
const domain = process.argv[2];
if (!domain) {
    console.error('Please provide a domain name:');
    console.error('node deploy-prod.js yourdomain.com');
    process.exit(1);
}

// Run deployment
deploy(domain).catch(console.error);
