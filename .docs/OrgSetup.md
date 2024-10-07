# Organizational setup:

### Summary
This is the outline for how organizational setup should work within the application.  Each user maybe be a member to certain objects within the organizational structure.
```markdown
└── Company
	├── Department
	└── Sub company
		├── Department
```
### Descriptions
- **Company:** is the top line structure and is managed by an admin(s)
	- This level contains primary billing.
	- Controls company wide user assignment.
- **Department:** is a sub-object of department.
- **Sub Company:** is a sub-object of the Company which also could have separate billing.  Sub companies can also contain separated departments.

### Setup for each OU should contain:
 - Name
 - OU Type
 - Authentication type: (reg email, Microsoft, Google)
 - Domain (email domain example: @jroverton.com)
 - Billing setup (inherited which is default or separate billing)
 - User list and a flag if they are decision makers

### User Roles
 - Admins: control company and department setup.  Admins may be set at the company or sub company level and can only add\remove change down stream departments.
 - Procurement: Can upload RFP's, amendments, and supporting documentation.
 - Contributors: someone who can review RFP's and ask questions in the comments section.

Special roles: Voting - which is a flag tied to a user a specific OU level.

### Organization On boarding:
Login Integrations:
 - Microsoft SSO
 - Google SSO
 - Email\Password

When a user logs in for the first time there should be a check based on the domain name of the email to see if a company or sub company exists.  If there is then a notification email should go out to the Admin for that company to decide on whether or not to add that user.

If the domain is being setup for the first time setup the company information, billing, etc.

### User Management
If using SSO whether someone is active in the system should be determined on whether they are active from the SSO provider.  There should be some sort of flag that sets whether a user is active or not.

If using reguar email then the admin will also have the ability to turn a user account on or off.  Active accounts are billed in invoicing.

Active users can be assigned to specific OU's with specific roles and voting rights.