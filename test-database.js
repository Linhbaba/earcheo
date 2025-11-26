// Test script for database connectivity and Prisma operations
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabase() {
  console.log('🧪 Testing database connection...\n');

  try {
    // Test 1: Connection
    console.log('✓ Test 1: Database connection');
    await prisma.$connect();
    console.log('  ✅ Connected to Neon PostgreSQL\n');

    // Test 2: Create User
    console.log('✓ Test 2: Create test user');
    const user = await prisma.user.upsert({
      where: { id: 'test-user-123' },
      update: {},
      create: {
        id: 'test-user-123',
        email: 'test@earcheo.cz',
        nickname: 'TestArcheolog',
        bio: 'Testovací uživatel pro Earcheo',
        location: 'Praha, ČR',
      },
    });
    console.log('  ✅ User created:', user.nickname);
    console.log('  📧 Email:', user.email, '\n');

    // Test 3: Create Equipment
    console.log('✓ Test 3: Create equipment');
    const equipment = await prisma.equipment.create({
      data: {
        userId: user.id,
        name: 'Garrett ACE 400i',
        type: 'DETECTOR',
        manufacturer: 'Garrett',
        model: 'ACE 400i',
        notes: 'Testovací detektor',
      },
    });
    console.log('  ✅ Equipment created:', equipment.name);
    console.log('  🔍 Type:', equipment.type, '\n');

    // Test 4: Create Social Link
    console.log('✓ Test 4: Create social link');
    const socialLink = await prisma.socialLink.create({
      data: {
        userId: user.id,
        platform: 'facebook',
        url: 'https://facebook.com/testuser',
      },
    });
    console.log('  ✅ Social link created:', socialLink.platform, '\n');

    // Test 5: Create Favorite Location
    console.log('✓ Test 5: Create favorite location');
    const location = await prisma.favoriteLocation.create({
      data: {
        userId: user.id,
        name: 'Karlštejn',
        latitude: 49.9394,
        longitude: 14.1882,
        notes: 'Dobrá lokalita pro hledání',
      },
    });
    console.log('  ✅ Location created:', location.name);
    console.log('  📍 GPS:', location.latitude, location.longitude, '\n');

    // Test 6: Create Finding
    console.log('✓ Test 6: Create finding');
    const finding = await prisma.finding.create({
      data: {
        userId: user.id,
        title: 'Římská mince',
        latitude: 50.0755,
        longitude: 14.4378,
        date: new Date('2024-11-26'),
        description: 'Stříbrná římská mince nalezená u řeky',
        category: 'coins',
        condition: 'good',
        depth: 15.5,
        material: 'stříbro',
        locationName: 'Pole u Prahy',
        isPublic: false,
      },
    });
    console.log('  ✅ Finding created:', finding.title);
    console.log('  📅 Date:', finding.date.toLocaleDateString('cs-CZ'));
    console.log('  🗺️  Location:', finding.locationName, '\n');

    // Test 7: Link Equipment to Finding
    console.log('✓ Test 7: Link equipment to finding');
    const findingEquipment = await prisma.findingEquipment.create({
      data: {
        findingId: finding.id,
        equipmentId: equipment.id,
      },
    });
    console.log('  ✅ Equipment linked to finding\n');

    // Test 8: Query with relations
    console.log('✓ Test 8: Query user with all relations');
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        socialLinks: true,
        favoriteLocations: true,
        equipment: true,
        findings: {
          include: {
            equipment: {
              include: {
                equipment: true,
              },
            },
          },
        },
      },
    });
    console.log('  ✅ User loaded with relations:');
    console.log('    - Social links:', fullUser.socialLinks.length);
    console.log('    - Favorite locations:', fullUser.favoriteLocations.length);
    console.log('    - Equipment items:', fullUser.equipment.length);
    console.log('    - Findings:', fullUser.findings.length, '\n');

    // Test 9: Count records
    console.log('✓ Test 9: Count all records');
    const counts = {
      users: await prisma.user.count(),
      equipment: await prisma.equipment.count(),
      findings: await prisma.finding.count(),
      socialLinks: await prisma.socialLink.count(),
      locations: await prisma.favoriteLocation.count(),
    };
    console.log('  📊 Database statistics:');
    console.log('    - Users:', counts.users);
    console.log('    - Equipment:', counts.equipment);
    console.log('    - Findings:', counts.findings);
    console.log('    - Social Links:', counts.socialLinks);
    console.log('    - Favorite Locations:', counts.locations, '\n');

    // Success summary
    console.log('═══════════════════════════════════════');
    console.log('✅ ALL TESTS PASSED!');
    console.log('═══════════════════════════════════════');
    console.log('\n🎉 Database is fully functional!');
    console.log('📊 Prisma ORM working correctly');
    console.log('🔗 All relations working');
    console.log('💾 Data persistence verified\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();

