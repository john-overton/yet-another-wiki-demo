# Backup and Restore

Learn how to backup and restore your Yet Another Wiki instance.

## Overview 📦

The backup and restore functionality allows you to:
- Create complete system backups
- Restore from previous backups
- Migrate content between instances
- Safeguard your wiki content

## Creating Backups 💾

### Starting a Backup

1. Navigate to Settings > Backup & Import
2. Click "Create Backup" button
3. Wait for backup generation
4. Download will start automatically

### What's Included

Backups contain:
- All wiki content and pages
- Database contents
- Public files and uploads
- System configuration
- User settings

:::info
Backups are created as ZIP files containing all necessary data for a complete system restore.
:::

## Restoring from Backup 🔄

### Import Process

1. Click "Import Backup" button
2. Select backup file (.zip)
3. Confirm the restore action
4. Wait for completion

:::danger
**WARNING**: Importing a backup will:
- **Completely replace** all existing data
- **Delete** current database contents
- **Overwrite** configuration directories
- This action **cannot be undone**!
:::

### Before Restoring

1. **Verify backup file**:
   - Ensure file is not corrupted
   - Confirm it's the correct backup
   - Check file format (.zip)

2. **Prepare system**:
   - Inform users of downtime
   - Consider creating current backup
   - Plan for potential issues

## Best Practices 💡

### Backup Strategy

1. **Regular Backups**:
   - Schedule routine backups
   - Keep multiple versions
   - Store in secure location

2. **Before Major Changes**:
   - Backup before updates
   - Backup before bulk operations
   - Backup before configuration changes

3. **Storage Management**:
   - Use descriptive filenames
   - Include dates in backup names
   - Maintain backup history

### Restore Strategy

1. **Testing**:
   - Test restores in development
   - Verify backup integrity
   - Document restore process

2. **Planning**:
   - Schedule maintenance window
   - Notify users in advance
   - Have rollback plan

## Security Considerations 🔒

### Backup Security

1. **Storage**:
   - Secure backup files
   - Control access permissions
   - Use encrypted storage

2. **Transfer**:
   - Use secure channels
   - Protect during transit
   - Verify file integrity

### Restore Security

1. **Access Control**:
   - Limit restore permissions
   - Log restore operations
   - Monitor system during restore

2. **Verification**:
   - Check backup source
   - Validate file contents
   - Scan for issues

## Troubleshooting 🔧

### Common Backup Issues

1. **Backup Failed**:
   - Check disk space
   - Verify permissions
   - Review error logs

2. **Download Issues**:
   - Check browser settings
   - Try different browser
   - Verify network connection

### Restore Problems

1. **Import Failed**:
   - Verify file format
   - Check file corruption
   - Confirm system requirements

2. **Post-Restore Issues**:
   - Clear browser cache
   - Check file permissions
   - Verify database connection

## Tips for Success 🎯

1. **Naming Convention**:
   ```
   wiki-backup-YYYY-MM-DD.zip
   ```

2. **Verification Steps**:
   - Test backup downloads
   - Verify file sizes
   - Check included content

3. **Documentation**:
   - Record backup dates
   - Note system versions
   - Document special configurations

:::tip
Always maintain at least three recent backups in case one becomes corrupted or contains unexpected issues.
:::

## Recovery Procedures 🚨

### Emergency Restore

If system failure occurs:

1. Access backup files
2. Use Import function
3. Follow restore prompts
4. Verify system operation

### Post-Restore Checklist

- [ ] Verify user access
- [ ] Check content integrity
- [ ] Test core functions
- [ ] Review system logs
- [ ] Update documentation

:::caution
After a restore, users may need to log in again as sessions might be cleared during the process.
:::

## Related Documentation 📚

- [System Settings](backend-settings.md)
- [User Management](user-management.md)
- [Troubleshooting Guide](troubleshooting.md)

:::info
Regular backups are crucial for data safety. Establish a backup schedule based on your update frequency and data importance.
:::
