import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

// Configure Cloudinary using existing environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload an image buffer directly to Cloudinary without writing to disk
 */
export async function uploadImage(buffer: Buffer, folder: string = "bqms/images"): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
}

/**
 * Upload a document buffer (PDF, Word, etc) directly to Cloudinary
 */
export async function uploadDocument(buffer: Buffer, folder: string = "bqms/documents"): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "raw" },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
}

/**
 * Delete an asset from Cloudinary using its public_id
 */
export async function deleteImage(publicId: string, resourceType: "image" | "raw" | "video" = "image"): Promise<any> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, { resource_type: resourceType }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
}

/**
 * Generate a secure transformed URL for a given public_id
 */
export function generateSecureUrl(publicId: string, options: any = {}): string {
  return cloudinary.url(publicId, {
    secure: true,
    ...options
  });
}
