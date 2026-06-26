const { v2: cloudinary } = require('cloudinary');
const {
  cloudinaryCloudName,
  cloudinaryApiKey,
  cloudinaryApiSecret,
} = require('./env');

const isCloudinaryConfigured = () =>
  Boolean(cloudinaryCloudName && cloudinaryApiKey && cloudinaryApiSecret);

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: cloudinaryCloudName,
    api_key: cloudinaryApiKey,
    api_secret: cloudinaryApiSecret,
  });
}

module.exports = { cloudinary, isCloudinaryConfigured };
