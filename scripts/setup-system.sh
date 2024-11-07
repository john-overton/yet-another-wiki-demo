#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status messages
print_status() {
    echo -e "${YELLOW}➜ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install Node.js
install_nodejs() {
    print_status "Installing Node.js..."
    
    if ! command_exists node; then
        # Add NodeSource repository
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
        print_success "Node.js installed successfully"
    else
        print_success "Node.js is already installed"
    fi
}

# Function to install PNPM
install_pnpm() {
    print_status "Installing PNPM..."
    
    if ! command_exists pnpm; then
        sudo npm install -g pnpm
        print_success "PNPM installed successfully"
    else
        print_success "PNPM is already installed"
    fi
}

# Function to install and configure Nginx
install_nginx() {
    print_status "Installing Nginx..."
    
    if ! command_exists nginx; then
        sudo apt-get update
        sudo apt-get install -y nginx
        
        # Start Nginx and enable it to start on boot
        sudo systemctl start nginx
        sudo systemctl enable nginx
        
        print_success "Nginx installed and configured successfully"
    else
        print_success "Nginx is already installed"
    fi
}

# Function to install Certbot
install_certbot() {
    print_status "Installing Certbot..."
    
    if ! command_exists certbot; then
        sudo apt-get update
        sudo apt-get install -y certbot python3-certbot-nginx
        print_success "Certbot installed successfully"
    else
        print_success "Certbot is already installed"
    fi
}

# Function to install Git
install_git() {
    print_status "Installing Git..."
    
    if ! command_exists git; then
        sudo apt-get update
        sudo apt-get install -y git
        print_success "Git installed successfully"
    else
        print_success "Git is already installed"
    fi
}

# Function to install PM2
install_pm2() {
    print_status "Installing PM2..."
    
    if ! command_exists pm2; then
        sudo npm install -g pm2
        print_success "PM2 installed successfully"
    else
        print_success "PM2 is already installed"
    fi
}

# Function to configure firewall
configure_firewall() {
    print_status "Configuring firewall..."
    
    if command_exists ufw; then
        # Allow SSH (port 22) first to prevent losing connection
        sudo ufw allow ssh
        
        # Allow HTTP and HTTPS
        sudo ufw allow 80/tcp
        sudo ufw allow 443/tcp
        
        # Enable firewall if it's not already enabled
        if ! sudo ufw status | grep -q "Status: active"; then
            sudo ufw --force enable
        fi
        
        print_success "Firewall configured successfully"
    else
        sudo apt-get update
        sudo apt-get install -y ufw
        configure_firewall
    fi
}

# Main installation function
main() {
    # Check if script is run as root
    if [ "$EUID" -ne 0 ]; then
        print_error "Please run this script as root or with sudo"
        exit 1
    }
    
    print_status "Starting system setup..."
    
    # Update package list
    print_status "Updating package list..."
    apt-get update
    
    # Install required packages
    install_git
    install_nodejs
    install_pnpm
    install_nginx
    install_certbot
    install_pm2
    
    # Configure firewall
    configure_firewall
    
    print_success "System setup completed successfully!"
    print_status "Next steps:"
    echo "1. Clone your repository:"
    echo "   git clone https://github.com/yourusername/yet-another-wiki.git"
    echo "2. Navigate to the project directory:"
    echo "   cd yet-another-wiki"
    echo "3. Run the deployment script:"
    echo "   node scripts/deploy-prod.js yourdomain.com"
}

# Run main function
main
