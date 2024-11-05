import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import ClientSetupWizard from './ClientSetupWizard';
import fs from 'fs/promises';

export default async function SetupPage() {
    try {
        // First check if basic setup is complete
        try {
            await fs.access('.env');
            await fs.access('db/yetanotherwiki.db');
        } catch {
            // If files don't exist, show setup wizard
            return <ClientSetupWizard />;
        }

        // Only try to use Prisma if basic setup is complete
        const prisma = new PrismaClient();
        
        try {
            // Check if any admin user exists
            const adminUser = await prisma.user.findFirst({
                where: {
                    role: 'Admin'
                }
            });

            // If admin exists, redirect to home page
            if (adminUser) {
                redirect('/');
            }

            // If no admin exists, show the setup wizard
            return <ClientSetupWizard />;
        } finally {
            await prisma.$disconnect();
        }
    } catch (error) {
        console.error('Error in setup page:', error);
        // If there's any error, show setup wizard
        return <ClientSetupWizard />;
    }
}
