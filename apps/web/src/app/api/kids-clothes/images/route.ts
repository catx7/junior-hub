import { NextRequest, NextResponse } from 'next/server';
import { authenticate, unauthorizedResponse, serverErrorResponse } from '@/lib/auth-middleware';
import { uploadMultipleImages } from '@/lib/cloudinary';

const MAX_FILES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const IMAGE_SIGNATURES: { [key: string]: number[] } = {
  jpeg: [0xff, 0xd8, 0xff],
  png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  gif: [0x47, 0x49, 0x46, 0x38],
  webp: [0x52, 0x49, 0x46, 0x46],
};

async function validateImageContent(file: File): Promise<boolean> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  if (bytes.length >= 8) {
    const isPng = IMAGE_SIGNATURES.png.every((byte, i) => bytes[i] === byte);
    if (isPng) return true;
  }
  if (bytes.length >= 3) {
    const isJpeg = IMAGE_SIGNATURES.jpeg.every((byte, i) => bytes[i] === byte);
    if (isJpeg) return true;
  }
  if (bytes.length >= 4) {
    const isGif = IMAGE_SIGNATURES.gif.every((byte, i) => bytes[i] === byte);
    if (isGif) return true;
  }
  if (bytes.length >= 12) {
    const isRiff = IMAGE_SIGNATURES.webp.every((byte, i) => bytes[i] === byte);
    const isWebp =
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
    if (isRiff && isWebp) return true;
  }

  return false;
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await authenticate(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const formData = await request.formData();
    const files = formData.getAll('images') as File[];

    if (!files.length) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: `Maximum ${MAX_FILES} images allowed` }, { status: 400 });
    }

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: 'File too large. Maximum size is 5MB per image' },
          { status: 400 }
        );
      }

      const isValid = await validateImageContent(file);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid image file. Only JPEG, PNG, GIF, and WebP are allowed.' },
          { status: 400 }
        );
      }
    }

    const results = await uploadMultipleImages(files, 'juniorhub/kids-clothes');

    return NextResponse.json({ urls: results.map((r) => r.url) }, { status: 201 });
  } catch (error) {
    console.error('Upload kids clothes images error:', error);
    return serverErrorResponse();
  }
}
