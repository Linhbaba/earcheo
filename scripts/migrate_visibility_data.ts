import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting data migration for Finding visibility...');

  // Update all findings where isPublic is true to have visibility PUBLIC
  const result = await prisma.finding.updateMany({
    where: {
      isPublic: true,
    },
    data: {
      visibility: 'PUBLIC',
    },
  });

  console.log(`Updated ${result.count} findings to PUBLIC visibility.`);
  
  // Note: Default is PRIVATE, so no need to update false ones unless we changed default.
  // ANONYMOUS is new, so no existing data maps to it.

  console.log('Migration completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });






