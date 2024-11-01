import { writeFile } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a safe filename
    const originalName = file.name;
    const timestamp = Date.now();
    const randomId = Math.floor(Math.random() * 1000000000);
    const filename = `${originalName.replace(/[^a-zA-Z0-9.-]/g, '-')}-${timestamp}-${randomId}${getExtension(originalName)}`;

    // Save the file
    const uploadDir = join(process.cwd(), 'public', 'files');
    const filePath = join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // Return the URL with /uploads prefix
    return NextResponse.json({
      url: `/uploads/${filename}`,
      filename: originalName
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    );
  }
}

function getExtension(filename) {
  const ext = filename.split('.').pop();
  return ext ? `.${ext}` : '';
}
