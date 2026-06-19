const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { sendResponse, sendSuccess, sendCreated } = require('../utils/apiResponse');

const buildProductQuery = (queryParams) => {
  const { keyword, category, minPrice, maxPrice } = queryParams;
  const filter = {};

  if (keyword) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { name: { $regex: escaped, $options: 'i' } },
      { description: { $regex: escaped, $options: 'i' } },
      { brand: { $regex: escaped, $options: 'i' } },
    ];
  }

  if (category) {
    filter.category = { $regex: `^${category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' };
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  return filter;
};

const buildSortOption = (sort) => {
  switch (sort) {
    case 'price_asc':
      return { price: 1 };
    case 'price_desc':
      return { price: -1 };
    case 'rating':
      return { rating: -1 };
    case 'newest':
    default:
      return { createdAt: -1 };
  }
};

const getProducts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  const filter = buildProductQuery(req.query);
  const sort = buildSortOption(req.query.sort);

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit).populate('user', 'name email'),
    Product.countDocuments(filter),
  ]);

  sendResponse(res, 200, {
    data: products,
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('user', 'name email');

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  sendSuccess(res, product);
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create({
    ...req.body,
    user: req.user._id,
  });

  sendCreated(res, product);
});

const updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (product.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized to update this product', 403);
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  sendSuccess(res, product, 'Product updated successfully');
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (product.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized to delete this product', 403);
  }

  await product.deleteOne();
  sendSuccess(res, null, 'Product removed successfully');
});

const getCategories = asyncHandler(async (_req, res) => {
  const categories = await Product.distinct('category');
  sendSuccess(res, categories.sort());
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
};
