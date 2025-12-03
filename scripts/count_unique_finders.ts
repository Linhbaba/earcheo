import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const uniqueUsersWithFindings = await prisma.finding.groupBy({
      by: ['userId'],
    });
    
    const totalFindings = await prisma.finding.count();

    console.log(`Počet unikátních uživatelů s nálezy: ${uniqueUsersWithFindings.length}`);
    console.log(`Celkový počet nálezů: ${totalFindings}`);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();


