const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendCreated } = require('../utils/apiResponse');

const uploadBufferToCloudinary = (fileBuffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'ecommerce/products',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      }
    );

    stream.end(fileBuffer);
  });

const uploadProductImage = asyncHandler(async (req, res) => {
  if (!isCloudinaryConfigured()) {
    throw new AppError('Cloudinary is not configured', 500);
  }

  if (!req.file) {
    throw new AppError('Image file is required', 400);
  }

  const result = await uploadBufferToCloudinary(req.file.buffer);

  sendCreated(res, {
    url: result.secure_url,
    publicId: result.public_id,
  }, 'Image uploaded successfully');
});

module.exports = { uploadProductImage };
