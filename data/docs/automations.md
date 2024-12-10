# Setting Up Yet Another Wiki as a Linux Service

## Prerequisites

* Linux system with systemd
* sudo privileges
* Node.js and pnpm installed
* Next.js project deployed

## Service Configuration

### 1. Create Service File

Create a new systemd service file:

```shell
sudo nano /etc/systemd/system/yetanotherwiki.service
```

Add the following content:

```text
[Unit]
Description=Yet Another Wiki Service
After=network.target

[Service]
Type=simple
User=<your_user>
WorkingDirectory=<path>
ExecStart=/usr/bin/pnpm next start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PATH=/usr/bin:/usr/local/bin
StandardOutput=append:/var/log/yetanotherwiki.log
StandardError=append:/var/log/yetanotherwiki.error.log

[Install]
WantedBy=multi-user.target
```

Replace:

* `<your_user>` with your Linux username
* `<path>` with your Next.js project path

### 2. Set Permissions

```shell
sudo chmod 644 /etc/systemd/system/yetanotherwiki.service
```

### 3. Create Log Files

```shell
sudo touch /var/log/yetanotherwiki.log /var/log/yetanotherwiki.error.log
sudo chown <your_user>:<your_user> /var/log/yetanotherwiki.log /var/log/yetanotherwiki.error.log
```

### 4. Enable and Start Service

```shell
# Reload systemd to recognize new service
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable yetanotherwiki

# Start the service
sudo systemctl start yetanotherwiki
```

## Service Management

### Status and Monitoring

```shell
# Check service status
sudo systemctl status yetanotherwiki

# View service logs
sudo journalctl -u yetanotherwiki

# View application logs
tail -f /var/log/yetanotherwiki.log
tail -f /var/log/yetanotherwiki.error.log
```

### Control Commands

```shell
# Stop service
sudo systemctl stop yetanotherwiki

# Restart service
sudo systemctl restart yetanotherwiki

# Reload service configuration
sudo systemctl reload yetanotherwiki
```

### Removing the Service

```shell
# Stop the service
sudo systemctl stop yetanotherwiki

# Disable service from starting on boot
sudo systemctl disable yetanotherwiki

# Remove service file
sudo rm /etc/systemd/system/yetanotherwiki.service

# Reload systemd
sudo systemctl daemon-reload
```

## Troubleshooting

### Common Issues

1. **Service Won't Start**
   * Check logs: `sudo journalctl -u yetanotherwiki -n 50`
   * Verify paths in service file
   * Ensure proper permissions on project directory
2. **Permission Issues**
   * Verify user ownership: `ls -l /var/log/yetanotherwiki*`
   * Check project directory permissions
   * Ensure user has access to pnpm and node
3. **Port Conflicts**
   * Check if port is in use: `sudo lsof -i :3000`
   * Verify no other instances are running

### Log Rotation

To prevent logs from growing too large, consider setting up log rotation:

```shell
sudo nano /etc/logrotate.d/yetanotherwiki
```

Add:

```text
/var/log/yetanotherwiki.log /var/log/yetanotherwiki.error.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 644 <your_user> <your_user>
}
```