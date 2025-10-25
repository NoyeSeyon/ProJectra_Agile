const mongoose = require('mongoose');
const User = require('../models/User');
const Organization = require('../models/Organization');
require('dotenv').config({ path: './config.env' });

async function createSuperAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'super_admin' });
    if (existingSuperAdmin) {
      console.log('⚠️  Super Admin already exists:', existingSuperAdmin.email);
      process.exit(0);
    }

    // Create a dummy organization for super admin (required by schema)
    let superAdminOrg = await Organization.findOne({ slug: 'projectra-system' });
    
    if (!superAdminOrg) {
      superAdminOrg = await Organization.create({
        name: 'Projectra System',
        slug: 'projectra-system',
        description: 'System organization for Super Admin',
        isActive: true,
        subscription: {
          plan: 'enterprise'
        }
      });
      console.log('✅ Created system organization');
    }

    // Create super admin user
    const superAdmin = await User.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'superadmin@projectra.com',
      password: 'SuperAdmin@123', // Change this to a secure password
      organization: superAdminOrg._id,
      role: 'super_admin',
      isActive: true,
      isEmailVerified: true,
      managedOrganizations: []
    });

    console.log('✅ Super Admin created successfully!');
    console.log('📧 Email:', superAdmin.email);
    console.log('🔑 Password: SuperAdmin@123');
    console.log('⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating Super Admin:', error.message);
    process.exit(1);
  }
}

createSuperAdmin();

