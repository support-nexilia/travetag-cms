import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default admin user
  const user = await prisma.user.upsert({
    where: { email: 'davide.cocco@mosai.co' },
    update: {},
    create: {
      username: 'coccus',
      email: 'davide.cocco@mosai.co',
      role: 'ADMIN',
    },
  });

  console.log('✅ Created admin user:', user);

  // Create some sample categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: '1' },
      update: { slug: 'travel' },
      create: {
        id: '1',
        name: 'Travel',
        slug: 'travel',
        description: 'Travel guides and tips',
      },
    }),
    prisma.category.upsert({
      where: { id: '2' },
      update: { slug: 'food' },
      create: {
        id: '2',
        name: 'Food',
        slug: 'food',
        description: 'Food and culinary experiences',
      },
    }),
  ]);

  console.log('✅ Created categories:', categories.length);

  // Create some sample tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { id: '1' },
      update: { slug: 'europe' },
      create: {
        id: '1',
        name: 'Europe',
        slug: 'europe',
        description: 'European destinations',
      },
    }),
    prisma.tag.upsert({
      where: { id: '2' },
      update: { slug: 'adventure' },
      create: {
        id: '2',
        name: 'Adventure',
        slug: 'adventure',
        description: 'Adventure activities',
      },
    }),
  ]);

  console.log('✅ Created tags:', tags.length);
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
