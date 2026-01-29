import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import { verifyAuthToken } from '@/lib/auth-middleware';
import { uploadImage } from '@/lib/cloudinary';

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Magic bytes for image format validation (server-side, not spoofable)
const IMAGE_SIGNATURES: { [key: string]: number[] } = {
  jpeg: [0xff, 0xd8, 0xff],
  png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  gif: [0x47, 0x49, 0x46, 0x38],
  webp: [0x52, 0x49, 0x46, 0x46], // RIFF header (WebP starts with RIFF)
};

async function validateImageContent(file: File): Promise<{ valid: boolean; type: string | null }> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Check PNG (8 bytes)
  if (bytes.length >= 8) {
    const isPng = IMAGE_SIGNATURES.png.every((byte, i) => bytes[i] === byte);
    if (isPng) return { valid: true, type: 'png' };
  }

  // Check JPEG (3 bytes)
  if (bytes.length >= 3) {
    const isJpeg = IMAGE_SIGNATURES.jpeg.every((byte, i) => bytes[i] === byte);
    if (isJpeg) return { valid: true, type: 'jpeg' };
  }

  // Check GIF (4 bytes)
  if (bytes.length >= 4) {
    const isGif = IMAGE_SIGNATURES.gif.every((byte, i) => bytes[i] === byte);
    if (isGif) return { valid: true, type: 'gif' };
  }

  // Check WebP (RIFF header + WEBP at offset 8)
  if (bytes.length >= 12) {
    const isRiff = IMAGE_SIGNATURES.webp.every((byte, i) => bytes[i] === byte);
    const isWebp = bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
    if (isRiff && isWebp) return { valid: true, type: 'webp' };
  }

  return { valid: false, type: null };
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuthToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jobId = params.id;

    // Verify job ownership
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { images: true },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.posterId !== user.id) {
      return NextResponse.json(
        { error: 'Only the job poster can upload images' },
        { status: 403 }
      );
    }

    // Check if max images reached
    if (job.images.length >= MAX_IMAGES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_IMAGES} images allowed` },
        { status: 400 }
      );
    }

    // Get the form data
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];

    if (!files.length) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      );
    }

    // Check if adding these would exceed the limit
    if (job.images.length + files.length > MAX_IMAGES) {
      return NextResponse.json(
        { error: `Can only add ${MAX_IMAGES - job.images.length} more images` },
        { status: 400 }
      );
    }

    // Validate files - check size and actual file content (not spoofable MIME type)
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: 'File too large. Maximum size is 5MB' },
          { status: 400 }
        );
      }

      // Validate actual file content using magic bytes (prevents MIME type spoofing)
      const validation = await validateImageContent(file);
      if (!validation.valid) {
        return NextResponse.json(
          { error: 'Invalid image file. Only JPEG, PNG, GIF, and WebP images are allowed.' },
          { status: 400 }
        );
      }
    }

    // Upload to Cloudinary and save to database
    const uploadedImages = [];
    const currentMaxOrder = job.images.length > 0
      ? Math.max(...job.images.map(img => img.order))
      : -1;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const result = await uploadImage(file, `localservices/jobs/${jobId}`);

      const image = await prisma.jobImage.create({
        data: {
          jobId,
          url: result.url,
          publicId: result.publicId,
          order: currentMaxOrder + i + 1,
        },
      });

      uploadedImages.push(image);
    }

    return NextResponse.json(uploadedImages, { status: 201 });
  } catch (error) {
    console.error('Upload images error:', error);
    return NextResponse.json(
      { error: 'Failed to upload images' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;

    const images = await prisma.jobImage.findMany({
      where: { jobId },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error('Get images error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
