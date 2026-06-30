require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findUnique({ where: { id: 'cmr0icwux0001g4n1rbvj00ra' } })
  .then(console.log)
  .finally(() => prisma.$disconnect());
