# PostgreSQL Setup and Database Initialization Guide

## NOTES
- Ensure that PostgreSQL is installed and running before executing these scripts.
- The setup script assumes you have sudo access to run commands as the postgres user. Adjust if necessary for your environment.
- Always backup your database before running schema updates.
- These scripts are basic and don't handle all error cases. In a production environment, you'd want to add more error checking and possibly use a more robust migration tool.
- Keep your `.env` file secure and never commit it to version control.

## 1. PostgreSQL Installation

### Windows Installation

1. Download the PostgreSQL installer from the official website: https://www.postgresql.org/download/windows/
2. Run the installer and follow the installation wizard.
3. Choose the components you want to install (at minimum, select the PostgreSQL Server and pgAdmin).
4. Choose an installation directory.
5. Set a password for the default PostgreSQL superuser (postgres).
6. Keep the default port (5432) unless you have a specific reason to change it.
7. Choose the default locale.
8. Complete the installation.

### Linux Installation (Ubuntu/Debian)

1. Update your package list:
   ```
   sudo apt update
   ```
2. Install PostgreSQL and contrib package:
   ```
   sudo apt install postgresql postgresql-contrib
   ```
3. Verify the installation:
   ```
   sudo -u postgres psql -c "SELECT version();"
   ```

## 2. Database Setup Script

Create a file named `setup_db.sh` in your project's root directory:

```bash
#!/bin/bash

# Load environment variables
source .env

# Default values
DB_NAME=${DB_NAME:-"rfp_application"}
DB_USER=${DB_USER:-"rfp_user"}
DB_PASSWORD=${DB_PASSWORD:-"password"}
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"5432"}

# Create user and database
sudo -u postgres psql << EOF
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
CREATE DATABASE $DB_NAME WITH OWNER $DB_USER;
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOF

# Connect to the database and run the schema file
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f docs/schema/DatabaseSchema0.01.sql

echo "Database setup complete."
```

## 3. Environment File

Create a `.env` file in your project's root directory:

```
DB_NAME=rfp_application
DB_USER=rfp_user
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432
```

## 4. Schema Update Script

Create a file named `update_schema.sh` in your project's root directory:

```bash
#!/bin/bash

# Load environment variables
source .env

# Default values
DB_NAME=${DB_NAME:-"rfp_application"}
DB_USER=${DB_USER:-"rfp_user"}
DB_PASSWORD=${DB_PASSWORD:-"password"}
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"5432"}

# Check if a schema file is provided
if [ -z "$1" ]; then
    echo "Please provide the path to the new schema file."
    exit 1
fi

# Run the new schema file
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $1

echo "Schema update complete."
```

## Usage Instructions

1. Install PostgreSQL using the instructions provided for your operating system.

2. Set up your environment variables by editing the `.env` file with your desired database name, user, password, and other configurations.

3. Make the scripts executable:
   ```
   chmod +x setup_db.sh update_schema.sh
   ```

4. To set up the initial database, run:
   ```
   ./setup_db.sh
   ```

5. To update the schema in the future, create a new schema file (e.g., `docs/schema/DatabaseSchema0.02.sql`) and run:
   ```
   ./update_schema.sh docs/schema/DatabaseSchema0.02.sql
   ```

