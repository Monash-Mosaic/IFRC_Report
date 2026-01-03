import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get('filePath');
  const fileName = searchParams.get('fileName') || 'download.pdf';

  if (!filePath) {
    return NextResponse.json({ error: 'File path is required' }, { status: 400 });
  }

  try {
    // Construct the full file path
    // Assuming files are stored in public/pdfs/ directory
    const fullPath = path.join(process.cwd(), 'public', filePath);
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      console.error(`File not found: ${fullPath}`);
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Read the file
    const buffer = fs.readFileSync(fullPath);
    
    // Log download for analytics (optional)
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const timestamp = new Date().toISOString();
    console.log(`Download: ${fileName} - ${userAgent} - ${timestamp}`);

    // Return file with appropriate headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });

  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}