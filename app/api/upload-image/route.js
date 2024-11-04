import { promises as fs } from 'fs';
import { join } from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Save to data/uploads/post-images
    const uploadDir = join(process.cwd(), 'data', 'uploads', 'post-images');
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename using crypto
    const randomValues = new Uint8Array(16);
    crypto.getRandomValues(randomValues);
    const uniqueId = Array.from(randomValues).map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Clean the filename to prevent path traversal and encoding issues
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-');
    const fileName = `${uniqueId}-${cleanFileName}`;
    const filePath = join(uploadDir, fileName);

    // Convert file to buffer and save
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(filePath, buffer);

    // Return the URL that will be handled by the [...path] route
    const url = `/api/uploads/post-images/${fileName}`;
    
    return Response.json({ 
      url,
      success: true
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return Response.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
