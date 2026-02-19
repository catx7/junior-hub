# New Features Documentation

## Overview

LocalServices has been enhanced with child safety and community features:

1. **AI Health Chat** - Pediatric health assistant
2. **Product Scanner** - Ingredient safety analysis
3. **Kids Events** - Community events discovery
4. **Kids Clothes Marketplace** - Buy, sell, donate clothes
5. **Provider Verification** - Safety screening system
6. **Admin Dashboard** - Platform management

---

## 1. AI Health Chat

**Location:** `/health-chat`

### Purpose

Professional AI-powered pediatric health assistant for parents to ask questions about their children's health.

### Features

- Real-time chat powered by Google Gemini AI
- Specialized in children's health topics
- Conversation history maintained
- Quick question suggestions
- Medical disclaimer and safety warnings

### Technology

- **AI Model:** Google Gemini Pro
- **Context:** Professional pediatric health assistant
- **API Endpoint:** `/api/ai/health-chat`

### Usage Example

```typescript
// Parent asks about fever
User: "My 3-year-old has a fever of 101°F. Should I be worried?"

AI: "A fever of 101°F (38.3°C) in a 3-year-old is generally considered mild to moderate.
Here's what you should know:

Normal response: Fevers under 102°F often indicate the body is fighting an infection.

When to monitor at home:
- Child is drinking fluids
- Still somewhat playful when fever reduces
- No difficulty breathing

When to call pediatrician:
- Fever above 102°F or lasting more than 3 days
- Child is lethargic even when fever breaks
- Signs of dehydration
- Rash appears

IMPORTANT: If your child shows any concerning symptoms, contact your pediatrician immediately."
```

### Implementation

```typescript
// apps/web/src/app/(main)/health-chat/page.tsx
const response = await fetch('/api/ai/health-chat', {
  method: 'POST',
  body: JSON.stringify({
    message: userInput,
    conversationHistory: previousMessages,
  }),
});
```

---

## 2. Product Scanner

**Location:** `/product-scanner`

### Purpose

AI-powered ingredient analysis for food products to help parents make informed decisions about what their children consume.

### Features

- Camera/photo upload for product labels
- Ingredient extraction via OCR + AI
- Safety scoring: A, B, C, D
- E-additive detection and risk assessment
- Allergen identification
- Personalized recommendations

### Scoring System

| Score | Description             | Criteria                                    |
| ----- | ----------------------- | ------------------------------------------- |
| **A** | Excellent - Safe        | Natural ingredients, no harmful additives   |
| **B** | Good - Generally Safe   | 1-2 safe additives, minimal concerns        |
| **C** | Fair - Use with Caution | Multiple additives, some with moderate risk |
| **D** | Poor - Not Recommended  | Many harmful additives, avoid for children  |

### Analysis Output

```json
{
  "productName": "Kids Fruit Snacks",
  "ingredients": ["fruit juice", "sugar", "gelatin", "citric acid", "E102"],
  "score": "C",
  "dangerLevel": "concerning",
  "eAdditives": [
    {
      "code": "E102",
      "name": "Tartrazine (Yellow 5)",
      "risk": "high"
    }
  ],
  "allergens": ["gelatin"],
  "warnings": [
    "Contains E102 which may cause hyperactivity in children",
    "High sugar content (12g per serving)"
  ],
  "recommendations": "Consider natural fruit alternatives without artificial colors",
  "summary": "This product contains artificial coloring linked to hyperactivity..."
}
```

### Technology

- **AI Model:** Google Gemini 1.5 Flash (vision model)
- **Image Processing:** Base64 encoding
- **API Endpoint:** `/api/ai/analyze-product`

### Usage

```bash
# User flow
1. Click "Take Photo" or "Upload Image"
2. Capture product ingredients list
3. AI analyzes image (5-10 seconds)
4. View detailed safety report
5. Share or save results
```

---

## 3. Kids Events

**Location:** `/kids-events`

### Purpose

Community-driven platform for discovering and organizing children's events, activities, and workshops.

### Features

- Event discovery with search and filters
- Category filtering (Art, Sports, Education, etc.)
- Age range specifications
- Participant capacity tracking
- Free and paid events
- Registration system
- Event creation for organizers

### Event Categories

- Art & Crafts
- Sports
- Education
- Performing Arts
- Technology
- Outdoor Adventures

### Implementation Notes

**Frontend:** `/apps/web/src/app/(main)/kids-events/page.tsx`

**API Routes (To Create):**

```bash
GET    /api/kids-events           # List events
POST   /api/kids-events           # Create event
GET    /api/kids-events/:id       # Event details
PATCH  /api/kids-events/:id       # Update event
DELETE /api/kids-events/:id       # Delete event
POST   /api/kids-events/:id/register  # Register for event
```

**Database Schema (To Add):**

```prisma
model KidsEvent {
  id                  String   @id @default(cuid())
  title               String
  description         String   @db.Text
  category            String
  ageRangeMin         Int
  ageRangeMax         Int
  date                DateTime
  time                String
  location            String
  latitude            Float?
  longitude           Float?
  maxParticipants     Int
  currentParticipants Int      @default(0)
  price               Decimal  @db.Decimal(10, 2)
  image               String?
  organizerId         String
  organizer           User     @relation(fields: [organizerId], references: [id])
  registrations       EventRegistration[]
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

model EventRegistration {
  id        String    @id @default(cuid())
  eventId   String
  event     KidsEvent @relation(fields: [eventId], references: [id])
  userId    String
  user      User      @relation(fields: [userId], references: [id])
  childName String
  childAge  Int
  notes     String?
  createdAt DateTime  @default(now())

  @@unique([eventId, userId])
}
```

---

## 4. Kids Clothes Marketplace

**Location:** `/kids-clothes`

### Purpose

Sustainable marketplace for buying, selling, and donating gently used children's clothing.

### Features

- Two modes: **Sell** (set price) or **Donate** (free)
- Condition badges (Like New, Good, Fair)
- Size and gender filters
- Category organization
- Seller ratings and locations
- Price comparison (original vs. sale price)

### Categories

- Outerwear
- Dresses
- Shirts & Tops
- Pants
- Baby Clothes
- Shoes
- School Uniforms

### Implementation Notes

**Frontend:** `/apps/web/src/app/(main)/kids-clothes/page.tsx`

**API Routes (To Create):**

```bash
GET    /api/kids-clothes           # List items
POST   /api/kids-clothes           # Create listing
GET    /api/kids-clothes/:id       # Item details
PATCH  /api/kids-clothes/:id       # Update listing
DELETE /api/kids-clothes/:id       # Delete listing
POST   /api/kids-clothes/:id/claim # Claim item
```

**Database Schema (To Add):**

```prisma
model ClothesItem {
  id            String   @id @default(cuid())
  title         String
  description   String   @db.Text
  category      String
  size          String
  gender        String   // 'Boy', 'Girl', 'Unisex'
  condition     String   // 'Like New', 'Good', 'Fair'
  type          String   // 'Sell', 'Donate'
  price         Decimal? @db.Decimal(10, 2)
  originalPrice Decimal? @db.Decimal(10, 2)
  images        String[]
  location      String
  sellerId      String
  seller        User     @relation(fields: [sellerId], references: [id])
  claimedById   String?
  claimedBy     User?    @relation(fields: [claimedById], references: [id])
  status        String   @default("AVAILABLE") // 'AVAILABLE', 'CLAIMED', 'COMPLETED'
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([category, status])
  @@index([type, status])
  @@index([sellerId])
}
```

---

## 5. Provider Verification System

**Location:** `/admin/verification`

### Purpose

Safety screening system to verify service providers and protect families from fraud, bots, or dangerous individuals.

### Verification Process

#### Step 1: Provider Submission

Provider uploads:

1. **Government-issued ID** (Driver's license, passport)
2. **Background Check** (from approved service)
3. **References** (2-3 reference letters)

#### Step 2: Admin Review

Admin examines:

- ✓ ID matches user profile (name, photo)
- ✓ Background check is recent (< 6 months)
- ✓ Background check is clear (no criminal records)
- ✓ References are credible and verifiable
- ✓ No red flags or inconsistencies

#### Step 3: Decision

- **Approve**: Provider gets verified badge, can accept jobs
- **Reject**: Provider notified with reason, can resubmit

#### Step 4: Ongoing Monitoring

- Review reports from users
- Re-verify annually
- Random audits

### Safety Checks Performed

1. **Identity Verification**
   - Government ID validation
   - Photo matching
   - Address verification

2. **Criminal Background Check**
   - National criminal database
   - Sex offender registry
   - Child abuse registry

3. **Reference Verification**
   - Contact references
   - Verify employment history
   - Check social media presence

4. **Behavior Monitoring**
   - Track user reports
   - Monitor message content (with consent)
   - Review completion rates

### Red Flags to Watch For

⚠️ **Immediate Rejection:**

- Criminal record related to children
- Sex offender registry match
- Fake or altered documents
- Threatening behavior

⚠️ **Requires Further Investigation:**

- Inconsistent information
- No verifiable references
- Recent account creation with immediate verification request
- Stock photos used for profile

### Database Schema

```prisma
model VerificationRequest {
  id              String            @id @default(cuid())
  userId          String
  user            User              @relation(fields: [userId], references: [id])
  status          VerificationStatus @default(PENDING)
  documents       Json              // {idCard: url, backgroundCheck: url, references: [urls]}
  submittedAt     DateTime          @default(now())
  reviewedAt      DateTime?
  reviewedBy      String?
  reviewer        User?             @relation(fields: [reviewedBy], references: [id])
  notes           String?           @db.Text

  @@index([status])
  @@index([userId])
}

enum VerificationStatus {
  PENDING
  APPROVED
  REJECTED
}
```

---

## 6. Admin Dashboard

**Location:** `/admin`

### Access Control

```typescript
// Middleware check
if (user.role !== 'ADMIN') {
  return redirect('/');
}
```

### Dashboard Sections

1. **Overview** - Platform statistics
2. **Users** - User management
3. **Jobs** - Job moderation
4. **Reviews** - Review management
5. **Verification** - Provider screening
6. **Notifications** - Communication
7. **Analytics** - Insights (future)

### Admin Capabilities

| Feature       | Create | Read | Update              | Delete |
| ------------- | ------ | ---- | ------------------- | ------ |
| Users         | ❌     | ✅   | ✅ (role)           | ✅     |
| Jobs          | ❌     | ✅   | ✅ (status)         | ✅     |
| Reviews       | ❌     | ✅   | ✅                  | ✅     |
| Notifications | ✅     | ✅   | ❌                  | ❌     |
| Verifications | ❌     | ✅   | ✅ (approve/reject) | ❌     |

---

## Security Considerations

### Child Safety Features

1. **Provider Verification**
   - Mandatory for babysitting jobs
   - Background checks required
   - Annual re-verification

2. **Content Moderation**
   - AI-powered content filtering
   - Manual review of flagged content
   - Quick removal of inappropriate posts

3. **Privacy Protection**
   - Never show full addresses until job accepted
   - Phone numbers hidden until verified
   - Children's photos prohibited in public posts

4. **Reporting System**
   - Easy report button on all profiles
   - Fast admin response to safety reports
   - Automatic suspension for serious violations

### COPPA Compliance

For users under 13:

- Parental consent required
- Limited data collection
- No targeted advertising
- Special privacy protections

---

## Integration Guide

### Adding Gemini AI to Your Project

1. **Install SDK**

```bash
pnpm add @google/generative-ai
```

2. **Configure Environment**

```bash
GOOGLE_GEMINI_API_KEY=your_api_key
```

3. **Initialize Client**

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
```

4. **Use in API Route**

```typescript
const result = await model.generateContent(prompt);
const response = result.response.text();
```

### Adding Image Analysis

For product scanner or document verification:

```typescript
// Use gemini-1.5-flash for vision
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Convert image to base64
const base64Image = buffer.toString('base64');

const result = await model.generateContent([
  prompt,
  {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Image,
    },
  },
]);
```

---

## API Endpoints Summary

### AI Services

```bash
POST /api/ai/health-chat        # Gemini health assistant
POST /api/ai/analyze-product    # Product ingredient analysis
```

### Admin Operations

```bash
GET    /api/admin/users                      # List users
DELETE /api/admin/users/:id                  # Delete user
PATCH  /api/admin/users/:id/role             # Update role
POST   /api/admin/notifications/send         # Push notification
GET    /api/admin/verification/requests      # List requests
PATCH  /api/admin/verification/:id           # Review request
```

### Kids Features (To Implement)

```bash
# Kids Events
GET    /api/kids-events
POST   /api/kids-events
GET    /api/kids-events/:id
PATCH  /api/kids-events/:id
DELETE /api/kids-events/:id
POST   /api/kids-events/:id/register

# Kids Clothes
GET    /api/kids-clothes
POST   /api/kids-clothes
GET    /api/kids-clothes/:id
PATCH  /api/kids-clothes/:id
DELETE /api/kids-clothes/:id
POST   /api/kids-clothes/:id/claim
```

---

## Testing New Features

### Test Health Chat

```bash
1. Navigate to /health-chat
2. Ask: "What temperature is considered a fever in toddlers?"
3. Verify AI responds with accurate pediatric information
4. Check conversation history is maintained
```

### Test Product Scanner

```bash
1. Navigate to /product-scanner
2. Upload image of ingredient list
3. Verify extraction is accurate
4. Check score calculation (A-D)
5. Review E-additive detection
6. Confirm allergen warnings
```

### Test Provider Verification

```bash
1. Create test provider account
2. Submit verification with sample documents
3. Login as admin
4. Navigate to /admin/verification
5. Review and approve/reject
6. Verify badge appears on provider profile
```

---

## Future Enhancements

### Planned Features

1. **AI Chat Improvements**
   - Multi-language support (Romanian)
   - Voice input/output
   - Chat history saved to database
   - Share chat with pediatrician

2. **Product Scanner**
   - Barcode scanning (UPC/EAN)
   - Product database integration
   - Save favorite safe products
   - Create shopping lists

3. **Provider Verification**
   - Integration with background check APIs (Checkr, etc.)
   - Automated ID verification (Stripe Identity)
   - Continuous monitoring
   - Reverification reminders

4. **Kids Events**
   - Calendar integration
   - Recurring events
   - Waitlist management
   - Automated reminders
   - Post-event feedback

5. **Kids Clothes**
   - Size recommendation AI
   - Image recognition for brand/type
   - Shipping/delivery options
   - Donation tax receipts

---

## Cost Considerations

### Google Gemini AI Pricing

**Free Tier:**

- 60 requests per minute
- 1,500 requests per day
- Sufficient for testing and small deployments

**Paid Tier:**

- $0.00025 per 1K characters (input)
- $0.0005 per 1K characters (output)
- Vision models slightly higher

**Estimated Monthly Costs:**

- 1,000 health chat conversations: ~$5
- 500 product scans: ~$3
- Total: ~$10-20/month for moderate usage

### Optimization Tips

1. **Caching**: Cache product analyses by barcode
2. **Rate Limiting**: Limit requests per user per day
3. **Batch Processing**: Group similar questions
4. **Model Selection**: Use flash model for simpler tasks

---

## Privacy & Legal

### Data Handling

**Health Chat:**

- Conversations are NOT stored by default
- No medical records created
- General information only
- Users can export chat history

**Product Scanner:**

- Images processed and deleted immediately
- Analysis results cached anonymously
- No personal data linked to scans

**Provider Verification:**

- Documents stored securely (encrypted)
- Access logged for compliance
- Retention: 7 years (or as required by law)
- Can be deleted upon request

### Disclaimers

All features include appropriate disclaimers:

1. **Health Chat**: "Not medical advice, consult pediatrician"
2. **Product Scanner**: "For informational purposes only"
3. **Verification**: "Verification does not guarantee safety"

---

## Monitoring & Analytics

### Key Metrics

Track usage of new features:

```sql
-- Health chat usage
SELECT COUNT(*) as chat_sessions,
       DATE(created_at) as date
FROM health_chat_sessions
GROUP BY date
ORDER BY date DESC;

-- Product scans per day
SELECT COUNT(*) as scans,
       AVG(score_numeric) as avg_score
FROM product_scans
WHERE created_at >= NOW() - INTERVAL '30 days';

-- Verification approval rate
SELECT
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM verification_requests
GROUP BY status;
```

---

## Support & Troubleshooting

### Common Issues

**Gemini API Errors**

```
Error: "API key not valid"
Solution: Check GOOGLE_GEMINI_API_KEY in .env.local
```

**Product Scanner Not Working**

```
Error: "Failed to analyze image"
Solutions:
- Ensure image is clear and in focus
- Check image size (< 10MB)
- Verify Gemini API quota not exceeded
```

**Verification Documents Not Loading**

```
Error: "Document not found"
Solutions:
- Check file upload size limits
- Verify storage bucket permissions
- Check CORS settings for image URLs
```

---

## Development Workflow

### Adding New AI Features

1. Create UI component
2. Create API route with Gemini integration
3. Add error handling and loading states
4. Test thoroughly with various inputs
5. Add rate limiting
6. Update documentation

### Example: Adding New AI Analysis

```typescript
// apps/web/src/app/api/ai/new-feature/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = 'Your specialized prompt here...';
  const result = await model.generateContent(prompt);

  return NextResponse.json({ response: result.response.text() });
}
```

---

## Next Steps

1. ✅ Review this documentation
2. ✅ Test each new feature
3. ✅ Set up admin account
4. 📝 Create API routes for Kids Events and Clothes
5. 📝 Add database migrations
6. 📝 Implement provider verification flow
7. 📝 Test notification push system
8. 📝 Add analytics tracking
