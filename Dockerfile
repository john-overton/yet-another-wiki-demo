# Use Node.js LTS
FROM node:22-alpine

# Add version argument
ARG VERSION
ENV APP_VERSION=$VERSION

# Install PNPM
RUN npm install -g pnpm

# Create app directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies without frozen lockfile
RUN pnpm install --frozen-lockfile

# Copy application files
COPY . .

# Run setup script
RUN pnpm run setup

# Build the application
RUN pnpm next build

# Expose port
EXPOSE 3000

# Start the application
CMD ["pnpm", "next", "start"]
