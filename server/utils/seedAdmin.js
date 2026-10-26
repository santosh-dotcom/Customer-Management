const User = require('../models/User');

const seedSuperAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';

    const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });

    if (!existingAdmin) {
      await User.create({
        name: 'Super Administrator',
        email: adminEmail.toLowerCase(),
        phone: '+1-555-0199',
        password: adminPassword,
        address: '100 Enterprise Way, Suite 500, Tech Park',
        role: 'admin',
        status: 'active',
      });
      console.log(`[Seed] Super Admin created successfully.`);
      console.log(`[Seed] Email: ${adminEmail}`);
      console.log(`[Seed] Password: ${adminPassword}`);
    } else {
      console.log(`[Seed] Super Admin account (${adminEmail}) already exists.`);
    }
  } catch (error) {
    console.error(`[Seed] Error seeding Super Admin:`, error.message);
  }
};

module.exports = seedSuperAdmin;
