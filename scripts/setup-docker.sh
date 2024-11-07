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

# Function to install Docker and Docker Compose
install_docker() {
    print_status "Installing Docker and Docker Compose..."
    
    if ! command_exists docker; then
        # Install Docker
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        rm get-docker.sh
        
        # Start and enable Docker service
        sudo systemctl start docker
        sudo systemctl enable docker
        
        # Add current user to docker group
        sudo usermod -aG docker $USER
        
        print_success "Docker installed successfully"
    else
        print_success "Docker is already installed"
    fi
    
    if ! command_exists docker-compose; then
        # Install Docker Compose
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        print_success "Docker Compose installed successfully"
    else
        print_success "Docker Compose is already installed"
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

# Function to create required directories
create_directories() {
    print_status "Creating required directories..."
    
    # Create directories with appropriate permissions
    mkdir -p data/docs data/uploads/post-images data/uploads/user-avatars
    mkdir -p db
    mkdir -p config/settings
    mkdir -p nginx/conf.d
    
    # Create .gitignore files to preserve directory structure
    echo "*" > data/uploads/post-images/.gitignore
    echo "*" > data/uploads/user-avatars/.gitignore
    echo "*" > db/.gitignore
    
    print_success "Directories created successfully"
}

# Function to generate initial configuration
generate_config() {
    print_status "Generating initial configuration..."
    
    # Create initial config files if they don't exist
    if [ ! -f config/settings/licensing.json ]; then
        echo '{
            "email": "",
            "key": "",
            "isValid": false,
            "token": "",
            "licenseType": "",
            "lastVerified": "",
            "lastCheck": ""
        }' > config/settings/licensing.json
    fi
    
    if [ ! -f config/settings/theming.json ]; then
        echo '{
            "font": "Open Sans",
            "theme": "light"
        }' > config/settings/theming.json
    fi
    
    print_success "Configuration files generated successfully"
}

# Main setup function
main() {
    print_status "Starting Docker deployment setup..."
    
    # Install Docker and Docker Compose
    install_docker
    
    # Configure firewall
    configure_firewall
    
    # Create required directories
    create_directories
    
    # Generate initial configuration
    generate_config
    
    print_success "Docker deployment setup completed successfully!"
    print_status "Next steps:"
    echo "1. Update your domain in docker-compose.yml:"
    echo "   NEXTAUTH_URL=https://yourdomain.com"
    echo ""
    echo "2. Start the application:"
    echo "   docker-compose up -d"
    echo ""
    echo "3. Monitor the logs:"
    echo "   docker-compose logs -f"
    
    # Notify about Docker group changes
    echo -e "\n${YELLOW}NOTE: You may need to log out and back in for Docker group changes to take effect.${NC}"
}

# Run main function
main
