export interface HelpArticle {
  slug: string;
  title: string;
  category: string;
  content: string;
}

export const helpArticles: HelpArticle[] = [
  // Getting Started
  {
    slug: 'create-account',
    title: 'How to create an account',
    category: 'Getting Started',
    content: `
## Creating Your JuniorHub Account

Getting started on JuniorHub is quick and easy. You have three ways to create an account:

### Sign Up with Email
1. Go to the **Sign Up** page from the top navigation
2. Enter your full name, email address, and create a password
3. Your password must be at least 8 characters long
4. Click **Sign Up** to create your account

### Sign Up with Google
1. Click **Continue with Google** on the login or registration page
2. Select your Google account
3. Your profile name and email will be imported automatically

### Sign Up with Facebook
1. Click **Continue with Facebook** on the login or registration page
2. Authorize JuniorHub to access your basic profile information
3. Your account will be created with your Facebook details

### After Registration
Once your account is created, we recommend:
- **Complete your profile** by adding a bio, phone number, and location
- **Upload a profile photo** to build trust with other users
- **Browse available jobs** to see what services are offered in your area

### Forgot Your Password?
If you forget your password, click **Forgot password?** on the login page. We'll send a reset link to your email address.
    `.trim(),
  },
  {
    slug: 'post-first-job',
    title: 'How to post your first job',
    category: 'Getting Started',
    content: `
## Posting Your First Job

JuniorHub supports two types of listings: **Service Requests** (you need a service) and **Service Offerings** (you offer a service).

### Posting a Service Request
1. Click **Post** in the navigation bar
2. Select **I need a service**
3. Fill in the details:
   - **Title** - A clear description of what you need (e.g., "Need a babysitter for 2 kids this weekend")
   - **Category** - Choose from Babysitting, House Cleaning, or Other
   - **Description** - Provide detailed information about your requirements
   - **Budget** (optional) - Set a fixed price, hourly rate, or leave it open
   - **Location** - Enter your address or area
   - **Scheduled Date** (optional) - When you need the service
   - **Photos** (optional) - Add up to 5 photos for context
4. Click **Post Job Request**

### Posting a Service Offering
To post a service offering, you must first be a **verified provider**. See [How provider verification works](/help/provider-verification) for details.

1. Click **Post** in the navigation
2. Select **I offer a service**
3. Choose your pricing type: Per Hour, Per Visit, or Fixed Price
4. Fill in your service details and set your price
5. Click **Post Service Offering**

### After Posting
- Your listing will be visible to all users immediately
- For service requests, providers can submit offers with their proposed price
- For service offerings, users can request bookings
- You'll receive notifications when someone responds to your listing

### Tips for a Great Listing
- Use a clear, specific title
- Write a detailed description
- Add photos when relevant
- Set a reasonable budget to attract quality providers
    `.trim(),
  },
  {
    slug: 'job-categories',
    title: 'Understanding job categories',
    category: 'Getting Started',
    content: `
## Job Categories on JuniorHub

JuniorHub organizes services into clear categories to help you find exactly what you need.

### Babysitting
Find trusted babysitters and childcare providers in your area. This category covers:
- Evening and weekend babysitting
- Regular part-time childcare
- Date night sitters
- Emergency childcare

### House Cleaning
Professional cleaning services for your home:
- Regular house cleaning
- Deep cleaning
- Move-in/move-out cleaning
- Specific room cleaning

### Other Services
A flexible category for various local services that don't fit the main categories:
- Pet sitting
- Tutoring
- Errand running
- Handyman services
- And more

### Local Food
Local Food has its own dedicated marketplace section. Browse homemade meals, baked goods, and local produce from community vendors at **Local Food** in the Community menu.

### Filtering by Category
When browsing jobs, you can filter by category using the filter bar at the top of the jobs page. You can also filter by:
- **Job type** - Service Requests vs Service Offerings
- **Budget range** - Set minimum and maximum budgets
- **Sort order** - Newest, price, or distance
    `.trim(),
  },
  {
    slug: 'setup-profile',
    title: 'Setting up your profile',
    category: 'Getting Started',
    content: `
## Setting Up Your Profile

A complete profile helps build trust and makes it easier to connect with others on JuniorHub.

### Accessing Your Profile
1. Click on your avatar or name in the top navigation
2. Select **Profile** from the dropdown menu
3. Click **Edit Profile** to make changes

### Profile Information
You can update the following details:
- **Full Name** - Your display name visible to other users
- **Bio** - Tell others about yourself, your experience, and what you're looking for
- **Phone Number** - For direct contact (optional)
- **Address** - Your general area or city
- **Profile Photo** - Upload a clear photo of yourself

### Why Complete Your Profile?
- **Build trust** - Users are more likely to work with people who have complete profiles
- **Get more responses** - Listings from complete profiles receive more engagement
- **Required for providers** - Provider verification requires a complete profile

### Profile Visibility
- Your profile is visible to all registered users
- Other users can see your name, bio, rating, and reviews
- Your email and phone are not publicly displayed unless you choose to share them
- Your reviews and ratings are visible on your profile page
    `.trim(),
  },

  // Safety & Verification
  {
    slug: 'provider-verification',
    title: 'How provider verification works',
    category: 'Safety & Verification',
    content: `
## Provider Verification Process

Provider verification ensures that service providers on JuniorHub are trustworthy and have had their identity confirmed.

### Who Needs Verification?
Any user who wants to:
- Post service offerings
- Be listed as a verified provider
- Display the verified badge on their profile

### How to Apply
1. Go to **Settings** from the navigation menu
2. Click **Become a Provider**
3. Complete the two-step process:

**Step 1: Motivation**
- Explain why you want to become a provider
- Describe your experience and skills
- Minimum 20 characters required

**Step 2: Identity Verification**
- You'll be redirected to our secure identity verification partner
- Have a valid ID document ready (passport, national ID, or driver's license)
- The verification process typically takes 2-3 minutes

### Review Process
- After submitting, your application goes to our admin team for review
- You'll see a "Pending Review" status while we process your application
- We aim to review applications within 1-2 business days
- You'll receive a notification once a decision is made

### After Approval
Once approved:
- Your account role changes from User to Provider
- A verified badge appears on your profile
- You can post service offerings
- Your listings will show the verified badge

### If Rejected
If your application is not approved:
- You'll receive the reason for rejection
- You can submit a new application addressing the feedback
    `.trim(),
  },
  {
    slug: 'safety-tips',
    title: 'Safety tips for hiring services',
    category: 'Safety & Verification',
    content: `
## Safety Tips for Hiring Services

Your safety is our priority. Follow these guidelines when using JuniorHub.

### Before Hiring
- **Check reviews and ratings** - Read what other users have said about a provider
- **Look for the verified badge** - Verified providers have had their identity confirmed
- **Read the full profile** - A complete profile with detailed bio is a good sign
- **Use in-app messaging** - Communicate through JuniorHub to keep a record of conversations

### Meeting a Provider
- **Meet in a public place first** when possible
- **Share your plans** with a friend or family member
- **Trust your instincts** - If something feels off, don't proceed
- **Verify the person matches their profile** when meeting in person

### During the Service
- **Be clear about expectations** from the start
- **Agree on pricing** before work begins
- **Keep communication on-platform** for your protection
- **Document any issues** immediately

### After the Service
- **Leave an honest review** to help other users
- **Rate your experience** to maintain the community rating system
- **Report any problems** immediately through the platform

### Protecting Your Information
- Never share passwords or financial details through messages
- Be cautious of requests to communicate outside the platform
- JuniorHub will never ask for your password via email or message
- Report suspicious activity using the report function
    `.trim(),
  },
  {
    slug: 'reporting-behavior',
    title: 'Reporting inappropriate behavior',
    category: 'Safety & Verification',
    content: `
## Reporting Inappropriate Behavior

JuniorHub takes safety seriously. If you encounter inappropriate behavior, here's how to report it.

### What to Report
- Harassment or abusive language
- Fraudulent listings or scam attempts
- Fake reviews or ratings
- Inappropriate content in listings or messages
- Users who misrepresent their identity
- Safety concerns during or after a service

### How to Report
1. Navigate to the user's profile or the problematic listing
2. Click the **Report** button
3. Select the reason for your report
4. Provide additional details about the issue
5. Submit your report

### What Happens After Reporting
- Our team reviews all reports promptly
- Reports go through these stages: **Pending** → **Investigating** → **Resolved** or **Dismissed**
- We may contact you for additional information
- Action taken depends on the severity of the violation
- The reported user is not notified of who filed the report

### Possible Actions
Depending on the investigation, we may:
- Issue a warning to the user
- Remove inappropriate content
- Temporarily suspend the account
- Permanently ban the user
- Contact law enforcement if required

### Emergency Situations
If you are in immediate danger, contact your local emergency services first. Then report the incident on JuniorHub.
    `.trim(),
  },
  {
    slug: 'verified-badges',
    title: 'Understanding verified badges',
    category: 'Safety & Verification',
    content: `
## Understanding Verified Badges

The verified badge is a trust indicator on JuniorHub that shows a provider has been through our verification process.

### What the Verified Badge Means
- The provider has submitted valid identification
- Their identity has been confirmed by our team
- They have completed the provider application process

### Where You'll See It
- On the provider's profile page
- Next to their name on job listings
- In search results and browse pages
- On offers they submit to your jobs

### How to Get Verified
1. Go to **Settings** → **Become a Provider**
2. Complete the motivation questionnaire
3. Verify your identity through our secure verification partner
4. Wait for admin review (typically 1-2 business days)

### What Verification Does NOT Mean
- It does not guarantee quality of work
- It does not replace your own judgment
- Always read reviews and communicate with providers before hiring
- The badge is one factor to consider, not the only one

### Verifying Other Users
- Check for the green verified badge on profiles
- Read reviews from other users who have worked with the provider
- Look at their completed job history
- Use in-app messaging to ask questions before hiring
    `.trim(),
  },

  // Payments & Pricing
  {
    slug: 'how-pricing-works',
    title: 'How pricing works',
    category: 'Payments & Pricing',
    content: `
## How Pricing Works on JuniorHub

JuniorHub offers flexible pricing options to accommodate different types of services.

### Pricing Types

**Fixed Price**
- A single agreed-upon price for the entire job
- Best for well-defined tasks with a clear scope
- Example: "Clean my 2-bedroom apartment for $80"

**Per Hour**
- An hourly rate for the service
- Best for ongoing or time-based services
- Example: "Babysitting at $15/hour"

**Per Visit**
- A price per service visit
- Best for recurring services
- Example: "Weekly house cleaning at $60/visit"

**Open Budget**
- No price specified - providers suggest their rates
- Best when you're unsure about typical pricing
- Providers will include their proposed price in their offer

### How Offers Work
1. When you post a job, providers can submit offers
2. Each offer includes the provider's proposed price and a message
3. You can review all offers and choose the best one
4. Once you accept an offer, a conversation is created for coordination
5. Only one offer can be accepted per job

### Setting a Good Budget
- Research typical rates for similar services in your area
- Setting a budget helps attract serious providers
- An open budget gives you flexibility but may attract a wider range of offers
    `.trim(),
  },
  {
    slug: 'payment-methods',
    title: 'Payment methods accepted',
    category: 'Payments & Pricing',
    content: `
## Payment Methods

JuniorHub connects you with local service providers. Here's how payments work on the platform.

### Direct Payments
Currently, payments on JuniorHub are arranged **directly between users**. This means:
- You agree on the price through the platform (via offers or booking requests)
- Payment is made directly to the service provider
- Common methods include cash, bank transfer, or other local payment methods

### Why Direct Payments?
- **Simplicity** - No additional payment processing fees
- **Flexibility** - Use whatever payment method works for both parties
- **Local focus** - Supports local payment preferences and methods

### Supported Currencies
Listings can display prices in:
- USD (US Dollar)
- EUR (Euro)
- RON (Romanian Leu)
- GBP (British Pound)

### Tips for Payment
- **Agree on payment terms** before the service begins
- **Confirm the total cost** including any additional charges
- **Get a receipt** if possible for larger payments
- **Report any payment disputes** through the platform
    `.trim(),
  },
  {
    slug: 'refund-policy',
    title: 'Refund policy',
    category: 'Payments & Pricing',
    content: `
## Refund Policy

Since payments are arranged directly between users on JuniorHub, our refund policy focuses on dispute resolution and platform fees.

### Service Disputes
If you're unsatisfied with a service:
1. **Communicate first** - Contact the provider through in-app messaging to discuss the issue
2. **Try to resolve it together** - Most issues can be resolved through direct communication
3. **Report the issue** - If you can't reach a resolution, report the issue through the platform
4. **Admin review** - Our team will investigate and mediate if necessary

### Platform Promotion Fees
For paid promotions (featuring your listing):
- Promotions are non-refundable once activated
- If a technical issue prevents your promotion from displaying, contact support for a credit
- Promotional tiers: Basic ($4.99/week), Premium ($9.99/week), Featured ($19.99/week)

### Account Deletion
- Deleting your account does not entitle you to refunds for purchased promotions
- Active services should be completed or cancelled before account deletion
- Any outstanding disputes should be resolved first

### Getting Help
If you need assistance with a payment dispute or refund request:
1. Go to the **Help Center**
2. Click **Contact Support**
3. Describe your issue with relevant details
4. Our team will respond within 1-2 business days
    `.trim(),
  },
  {
    slug: 'platform-fees',
    title: 'Platform fees explained',
    category: 'Payments & Pricing',
    content: `
## Platform Fees Explained

JuniorHub is designed to be accessible to everyone. Here's our fee structure.

### Basic Usage - Free
The following features are completely free:
- Creating an account
- Browsing jobs and services
- Posting service requests
- Posting service offerings (for verified providers)
- Sending and receiving messages
- Leaving reviews
- Identity verification for providers

### Job Promotions
Want more visibility for your listing? Upgrade with a promotion tier:

**Basic - $4.99/week**
- Highlighted in search listings
- Increased visibility

**Premium - $9.99/week**
- Top of category results
- Premium badge on listing
- All Basic benefits

**Featured - $19.99/week**
- Featured on homepage
- Priority in all search results
- Featured badge on listing
- All Premium benefits

### No Commission Fees
JuniorHub does **not** take a commission on payments between users. The price you agree on is the price you pay or receive.

### No Hidden Fees
- No signup fees
- No monthly subscription required
- No listing fees
- No messaging fees
- Promotions are the only paid feature
    `.trim(),
  },

  // Platform Features
  {
    slug: 'kids-events',
    title: 'Kids Events - Finding activities for children',
    category: 'Platform Features',
    content: `
## Kids Events

Discover community events and activities for children in your area.

### Browsing Events
1. Go to **Community** → **Kids Events** in the navigation menu
2. Browse events by category:
   - **Art** - Painting, crafts, creative workshops
   - **Sports** - Soccer, swimming, gymnastics, martial arts
   - **Education** - Science, coding, language classes
   - **Performing Arts** - Music, dance, theater

### Event Details
Each event listing includes:
- Event title and description
- Date, time, and location
- Age range for children
- Price (if applicable)
- Number of spots available
- Organizer information

### Registering for Events
1. Find an event you're interested in
2. Click on the event to view full details
3. Click **Register** to sign up your child
4. You'll receive confirmation and event reminders

### Creating Events (Providers)
Verified providers can create events:
1. Navigate to Kids Events
2. Click **Create Event**
3. Fill in event details (title, description, category, date, location, price)
4. Set the maximum number of participants
5. Publish your event

### Tips
- Check the organizer's profile and reviews before registering
- Register early for popular events as spots fill up quickly
- Use the search and category filters to find relevant events
    `.trim(),
  },
  {
    slug: 'kids-clothes',
    title: 'Kids Clothes - Buy, sell, and donate',
    category: 'Platform Features',
    content: `
## Kids Clothes Marketplace

Buy, sell, or donate children's clothing within your community.

### Browsing Clothes
1. Go to **Community** → **Kids Clothes** in the navigation menu
2. Browse available items or use search to find specific items
3. Filter by size, condition, or listing type (sell/donate)

### Buying Items
1. Find an item you're interested in
2. View the full listing with photos, size, condition, and price
3. Contact the seller through the platform
4. Arrange pickup or delivery directly with the seller

### Listing Items for Sale
1. Navigate to Kids Clothes
2. Click **List Item**
3. Choose **Sell** mode
4. Add details:
   - Photos of the clothing item
   - Title and description
   - Size and condition
   - Set your price
   - Your location
5. Publish your listing

### Donating Items
1. Navigate to Kids Clothes
2. Click **List Item**
3. Choose **Donate** mode
4. Add photos and details
5. The item will be listed as **Free**
6. Others can claim your donated items

### Listing Tips
- Take clear, well-lit photos from multiple angles
- Be honest about the condition (new, like new, good, fair)
- Include accurate sizing information
- Set fair prices based on the item's condition and brand
- Respond promptly to inquiries

### Safety Reminders
- Meet in a public place for exchanges
- Inspect items before completing the transaction
- Use in-app messaging for communication
    `.trim(),
  },
  {
    slug: 'provider-verification-process',
    title: 'Provider verification process',
    category: 'Platform Features',
    content: `
## Provider Verification Process - Step by Step

This guide walks you through the complete process of becoming a verified provider on JuniorHub.

### Prerequisites
- A registered JuniorHub account
- A valid government-issued ID (passport, national ID, or driver's license)
- A completed user profile

### Step 1: Start the Application
1. Log into your JuniorHub account
2. Go to **Settings** (click your profile in the top navigation)
3. Find the **Provider** section
4. Click **Become a Provider**

### Step 2: Write Your Motivation
- Explain why you want to become a provider
- Describe your relevant experience and skills
- Mention what services you plan to offer
- Minimum 20 characters required (we recommend being detailed)

### Step 3: Identity Verification
- Click **Start Identity Verification**
- You'll be redirected to our secure verification partner
- Follow the on-screen instructions to:
  - Take a photo of your ID document
  - Complete a brief liveness check
- The process typically takes 2-3 minutes

### Step 4: Wait for Review
- Your application will show as **Pending Review**
- Our admin team reviews your motivation and verification results
- Typical review time is 1-2 business days
- You'll receive a notification with the result

### Step 5: Start Providing Services
Once approved:
- Your profile shows a **Verified** badge
- You can post **Service Offerings** with pricing
- You can list items on the **Local Food** marketplace
- You can create **Kids Events**
- You can receive **Booking Requests** from users

### Common Reasons for Rejection
- Unclear or unreadable ID document
- ID document doesn't match account information
- Insufficient motivation description
- Multiple failed verification attempts

If rejected, you can submit a new application after addressing the feedback provided.
    `.trim(),
  },
];

export const faqItems = [
  {
    question: 'How do I become a verified provider?',
    answer:
      "Go to Settings → Become a Provider. You'll need to write a brief motivation explaining why you want to provide services, then complete identity verification through our secure partner. The process takes about 5 minutes, and our team reviews applications within 1-2 business days. Once approved, you'll receive a verified badge and can start posting service offerings.",
  },
  {
    question: 'How do I list kids clothes for sale or donation?',
    answer:
      'Navigate to Community → Kids Clothes, then click "List Item". Choose whether you want to sell (set your price) or donate (listed for free). Add clear photos, a description, the size, and condition of the item. Your listing will be visible immediately to other users in the community.',
  },
  {
    question: 'Can I delete my account?',
    answer:
      'Yes, you can delete your account from Settings → Danger Zone → Delete Account. Before deleting, make sure any active jobs or conversations are completed. Once deleted, your profile, listings, and data will be permanently removed. This action cannot be undone.',
  },
  {
    question: 'How do I contact a service provider?',
    answer:
      "You can message a provider by submitting an offer on their service listing or requesting a booking. Once they respond, a conversation is created in your Messages section. You can also view a provider's profile by clicking their name on any listing.",
  },
  {
    question: 'What payment methods are accepted?',
    answer:
      'Payments on JuniorHub are arranged directly between users. You can use any payment method agreed upon by both parties, such as cash, bank transfer, or other local payment options. JuniorHub does not charge commission on service payments.',
  },
  {
    question: 'How do I promote my listing?',
    answer:
      'You can promote your listing by selecting a promotion tier: Basic ($4.99/week) for highlighted visibility, Premium ($9.99/week) for top category placement, or Featured ($19.99/week) for homepage placement. Navigate to your job listing and click the promote option.',
  },
];

export function getArticleBySlug(slug: string): HelpArticle | undefined {
  return helpArticles.find((a) => a.slug === slug);
}

export function getArticlesByCategory(category: string): HelpArticle[] {
  return helpArticles.filter((a) => a.category === category);
}

export function getAllCategories(): string[] {
  return [...new Set(helpArticles.map((a) => a.category))];
}
