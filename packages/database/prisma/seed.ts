import { PrismaClient, ServiceCategory, JobStatus, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create demo users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'john@example.com' },
      update: {},
      create: {
        email: 'john@example.com',
        firebaseUid: 'demo-user-john-123',
        name: 'John Smith',
        bio: 'I am a loving parent looking for reliable childcare services.',
        address: '123 Main St, New York, NY 10001',
        latitude: 40.7128,
        longitude: -74.006,
        role: UserRole.USER,
        isVerified: true,
        rating: 4.8,
        reviewCount: 12,
        locale: 'en',
      },
    }),
    prisma.user.upsert({
      where: { email: 'maria@example.com' },
      update: {},
      create: {
        email: 'maria@example.com',
        firebaseUid: 'demo-user-maria-456',
        name: 'Maria Garcia',
        bio: 'Professional babysitter with 5 years of experience. First aid certified.',
        address: '456 Oak Ave, Brooklyn, NY 11201',
        latitude: 40.6892,
        longitude: -73.9857,
        role: UserRole.PROVIDER,
        isVerified: true,
        rating: 4.9,
        reviewCount: 45,
        locale: 'en',
      },
    }),
    prisma.user.upsert({
      where: { email: 'alex@example.com' },
      update: {},
      create: {
        email: 'alex@example.com',
        firebaseUid: 'demo-user-alex-789',
        name: 'Alex Johnson',
        bio: 'Eco-friendly cleaning service. Using only organic products.',
        address: '789 Pine St, Queens, NY 11375',
        latitude: 40.7282,
        longitude: -73.8317,
        role: UserRole.PROVIDER,
        isVerified: true,
        rating: 4.7,
        reviewCount: 28,
        locale: 'en',
      },
    }),
    prisma.user.upsert({
      where: { email: 'elena@example.com' },
      update: {},
      create: {
        email: 'elena@example.com',
        firebaseUid: 'demo-user-elena-101',
        name: 'Elena Popescu',
        bio: 'Bucătar profesionist specializat în mâncăruri tradiționale românești.',
        address: 'Str. Victoriei 10, București',
        latitude: 44.4268,
        longitude: 26.1025,
        role: UserRole.PROVIDER,
        isVerified: true,
        rating: 4.95,
        reviewCount: 67,
        locale: 'ro',
      },
    }),
  ]);

  console.log(`Created ${users.length} users`);

  // Create demo jobs
  const jobs = await Promise.all([
    prisma.job.create({
      data: {
        title: 'Babysitter needed for 2 kids this weekend',
        description:
          'Looking for an experienced babysitter for my two children (ages 4 and 7) this Saturday evening from 6 PM to 11 PM. Must have experience with young children and references. The kids love playing board games and reading bedtime stories.',
        category: ServiceCategory.BABYSITTING,
        budget: 75.0,
        currency: 'USD',
        status: JobStatus.OPEN,
        location: 'Upper East Side, Manhattan, NY',
        latitude: 40.7736,
        longitude: -73.9566,
        scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        posterId: users[0].id,
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800',
              publicId: 'demo/babysitting-1',
              order: 0,
            },
          ],
        },
      },
    }),
    prisma.job.create({
      data: {
        title: 'Deep cleaning for 2-bedroom apartment',
        description:
          'Need a thorough deep cleaning of my 2-bedroom apartment. This includes: bathroom and kitchen deep clean, dusting all surfaces, vacuuming and mopping floors, cleaning inside appliances (oven, microwave, fridge). Approximately 900 sq ft.',
        category: ServiceCategory.HOUSE_CLEANING,
        budget: 150.0,
        currency: 'USD',
        status: JobStatus.OPEN,
        location: 'Williamsburg, Brooklyn, NY',
        latitude: 40.7081,
        longitude: -73.9571,
        posterId: users[0].id,
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',
              publicId: 'demo/cleaning-1',
              order: 0,
            },
          ],
        },
      },
    }),
    prisma.job.create({
      data: {
        title: 'Homemade Romanian dinner for 6 people',
        description:
          'Looking for someone to prepare a traditional Romanian dinner for a family gathering. Menu should include: sarmale, mămăligă, salată de vinete, and a dessert (cozonac or papanași). All ingredients will be provided.',
        category: ServiceCategory.LOCAL_FOOD,
        budget: 120.0,
        currency: 'USD',
        status: JobStatus.OPEN,
        location: 'Astoria, Queens, NY',
        latitude: 40.7592,
        longitude: -73.9196,
        scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        posterId: users[0].id,
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
              publicId: 'demo/food-1',
              order: 0,
            },
          ],
        },
      },
    }),
    prisma.job.create({
      data: {
        title: 'Regular babysitter needed - 3 days/week',
        description:
          'Looking for a reliable babysitter for ongoing care, 3 days per week (Monday, Wednesday, Friday) from 3 PM to 7 PM. Taking care of one 5-year-old boy. Activities include helping with homework, preparing snacks, and outdoor play.',
        category: ServiceCategory.BABYSITTING,
        budget: 200.0,
        currency: 'USD',
        status: JobStatus.OPEN,
        location: 'Park Slope, Brooklyn, NY',
        latitude: 40.6681,
        longitude: -73.9822,
        posterId: users[0].id,
      },
    }),
    prisma.job.create({
      data: {
        title: 'Weekly house cleaning service',
        description:
          'Need a reliable cleaner for weekly visits. 3-bedroom house, approximately 1,500 sq ft. Standard cleaning: vacuuming, mopping, bathroom cleaning, kitchen cleaning, dusting. Every Friday morning preferred.',
        category: ServiceCategory.HOUSE_CLEANING,
        budget: 100.0,
        currency: 'USD',
        status: JobStatus.OPEN,
        location: 'Forest Hills, Queens, NY',
        latitude: 40.7196,
        longitude: -73.8448,
        posterId: users[0].id,
      },
    }),
  ]);

  console.log(`Created ${jobs.length} jobs`);

  // Create demo offers
  const offers = await Promise.all([
    prisma.offer.create({
      data: {
        price: 70.0,
        message:
          'Hi! I would love to help with your children this weekend. I have 5 years of experience as a babysitter and am first aid certified. I love playing games and reading stories. Looking forward to meeting your family!',
        jobId: jobs[0].id,
        providerId: users[1].id,
      },
    }),
    prisma.offer.create({
      data: {
        price: 140.0,
        message:
          'Hello! I can provide excellent deep cleaning for your apartment. I use eco-friendly products and pay attention to every detail. I am available this week and can bring all necessary supplies.',
        jobId: jobs[1].id,
        providerId: users[2].id,
      },
    }),
    prisma.offer.create({
      data: {
        price: 110.0,
        message:
          'Bună! Sunt bucătar profesionist și aș fi încântată să pregătesc o cină tradițională românească pentru familia dumneavoastră. Am experiență în prepararea sarmalelor și cozonacului după rețete de familie.',
        jobId: jobs[2].id,
        providerId: users[3].id,
      },
    }),
  ]);

  console.log(`Created ${offers.length} offers`);

  // Create demo reviews
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        rating: 5,
        comment:
          'Maria was absolutely wonderful with our kids! They had so much fun and were asking when she could come back. Highly recommend!',
        jobId: jobs[0].id,
        authorId: users[0].id,
        targetId: users[1].id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment:
          "Alex did an amazing job cleaning our apartment. It's never looked better! Very thorough and professional.",
        jobId: jobs[1].id,
        authorId: users[0].id,
        targetId: users[2].id,
      },
    }),
  ]);

  console.log(`Created ${reviews.length} reviews`);

  // Create a demo conversation
  const conversation = await prisma.conversation.create({
    data: {
      jobId: jobs[0].id,
      participants: {
        create: [{ userId: users[0].id }, { userId: users[1].id }],
      },
      messages: {
        create: [
          {
            content: 'Hi Maria! Thanks for your offer. Are you available this Saturday?',
            senderId: users[0].id,
          },
          {
            content:
              'Hi John! Yes, I am completely available on Saturday. What time would you need me?',
            senderId: users[1].id,
          },
          {
            content:
              'Great! We would need you from 6 PM to around 11 PM. Does that work for you?',
            senderId: users[0].id,
          },
          {
            content:
              'That works perfectly! Could you tell me a bit more about the kids? What do they like to do?',
            senderId: users[1].id,
          },
        ],
      },
    },
  });

  console.log('Created demo conversation');

  // Create demo notifications
  await prisma.notification.createMany({
    data: [
      {
        type: 'NEW_OFFER',
        title: 'New offer received',
        body: 'Maria Garcia submitted an offer for your babysitting job',
        data: JSON.stringify({ jobId: jobs[0].id, offerId: offers[0].id }),
        userId: users[0].id,
      },
      {
        type: 'NEW_MESSAGE',
        title: 'New message',
        body: 'Maria Garcia sent you a message',
        data: JSON.stringify({ conversationId: conversation.id }),
        userId: users[0].id,
      },
    ],
  });

  console.log('Created demo notifications');

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
