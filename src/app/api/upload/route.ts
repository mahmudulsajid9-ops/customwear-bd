import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    let buffer: Buffer;
    let fileName: string;
    let mimeType: string = 'image/png';

    if (contentType.includes('application/json')) {
      const json = await req.json();
      if (!json.base64) {
        return NextResponse.json({ error: 'Base64 image data is required.' }, { status: 400 });
      }

      // Extract raw base64 and mime
      const match = json.base64.match(/^data:([a-zA-Z0-9/+-]+);base64,(.+)$/);
      let rawBase64 = json.base64;
      if (match) {
        mimeType = match[1];
        rawBase64 = match[2];
      }

      buffer = Buffer.from(rawBase64, 'base64');
      const cleanName = (json.fileName || 'image.png').replace(/[^a-zA-Z0-9.-]/g, '_');
      fileName = `${Date.now()}-${cleanName}`;
    } else {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
      }

      mimeType = file.type;
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      fileName = `${Date.now()}-${cleanName}`;
    }

    // Validate size (max 5MB)
    const maxBytes = 5 * 1024 * 1024;
    if (buffer.length > maxBytes) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit.' }, { status: 400 });
    }

    const isServerless = Boolean(
      process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL
    );

    let fileUrl: string;

    if (isServerless) {
      // Return Data URL on serverless platforms where disk is ephemeral
      fileUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
    } else {
      try {
        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, buffer);
        fileUrl = `/uploads/${fileName}`;
      } catch {
        // Fallback to Data URL if local disk write fails
        fileUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
      }
    }

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName,
      size: buffer.length,
      mimeType,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'Failed to process image upload.' }, { status: 500 });
  }
}
