require('dotenv').config();

const mongoose = require('mongoose');
const Product = require('../src/models/Product');
const User = require('../src/models/User');
const { mongoUri } = require('../src/config/env');
const { ADMIN } = require('../src/constants/roles');
const productsData = require('./products.json');

const seedProducts = async () => {
  await mongoose.connect(mongoUri);

  const admin = await User.findOne({ role: ADMIN });
  if (!admin) {
    console.error('No admin user found. Run node scripts/seedAdmin.js first.');
    process.exit(1);
  }

  const { products } = productsData;
  let inserted = 0;
  let skipped = 0;

  for (const product of products) {
    const existing = await Product.findOne({ name: product.name });
    if (existing) {
      console.log(`Skipped (exists): ${product.name}`);
      skipped++;
      continue;
    }

    await Product.create({ ...product, user: admin._id });
    console.log(`Inserted: ${product.name}`);
    inserted++;
  }

  console.log(`\nDone. ${inserted} inserted, ${skipped} skipped.`);
  await mongoose.disconnect();
};

seedProducts().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
