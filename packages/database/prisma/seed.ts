import {
  PrismaClient,
  ServiceCategory,
  JobStatus,
  UserRole,
  JobType,
  PricingType,
} from '@prisma/client';

const prisma = new PrismaClient();

// Helper to create a date offset from now
const daysFromNow = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

// NYC-area coordinates with slight variations
const locations = [
  { address: 'Manhattan, NY', lat: 40.7128, lng: -74.006 },
  { address: 'Brooklyn, NY', lat: 40.6782, lng: -73.9442 },
  { address: 'Queens, NY', lat: 40.7282, lng: -73.8317 },
  { address: 'Bronx, NY', lat: 40.8448, lng: -73.8648 },
  { address: 'Staten Island, NY', lat: 40.5795, lng: -74.1502 },
  { address: 'Upper West Side, NY', lat: 40.787, lng: -73.9754 },
  { address: 'Williamsburg, Brooklyn', lat: 40.7081, lng: -73.9571 },
  { address: 'Astoria, Queens', lat: 40.7592, lng: -73.9196 },
  { address: 'Park Slope, Brooklyn', lat: 40.671, lng: -73.9777 },
  { address: 'Harlem, NY', lat: 40.8116, lng: -73.9465 },
  { address: 'Long Island City, Queens', lat: 40.744, lng: -73.9485 },
  { address: 'SoHo, Manhattan', lat: 40.7233, lng: -73.9985 },
];

const jitter = () => (Math.random() - 0.5) * 0.01;

async function main() {
  console.log('🌱 Seeding database with comprehensive demo data...\n');

  // Clean existing data in correct order
  console.log('Cleaning existing data...');
  await prisma.foodOrder.deleteMany();
  await prisma.localFood.deleteMany();
  await prisma.bookingRequest.deleteMany();
  await prisma.eventRegistration.deleteMany();
  await prisma.kidsEvent.deleteMany();
  await prisma.clothesItem.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.verificationRequest.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.review.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.jobImage.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.savedJob.deleteMany();
  await prisma.report.deleteMany();
  await prisma.job.deleteMany();
  await prisma.user.deleteMany();
  console.log('✓ Cleaned\n');

  // ==========================================
  // 1. USERS — 10 regular, 10 providers, 3 admins
  // ==========================================
  console.log('Creating users...');

  const admins = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@juniorhub.com',
        firebaseUid: 'seed-admin-001',
        name: 'Platform Admin',
        bio: 'JuniorHub platform administrator.',
        address: 'Manhattan, NY',
        latitude: 40.7128,
        longitude: -74.006,
        role: UserRole.ADMIN,
        isVerified: true,
        rating: 5.0,
        reviewCount: 0,
      },
    }),
    prisma.user.create({
      data: {
        email: 'moderator@juniorhub.com',
        firebaseUid: 'seed-admin-002',
        name: 'Dana Moderator',
        bio: 'Community moderator.',
        address: 'Brooklyn, NY',
        latitude: 40.6782,
        longitude: -73.9442,
        role: UserRole.ADMIN,
        isVerified: true,
        rating: 5.0,
        reviewCount: 0,
      },
    }),
    prisma.user.create({
      data: {
        email: 'support@juniorhub.com',
        firebaseUid: 'seed-admin-003',
        name: 'Support Admin',
        bio: 'Customer support administrator.',
        address: 'Queens, NY',
        latitude: 40.7282,
        longitude: -73.8317,
        role: UserRole.ADMIN,
        isVerified: true,
        rating: 5.0,
        reviewCount: 0,
      },
    }),
  ]);

  const regularUserData = [
    {
      name: 'John Smith',
      email: 'john@example.com',
      bio: 'Father of two. Always looking for trusted childcare and clean apartments.',
      phone: '+12125550101',
    },
    {
      name: 'Emily Chen',
      email: 'emily.chen@example.com',
      bio: 'Working mom. My kids love art and music! Looking for creative activities.',
      phone: '+12125550102',
    },
    {
      name: 'Michael Brown',
      email: 'michael.b@example.com',
      bio: 'Single dad with a 5-year-old. Weekend warrior for kids events!',
      phone: '+17185550103',
    },
    {
      name: 'Jessica Taylor',
      email: 'jessica.t@example.com',
      bio: 'Mom of 3. Always in need of babysitters and home cooked meals.',
      phone: '+13475550104',
    },
    {
      name: 'David Wilson',
      email: 'david.w@example.com',
      bio: 'New to the neighborhood. Looking for local services and community.',
      phone: '+19175550105',
    },
    {
      name: 'Sarah Martinez',
      email: 'sarah.m@example.com',
      bio: 'Stay-at-home mom who loves organizing playdates and swapping kids clothes.',
      phone: '+12125550106',
    },
    {
      name: 'Daniel Kim',
      email: 'daniel.k@example.com',
      bio: 'Tech dad. Love finding innovative ways to keep the kids entertained.',
      phone: '+17185550107',
    },
    {
      name: 'Rachel Green',
      email: 'rachel.g@example.com',
      bio: 'Freelancer and mom. Flexible schedule but always need help with housework.',
      phone: '+13475550108',
    },
    {
      name: 'Alex Patel',
      email: 'alex.p@example.com',
      bio: 'Father of twins. Double the fun, double the help needed!',
      phone: '+19175550109',
    },
    {
      name: 'Olivia Anderson',
      email: 'olivia.a@example.com',
      bio: 'First-time mom. Learning the ropes and grateful for this community.',
      phone: '+12125550110',
    },
  ];

  const regularUsers = await Promise.all(
    regularUserData.map((u, i) => {
      const loc = locations[i % locations.length];
      return prisma.user.create({
        data: {
          email: u.email,
          firebaseUid: `seed-user-${String(i + 1).padStart(3, '0')}`,
          name: u.name,
          bio: u.bio,
          phone: u.phone,
          address: loc.address,
          latitude: loc.lat + jitter(),
          longitude: loc.lng + jitter(),
          role: UserRole.USER,
          isVerified: false,
          rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
          reviewCount: Math.floor(Math.random() * 15),
        },
      });
    })
  );

  const providerData = [
    {
      name: 'Maria Garcia',
      email: 'maria@example.com',
      bio: 'Certified babysitter with 5+ years experience. CPR certified. Love working with kids!',
    },
    {
      name: 'Alex Johnson',
      email: 'alex.j@example.com',
      bio: 'Professional cleaner. Eco-friendly products only. 10 years experience.',
    },
    {
      name: 'Elena Popescu',
      email: 'elena@example.com',
      bio: 'Professional cook specialized in traditional Romanian cuisine. 15 years experience.',
      locale: 'ro',
    },
    {
      name: 'Sophie Laurent',
      email: 'sophie.l@example.com',
      bio: 'Former preschool teacher turned babysitter. Specializing in educational play.',
    },
    {
      name: 'Marcus Reed',
      email: 'marcus.r@example.com',
      bio: 'Deep cleaning specialist. Apartments, houses, move-in/move-out cleaning.',
    },
    {
      name: 'Priya Sharma',
      email: 'priya.s@example.com',
      bio: 'Home chef. Indian, Mediterranean, and fusion cuisines. Catering for families.',
    },
    {
      name: 'Lisa Wong',
      email: 'lisa.w@example.com',
      bio: 'Experienced nanny. Bilingual English/Mandarin. Great with toddlers.',
    },
    {
      name: 'Carlos Rivera',
      email: 'carlos.r@example.com',
      bio: 'Handyman and home organizer. I also do house cleaning. Very thorough.',
    },
    {
      name: 'Aisha Mohammed',
      email: 'aisha.m@example.com',
      bio: 'Certified childcare provider. First aid trained. Available nights and weekends.',
    },
    {
      name: 'Tom Baker',
      email: 'tom.b@example.com',
      bio: 'Personal chef and meal prep expert. Healthy family meals are my specialty!',
    },
  ];

  const providers = await Promise.all(
    providerData.map((u, i) => {
      const loc = locations[(i + 3) % locations.length];
      return prisma.user.create({
        data: {
          email: u.email,
          firebaseUid: `seed-provider-${String(i + 1).padStart(3, '0')}`,
          name: u.name,
          bio: u.bio,
          phone: `+1${Math.floor(2000000000 + Math.random() * 8000000000)}`,
          address: loc.address,
          latitude: loc.lat + jitter(),
          longitude: loc.lng + jitter(),
          role: UserRole.PROVIDER,
          isVerified: i < 7, // first 7 verified, last 3 not
          rating: parseFloat((4.2 + Math.random() * 0.8).toFixed(1)),
          reviewCount: Math.floor(10 + Math.random() * 60),
          locale: (u as any).locale || 'en',
        },
      });
    })
  );

  console.log(
    `✓ Created ${admins.length} admins, ${regularUsers.length} regular users, ${providers.length} providers\n`
  );

  // ==========================================
  // 2. JOBS — 15 jobs across all categories & statuses
  // ==========================================
  console.log('Creating jobs...');

  // Service requests from clients (SERVICE_REQUEST - default)
  const jobsData: Array<{
    title: string;
    desc: string;
    cat: ServiceCategory;
    budget: number | null;
    status: JobStatus;
    poster: number;
    provider?: number;
    sched?: number;
    jobType?: JobType;
    pricingType?: PricingType;
    isProviderJob?: boolean;
  }> = [
    // BABYSITTING - SERVICE_REQUEST
    {
      title: 'Babysitter needed for 2 kids this Saturday',
      desc: 'Looking for an experienced babysitter for my two children (ages 4 and 7) this Saturday evening from 6 PM to 11 PM. Must have experience with young children. The kids love board games and bedtime stories.',
      cat: ServiceCategory.BABYSITTING,
      budget: 75,
      status: JobStatus.OPEN,
      poster: 0,
      sched: 3,
    },
    {
      title: 'After-school care Mon-Fri',
      desc: 'Need someone to pick up my daughter (age 8) from school at 3 PM and watch her until 6 PM, Monday through Friday. Help with homework is a plus. Must be reliable and punctual.',
      cat: ServiceCategory.BABYSITTING,
      budget: 200,
      status: JobStatus.OPEN,
      poster: 1,
      sched: 1,
    },
    {
      title: 'Weekend nanny for newborn',
      desc: 'First-time parents looking for an experienced nanny for our 3-month-old baby on weekends. Must have infant care experience. Hours: 9 AM - 5 PM Saturday and Sunday.',
      cat: ServiceCategory.BABYSITTING,
      budget: 250,
      status: JobStatus.IN_PROGRESS,
      poster: 9,
      provider: 0,
      sched: 2,
    },
    {
      title: 'Babysitter for birthday party',
      desc: 'Hosting a birthday party for my son (turning 6). Need someone to help supervise 10 kids for 3 hours. Games and activities already planned, just need an extra set of hands.',
      cat: ServiceCategory.BABYSITTING,
      budget: 60,
      status: JobStatus.COMPLETED,
      poster: 3,
      provider: 3,
      sched: -5,
    },
    // HOUSE_CLEANING - SERVICE_REQUEST
    {
      title: 'Deep cleaning for 2BR apartment',
      desc: 'Need thorough deep cleaning for my apartment. Kitchen, 2 bathrooms, bedrooms, living room. About 900 sq ft. Eco-friendly products preferred.',
      cat: ServiceCategory.HOUSE_CLEANING,
      budget: 150,
      status: JobStatus.OPEN,
      poster: 0,
    },
    {
      title: 'Move-out cleaning service',
      desc: 'Moving out of my apartment end of month. Need professional cleaning to get security deposit back. 1BR apartment, about 650 sq ft. Kitchen and bathroom need special attention.',
      cat: ServiceCategory.HOUSE_CLEANING,
      budget: 120,
      status: JobStatus.OPEN,
      poster: 4,
    },
    {
      title: 'Weekly house cleaning',
      desc: 'Looking for a reliable cleaner to come once a week. 3BR house, about 1400 sq ft. General cleaning, vacuuming, mopping, bathroom sanitizing.',
      cat: ServiceCategory.HOUSE_CLEANING,
      budget: 100,
      status: JobStatus.IN_PROGRESS,
      poster: 7,
      provider: 1,
    },
    {
      title: 'Post-renovation cleanup',
      desc: 'Just finished renovating our kitchen. Need help with heavy-duty cleanup — dust, debris, deep scrubbing of surfaces. Half day work.',
      cat: ServiceCategory.HOUSE_CLEANING,
      budget: 180,
      status: JobStatus.COMPLETED,
      poster: 2,
      provider: 4,
      sched: -10,
    },
    // OTHER - SERVICE_REQUEST
    {
      title: 'Help assembling IKEA furniture',
      desc: 'Need help assembling a bunk bed, a bookshelf, and a small desk for my kids room. All IKEA, tools provided. Estimated 3-4 hours.',
      cat: ServiceCategory.OTHER,
      budget: 90,
      status: JobStatus.OPEN,
      poster: 6,
    },
    {
      title: 'Dog walking while on vacation',
      desc: 'Going away for 5 days. Need someone to walk our friendly golden retriever twice a day (morning and evening). Dog is well-behaved.',
      cat: ServiceCategory.OTHER,
      budget: 100,
      status: JobStatus.OPEN,
      poster: 3,
      sched: 10,
    },
    {
      title: 'Photography for kids birthday party',
      desc: "Looking for someone to photograph my daughter's 4th birthday party. 2-hour event in Central Park. Natural, candid shots preferred.",
      cat: ServiceCategory.OTHER,
      budget: 150,
      status: JobStatus.COMPLETED,
      poster: 5,
      provider: 7,
      sched: -14,
    },

    // === MORE BABYSITTING - SERVICE_REQUEST ===
    {
      title: 'Evening babysitter for toddler',
      desc: 'Need a patient, experienced sitter for our 2-year-old on Friday evenings (6 PM - 10 PM). She is still adjusting to being without mom, so someone warm and calm is key. Dinner will be prepared.',
      cat: ServiceCategory.BABYSITTING,
      budget: 65,
      status: JobStatus.OPEN,
      poster: 5,
      sched: 4,
    },
    {
      title: 'Summer camp drop-off & pickup helper',
      desc: 'Looking for someone to drop my son (age 9) at summer camp at 8:30 AM and pick him up at 4 PM, Monday-Friday for 2 weeks. Must have a car and car seat.',
      cat: ServiceCategory.BABYSITTING,
      budget: 300,
      status: JobStatus.OPEN,
      poster: 4,
      sched: 14,
    },
    {
      title: 'Overnight nanny for business trip',
      desc: 'Traveling for work overnight (Tuesday-Wednesday). Need someone to stay with my 6-year-old son. Must handle bedtime routine, breakfast, and school drop-off next morning.',
      cat: ServiceCategory.BABYSITTING,
      budget: 180,
      status: JobStatus.IN_PROGRESS,
      poster: 2,
      provider: 6,
      sched: 2,
    },
    {
      title: 'Playdate supervisor for 4 kids',
      desc: 'Hosting a playdate this Sunday. 4 kids ages 5-8 will be here. Need someone to keep them entertained and safe while I work from home. Snacks provided. 3 hours.',
      cat: ServiceCategory.BABYSITTING,
      budget: 55,
      status: JobStatus.OPEN,
      poster: 7,
      sched: 5,
    },
    {
      title: 'Regular sitter for special needs child',
      desc: 'My daughter (age 7) has mild autism. Looking for a patient, trained sitter who can engage her with sensory activities. Weekly Saturday mornings, 9 AM - 1 PM.',
      cat: ServiceCategory.BABYSITTING,
      budget: 120,
      status: JobStatus.IN_PROGRESS,
      poster: 6,
      provider: 8,
      sched: 1,
    },
    {
      title: 'Last-minute babysitter tonight!',
      desc: 'Emergency! Our regular sitter cancelled. Need someone tonight from 7 PM to midnight for our 3-year-old daughter. She goes to bed around 8:30 PM so it should be easy after that.',
      cat: ServiceCategory.BABYSITTING,
      budget: 90,
      status: JobStatus.COMPLETED,
      poster: 8,
      provider: 0,
      sched: -2,
    },
    {
      title: 'Bilingual nanny for language immersion',
      desc: 'Looking for a Spanish-speaking nanny for my two kids (ages 3 and 5). Goal is language immersion during playtime. 3 afternoons per week, 1 PM - 5 PM.',
      cat: ServiceCategory.BABYSITTING,
      budget: 280,
      status: JobStatus.OPEN,
      poster: 1,
      sched: 6,
    },
    {
      title: 'Date night babysitter needed',
      desc: 'My husband and I have a dinner reservation this Saturday. Need someone from 6:30 PM to 11 PM for our two boys (ages 3 and 6). They eat dinner at 7, bed at 8:30.',
      cat: ServiceCategory.BABYSITTING,
      budget: 85,
      status: JobStatus.COMPLETED,
      poster: 0,
      provider: 3,
      sched: -3,
    },

    // === MORE HOUSE CLEANING - SERVICE_REQUEST ===
    {
      title: 'Spring deep clean for 3BR house',
      desc: 'Annual spring cleaning! Need every room deep cleaned — windows inside, baseboards, behind appliances, ceiling fans. About 1800 sq ft. Prefer someone who brings their own supplies.',
      cat: ServiceCategory.HOUSE_CLEANING,
      budget: 250,
      status: JobStatus.OPEN,
      poster: 1,
      sched: 5,
    },
    {
      title: 'Nursery cleaning and sanitizing',
      desc: 'Expecting a baby in 3 weeks! Need the nursery and master bedroom thoroughly cleaned and sanitized. Hypoallergenic products only please. About 400 sq ft total.',
      cat: ServiceCategory.HOUSE_CLEANING,
      budget: 80,
      status: JobStatus.OPEN,
      poster: 9,
      sched: 2,
    },
    {
      title: 'Kitchen deep clean - grease & oven',
      desc: "My kitchen needs serious attention. Oven hasn't been cleaned in months, grease buildup on range hood, and the fridge needs a full wipedown. Just the kitchen!",
      cat: ServiceCategory.HOUSE_CLEANING,
      budget: 90,
      status: JobStatus.IN_PROGRESS,
      poster: 3,
      provider: 4,
    },
    {
      title: 'Bi-weekly apartment cleaning',
      desc: 'Looking for a reliable cleaner every other week. Studio apartment, ~500 sq ft. General cleaning: dusting, vacuuming, bathroom, kitchen surfaces. Quick job for someone efficient.',
      cat: ServiceCategory.HOUSE_CLEANING,
      budget: 65,
      status: JobStatus.OPEN,
      poster: 6,
    },
    {
      title: 'Post-party cleanup needed ASAP',
      desc: 'Had a kids birthday party yesterday and the house is a disaster. Need help cleaning up: floors are sticky, frosting on walls, glitter everywhere. 2BR apartment.',
      cat: ServiceCategory.HOUSE_CLEANING,
      budget: 100,
      status: JobStatus.COMPLETED,
      poster: 5,
      provider: 1,
      sched: -4,
    },
    {
      title: 'Garage and basement organizing + clean',
      desc: 'Need help organizing and deep cleaning our garage and basement. Lots of kids toys, seasonal items, and clutter. About 6 hours of work total.',
      cat: ServiceCategory.HOUSE_CLEANING,
      budget: 200,
      status: JobStatus.OPEN,
      poster: 8,
      sched: 8,
    },
    {
      title: 'Window cleaning - 10 windows inside & out',
      desc: 'Need all 10 windows in my apartment cleaned inside and out. Ground floor, so no special equipment needed. Screen cleaning included please.',
      cat: ServiceCategory.HOUSE_CLEANING,
      budget: 70,
      status: JobStatus.COMPLETED,
      poster: 4,
      provider: 7,
      sched: -6,
    },
    {
      title: 'Carpet steam cleaning for 3 rooms',
      desc: 'Our carpets are looking worn and stained from the kids. Need professional steam cleaning in living room, hallway, and master bedroom. Must bring own steam cleaner.',
      cat: ServiceCategory.HOUSE_CLEANING,
      budget: 160,
      status: JobStatus.IN_PROGRESS,
      poster: 0,
      provider: 4,
      sched: 1,
    },

    // === SERVICE OFFERINGS (by providers) ===
    // Babysitting offerings
    {
      title: 'Experienced babysitter available evenings & weekends',
      desc: 'Certified babysitter with 5+ years experience and CPR training. I specialize in ages 2-10. I bring educational activities and games. Available Monday-Saturday evenings and all day weekends. References available upon request.',
      cat: ServiceCategory.BABYSITTING,
      budget: 25,
      status: JobStatus.OPEN,
      poster: 0,
      jobType: JobType.SERVICE_OFFERING,
      pricingType: PricingType.HOURLY,
      isProviderJob: true,
    },
    {
      title: 'Former preschool teacher offering childcare',
      desc: 'With 8 years of preschool teaching experience, I offer quality childcare with an educational approach. Activities include reading, arts and crafts, music, and outdoor play. First aid certified. Great with toddlers and preschoolers.',
      cat: ServiceCategory.BABYSITTING,
      budget: 30,
      status: JobStatus.OPEN,
      poster: 3,
      jobType: JobType.SERVICE_OFFERING,
      pricingType: PricingType.HOURLY,
      isProviderJob: true,
    },
    {
      title: 'Bilingual nanny - English & Mandarin',
      desc: 'Experienced nanny fluent in English and Mandarin. I create immersive bilingual environments for children. Perfect for families wanting their kids to learn Mandarin through play. Available full days and half days.',
      cat: ServiceCategory.BABYSITTING,
      budget: 35,
      status: JobStatus.OPEN,
      poster: 6,
      jobType: JobType.SERVICE_OFFERING,
      pricingType: PricingType.HOURLY,
      isProviderJob: true,
    },
    {
      title: 'Night & weekend babysitter - infant specialist',
      desc: 'Certified childcare provider with special training in infant care. First aid and CPR certified. I am available evenings and weekends. Gentle approach, experienced with newborns through toddlers. Night rates apply after 10 PM.',
      cat: ServiceCategory.BABYSITTING,
      budget: 28,
      status: JobStatus.OPEN,
      poster: 8,
      jobType: JobType.SERVICE_OFFERING,
      pricingType: PricingType.HOURLY,
      isProviderJob: true,
    },

    // House cleaning offerings
    {
      title: 'Eco-friendly deep cleaning service',
      desc: 'Professional house cleaner using only eco-friendly, non-toxic products. 10 years of experience. I bring all my own supplies and equipment. Specializing in apartments and small homes. Satisfaction guaranteed or I come back free.',
      cat: ServiceCategory.HOUSE_CLEANING,
      budget: 120,
      status: JobStatus.OPEN,
      poster: 1,
      jobType: JobType.SERVICE_OFFERING,
      pricingType: PricingType.PER_LOCATION,
      isProviderJob: true,
    },
    {
      title: 'Move-in / move-out cleaning specialist',
      desc: 'I specialize in thorough move-in and move-out cleanings that help you get your security deposit back. Every surface, inside cabinets, appliances, bathroom deep scrub. Photos of completed work provided.',
      cat: ServiceCategory.HOUSE_CLEANING,
      budget: 180,
      status: JobStatus.OPEN,
      poster: 4,
      jobType: JobType.SERVICE_OFFERING,
      pricingType: PricingType.PER_LOCATION,
      isProviderJob: true,
    },
    {
      title: 'Handyman & home cleaning combo service',
      desc: 'Offering a combined handyman and cleaning service. I can fix small things around the house while also doing a thorough cleaning. Great for families who need both. Tools and supplies included.',
      cat: ServiceCategory.HOUSE_CLEANING,
      budget: 40,
      status: JobStatus.OPEN,
      poster: 7,
      jobType: JobType.SERVICE_OFFERING,
      pricingType: PricingType.HOURLY,
      isProviderJob: true,
    },

    // Other offerings
    {
      title: 'Professional family photography sessions',
      desc: 'Candid, natural family photos in parks and outdoor locations around NYC. I specialize in kids photography and capturing genuine moments. Package includes 1-hour session and 30 edited digital photos. Props and outfit suggestions provided.',
      cat: ServiceCategory.OTHER,
      budget: 150,
      status: JobStatus.OPEN,
      poster: 7,
      jobType: JobType.SERVICE_OFFERING,
      pricingType: PricingType.FIXED,
      isProviderJob: true,
    },
  ];

  const jobs = await Promise.all(
    jobsData.map((j, i) => {
      const loc = locations[i % locations.length];
      // Provider offerings use the provider array; client requests use regularUsers
      const posterId = j.isProviderJob ? providers[j.poster].id : regularUsers[j.poster].id;
      return prisma.job.create({
        data: {
          title: j.title,
          description: j.desc,
          category: j.cat,
          jobType: j.jobType || JobType.SERVICE_REQUEST,
          pricingType: j.pricingType || PricingType.FIXED,
          budget: j.budget,
          status: j.status,
          location: loc.address,
          latitude: loc.lat + jitter(),
          longitude: loc.lng + jitter(),
          scheduledAt: j.sched ? (j.sched > 0 ? daysFromNow(j.sched) : daysAgo(-j.sched)) : null,
          completedAt:
            j.status === JobStatus.COMPLETED ? daysAgo(j.sched ? -j.sched - 1 : 3) : null,
          posterId,
          providerId: j.provider !== undefined ? providers[j.provider].id : null,
        },
      });
    })
  );

  console.log(`✓ Created ${jobs.length} jobs\n`);

  // ==========================================
  // 2b. JOB IMAGES — every job gets 1-3 images
  // ==========================================
  console.log('Creating job images...');

  const babysittingImages = [
    'https://images.unsplash.com/photo-1587616211892-f743fcca64f9?w=800',
    'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800',
    'https://images.unsplash.com/photo-1484820540004-14229fe36ca4?w=800',
    'https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=800',
    'https://images.unsplash.com/photo-1587131782738-de30ea91a542?w=800',
    'https://images.unsplash.com/photo-1608889825103-f5fd55730191?w=800',
    'https://images.unsplash.com/photo-1566004100477-7b3e6a0f9171?w=800',
    'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800',
    'https://images.unsplash.com/photo-1476234251651-f353703a034d?w=800',
    'https://images.unsplash.com/photo-1571210862729-78a33e9911a7?w=800',
    'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800',
    'https://images.unsplash.com/photo-1587654780291-39c9404d7dd0?w=800',
  ];

  const cleaningImages = [
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',
    'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800',
    'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=800',
    'https://images.unsplash.com/photo-1527515545081-5db817172677?w=800',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
    'https://images.unsplash.com/photo-1556909211-36987daf7b4d?w=800',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800',
    'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800',
    'https://images.unsplash.com/photo-1556908153-2405c43b483a?w=800',
    'https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?w=800',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
  ];

  const foodImages = [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
    'https://images.unsplash.com/photo-1547592180-85f173990554?w=800',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
    'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800',
    'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800',
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800',
    'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=800',
  ];

  const otherImages = [
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800',
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800',
  ];

  const imagesByCategory: Record<string, string[]> = {
    BABYSITTING: babysittingImages,
    HOUSE_CLEANING: cleaningImages,
    OTHER: otherImages,
  };

  let imageCount = 0;
  for (let i = 0; i < jobs.length; i++) {
    const cat = jobsData[i].cat;
    const pool = imagesByCategory[cat] || otherImages;
    // Each job gets 1-3 images
    const numImages = 1 + (i % 3); // cycles: 1, 2, 3, 1, 2, 3...
    for (let img = 0; img < numImages; img++) {
      const url = pool[(i + img) % pool.length];
      await prisma.jobImage.create({
        data: {
          url,
          publicId: `seed-job-${i}-img-${img}`,
          order: img,
          jobId: jobs[i].id,
        },
      });
      imageCount++;
    }
  }

  console.log(`✓ Created ${imageCount} job images\n`);

  // ==========================================
  // 3. OFFERS — 2-3 per open job, 1 accepted per in-progress/completed
  // ==========================================
  console.log('Creating offers...');

  const offersToCreate: Array<{
    price: number;
    message: string;
    jobId: string;
    providerId: string;
    isAccepted: boolean;
  }> = [];

  // Open SERVICE_REQUEST jobs get multiple offers (not SERVICE_OFFERING jobs)
  const openJobs = jobs.filter(
    (_, i) =>
      jobsData[i].status === JobStatus.OPEN && jobsData[i].jobType !== JobType.SERVICE_OFFERING
  );
  for (const job of openJobs) {
    const availableProviders = [...providers].sort(() => Math.random() - 0.5).slice(0, 3);
    for (const prov of availableProviders) {
      offersToCreate.push({
        price: parseFloat((Number(job.budget) * (0.8 + Math.random() * 0.4)).toFixed(2)),
        message: [
          "Hi! I'd love to help with this. I have extensive experience and great references.",
          "I'm available and very interested. I can do this for a competitive price!",
          "This is right up my alley. I've done similar work many times and always get 5 stars.",
        ][Math.floor(Math.random() * 3)],
        jobId: job.id,
        providerId: prov.id,
        isAccepted: false,
      });
    }
  }

  // In-progress and completed jobs: the assigned provider's offer is accepted
  for (let i = 0; i < jobsData.length; i++) {
    const jd = jobsData[i];
    if (
      (jd.status === JobStatus.IN_PROGRESS || jd.status === JobStatus.COMPLETED) &&
      jd.provider !== undefined
    ) {
      offersToCreate.push({
        price: parseFloat((Number(jobs[i].budget) * 0.95).toFixed(2)),
        message: 'I am excited to work on this! I have all the skills needed.',
        jobId: jobs[i].id,
        providerId: providers[jd.provider].id,
        isAccepted: true,
      });
    }
  }

  // Deduplicate by jobId+providerId
  const seen = new Set<string>();
  const uniqueOffers = offersToCreate.filter((o) => {
    const key = `${o.jobId}-${o.providerId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const offers = [];
  for (const o of uniqueOffers) {
    offers.push(
      await prisma.offer.create({
        data: {
          price: o.price,
          message: o.message,
          jobId: o.jobId,
          providerId: o.providerId,
          isAccepted: o.isAccepted,
        },
      })
    );
  }

  console.log(`✓ Created ${offers.length} offers\n`);

  // ==========================================
  // 4. REVIEWS — for all completed jobs + extras
  // ==========================================
  console.log('Creating reviews...');

  const reviewComments: Record<number, string[]> = {
    5: [
      'Absolutely fantastic! Exceeded all expectations. Would hire again in a heartbeat.',
      'Best experience ever. Professional, kind, and thorough. 10/10!',
      'Our kids loved them! So responsible and caring. Highly recommend.',
      'Amazing work. The house has never looked this clean. Thank you!',
      'The food was incredible. Everyone at the dinner raved about it!',
    ],
    4: [
      'Very good job overall. Minor issues but nothing significant. Would use again.',
      'Professional and reliable. Showed up on time and did great work.',
      'Kids had a wonderful time. Very responsible and attentive.',
      'Good cleaning job. A couple of spots missed but otherwise excellent.',
    ],
    3: [
      'Decent service. Met expectations but nothing extraordinary.',
      'Average experience. Got the job done but could be more thorough.',
      'Okay overall. Communication could have been better.',
    ],
  };

  let reviewCount = 0;

  // Reviews for completed jobs
  for (let i = 0; i < jobsData.length; i++) {
    const jd = jobsData[i];
    if (jd.status === JobStatus.COMPLETED && jd.provider !== undefined) {
      const rating = [5, 5, 4, 5][reviewCount % 4];
      const comments = reviewComments[rating];
      await prisma.review.create({
        data: {
          rating,
          comment: comments[Math.floor(Math.random() * comments.length)],
          jobId: jobs[i].id,
          authorId: regularUsers[jd.poster].id,
          targetId: providers[jd.provider].id,
        },
      });
      reviewCount++;

      // Provider also reviews the poster
      const reverseComments = [
        'Great client! Clear instructions and very respectful. Happy to work with them again.',
        'Nice family. Everything was well organized and payment was prompt.',
        'Good communication and fair expectations. Would work with them again.',
        'Pleasant experience. The home was welcoming and instructions were clear.',
      ];
      await prisma.review.create({
        data: {
          rating: [5, 4, 5, 5][reviewCount % 4],
          comment: reverseComments[reviewCount % reverseComments.length],
          jobId: jobs[i].id,
          authorId: providers[jd.provider].id,
          targetId: regularUsers[jd.poster].id,
        },
      });
      reviewCount++;
    }
  }

  // Extra reviews: create auxiliary completed jobs for each pair
  const extraReviewPairs = [
    { author: 0, target: 0, rating: 5 },
    { author: 1, target: 3, rating: 4 },
    { author: 2, target: 1, rating: 5 },
    { author: 3, target: 5, rating: 4 },
    { author: 4, target: 4, rating: 3 },
    { author: 5, target: 9, rating: 5 },
    { author: 6, target: 6, rating: 5 },
    { author: 7, target: 1, rating: 4 },
    { author: 8, target: 5, rating: 5 },
    { author: 9, target: 0, rating: 5 },
  ];

  const extraReviewJobs = await Promise.all(
    extraReviewPairs.map((pair, i) => {
      const loc = locations[i % locations.length];
      return prisma.job.create({
        data: {
          title: `Past service #${i + 1}`,
          description: 'Historical completed service for review purposes.',
          category: [
            ServiceCategory.BABYSITTING,
            ServiceCategory.HOUSE_CLEANING,
            ServiceCategory.OTHER,
            ServiceCategory.BABYSITTING,
          ][i % 4],
          budget: 50 + Math.floor(Math.random() * 150),
          status: JobStatus.COMPLETED,
          location: loc.address,
          latitude: loc.lat,
          longitude: loc.lng,
          completedAt: daysAgo(15 + i * 3),
          posterId: regularUsers[pair.author].id,
          providerId: providers[pair.target].id,
        },
      });
    })
  );

  // Add images to extra review jobs too
  for (let i = 0; i < extraReviewJobs.length; i++) {
    const cat = [
      ServiceCategory.BABYSITTING,
      ServiceCategory.HOUSE_CLEANING,
      ServiceCategory.OTHER,
      ServiceCategory.BABYSITTING,
    ][i % 4];
    const pool = imagesByCategory[cat] || otherImages;
    const url = pool[(i + 5) % pool.length];
    await prisma.jobImage.create({
      data: {
        url,
        publicId: `seed-extra-job-${i}-img-0`,
        order: 0,
        jobId: extraReviewJobs[i].id,
      },
    });
    imageCount++;
  }

  for (let i = 0; i < extraReviewPairs.length; i++) {
    const pair = extraReviewPairs[i];
    const comments = reviewComments[pair.rating];
    await prisma.review.create({
      data: {
        rating: pair.rating,
        comment: comments[Math.floor(Math.random() * comments.length)],
        jobId: extraReviewJobs[i].id,
        authorId: regularUsers[pair.author].id,
        targetId: providers[pair.target].id,
      },
    });
    reviewCount++;
  }

  console.log(`✓ Created ${reviewCount} reviews\n`);

  // ==========================================
  // 5. CONVERSATIONS & MESSAGES
  // ==========================================
  console.log('Creating conversations and messages...');

  const conversationScripts = [
    {
      jobIdx: 0,
      userIdx: 0,
      provIdx: 0,
      messages: [
        {
          from: 'user',
          text: 'Hi Maria! Thanks for your offer. Are you available Saturday 6-11 PM?',
        },
        {
          from: 'prov',
          text: 'Hi John! Yes, I am absolutely available. I love working with kids that age!',
        },
        {
          from: 'user',
          text: 'Great! My kids are 4 and 7. They love board games and bedtime stories.',
        },
        {
          from: 'prov',
          text: 'Perfect! I actually bring a bag of age-appropriate activities. Would you like me to arrive 15 min early to get settled?',
        },
        { from: 'user', text: 'That would be wonderful. See you at 5:45 PM then!' },
        { from: 'prov', text: 'See you then! Looking forward to it.' },
      ],
    },
    {
      jobIdx: 1,
      userIdx: 1,
      provIdx: 3,
      messages: [
        {
          from: 'user',
          text: 'Hi Sophie, I saw your profile. Do you have experience with after-school pickup?',
        },
        {
          from: 'prov',
          text: 'Hi Emily! Yes, I did after-school care for 3 years when I was teaching. Which school?',
        },
        { from: 'user', text: 'PS 234 on the Upper West Side. Pickup at 3 PM sharp.' },
        {
          from: 'prov',
          text: 'I know that school! Very convenient for me. I can also help with homework.',
        },
        { from: 'user', text: 'That would be amazing. Can we do a trial day first?' },
        { from: 'prov', text: 'Of course! How about this Monday?' },
        { from: 'user', text: 'Monday works. I will add you to the pickup list.' },
      ],
    },
    {
      jobIdx: 4,
      userIdx: 0,
      provIdx: 1,
      messages: [
        { from: 'user', text: 'Hi Alex, how soon can you come for the deep clean?' },
        { from: 'prov', text: 'I could come this Thursday or Friday morning. Which works better?' },
        { from: 'user', text: 'Friday morning is great. Do you bring your own supplies?' },
        { from: 'prov', text: 'Yes, I use only eco-friendly products. All included in the price.' },
        { from: 'user', text: 'Perfect, see you Friday at 9 AM.' },
      ],
    },
    {
      jobIdx: 8,
      userIdx: 6,
      provIdx: 7,
      messages: [
        {
          from: 'user',
          text: 'Hi Carlos, I saw your profile. Are you good with IKEA furniture assembly?',
        },
        {
          from: 'prov',
          text: 'Absolutely! I have assembled hundreds of IKEA pieces. Bunk beds, bookshelves, desks — no problem.',
        },
        {
          from: 'user',
          text: 'Great. I have a bunk bed, a bookshelf, and a small desk. About how long would it take?',
        },
        {
          from: 'prov',
          text: 'For those three items, I would estimate about 3-4 hours. I bring my own tools.',
        },
        { from: 'user', text: 'Perfect. Can you come Saturday morning around 10 AM?' },
        { from: 'prov', text: 'Saturday at 10 works great. See you then!' },
      ],
    },
    {
      jobIdx: 11,
      userIdx: 5,
      provIdx: 0,
      messages: [
        {
          from: 'user',
          text: 'Hi Maria! Are you available Friday evenings to babysit my 2-year-old?',
        },
        {
          from: 'prov',
          text: 'Hi Sarah! Yes, Friday evenings work well for me. I love working with toddlers!',
        },
        {
          from: 'user',
          text: 'She is still adjusting to being without me, so someone calm and patient is really important.',
        },
        {
          from: 'prov',
          text: 'I completely understand. I always bring comforting activities — soft toys, picture books. I will follow her routine closely.',
        },
        { from: 'user', text: 'That sounds wonderful. Can we do a trial this Friday?' },
        { from: 'prov', text: 'Of course! I will come at 5:45 so we can chat before you leave.' },
      ],
    },
    {
      jobIdx: 9,
      userIdx: 3,
      provIdx: 7,
      messages: [
        {
          from: 'user',
          text: 'Hi! I need someone to walk my dog twice daily while I am away for 5 days. Are you available?',
        },
        { from: 'prov', text: 'Yes, I love dogs! What breed and how long are the walks usually?' },
        {
          from: 'user',
          text: 'Golden retriever, very friendly. Morning and evening walks, about 30 minutes each.',
        },
        {
          from: 'prov',
          text: 'Perfect, I am great with goldens. I can definitely handle that. When do you leave?',
        },
      ],
    },
  ];

  let messageCount = 0;
  for (const script of conversationScripts) {
    const userId = regularUsers[script.userIdx].id;
    const provId = providers[script.provIdx].id;

    await prisma.conversation.create({
      data: {
        jobId: jobs[script.jobIdx].id,
        participants: {
          create: [{ userId }, { userId: provId }],
        },
        messages: {
          create: script.messages.map((m, idx) => ({
            content: m.text,
            senderId: m.from === 'user' ? userId : provId,
            isRead: idx < script.messages.length - 1,
            createdAt: new Date(Date.now() - (script.messages.length - idx) * 3600 * 1000),
          })),
        },
      },
    });
    messageCount += script.messages.length;
  }

  console.log(
    `✓ Created ${conversationScripts.length} conversations with ${messageCount} messages\n`
  );

  // ==========================================
  // 6. VERIFICATION REQUESTS
  // ==========================================
  console.log('Creating verification requests...');

  for (let i = 0; i < 7; i++) {
    await prisma.verificationRequest.create({
      data: {
        userId: providers[i].id,
        status: 'APPROVED',
        documents: {
          idCard: `https://images.unsplash.com/photo-1589395937338-7bbc6a53c21e?w=400&sig=${i}`,
          backgroundCheck: `https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&sig=${i}`,
          references: [
            `https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&sig=${i}`,
          ],
        },
        reviewedAt: daysAgo(30 + i * 5),
        reviewedBy: admins[0].id,
        notes: 'All documents verified. Background check clear. Approved.',
      },
    });
  }

  for (let i = 7; i < 10; i++) {
    await prisma.verificationRequest.create({
      data: {
        userId: providers[i].id,
        status: 'PENDING',
        documents: {
          idCard: `https://images.unsplash.com/photo-1589395937338-7bbc6a53c21e?w=400&sig=pending${i}`,
          backgroundCheck:
            i < 9
              ? `https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&sig=pending${i}`
              : '',
          references:
            i === 7 ? ['https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400'] : [],
        },
        notes: null,
      },
    });
  }

  await prisma.verificationRequest.create({
    data: {
      userId: regularUsers[6].id,
      status: 'REJECTED',
      documents: {
        idCard: 'https://images.unsplash.com/photo-1589395937338-7bbc6a53c21e?w=400&sig=rejected',
        backgroundCheck: '',
        references: [],
      },
      reviewedAt: daysAgo(10),
      reviewedBy: admins[0].id,
      notes:
        'Incomplete documentation. Background check document missing. Please resubmit with all required documents.',
    },
  });

  console.log('✓ Created 11 verification requests (7 approved, 3 pending, 1 rejected)\n');

  // ==========================================
  // 7. KIDS EVENTS — 10 events
  // ==========================================
  console.log('Creating kids events...');

  const eventsData = [
    {
      title: 'Kids Art Workshop - Painting & Crafts',
      desc: 'Explore creativity through painting, collaging, and mixed media. All materials provided! Smocks available.',
      cat: 'Art & Crafts',
      ageMin: 5,
      ageMax: 10,
      time: '10:00 AM - 12:00 PM',
      max: 15,
      current: 8,
      price: 25,
      org: 0,
      days: 5,
    },
    {
      title: 'Outdoor Sports Day',
      desc: 'A full day of soccer, relay races, and team-building games in the park. Bring water and sunscreen!',
      cat: 'Sports',
      ageMin: 7,
      ageMax: 12,
      time: '9:00 AM - 3:00 PM',
      max: 30,
      current: 22,
      price: 0,
      org: 1,
      days: 7,
    },
    {
      title: 'Story Time & Puppet Show',
      desc: 'Interactive storytelling session followed by a puppet show. Kids get to make their own finger puppets!',
      cat: 'Education',
      ageMin: 3,
      ageMax: 7,
      time: '2:00 PM - 4:00 PM',
      max: 20,
      current: 14,
      price: 10,
      org: 3,
      days: 3,
    },
    {
      title: 'Junior Scientists Lab',
      desc: 'Fun science experiments for curious minds! Volcanoes, slime, and crystal growing. Lab coats provided.',
      cat: 'Education',
      ageMin: 6,
      ageMax: 11,
      time: '10:00 AM - 1:00 PM',
      max: 12,
      current: 10,
      price: 30,
      org: 6,
      days: 10,
    },
    {
      title: 'Kids Dance Party',
      desc: 'DJ-led dance party with age-appropriate music, games, and prizes. Glow sticks included!',
      cat: 'Performing Arts',
      ageMin: 4,
      ageMax: 9,
      time: '4:00 PM - 6:00 PM',
      max: 25,
      current: 18,
      price: 15,
      org: 0,
      days: 4,
    },
    {
      title: 'Nature Walk & Bug Hunt',
      desc: 'Guided nature walk through the botanical garden. Kids learn about local plants and insects. Magnifying glasses provided.',
      cat: 'Education',
      ageMin: 5,
      ageMax: 10,
      time: '10:00 AM - 12:00 PM',
      max: 15,
      current: 6,
      price: 12,
      org: 2,
      days: 8,
    },
    {
      title: 'Mini Chef Cooking Class',
      desc: 'Kids learn to make healthy snacks and simple meals. Pizza, fruit smoothies, and veggie wraps on the menu!',
      cat: 'Art & Crafts',
      ageMin: 6,
      ageMax: 12,
      time: '11:00 AM - 1:00 PM',
      max: 10,
      current: 7,
      price: 35,
      org: 5,
      days: 6,
    },
    {
      title: 'Kids Yoga & Mindfulness',
      desc: 'Gentle yoga session designed for children, with breathing exercises and guided relaxation. Mats provided.',
      cat: 'Sports',
      ageMin: 4,
      ageMax: 10,
      time: '9:00 AM - 10:00 AM',
      max: 15,
      current: 9,
      price: 15,
      org: 8,
      days: 2,
    },
    {
      title: 'Lego Building Challenge',
      desc: 'Team-based Lego building competition with prizes! Themes announced at the event. All Lego provided.',
      cat: 'Education',
      ageMin: 5,
      ageMax: 12,
      time: '1:00 PM - 4:00 PM',
      max: 20,
      current: 16,
      price: 20,
      org: 4,
      days: 12,
    },
    {
      title: 'Family Movie Night in the Park',
      desc: 'Outdoor screening of a family-friendly animated movie. Bring blankets and pillows! Popcorn and drinks available.',
      cat: 'Performing Arts',
      ageMin: 3,
      ageMax: 14,
      time: '7:00 PM - 9:30 PM',
      max: 50,
      current: 35,
      price: 5,
      org: 1,
      days: 9,
    },
  ];

  const eventImages = [
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800',
    'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800',
    'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800',
    'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=800',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800',
    'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800',
    'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800',
    'https://images.unsplash.com/photo-1587654780291-39c9404d7dd0?w=800',
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800',
  ];

  const events = await Promise.all(
    eventsData.map((e, i) => {
      const loc = locations[i % locations.length];
      return prisma.kidsEvent.create({
        data: {
          title: e.title,
          description: e.desc,
          category: e.cat,
          ageRangeMin: e.ageMin,
          ageRangeMax: e.ageMax,
          date: daysFromNow(e.days),
          time: e.time,
          location: loc.address,
          latitude: loc.lat + jitter(),
          longitude: loc.lng + jitter(),
          maxParticipants: e.max,
          currentParticipants: e.current,
          price: e.price,
          image: eventImages[i],
          organizerId: providers[e.org].id,
        },
      });
    })
  );

  console.log(`✓ Created ${events.length} kids events\n`);

  // ==========================================
  // 8. EVENT REGISTRATIONS
  // ==========================================
  console.log('Creating event registrations...');

  const registrations = [
    { event: 0, user: 0, child: 'Emily Smith', age: 6, notes: 'Emily loves painting!' },
    { event: 0, user: 1, child: 'Lily Chen', age: 8, notes: 'Has her own brushes.' },
    { event: 0, user: 3, child: 'Jake Taylor', age: 7, notes: null },
    { event: 1, user: 0, child: 'Tommy Smith', age: 9, notes: 'Plays soccer twice a week.' },
    { event: 1, user: 2, child: 'Max Brown', age: 5, notes: 'First sports event, a bit shy.' },
    { event: 1, user: 4, child: 'Sam Wilson', age: 10, notes: null },
    { event: 2, user: 9, child: 'Baby Anderson', age: 3, notes: 'First time at a group event!' },
    { event: 2, user: 5, child: 'Maya Martinez', age: 5, notes: 'Loves puppet shows.' },
    { event: 3, user: 1, child: 'Noah Chen', age: 10, notes: 'Wants to be a scientist!' },
    { event: 3, user: 6, child: 'Lucas Kim', age: 8, notes: null },
    { event: 4, user: 3, child: 'Sophia Taylor', age: 6, notes: 'Loves dancing!' },
    { event: 4, user: 7, child: 'Ella Green', age: 7, notes: null },
    { event: 7, user: 5, child: 'Maya Martinez', age: 5, notes: 'Very flexible and energetic.' },
    { event: 8, user: 8, child: 'Twin A Patel', age: 7, notes: 'Lego fanatic!' },
    {
      event: 9,
      user: 0,
      child: 'Emily Smith',
      age: 6,
      notes: 'Bringing a blanket for the family.',
    },
    { event: 9, user: 3, child: 'Sophia Taylor', age: 6, notes: null },
    {
      event: 9,
      user: 9,
      child: 'Baby Anderson',
      age: 3,
      notes: 'Might fall asleep before it ends!',
    },
  ];

  for (const reg of registrations) {
    await prisma.eventRegistration.create({
      data: {
        eventId: events[reg.event].id,
        userId: regularUsers[reg.user].id,
        childName: reg.child,
        childAge: reg.age,
        notes: reg.notes,
      },
    });
  }

  console.log(`✓ Created ${registrations.length} event registrations\n`);

  // ==========================================
  // 9. KIDS CLOTHES — 12 items
  // ==========================================
  console.log('Creating kids clothes items...');

  const clothesData = [
    {
      title: 'Boys Winter Jacket - Navy Blue',
      desc: 'Warm winter jacket in excellent condition. Navy blue with orange lining. Water-resistant. Worn only one season.',
      cat: 'Outerwear',
      size: '6',
      gender: 'Boy',
      cond: 'Like New',
      type: 'Sell',
      price: 35,
      origPrice: 80,
      seller: 0,
    },
    {
      title: 'Girls Summer Dress Set (3 pieces)',
      desc: 'Beautiful summer dresses in pink, yellow, and blue. Cotton, machine washable. Perfect for warm days.',
      cat: 'Dresses',
      size: '4T',
      gender: 'Girl',
      cond: 'Good',
      type: 'Donate',
      price: null,
      origPrice: null,
      seller: 5,
    },
    {
      title: 'Baby Onesies Bundle (8 pieces)',
      desc: 'Set of 8 cotton onesies in various colors. Very soft, perfect for newborns. Some have minor stains.',
      cat: 'Baby Clothes',
      size: '3-6M',
      gender: 'Unisex',
      cond: 'Good',
      type: 'Donate',
      price: null,
      origPrice: null,
      seller: 9,
    },
    {
      title: 'Nike Kids Running Shoes',
      desc: 'Nike Revolution 6 running shoes. Barely worn — son outgrew them quickly! Black with green accents.',
      cat: 'Shoes',
      size: '12',
      gender: 'Boy',
      cond: 'Like New',
      type: 'Sell',
      price: 25,
      origPrice: 55,
      seller: 2,
    },
    {
      title: 'Girls School Uniform Set',
      desc: 'Complete school uniform: navy skirt, white polo shirts (x2), navy cardigan. Fits slim build.',
      cat: 'School Uniforms',
      size: '7',
      gender: 'Girl',
      cond: 'Good',
      type: 'Sell',
      price: 30,
      origPrice: 120,
      seller: 1,
    },
    {
      title: 'Toddler Snow Suit',
      desc: 'One-piece snow suit, very warm and waterproof. Pink with floral pattern. Zipper works perfectly.',
      cat: 'Outerwear',
      size: '2T',
      gender: 'Girl',
      cond: 'Fair',
      type: 'Sell',
      price: 15,
      origPrice: 65,
      seller: 3,
    },
    {
      title: 'Boys Swim Trunks + Rash Guard',
      desc: 'Matching set of swim trunks and UV-protective rash guard. Blue with sharks pattern. Like new condition.',
      cat: 'Swimwear',
      size: '5',
      gender: 'Boy',
      cond: 'Like New',
      type: 'Sell',
      price: 18,
      origPrice: 40,
      seller: 8,
    },
    {
      title: 'Kids Pajama Set Bundle',
      desc: 'Three sets of cozy pajamas: dinosaurs, space, and stripes. All cotton. Fits true to size.',
      cat: 'Sleepwear',
      size: '6',
      gender: 'Boy',
      cond: 'Good',
      type: 'Donate',
      price: null,
      origPrice: null,
      seller: 4,
    },
    {
      title: 'Girls Leggings Pack (5 pairs)',
      desc: 'Five pairs of soft cotton leggings in assorted colors. No holes or pilling. Great for everyday wear.',
      cat: 'Pants',
      size: '5T',
      gender: 'Girl',
      cond: 'Good',
      type: 'Sell',
      price: 12,
      origPrice: 35,
      seller: 7,
    },
    {
      title: 'Baby Winter Hat & Mittens Set',
      desc: 'Adorable hand-knit winter set. Soft wool blend. Unisex cream color with pom-pom. Never worn!',
      cat: 'Accessories',
      size: '6-12M',
      gender: 'Unisex',
      cond: 'Like New',
      type: 'Donate',
      price: null,
      origPrice: null,
      seller: 6,
    },
    {
      title: 'Boys Denim Jacket',
      desc: 'Classic denim jacket for kids. Slightly distressed look. Buttons and pockets all intact.',
      cat: 'Outerwear',
      size: '8',
      gender: 'Boy',
      cond: 'Good',
      type: 'Sell',
      price: 20,
      origPrice: 45,
      seller: 0,
    },
    {
      title: 'Girls Party Dress - Sequin Pink',
      desc: 'Beautiful sparkly pink dress, perfect for parties and holidays. Worn once for a birthday party. Includes matching hairbow.',
      cat: 'Dresses',
      size: '6X',
      gender: 'Girl',
      cond: 'Like New',
      type: 'Sell',
      price: 22,
      origPrice: 50,
      seller: 3,
    },
  ];

  const clothesImages = [
    ['https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=800'],
    ['https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=800'],
    ['https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800'],
    ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'],
    ['https://images.unsplash.com/photo-1604467707321-70d009801bf6?w=800'],
    ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800'],
    ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800'],
    ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800'],
    ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800'],
    ['https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=800'],
    ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800'],
    ['https://images.unsplash.com/photo-1543087903-1bf539e929e2?w=800'],
  ];

  for (let i = 0; i < clothesData.length; i++) {
    const c = clothesData[i];
    const loc = locations[i % locations.length];
    await prisma.clothesItem.create({
      data: {
        title: c.title,
        description: c.desc,
        category: c.cat,
        size: c.size,
        gender: c.gender,
        condition: c.cond,
        type: c.type,
        price: c.price,
        originalPrice: c.origPrice,
        images: clothesImages[i],
        location: loc.address,
        latitude: loc.lat + jitter(),
        longitude: loc.lng + jitter(),
        sellerId: regularUsers[c.seller].id,
        status: 'AVAILABLE',
      },
    });
  }

  console.log(`✓ Created ${clothesData.length} clothes items\n`);

  // ==========================================
  // 10. LOCAL FOOD ITEMS
  // ==========================================
  console.log('Creating local food items...');

  const localFoodData = [
    {
      title: 'Traditional Romanian Sarmale (20 pieces)',
      desc: 'Authentic sarmale made with fresh cabbage leaves, pork and rice filling, slow-cooked for hours. Recipe passed down through three generations. Served with mamaliga and sour cream. Perfect for family dinners or special occasions.',
      cat: 'Prepared Meals',
      price: 45,
      pickup: true,
      delivery: true,
      deliveryArea: 'Manhattan, Brooklyn',
      vendor: 2,
    },
    {
      title: 'Fresh Organic Baby Food - Weekly Box',
      desc: 'Freshly prepared organic baby food purees and soft meals. Each box contains 14 portions (2 per day for a week). Seasonal vegetables and fruits. No salt, no sugar, no preservatives. Suitable for 6-12 months.',
      cat: 'Prepared Meals',
      price: 55,
      pickup: true,
      delivery: true,
      deliveryArea: 'All NYC boroughs',
      vendor: 5,
    },
    {
      title: 'Artisan Sourdough Bread Loaf',
      desc: 'Traditional sourdough bread made with organic flour and a 10-year-old starter. Long fermentation for better taste and digestion. Baked fresh every morning. Available in plain, whole wheat, and olive rosemary.',
      cat: 'Baked Goods',
      price: 8,
      pickup: true,
      delivery: false,
      vendor: 2,
    },
    {
      title: 'Family Meal Prep Box - 5 Days',
      desc: 'Complete meal prep for a family of 4: 5 lunches and 5 dinners. Balanced, kid-friendly meals with proteins, vegetables, and grains. Allergy-friendly options available. Containers and reheating instructions included.',
      cat: 'Prepared Meals',
      price: 180,
      pickup: false,
      delivery: true,
      deliveryArea: 'Manhattan, Brooklyn, Queens',
      vendor: 9,
    },
    {
      title: 'Homemade Indian Curry Set',
      desc: 'Authentic homemade Indian curries: Butter Chicken, Dal Makhani, and Palak Paneer. Comes with basmati rice and fresh naan bread. Serves 4 people generously. Mild spice level, perfect for families with kids.',
      cat: 'Prepared Meals',
      price: 35,
      pickup: true,
      delivery: true,
      deliveryArea: 'Manhattan, Queens',
      vendor: 5,
    },
    {
      title: 'Fresh Seasonal Fruit Box',
      desc: 'Curated box of fresh, locally sourced seasonal fruits. Perfect for families who want the best produce for their children. Each box contains 8-10 varieties, approximately 10 lbs total. Sourced from local farms.',
      cat: 'Produce',
      price: 28,
      pickup: true,
      delivery: true,
      deliveryArea: 'Brooklyn, Manhattan',
      vendor: 9,
    },
    {
      title: 'Homemade Cozonac (Romanian Sweet Bread)',
      desc: 'Traditional Romanian cozonac with walnuts and cocoa swirl. Made from scratch with real butter, eggs, and vanilla. Perfect for holidays or weekend breakfast. Each loaf is approximately 1.5 lbs.',
      cat: 'Baked Goods',
      price: 18,
      pickup: true,
      delivery: false,
      vendor: 2,
    },
    {
      title: 'Kids Lunchbox Bento - Weekly Pack',
      desc: 'Five creative bento-style lunchboxes designed for kids ages 4-12. Each box includes a protein, veggie, fruit, grain, and a small treat. Fun shapes and colors that kids love. Nut-free guaranteed.',
      cat: 'Prepared Meals',
      price: 65,
      pickup: true,
      delivery: true,
      deliveryArea: 'Manhattan, Brooklyn',
      vendor: 9,
    },
    {
      title: 'Homemade Strawberry Jam (3 jars)',
      desc: 'Small-batch strawberry jam made with fresh local strawberries. Only 3 ingredients: strawberries, organic cane sugar, and lemon juice. No preservatives, no pectin. 8oz jars. Perfect on toast or with cheese.',
      cat: 'Preserves',
      price: 15,
      pickup: true,
      delivery: false,
      vendor: 2,
    },
    {
      title: 'Fresh Goat Milk Cheese Selection',
      desc: 'Artisanal goat cheese from a small family farm in upstate NY. Selection includes: plain chevre, herb-crusted, and honey lavender. Three 4oz portions. Pasteurized, safe for children.',
      cat: 'Dairy',
      price: 22,
      pickup: true,
      delivery: true,
      deliveryArea: 'Manhattan',
      vendor: 5,
    },
    {
      title: 'Cold-Pressed Juice Pack (12 bottles)',
      desc: 'Twelve 12oz bottles of cold-pressed juices in kid-friendly flavors: Apple-Carrot-Ginger, Berry Blast, Green Machine, and Tropical Sunshine. No added sugar. Made fresh daily. 3-day shelf life.',
      cat: 'Beverages',
      price: 48,
      pickup: true,
      delivery: true,
      deliveryArea: 'All NYC',
      vendor: 9,
    },
    {
      title: 'Gluten-Free Cookie Assortment',
      desc: 'Assortment of 24 delicious gluten-free cookies. Flavors: chocolate chip, snickerdoodle, peanut butter (separate box), and oatmeal raisin. Made with almond flour. Perfect for school events and playdates.',
      cat: 'Baked Goods',
      price: 28,
      pickup: true,
      delivery: true,
      deliveryArea: 'Brooklyn, Manhattan',
      vendor: 2,
    },
  ];

  const localFoodItems = [];
  for (let i = 0; i < localFoodData.length; i++) {
    const f = localFoodData[i];
    const loc = locations[i % locations.length];
    const item = await prisma.localFood.create({
      data: {
        title: f.title,
        description: f.desc,
        category: f.cat,
        price: f.price,
        images: [foodImages[i % foodImages.length]],
        pickupOnly: !f.delivery,
        pickupLocation: f.pickup ? loc.address : null,
        deliveryAvailable: f.delivery,
        deliveryArea: f.deliveryArea || null,
        location: loc.address,
        latitude: loc.lat + jitter(),
        longitude: loc.lng + jitter(),
        vendorId: providers[f.vendor].id,
        status: 'AVAILABLE',
      },
    });
    localFoodItems.push(item);
  }

  console.log(`✓ Created ${localFoodItems.length} local food items\n`);

  // ==========================================
  // 10b. FOOD ORDERS
  // ==========================================
  console.log('Creating food orders...');

  const foodOrdersData = [
    {
      food: 0,
      customer: 0,
      qty: 1,
      type: 'DELIVERY',
      address: 'Manhattan, NY 10001',
      msg: 'Please deliver by 6 PM if possible. Thank you!',
    },
    {
      food: 1,
      customer: 9,
      qty: 2,
      type: 'DELIVERY',
      address: 'Brooklyn, NY 11201',
      msg: 'My baby is 8 months old. No allergens please.',
    },
    {
      food: 3,
      customer: 3,
      qty: 1,
      type: 'DELIVERY',
      address: 'Queens, NY 11101',
      msg: 'No shellfish allergy in the family. Thanks!',
    },
    {
      food: 4,
      customer: 7,
      qty: 2,
      type: 'PICKUP',
      msg: 'Will pick up around noon. Can you have it ready by then?',
    },
    { food: 5, customer: 1, qty: 1, type: 'DELIVERY', address: 'Upper West Side, NY', msg: null },
    {
      food: 7,
      customer: 5,
      qty: 1,
      type: 'DELIVERY',
      address: 'Park Slope, Brooklyn',
      msg: 'My kids love fun lunchboxes! No nuts please.',
    },
  ];

  for (const fo of foodOrdersData) {
    await prisma.foodOrder.create({
      data: {
        foodItemId: localFoodItems[fo.food].id,
        customerId: regularUsers[fo.customer].id,
        quantity: fo.qty,
        orderType: fo.type,
        deliveryAddress: fo.type === 'DELIVERY' ? fo.address : null,
        pickupLocation:
          fo.type === 'PICKUP'
            ? localFoodData[fo.food].pickup
              ? locations[fo.food % locations.length].address
              : null
            : null,
        message: fo.msg,
        status: 'PENDING',
        totalPrice: localFoodData[fo.food].price * fo.qty,
      },
    });
  }

  console.log(`✓ Created ${foodOrdersData.length} food orders\n`);

  // ==========================================
  // 10c. BOOKING REQUESTS (for SERVICE_OFFERING jobs)
  // ==========================================
  console.log('Creating booking requests...');

  // Find service offering jobs (the last 8 jobs in jobsData are offerings)
  const serviceOfferingJobs = jobs.filter(
    (_, i) => jobsData[i].jobType === JobType.SERVICE_OFFERING
  );

  const bookingRequestsData = [
    {
      jobIdx: 0,
      client: 0,
      date: daysFromNow(3),
      msg: 'Hi! I need a babysitter this Saturday evening from 6-11 PM for my two kids (ages 4 and 7). Are you available?',
    },
    {
      jobIdx: 0,
      client: 3,
      date: daysFromNow(5),
      msg: 'I have three kids and need help next Friday evening. Would you be available for about 4 hours?',
    },
    {
      jobIdx: 1,
      client: 1,
      date: daysFromNow(2),
      msg: 'Looking for after-school care for my daughter starting next week. She is 8 years old and loves art.',
    },
    {
      jobIdx: 2,
      client: 8,
      date: daysFromNow(4),
      msg: 'We have twins (age 3) and need a bilingual nanny. Could we schedule a trial session?',
    },
    {
      jobIdx: 4,
      client: 7,
      date: daysFromNow(6),
      msg: 'I need a deep clean for my 2BR apartment. Eco-friendly products are a must for us. When can you come?',
    },
    {
      jobIdx: 4,
      client: 4,
      date: daysFromNow(3),
      msg: 'Moving out end of month. Can you do a thorough cleaning to help me get my deposit back?',
    },
    {
      jobIdx: 5,
      client: 2,
      date: daysFromNow(8),
      msg: 'Need a move-out clean for my 1BR. Kitchen and bathroom need extra attention.',
    },
    {
      jobIdx: 6,
      client: 0,
      date: daysFromNow(5),
      msg: 'Looking for help fixing a few things around the house plus a general cleaning. Half day work?',
    },
  ];

  let bookingCount = 0;
  for (const br of bookingRequestsData) {
    if (serviceOfferingJobs[br.jobIdx]) {
      await prisma.bookingRequest.create({
        data: {
          jobId: serviceOfferingJobs[br.jobIdx].id,
          clientId: regularUsers[br.client].id,
          preferredDate: br.date,
          message: br.msg,
          status: 'PENDING',
        },
      });
      bookingCount++;
    }
  }

  console.log(`✓ Created ${bookingCount} booking requests\n`);

  // ==========================================
  // 11. NOTIFICATIONS
  // ==========================================
  console.log('Creating notifications...');

  const notificationsData = [
    ...openJobs.slice(0, 4).map((job, i) => ({
      type: 'new_offer',
      title: 'New offer received!',
      body: `${providers[i].name} submitted an offer for "${job.title}"`,
      jobId: job.id,
      userId: job.posterId,
    })),
    ...regularUsers.slice(0, 5).map((user, i) => ({
      type: 'new_message',
      title: 'New message',
      body: `${providers[i].name} sent you a message`,
      jobId: null as string | null,
      userId: user.id,
    })),
    ...providers.slice(0, 3).map((prov) => ({
      type: 'new_review',
      title: 'New review received',
      body: 'Someone left you a review! Check your profile to see it.',
      jobId: null as string | null,
      userId: prov.id,
    })),
    ...regularUsers.map((user) => ({
      type: 'system',
      title: 'Welcome to JuniorHub!',
      body: 'Thank you for joining our community. Start by posting your first job or browsing services.',
      jobId: null as string | null,
      userId: user.id,
    })),
    ...providers.slice(7, 10).map((prov) => ({
      type: 'system',
      title: 'Verification submitted',
      body: 'Your provider verification request has been submitted and is under review.',
      jobId: null as string | null,
      userId: prov.id,
    })),
  ];

  await prisma.notification.createMany({
    data: notificationsData.map((n) => ({
      type: n.type,
      title: n.title,
      body: n.body,
      jobId: n.jobId,
      userId: n.userId,
      isRead: Math.random() > 0.6,
    })),
  });

  console.log(`✓ Created ${notificationsData.length} notifications\n`);

  // ==========================================
  // 11. SAVED JOBS
  // ==========================================
  console.log('Creating saved jobs...');

  const savedJobPairs = [
    { user: 0, job: 1 },
    { user: 0, job: 5 },
    { user: 1, job: 0 },
    { user: 1, job: 8 },
    { user: 3, job: 4 },
    { user: 3, job: 9 },
    { user: 5, job: 0 },
    { user: 5, job: 12 },
    { user: 7, job: 4 },
    { user: 7, job: 13 },
    { user: 8, job: 8 },
    { user: 9, job: 0 },
  ];

  for (const pair of savedJobPairs) {
    await prisma.savedJob.create({
      data: {
        userId: regularUsers[pair.user].id,
        jobId: jobs[pair.job].id,
      },
    });
  }

  console.log(`✓ Created ${savedJobPairs.length} saved jobs\n`);

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log('═══════════════════════════════════════════');
  console.log('✅ Database seeding completed!');
  console.log('═══════════════════════════════════════════\n');

  console.log('📊 Data Summary:');
  console.log('   • 3 admins');
  console.log('   • 10 regular users');
  console.log('   • 10 providers (7 verified, 3 pending)');
  console.log(
    `   • ${jobs.length + extraReviewJobs.length} jobs (incl. ${serviceOfferingJobs.length} service offerings)`
  );
  console.log(`   • ${imageCount} job images`);
  console.log(`   • ${offers.length} offers`);
  console.log(`   • ${bookingCount} booking requests`);
  console.log(`   • ${reviewCount} reviews`);
  console.log(`   • ${conversationScripts.length} conversations (${messageCount} messages)`);
  console.log('   • 11 verification requests');
  console.log(`   • ${events.length} kids events`);
  console.log(`   • ${registrations.length} event registrations`);
  console.log(`   • ${clothesData.length} clothes items`);
  console.log(`   • ${localFoodItems.length} local food items`);
  console.log(`   • ${foodOrdersData.length} food orders`);
  console.log(`   • ${notificationsData.length} notifications`);
  console.log(`   • ${savedJobPairs.length} saved jobs\n`);

  console.log('📧 Demo Accounts:');
  console.log('   Admin:     admin@juniorhub.com');
  console.log('   Users:     john@example.com, emily.chen@example.com, ...');
  console.log('   Providers: maria@example.com, alex.j@example.com, ...\n');

  console.log('🔐 Note: These use dummy Firebase UIDs.');
  console.log('   To test auth, create real accounts through the app,');
  console.log('   then use Prisma Studio to set roles.\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
