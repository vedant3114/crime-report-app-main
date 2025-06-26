const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin123', 10);
  const data = {
    email: 'admin@example.com',
    password,
    name: 'Admin',
    role: 'ADMIN',
  };
  console.log('User data being sent to Prisma:', data);
  const user = await prisma.user.create({ data });
  console.log(user);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());u