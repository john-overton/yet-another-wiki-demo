# Use Node.js LTS (Debian-based)
FROM node:22-alpine

# Install system dependencies
RUN apt-get update && apt-get install -y \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Install PNPM
RUN npm install -g pnpm

# Create app directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy application files
COPY . .

# Generate Prisma client
RUN pnpm next setup

# Build the application
RUN pnpm next build

# Expose port
EXPOSE 3000

# Start the application
CMD ["pnpm", "next", "start"]
