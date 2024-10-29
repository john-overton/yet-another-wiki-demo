const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const updatedUser = await prisma.user.update({
    where: { id: 1 },
    data: {
      avatar: '/user-avatars/0f65d745090909047ee4e8e40bd98c95-johno-headsot.jpg'
    }
  });
  console.log('Updated user:', updatedUser);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
