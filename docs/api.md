# API Documentation

Base URL: `https://api.localservices.com/v1`

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header.

```
Authorization: Bearer <firebase_id_token>
```

### Get Firebase Token

```typescript
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const token = await auth.currentUser?.getIdToken();
```

---

## Endpoints

### Authentication

#### Register with Email

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response** `201 Created`
```json
{
  "user": {
    "id": "clx1234567890",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": null,
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "token": "eyJhbGciOiJSUzI1NiIs..."
}
```

#### Social Login

```http
POST /api/auth/social
Content-Type: application/json

{
  "provider": "google",  // or "facebook"
  "idToken": "google_id_token_here"
}
```

**Response** `200 OK`
```json
{
  "user": { ... },
  "token": "...",
  "isNewUser": true
}
```

---

### Users

#### Get Current User

```http
GET /api/users/me
Authorization: Bearer <token>
```

**Response** `200 OK`
```json
{
  "id": "clx1234567890",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar": "https://cdn.localservices.com/avatars/abc.jpg",
  "phone": "+1234567890",
  "bio": "Experienced babysitter...",
  "address": "123 Main St, New York, NY",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "role": "USER",
  "isVerified": true,
  "rating": 4.8,
  "reviewCount": 24,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### Update Profile

```http
PATCH /api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Smith",
  "phone": "+1234567890",
  "bio": "Updated bio...",
  "address": "456 Oak Ave, New York, NY",
  "latitude": 40.7589,
  "longitude": -73.9851
}
```

**Response** `200 OK`
```json
{
  "id": "clx1234567890",
  "name": "John Smith",
  ...
}
```

#### Get User Profile

```http
GET /api/users/:id
```

**Response** `200 OK`
```json
{
  "id": "clx1234567890",
  "name": "John Doe",
  "avatar": "https://...",
  "bio": "...",
  "rating": 4.8,
  "reviewCount": 24,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### Get User Reviews

```http
GET /api/users/:id/reviews?page=1&limit=10
```

**Response** `200 OK`
```json
{
  "reviews": [
    {
      "id": "clx987654321",
      "rating": 5,
      "comment": "Excellent service!",
      "author": {
        "id": "clx111222333",
        "name": "Jane Doe",
        "avatar": "https://..."
      },
      "job": {
        "id": "clx444555666",
        "title": "Babysitting needed"
      },
      "createdAt": "2024-02-10T14:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 24,
    "totalPages": 3
  }
}
```

---

### Jobs

#### List Jobs

```http
GET /api/jobs?category=BABYSITTING&status=OPEN&lat=40.7128&lng=-74.0060&radius=25&sort=createdAt&order=desc&page=1&limit=20
```

**Query Parameters**
| Param | Type | Description |
|-------|------|-------------|
| category | string | Filter by category |
| status | string | Filter by status |
| lat | number | Latitude for geo search |
| lng | number | Longitude for geo search |
| radius | number | Search radius in km |
| minBudget | number | Minimum budget |
| maxBudget | number | Maximum budget |
| search | string | Keyword search |
| sort | string | Sort field (createdAt, budget) |
| order | string | Sort order (asc, desc) |
| page | number | Page number |
| limit | number | Items per page |

**Response** `200 OK`
```json
{
  "jobs": [
    {
      "id": "clx444555666",
      "title": "Babysitter needed for 2 kids",
      "description": "Looking for experienced babysitter...",
      "category": "BABYSITTING",
      "budget": 50.00,
      "currency": "USD",
      "status": "OPEN",
      "location": "Manhattan, NY",
      "latitude": 40.7831,
      "longitude": -73.9712,
      "distance": 2.5,
      "scheduledAt": "2024-02-20T18:00:00Z",
      "poster": {
        "id": "clx1234567890",
        "name": "John Doe",
        "avatar": "https://...",
        "rating": 4.8
      },
      "images": [
        {
          "id": "img1",
          "url": "https://cdn.localservices.com/jobs/..."
        }
      ],
      "offerCount": 5,
      "isPromoted": true,
      "createdAt": "2024-02-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

#### Create Job

```http
POST /api/jobs
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Babysitter needed for 2 kids",
  "description": "Looking for an experienced babysitter for our 2 children (ages 4 and 7). Must have references.",
  "category": "BABYSITTING",
  "budget": 50.00,
  "currency": "USD",
  "location": "Manhattan, NY",
  "latitude": 40.7831,
  "longitude": -73.9712,
  "scheduledAt": "2024-02-20T18:00:00Z"
}
```

**Response** `201 Created`
```json
{
  "id": "clx444555666",
  "title": "Babysitter needed for 2 kids",
  "status": "OPEN",
  ...
}
```

#### Get Job Details

```http
GET /api/jobs/:id
```

**Response** `200 OK`
```json
{
  "id": "clx444555666",
  "title": "Babysitter needed for 2 kids",
  "description": "Looking for an experienced babysitter...",
  "category": "BABYSITTING",
  "budget": 50.00,
  "currency": "USD",
  "status": "OPEN",
  "location": "Manhattan, NY",
  "latitude": 40.7831,
  "longitude": -73.9712,
  "scheduledAt": "2024-02-20T18:00:00Z",
  "poster": {
    "id": "clx1234567890",
    "name": "John Doe",
    "avatar": "https://...",
    "rating": 4.8,
    "reviewCount": 24
  },
  "provider": null,
  "images": [...],
  "offerCount": 5,
  "isPromoted": false,
  "createdAt": "2024-02-15T10:00:00Z",
  "updatedAt": "2024-02-15T10:00:00Z"
}
```

#### Update Job

```http
PATCH /api/jobs/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated title",
  "budget": 60.00
}
```

#### Delete Job

```http
DELETE /api/jobs/:id
Authorization: Bearer <token>
```

**Response** `204 No Content`

#### Upload Job Images

```http
POST /api/jobs/:id/images
Authorization: Bearer <token>
Content-Type: multipart/form-data

images: [File, File, ...]
```

**Response** `201 Created`
```json
{
  "images": [
    {
      "id": "img1",
      "url": "https://cdn.localservices.com/jobs/...",
      "order": 0
    }
  ]
}
```

#### Update Job Status

```http
PATCH /api/jobs/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "COMPLETED"
}
```

---

### Offers

#### List Job Offers

```http
GET /api/jobs/:id/offers
Authorization: Bearer <token>
```

**Response** `200 OK`
```json
{
  "offers": [
    {
      "id": "offer123",
      "price": 45.00,
      "message": "I have 5 years of experience with children...",
      "isAccepted": false,
      "provider": {
        "id": "clx777888999",
        "name": "Jane Smith",
        "avatar": "https://...",
        "rating": 4.9,
        "reviewCount": 42
      },
      "createdAt": "2024-02-16T09:00:00Z"
    }
  ]
}
```

#### Submit Offer

```http
POST /api/jobs/:id/offers
Authorization: Bearer <token>
Content-Type: application/json

{
  "price": 45.00,
  "message": "I have 5 years of experience with children and I'm available on the requested date."
}
```

**Response** `201 Created`
```json
{
  "id": "offer123",
  "price": 45.00,
  "message": "I have 5 years of experience...",
  "isAccepted": false,
  "createdAt": "2024-02-16T09:00:00Z"
}
```

#### Accept Offer

```http
PATCH /api/offers/:id/accept
Authorization: Bearer <token>
```

**Response** `200 OK`
```json
{
  "offer": {
    "id": "offer123",
    "isAccepted": true
  },
  "job": {
    "id": "clx444555666",
    "status": "IN_PROGRESS",
    "providerId": "clx777888999"
  },
  "conversation": {
    "id": "conv123"
  }
}
```

#### Reject Offer

```http
PATCH /api/offers/:id/reject
Authorization: Bearer <token>
```

#### Withdraw Offer

```http
DELETE /api/offers/:id
Authorization: Bearer <token>
```

---

### Reviews

#### Create Review

```http
POST /api/jobs/:id/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "comment": "Excellent service! Very professional and punctual."
}
```

**Response** `201 Created`
```json
{
  "id": "review123",
  "rating": 5,
  "comment": "Excellent service!...",
  "createdAt": "2024-02-21T10:00:00Z"
}
```

---

### Conversations

#### List Conversations

```http
GET /api/conversations
Authorization: Bearer <token>
```

**Response** `200 OK`
```json
{
  "conversations": [
    {
      "id": "conv123",
      "job": {
        "id": "clx444555666",
        "title": "Babysitter needed"
      },
      "participant": {
        "id": "clx777888999",
        "name": "Jane Smith",
        "avatar": "https://..."
      },
      "lastMessage": {
        "content": "See you tomorrow!",
        "createdAt": "2024-02-19T15:30:00Z",
        "isRead": true
      },
      "unreadCount": 0,
      "updatedAt": "2024-02-19T15:30:00Z"
    }
  ]
}
```

#### Get Messages

```http
GET /api/conversations/:id/messages?before=2024-02-19T15:30:00Z&limit=50
Authorization: Bearer <token>
```

**Response** `200 OK`
```json
{
  "messages": [
    {
      "id": "msg456",
      "content": "Hi, I'm interested in the job.",
      "imageUrl": null,
      "isRead": true,
      "sender": {
        "id": "clx777888999",
        "name": "Jane Smith",
        "avatar": "https://..."
      },
      "createdAt": "2024-02-18T10:00:00Z"
    }
  ],
  "hasMore": true
}
```

#### Send Message

```http
POST /api/conversations/:id/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Great, looking forward to it!"
}
```

Or with image:
```http
POST /api/conversations/:id/messages
Authorization: Bearer <token>
Content-Type: multipart/form-data

content: "Here's the location"
image: [File]
```

---

### WebSocket Events

Connect to: `wss://api.localservices.com/socket`

#### Authentication
```javascript
socket.emit('authenticate', { token: 'firebase_token' });
```

#### Events

**Receive Message**
```javascript
socket.on('message:new', (data) => {
  // {
  //   conversationId: "conv123",
  //   message: { id, content, sender, createdAt }
  // }
});
```

**Message Read**
```javascript
socket.on('message:read', (data) => {
  // { conversationId: "conv123", readAt: "..." }
});
```

**Typing Indicator**
```javascript
socket.emit('typing:start', { conversationId: 'conv123' });
socket.emit('typing:stop', { conversationId: 'conv123' });

socket.on('typing', (data) => {
  // { conversationId: "conv123", userId: "...", isTyping: true }
});
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHORIZED | 401 | Missing or invalid auth token |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid request data |
| CONFLICT | 409 | Resource already exists |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| Authentication | 10 req/min |
| Job creation | 20 req/hour |
| Message sending | 60 req/min |
| Image upload | 30 req/hour |
| General API | 100 req/min |

Response headers include:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1708354800
```
