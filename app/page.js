import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import meta from '../data/docs/meta.json';
import fs from 'fs/promises';
import { execSync } from 'child_process';

// Mark the page as dynamic
export const dynamic = 'force-dynamic';

async function runSetup() {
    try {
        console.log('Running setup script...');
        execSync('node setup.js', { stdio: 'inherit' });
        return true;
    } catch (error) {
        console.error('Setup failed:', error);
        return false;
    }
}

async function checkSetupNeeded() {
    try {
        // Check if .env exists
        try {
            await fs.access('.env');
        } catch {
            console.log('.env file missing, running setup...');
            await runSetup();
            return true;
        }

        // Check if database exists
        try {
            await fs.access('db/yetanotherwiki.db');
        } catch {
            console.log('Database file missing, running setup...');
            await runSetup();
            return true;
        }

        // Check if admin exists
        const prisma = new PrismaClient();
        try {
            const adminUser = await prisma.user.findFirst({
                where: {
                    role: 'Admin'
                }
            });

            return !adminUser; // Need setup if no admin exists
        } finally {
            await prisma.$disconnect();
        }
    } catch (error) {
        console.error('Setup check failed:', error);
        return true;
    }
}

export default async function Home() {
    try {
        const needsSetup = await checkSetupNeeded();
        
        if (needsSetup) {
            redirect('/setup');
        }

        const topPage = meta.pages
            .filter(page => page.isPublic && !page.deleted)
            .sort((a, b) => a.sortOrder - b.sortOrder)[0];

        if (!topPage) {
            throw new Error('No public, non-deleted pages found');
        }

        redirect(`/${topPage.slug}`);
    } catch (error) {
        console.error('Error in home page:', error);
        throw error;
    }
}
