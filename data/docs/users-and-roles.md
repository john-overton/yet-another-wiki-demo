# Users and Roles in Yet Another Wiki

This guide explains the different user roles available in Yet Another Wiki and their associated permissions.

## User Roles Overview 👥

Yet Another Wiki implements a role-based access control system with three main roles:

### Admin Role 👑

Administrators have full control over the wiki:

* Create, edit, and delete any pages
* Manage the sidebar structure and organization
* Access the Settings page
* Import and export content
* Access the trash bin
* Manage themes and customization
* Configure licensing settings
* Manage backups and imports

### Contributor Role ✍️

Contributors have content management permissions:

* Create new pages
* Edit existing pages
* Delete pages (moves to trash bin)
* Import pages
* Access the trash bin
* Organize content in the sidebar

### User Role 👤

Basic users have limited read-only access:

* View public\private pages
* Use the search functionality
* Navigate using the table of contents
* Cannot create or edit pages
* Cannot access the trash bin or import features

## License Types and User Management 🔑

### Personal License

* User is automatically assigned the Admin role
* Cannot add additional users
* Full access to all features except user management
* Ideal for individual documentation needs

### Pro License

* Full user management capabilities in the Settings page
* Can add and manage multiple users
* Assign different roles to users
* Manage user permissions and access
* Perfect for teams and organizations

## Component Access by Role 🔐

### Sidebar Access

* **Admin/Contributor**:
  * See all pages
  * Add/delete pages
  * Organize content structure
  * Access import and trash bin features
  * See settings link (Admin only)
* **User**:
  * View public and private pages
  * No content management options
  * No access to import or trash bin

### Settings Page Access

* **Admin**:
  * Full access to all settings sections
  * User management (Pro license only)
  * Theming settings
  * Licensing settings
  * Backup & import features
* **Contributor/User**:
  * No access to settings page

### Content Management

* **Admin/Contributor**:
  * Full markdown editor access
  * File attachments
  * Page organization
  * Content import/export
* **User**:
  * View-only access
  * Can use search and navigation features
  * Cannot modify content

## Common Scenarios 🎯

### Personal Wiki

* Single admin user
* Full control over all features
* No user management needed

### Team Wiki (Pro)

* Admin(s) for system management
* Contributors for content creation
* Users for content consumption
* Full user management capabilities

:::tip
When using a Pro license, start with a minimal number of admin users and grant additional permissions as needed rather than starting with too many privileged accounts.
:::

:::info
Personal license users automatically get admin privileges but cannot add other users. Upgrade to Pro if you need multi-user capabilities.
:::