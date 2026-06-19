/**
 * Seed an admin user for development/testing.
 *
 * Usage: node scripts/seedAdmin.js
 * Env:   ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD (optional overrides)
 */
require('dotenv').config();

const mongoose = require('mongoose');
const User = require('../src/models/User');
const { mongoUri } = require('../src/config/env');
const { ADMIN } = require('../src/constants/roles');

const seedAdmin = async () => {
  const name = process.env.ADMIN_NAME || 'Admin User';
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';

  await mongoose.connect(mongoUri);

  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== ADMIN) {
      existing.role = ADMIN;
      await existing.save();
      console.log(`Updated existing user to admin: ${email}`);
    } else {
      console.log(`Admin user already exists: ${email}`);
    }
  } else {
    await User.create({ name, email, password, role: ADMIN });
    console.log(`Admin user created: ${email}`);
  }

  await mongoose.disconnect();
};

seedAdmin().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
