import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import ClientSetupWizard from './ClientSetupWizard';

export default async function SetupPage() {
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
}
