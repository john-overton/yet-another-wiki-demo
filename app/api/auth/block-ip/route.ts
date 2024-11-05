import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    try {
        const { ip } = await request.json();
        
        if (!ip) {
            return NextResponse.json({ error: 'IP address is required' }, { status: 400 });
        }

        const blockedIpsPath = path.join(process.cwd(), 'nginx/conf.d/blocked_ips.conf');
        const timestamp = new Date().toISOString();
        const entry = `${ip} 1; # Blocked at ${timestamp}\n`;

        // Append to blocked IPs file
        fs.appendFileSync(blockedIpsPath, entry);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error blocking IP:', error);
        return NextResponse.json({ error: 'Failed to block IP' }, { status: 500 });
    }
}
