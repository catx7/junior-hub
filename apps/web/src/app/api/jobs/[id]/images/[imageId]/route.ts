import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import { verifyAuthToken } from '@/lib/auth-middleware';
import { deleteImage } from '@/lib/cloudinary';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; imageId: string } }
) {
  try {
    const user = await verifyAuthToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: jobId, imageId } = params;

    // Get the image with job info
    const image = await prisma.jobImage.findUnique({
      where: { id: imageId },
      include: {
        job: {
          select: { posterId: true },
        },
      },
    });

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Verify job ownership
    if (image.job.posterId !== user.id) {
      return NextResponse.json(
        { error: 'Only the job poster can delete images' },
        { status: 403 }
      );
    }

    // Verify image belongs to the job
    if (image.jobId !== jobId) {
      return NextResponse.json(
        { error: 'Image does not belong to this job' },
        { status: 400 }
      );
    }

    // Delete from Cloudinary
    try {
      await deleteImage(image.publicId);
    } catch (cloudinaryError) {
      console.error('Cloudinary delete error:', cloudinaryError);
      // Continue with database deletion even if Cloudinary fails
    }

    // Delete from database
    await prisma.jobImage.delete({
      where: { id: imageId },
    });

    return NextResponse.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete image error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; imageId: string } }
) {
  try {
    const user = await verifyAuthToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: jobId, imageId } = params;
    const body = await request.json();
    const { order } = body;

    if (typeof order !== 'number') {
      return NextResponse.json(
        { error: 'Order must be a number' },
        { status: 400 }
      );
    }

    // Get the image with job info
    const image = await prisma.jobImage.findUnique({
      where: { id: imageId },
      include: {
        job: {
          select: { posterId: true },
        },
      },
    });

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Verify job ownership
    if (image.job.posterId !== user.id) {
      return NextResponse.json(
        { error: 'Only the job poster can update images' },
        { status: 403 }
      );
    }

    // Update order
    const updatedImage = await prisma.jobImage.update({
      where: { id: imageId },
      data: { order },
    });

    return NextResponse.json(updatedImage);
  } catch (error) {
    console.error('Update image error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
