import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const form = formidable({
    uploadDir: path.join(process.cwd(), 'tmp'),
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err);
      return res.status(500).json({ message: 'Error uploading file' });
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const directory = Array.isArray(fields.directory) ? fields.directory[0] : fields.directory;

    if (!file || !directory) {
      return res.status(400).json({ message: 'Missing file or directory' });
    }

    const tempPath = file.filepath;
    const targetDir = path.join(process.cwd(), 'pages', directory as string);

    // Ensure the target directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    try {
      // Convert PDF to MDX using the Python script
      await new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', [
          path.join(process.cwd(), 'scripts', 'convert_pdf.py'),
          tempPath,
          targetDir
        ]);

        pythonProcess.stdout.on('data', (data) => {
          console.log(`Python script output: ${data}`);
        });

        pythonProcess.stderr.on('data', (data) => {
          console.error(`Python script error: ${data}`);
        });

        pythonProcess.on('close', (code) => {
          if (code === 0) {
            resolve(null);
          } else {
            reject(new Error(`Python script exited with code ${code}`));
          }
        });
      });

      // Clean up the temporary file
      fs.unlinkSync(tempPath);

      res.status(200).json({ message: 'File uploaded and converted successfully' });
    } catch (error) {
      console.error('Error converting PDF:', error);
      res.status(500).json({ message: 'Error converting PDF' });
    }
  });
}