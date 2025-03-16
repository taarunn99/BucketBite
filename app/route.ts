import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.REGION as string,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID as string,
    secretAccessKey: process.env.SECRET_ACCESS_KEY as string,
  },
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Blog ID is required' }, { status: 400 });
  }

  // Remove any file extension if present
  const cleanId = id.replace('.md', '');
  
  const params = {
    Bucket: process.env.S3_BUCKET_NAME as string,
    Key: `blogs/${cleanId}.md`, // Use cleaned ID
  };

  try {
    console.log(`Fetching blog with ID: ${cleanId}`);
    const command = new GetObjectCommand(params);
    const { Body } = await s3Client.send(command);
    
    if (!Body) {
      console.log(`Blog content not found for ID: ${cleanId}`);
      return NextResponse.json({ error: 'Blog content not found' }, { status: 404 });
    }

    const blogContent = await Body.transformToString();
    console.log(`Successfully fetched blog content length: ${blogContent.length}`);
    
    // Add CORS headers
    return NextResponse.json(
      { blogContent },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching blog content:', error);
    return NextResponse.json({ error: 'Error fetching blog content' }, { status: 500 });
  }
}