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

# Function to show deployment options
show_options() {
    clear
    echo "Yet Another Wiki - Deployment Options"
    echo "===================================="
    echo ""
    echo "1) Docker Deployment (Recommended)"
    echo "   - Easier setup and management"
    echo "   - Containerized environment"
    echo "   - Automatic SSL certificate management"
    echo ""
    echo "2) Traditional Deployment"
    echo "   - Direct system installation"
    echo "   - More control over the setup"
    echo "   - Manual service management"
    echo ""
    echo "3) Exit"
    echo ""
}

# Function to get domain name
get_domain() {
    while true; do
        read -p "Enter your domain name (e.g., wiki.yourdomain.com): " domain
        if [[ $domain =~ ^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$ ]]; then
            break
        else
            print_error "Invalid domain name format. Please try again."
        fi
    done
}

# Function to handle Docker deployment
docker_deployment() {
    print_status "Starting Docker deployment setup..."
    
    # Get domain name
    get_domain
    
    # Run Docker setup script
    chmod +x scripts/setup-docker.sh
    ./scripts/setup-docker.sh
    
    # Update domain in docker-compose.yml
    sed -i "s|NEXTAUTH_URL=http://localhost:3000|NEXTAUTH_URL=https://$domain|g" docker-compose.yml
    
    print_success "Docker deployment setup completed!"
    echo ""
    print_status "To start the application, run:"
    echo "docker-compose up -d"
}

# Function to handle traditional deployment
traditional_deployment() {
    print_status "Starting traditional deployment setup..."
    
    # Get domain name
    get_domain
    
    # Run system setup script
    chmod +x scripts/setup-system.sh
    sudo ./scripts/setup-system.sh
    
    # Run application setup
    node scripts/setup.js
    
    # Run production deployment
    node scripts/deploy-prod.js $domain
    
    print_success "Traditional deployment setup completed!"
}

# Main menu loop
while true; do
    show_options
    read -p "Select deployment method (1-3): " choice
    
    case $choice in
        1)
            docker_deployment
            break
            ;;
        2)
            traditional_deployment
            break
            ;;
        3)
            echo "Exiting..."
            exit 0
            ;;
        *)
            print_error "Invalid option. Please try again."
            sleep 2
            ;;
    esac
done

# Final instructions
echo ""
print_status "Deployment setup is complete!"
echo "Please check the README.md file for additional configuration options"
echo "and troubleshooting information."
