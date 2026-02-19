# Admin Setup Guide

## Setting Up Your First Admin User

### Method 1: Database Direct Update (Recommended)

After creating your user account through the web interface:

```bash
# Connect to your database
pnpm db:studio

# Or use SQL directly
psql $DATABASE_URL
```

Execute this SQL command:

```sql
UPDATE "User"
SET role = 'ADMIN'
WHERE email = 'your-email@example.com';
```

### Method 2: Using Prisma Studio

1. Start Prisma Studio:

```bash
pnpm db:studio
```

2. Navigate to the `User` model
3. Find your user by email
4. Change the `role` field from `USER` to `ADMIN`
5. Save changes

### Method 3: Using Seed Script

Edit `packages/database/prisma/seed.ts` and add:

```typescript
await prisma.user.update({
  where: { email: 'your-email@example.com' },
  data: { role: 'ADMIN' },
});
```

Then run:

```bash
pnpm db:seed
```

---

## Admin Dashboard Access

Once you have admin role, access the admin dashboard at:

```
http://localhost:3000/admin
```

### Admin Features

#### 1. User Management (`/admin/users`)

- View all registered users
- Change user roles (USER ↔ ADMIN)
- Delete user accounts
- Search and filter users
- View user statistics

**Actions:**

- **Edit Role**: Click edit button → Select role → Save
- **Delete User**: Click delete → Confirm deletion
- **Search**: Type in search box to filter by name/email

#### 2. Job Management (`/admin/jobs`)

- View all job postings
- Change job status
- Delete inappropriate jobs
- Filter by category and status
- View job statistics

**Job Statuses:**

- `DRAFT`: Not published yet
- `OPEN`: Accepting offers
- `IN_PROGRESS`: Work started
- `COMPLETED`: Finished
- `CANCELLED`: Cancelled by poster

#### 3. Provider Verification (`/admin/verification`)

- Review provider verification requests
- Approve/reject with notes
- View uploaded documents:
  - Government-issued ID
  - Background check results
  - Reference letters
- Track verification statistics

**Verification Workflow:**

1. Provider submits verification request with documents
2. Admin reviews documents in verification dashboard
3. Admin approves or rejects with notes
4. Provider gets notified of decision
5. Approved providers get verified badge

#### 4. Push Notifications (`/admin/notifications`)

- Send notifications to all users
- Send to specific user
- Link notifications to jobs
- Use quick templates
- Preview before sending

**Notification Types:**

- `info`: General information
- `new_job`: Alert about new jobs
- `promotion`: Special offers
- `reminder`: Payment or action reminders
- `warning`: Important alerts

**Sending Process:**

1. Select target (all users or specific user)
2. Choose notification type
3. Write title and message
4. Optionally link to a job
5. Preview → Send
6. Users see it in notification bell icon

---

## Security Best Practices

### Admin Account Security

1. **Use Strong Passwords**: Minimum 8 characters with uppercase, lowercase, and numbers
2. **Enable 2FA**: Configure in Firebase Console
3. **Limit Admin Accounts**: Only promote trusted users
4. **Audit Regularly**: Review admin actions monthly

### Data Privacy

1. **GDPR Compliance**: User data access is logged
2. **Right to Erasure**: User deletion removes all personal data
3. **Data Minimization**: Only access data needed for admin tasks

### Rate Limiting

Admin endpoints should be rate-limited in production:

```typescript
// Recommended: 100 requests per minute
import rateLimit from 'express-rate-limit';

const adminLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
});
```

---

## Admin API Routes

All admin routes require `role === 'ADMIN'`:

### User Management

```bash
GET    /api/admin/users              # List all users
DELETE /api/admin/users/:id          # Delete user
PATCH  /api/admin/users/:id/role     # Update user role
```

### Verification

```bash
GET    /api/admin/verification/requests      # List requests
PATCH  /api/admin/verification/:id           # Approve/reject
```

### Notifications

```bash
POST   /api/admin/notifications/send         # Push notification
```

---

## Environment Variables

Add these to `.env.local`:

```bash
# Google Gemini AI (for health chat & product scanner)
GOOGLE_GEMINI_API_KEY=your_gemini_api_key

# Firebase Cloud Messaging (for push notifications)
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key
FIREBASE_ADMIN_CLIENT_EMAIL=your_client_email
```

### Getting Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create new API key
3. Copy and add to `.env.local`

### Getting Firebase VAPID Key

1. Go to Firebase Console → Project Settings
2. Navigate to Cloud Messaging tab
3. Under "Web Push certificates" → Generate key pair
4. Copy the key pair value

---

## Database Migration

After schema changes, run migrations:

```bash
# Development
pnpm db:migrate:dev --name add_notification_job_link

# Production
pnpm db:migrate
```

---

## Troubleshooting

### "Access Denied" on Admin Pages

**Solution:** Verify your user role in database:

```sql
SELECT id, email, role FROM "User" WHERE email = 'your-email@example.com';
```

Should show `role = 'ADMIN'`

### Notifications Not Appearing

**Checklist:**

1. ✓ Database has Notification model
2. ✓ User has `fcmToken` stored
3. ✓ `GOOGLE_GEMINI_API_KEY` is set
4. ✓ Run migrations: `pnpm db:migrate:dev`

### Gemini AI Errors

**Common Issues:**

- API key not set or invalid
- Rate limit exceeded (free tier: 60 req/min)
- Image too large (max 4MB for Gemini)

**Solution:**

```bash
# Check if API key is loaded
echo $GOOGLE_GEMINI_API_KEY

# Verify in code
console.log(process.env.GOOGLE_GEMINI_API_KEY ? 'Key loaded' : 'Key missing');
```

---

## Admin Workflow Examples

### Example 1: Approve a Provider

1. Navigate to `/admin/verification`
2. Click "Review" on pending request
3. Examine documents:
   - ID card matches user photo and name
   - Background check is recent and clear
   - References are legitimate
4. Add review notes
5. Click "Approve"
6. User receives verification badge

### Example 2: Send Job Alert Notification

1. Navigate to `/admin/notifications`
2. Select "All Users"
3. Choose type: "New Job"
4. Write title: "New Babysitting Jobs Available!"
5. Write message: "Check out 5 new babysitting opportunities in your area"
6. Link to specific job (optional)
7. Preview → Send
8. Users receive notification instantly

### Example 3: Remove Inappropriate Content

1. Navigate to `/admin/jobs`
2. Search for the job
3. Review content
4. Change status to "CANCELLED" or delete permanently
5. Optionally send notification to user explaining removal

---

## Monitoring & Logs

### Key Metrics to Track

- **User Growth**: Daily/weekly new signups
- **Verification Rate**: % of providers verified
- **Job Success Rate**: % of jobs completed
- **Response Time**: Admin verification turnaround
- **Safety Reports**: Monitor Report model for issues

### Logging

All admin actions are logged:

```typescript
console.log('[ADMIN]', authUser.email, 'performed', action);
```

Consider implementing audit logs for compliance.

---

## Next Steps

1. ✅ Set yourself as admin
2. ✅ Access `/admin` dashboard
3. ✅ Review any pending verifications
4. ✅ Test notification system
5. ✅ Familiarize with user/job management
6. 📚 Read [API Documentation](./api.md)
7. 📚 Review [Architecture](./architecture.md)
