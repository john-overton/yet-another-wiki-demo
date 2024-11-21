# Backend Settings Overview

This guide provides a high-level overview of the settings available in Yet Another Wiki. Each section has its own detailed documentation page.

## Accessing Settings ⚙️

The settings page is accessible through:
- The settings icon in the sidebar (Admin users only)
- Direct URL navigation to `/settings`

:::info
Settings access requires Admin privileges. Regular users and Contributors cannot access these settings.
:::

## Settings Sections 📑

### User Management (Pro License Only)
[Detailed Documentation →](/settings/user-management)

- Add and manage users
- Assign user roles
- Manage permissions
- View user activity
- Only available with Pro license

### Backup & Import
[Detailed Documentation →](/settings/backup-import)

- Create system backups
- Restore from backups
- Import markdown content
- Export wiki content
- Manage backup schedules

### Theming Settings
[Detailed Documentation →](/settings/theming)

- Customize appearance
- Manage color schemes
- Configure fonts
- Set up header content
- Customize footer content
- Define navigation links

### Licensing Settings
[Detailed Documentation →](/settings/licensing)

- View license status
- Manage license key
- Upgrade license
- View feature availability
- Check user limits

## Section Visibility 👁️

Settings sections are displayed based on:

1. **User Role**:
   - All sections visible to Admins
   - No access for other roles

2. **License Type**:
   - Personal: All sections except User Management
   - Pro: All sections including User Management

3. **Authentication**:
   - Must be logged in
   - Must have Admin privileges

## Common Tasks 🔧

### User Management
- Add new users (Pro)
- Modify user roles
- Disable/enable accounts
- Manage access permissions

### Backup Operations
- Create manual backups
- Schedule automatic backups
- Restore from backup points
- Export wiki content

### Theme Customization
- Change color schemes
- Update branding
- Modify layout elements
- Configure navigation

### License Management
- View current status
- Update license key
- Check feature access
- Monitor usage limits

## Best Practices 💡

1. **Regular Backups**:
   - Schedule automatic backups
   - Test restore functionality
   - Keep multiple backup points

2. **User Management** (Pro):
   - Regular access review
   - Clear role assignments
   - Document user policies

3. **Theme Changes**:
   - Test in preview mode
   - Document customizations
   - Consider all users

4. **License Management**:
   - Keep license current
   - Monitor user counts
   - Plan for upgrades

:::tip
Each settings section has its own detailed documentation page. Click the "Detailed Documentation" links above to learn more about specific features.
:::

:::caution
Some settings changes may require a system restart or cache clear to take effect. Always test changes in a controlled manner.
:::

## Related Documentation 📚

- [User Roles and Permissions](users-and-roles.md)
- [Theming Guide](theming-guide.md)
- [Backup Strategies](backup-strategies.md)
- [License Types](license-types.md)

:::info
This is a high-level overview. Each section has its own detailed documentation page with specific instructions and examples.
:::
