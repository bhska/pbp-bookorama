import { PrismaClient } from "@/generated/client";
const hash = require('bcrypt').hash;

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL
});

async function main() {
  console.log('Starting seed...');

  // Clean up dependent data first
  console.log('Cleaning up existing data...');
  await prisma.orderItems.deleteMany({});
  await prisma.bookReview.deleteMany({});
  await prisma.orders.deleteMany({});
  await prisma.books.deleteMany({});
  
  await prisma.user.deleteMany({});
  console.log('Deleted existing users and related data');

  const passwordAdmin = await hash('admin', 12);
  const passwordUser = await hash('user', 12);


  const admin = await prisma.user.upsert({
    where: {
      email: 'admin@test.com',
    },
    update: {},
    create: {
      email: 'admin@test.com',
      name: 'Test Admin',
      role: 'ADMIN',
      password: passwordAdmin,
    },
  });

  const customer = await prisma.user.upsert({
    where: {
      email: 'user@test.com',
    },
    update: {},
    create: {
      email: 'user@test.com',
      name: 'Test Customer',
      role: 'CUSTOMER',
      password: passwordUser,
    },
  });

  console.log('🎉 Created admin account ', admin);
  console.log('🎉 Created customer account', customer);

  console.log('Seed data created successfully!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    // await pool.end();
  });
