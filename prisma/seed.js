const { PrismaClient } = require('@prisma/client');
const secretQuestions = require('./secretQuestions');

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding secret questions...');
  
  for (const question of secretQuestions) {
    await prisma.secretQuestion.create({
      data: {
        question: question,
      },
    });
  }
  
  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
