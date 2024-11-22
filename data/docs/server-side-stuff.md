# Server Side Stuff

This document explains the server-side components of Yet Another Wiki, focusing on key directories and their purposes.

## Key Directories

### /app Directory

The `/app` directory is the heart of the Next.js application, using the App Router pattern. Here's what you'll find:

* `/api`: Contains all API route handlers for backend functionality
  * `/auth`: Authentication-related endpoints (login, register, password reset)
  * `/backup`: Backup and restore functionality
  * `/content`: Content management endpoints
  * `/users`: User management endpoints
* `/components`: React components (some have server-side functionality)
* `/utils`: Utility functions used throughout the application
* `middleware.ts`: Server-side middleware for request handling

### /data Directory

The `/data` directory stores the wiki's content and assets:

* `/content`: Stores wiki content and theming data
* `/docs`: Documentation markdown files
* `/uploads`: User-uploaded files
  * `/post-images`: Images used in wiki posts
  * `/user-avatars`: User profile pictures

### /db Directory

The `/db` directory contains the SQLite database:

* `yetanotherwiki.db`: Main database file

### /public Directory

The `/public` directory contains static assets:

* `/static`: Static files like fonts, icons, and images
  * `/fonts`: Custom fonts
  * `/icons`: Icon assets
  * `/images`: Static images

### /scripts Directory

The `/scripts` directory contains important server management scripts:

* `setup.js`: Initial application setup
* `deploy.sh`: Deployment script
* `deploy-prod.js`: Production deployment configuration
* `setup-docker.sh`: Docker environment setup
* `setup-system.sh`: System environment setup
* `ip-blocker.js`: IP blocking functionality
* `license-checker.js`: License validation
* Various test scripts for auth and user management

## Key Server Components

### Middleware (middleware.ts)

The middleware handles critical server-side operations:

* Rate limiting (300 requests per minute per IP)
* IP blocking for security
* Failed login attempt tracking
* License validation
* Session management

:::danger
Unlikely, but if your local computer\IP gets blocked you will see a 403 error when visiting the application in a browser.  Edit the **nginx\conf.d\blocked\_ips.conf** within the application folder to remove the IP address entry if you get blocked by mistake.
:::

Features:

* Blocks IPs after 15 failed login attempts
* 24-hour blocking duration
* Periodic license checking
* NextAuth session handling

### Database

The application uses SQLite with Prisma as the ORM:

* Easy to backup (just copy the .db file)
* No separate database server needed
* File-based storage in `/db` directory

### Security Features

* Rate limiting to prevent abuse
* IP blocking for suspicious activity
* Secure session handling
* Environment variable based configuration
* CSRF protection

### Deployment Options

Two deployment methods are supported:

1. Docker Deployment (Recommended)
   * Uses docker-compose
   * Includes Nginx configuration
   * Automatic SSL certificate management
   * Easy container management
2. Traditional Deployment
   * Direct system installation
   * Manual service management
   * More control over the setup
   * Requires more system administration

## Environment Configuration

The application uses `.env` file for configuration:

* `NEXTAUTH_URL`: Application URL
* `NEXTAUTH_SECRET`: Session encryption key (unique to your instance)
* `DATABASE_URL`: SQLite database path

## Troubleshooting

### Common Issues

1. Database Access
   * Check file permissions on `/db` directory
   * Verify database file exists
   * Check SQLite file permissions
2. Upload Issues
   * Verify `/data/uploads` permissions
   * Check disk space
   * Verify Nginx upload size limits
3. Authentication Problems
   * Check `.env` configuration
   * Verify NextAuth setup
   * Check database connectivity