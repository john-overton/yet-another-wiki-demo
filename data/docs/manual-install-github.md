# Manual Installation Guide for Yet Another Wiki

## Prerequisites

Before beginning the installation, ensure you have:

1. [Git](https://git-scm.com/downloads)
2. [Node.js](https://nodejs.org/en/download/prebuilt-installer/current)

## Installation Steps

### 1. Prepare Installation Directory

Open a terminal and navigate to the directory where you want to install Yet Another Wiki.

### 2. Clone Repository

```shell
git clone https://github.com/john-overton/yet-another-wiki.git
```

### 3. Navigate to Project Directory

```shell
cd yet-another-wiki
```

### 4. Install Package Manager and Dependencies

```shell
# Install pnpm globally
npm install -g pnpm

# Install project dependencies
pnpm install
```

### 5. Setup Server

```shell
pnpm run setup
```

## Running the Application

### Development Mode

To start a development server:

```shell
pnpm run dev
```

### Production Mode

To prepare and run in production:

```shell
# Build for production (may take several minutes)
pnpm next build

# Start production server
pnpm next start
```