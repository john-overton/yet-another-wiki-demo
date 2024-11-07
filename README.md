# Yet Another Wiki

A Next.js-based wiki application with advanced features including authentication, rate limiting, and security protections.

## System Requirements

- Node.js 18.x or later
- PNPM package manager
- Linux server for production deployment
- Nginx web server
- Certbot for SSL certificates
- PM2 process manager (installed automatically during deployment)

## Development Setup

First, install dependencies:

```bash
pnpm install
```

Then, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Production Deployment

### Prerequisites

1. A Linux server with:
   - Node.js 18.x or later installed
   - Nginx installed and running
   - Certbot installed for SSL certificates
   - Git for cloning the repository

2. A domain name pointed to your server's IP address

### Deployment Steps

1. Clone the repository:
```bash
git clone https://github.com/yourusername/yet-another-wiki.git
cd yet-another-wiki
```

2. Install PNPM if not already installed:
```bash
npm install -g pnpm
```

3. Run the production deployment script:
```bash
node scripts/deploy-prod.js yourdomain.com
```

The deployment script will:
- Generate production environment configuration
- Set up SSL certificates using Let's Encrypt
- Configure Nginx with security best practices
- Set up the database and run migrations
- Build and start the application using PM2

### Post-Deployment

Monitor your application:
- Check PM2 status: `pm2 status`
- View PM2 logs: `pm2 logs`
- View Nginx access logs: `tail -f /var/log/nginx/access.log`
- View Nginx error logs: `tail -f /var/log/nginx/error.log`

### Security Features

The application includes several security features:
- Rate limiting for API and regular endpoints
- IP blocking for repeated failed login attempts
- SSL/TLS configuration with modern cipher suites
- Security headers including HSTS, CSP, and XSS protection
- Request body size limits and timeout configurations

### Configuration

Key configuration files:
- `.env.production`: Environment variables
- `nginx/conf.d/app.conf`: Nginx configuration
- `config/settings/`: Application settings

### Troubleshooting

1. SSL Certificate Issues:
   - Verify domain DNS settings
   - Check Certbot logs: `journalctl -u certbot`
   - Ensure ports 80/443 are open

2. Database Issues:
   - Check database migrations: `npx prisma migrate status`
   - Verify database file permissions
   - Check Prisma logs

3. Application Not Starting:
   - Check PM2 logs: `pm2 logs`
   - Verify environment variables
   - Check Node.js version compatibility

4. Nginx Issues:
   - Test configuration: `nginx -t`
   - Check error logs: `tail -f /var/log/nginx/error.log`
   - Verify permissions on config files

## Testing

Run the test suite:

```bash
# Set up test environment
node scripts/setup-test-env.js

# Run authentication tests
node scripts/test-auth.js

# Clean up test environment
node scripts/cleanup-test-env.js
```

## License

[MIT License](LICENSE)

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [NextAuth.js Documentation](https://next-auth.js.org)
