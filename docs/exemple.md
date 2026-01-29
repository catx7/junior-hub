# Ghid Tehnologii și Flow-uri - LocalServices

Acest document explică toate tehnologiile folosite și de ce, cu exemple concrete de flow-uri cap-coadă.

---

## Cuprins

1. [Stack-ul Tehnologic](#stack-ul-tehnologic)
2. [Flow Complet: Postare Job (Web)](#flow-complet-postare-job-web)
3. [Flow Complet: Trimitere Ofertă (Mobile)](#flow-complet-trimitere-ofertă-mobile)
4. [Flow Complet: Chat în Timp Real](#flow-complet-chat-în-timp-real)
5. [Structura Monorepo](#structura-monorepo)

---

## Stack-ul Tehnologic

### 1. TypeScript (în loc de JavaScript)

**De ce?** TypeScript adaugă tipuri statice care prind erori la compilare, nu la runtime.

```typescript
// ❌ JavaScript - eroarea apare doar când rulezi codul
function getUser(id) {
  return fetch(`/api/users/${id}`); // id poate fi undefined, null, number...
}

// ✅ TypeScript - eroarea apare instant în editor
function getUser(id: string): Promise<User> {
  return fetch(`/api/users/${id}`).then(res => res.json());
}

// Dacă încerci: getUser(123) → Eroare: "Argument of type 'number' is not assignable to type 'string'"
```

### 2. Next.js 14 (în loc de React simplu)

**De ce?** Next.js oferă:
- **Server-Side Rendering (SSR)** - paginile se încarcă mai repede
- **API Routes** - backend și frontend în același proiect
- **App Router** - routing bazat pe foldere, simplu de înțeles

```
apps/web/src/app/
├── page.tsx              → URL: /
├── jobs/
│   ├── page.tsx          → URL: /jobs
│   ├── [id]/
│   │   └── page.tsx      → URL: /jobs/abc123 (dinamic)
│   └── new/
│       └── page.tsx      → URL: /jobs/new
└── api/
    └── jobs/
        └── route.ts      → API: POST/GET /api/jobs
```

**Exemplu concret - Diferența față de React simplu:**

```typescript
// React simplu - trebuie să faci manual fetching pe client
function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/jobs').then(res => res.json()).then(setJobs);
    setLoading(false);
  }, []);

  if (loading) return <Spinner />;
  return <JobList jobs={jobs} />;
}

// Next.js App Router - datele vin deja încărcate de pe server
async function JobsPage() {
  const jobs = await prisma.job.findMany(); // Rulează pe server!
  return <JobList jobs={jobs} />; // HTML-ul vine complet
}
```

### 3. Prisma ORM (în loc de SQL raw sau alte ORM-uri)

**De ce?**
- Generează tipuri TypeScript automat din schema
- Migrări automate de bază de date
- Query-uri type-safe (nu poți greși numele unui câmp)

```typescript
// ❌ SQL raw - erori descoperite doar la runtime
const result = await db.query(
  'SELECT * FROM users WHERE emial = $1', // Typo: "emial" în loc de "email"
  [email]
);

// ❌ Alte ORM-uri (ex: TypeORM) - mai verbose
const user = await userRepository.findOne({
  where: { email: email },
  relations: ['jobs', 'reviews'],
});

// ✅ Prisma - autocomplete și type-safety
const user = await prisma.user.findUnique({
  where: { email }, // Dacă scrii "emial" → eroare instant
  include: {
    jobsPosted: true,    // Relații definite în schema
    reviewsReceived: true,
  },
});
// user.jobsPosted este tipat automat ca Job[]
```

**Schema Prisma → Tipuri generate:**

```prisma
// packages/database/prisma/schema.prisma
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String
  jobsPosted  Job[]    @relation("JobPoster")
}

model Job {
  id          String   @id @default(cuid())
  title       String
  posterId    String
  poster      User     @relation("JobPoster", fields: [posterId], references: [id])
}
```

După `pnpm db:generate`, Prisma creează automat:

```typescript
// Generat automat - poți importa aceste tipuri
type User = {
  id: string;
  email: string;
  name: string;
};

type Job = {
  id: string;
  title: string;
  posterId: string;
};
```

### 4. Zod (în loc de validare manuală)

**De ce?** Validare runtime cu tipuri TypeScript generate automat.

```typescript
// ❌ Validare manuală - repetitivă și error-prone
function validateJob(data: any) {
  if (!data.title || typeof data.title !== 'string') {
    throw new Error('Title required');
  }
  if (data.title.length < 3) {
    throw new Error('Title too short');
  }
  if (!data.budget || typeof data.budget !== 'number') {
    throw new Error('Budget required');
  }
  // ... și tot așa pentru fiecare câmp
}

// ✅ Zod - declarativ și generează tipuri
import { z } from 'zod';

const createJobSchema = z.object({
  title: z.string().min(3, 'Titlul trebuie să aibă minim 3 caractere'),
  description: z.string().min(10),
  budget: z.number().positive('Bugetul trebuie să fie pozitiv'),
  category: z.enum(['BABYSITTING', 'HOUSE_CLEANING', 'LOCAL_FOOD']),
});

// Tipul TypeScript este generat automat!
type CreateJobInput = z.infer<typeof createJobSchema>;
// = { title: string; description: string; budget: number; category: 'BABYSITTING' | ... }

// Utilizare în API
const result = createJobSchema.safeParse(requestBody);
if (!result.success) {
  return { errors: result.error.errors }; // Mesaje de eroare detaliate
}
const validData = result.data; // Tipat corect!
```

### 5. Firebase Auth (în loc de auth custom)

**De ce?**
- Gestionează parole, token-uri, sesiuni - nu trebuie să le implementezi
- Social login (Google, Facebook) out-of-the-box
- Verificare email, reset parolă - totul inclus

```typescript
// ❌ Auth custom - trebuie să implementezi TOT
// - Hash parole (bcrypt)
// - Generare/validare JWT
// - Refresh tokens
// - Stocare sesiuni
// - Social OAuth flows
// - Email verification
// - Password reset
// ... sute de linii de cod și multe vulnerabilități potențiale

// ✅ Firebase Auth - totul e gata
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

// Login cu email
await signInWithEmailAndPassword(auth, email, password);

// Login cu Google - o singură linie!
await signInWithPopup(auth, new GoogleAuthProvider());

// Token pentru API - automat generat și refreshed
const token = await auth.currentUser.getIdToken();
```

### 6. React Query / TanStack Query (în loc de useEffect + useState)

**De ce?**
- Cache automat
- Refetch la focus/reconectare
- Loading/error states
- Optimistic updates

```typescript
// ❌ Abordare clasică cu useEffect
function JobsList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/jobs')
      .then(res => res.json())
      .then(data => {
        setJobs(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []);

  // Trebuie să gestionezi manual refresh, cache, etc.
}

// ✅ React Query - totul e gestionat automat
function JobsList() {
  const { data: jobs, isLoading, error, refetch } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => fetch('/api/jobs').then(res => res.json()),
    staleTime: 5 * 60 * 1000, // Cache valid 5 minute
    refetchOnWindowFocus: true, // Refresh când user-ul revine la tab
  });

  // jobs sunt cached, refetch automat, loading/error states incluse
}
```

### 7. Zustand (în loc de Redux sau Context)

**De ce?**
- Simplu - nu trebuie reducers, actions, dispatch
- Performant - nu re-renderează tot arborele
- TypeScript-friendly

```typescript
// ❌ Redux - verbose și complex
// actions.ts
const SET_USER = 'SET_USER';
const setUser = (user) => ({ type: SET_USER, payload: user });

// reducer.ts
const userReducer = (state = null, action) => {
  switch (action.type) {
    case SET_USER:
      return action.payload;
    default:
      return state;
  }
};

// component.tsx
const user = useSelector(state => state.user);
const dispatch = useDispatch();
dispatch(setUser(newUser));

// ✅ Zustand - simplu și direct
// stores/auth-store.ts
import { create } from 'zustand';

interface AuthStore {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));

// component.tsx - folosire directă
const user = useAuthStore((state) => state.user);
const setUser = useAuthStore((state) => state.setUser);
setUser(newUser);
```

### 8. Tailwind CSS (în loc de CSS normal sau styled-components)

**De ce?**
- Utility-first - scrii stiluri direct în JSX
- Nu mai ai fișiere CSS separate
- Design consistent prin design tokens

```typescript
// ❌ CSS tradițional
// styles.css
.card {
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

// component.tsx
import './styles.css';
<div className="card">
  <h2 className="card-title">...</h2>
</div>

// ✅ Tailwind - totul inline, dar consistent
<div className="bg-white rounded-lg p-4 shadow-md">
  <h2 className="text-lg font-semibold text-gray-900">...</h2>
</div>

// Beneficii:
// - Nu schimbi între fișiere
// - Responsive simplu: "md:p-6 lg:p-8"
// - Dark mode: "dark:bg-gray-800"
// - Hover states: "hover:shadow-lg"
```

### 9. Expo / React Native (pentru Mobile)

**De ce?**
- Un singur codebase pentru iOS și Android
- Hot reload - vezi schimbările instant
- Acces la API-uri native (cameră, notificări, etc.)

```typescript
// Același cod rulează pe iOS și Android
import { View, Text, TouchableOpacity } from 'react-native';

function JobCard({ job }: { job: Job }) {
  return (
    <TouchableOpacity
      onPress={() => router.push(`/job/${job.id}`)}
      style={styles.card}
    >
      <Text style={styles.title}>{job.title}</Text>
      <Text style={styles.budget}>${job.budget}</Text>
    </TouchableOpacity>
  );
}

// StyleSheet în loc de Tailwind (React Native nu suportă CSS)
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Pentru Android
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  budget: {
    fontSize: 14,
    color: '#22c55e',
    marginTop: 4,
  },
});
```

---

## Flow Complet: Postare Job (Web)

Să urmărim exact ce se întâmplă când un user postează un job nou.

### Pasul 1: User-ul completează formularul

```
Browser (React Component)
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  apps/web/src/app/(main)/jobs/new/page.tsx              │
│                                                         │
│  function NewJobPage() {                                │
│    const [formData, setFormData] = useState({           │
│      title: '',                                         │
│      description: '',                                   │
│      budget: '',                                        │
│      category: 'BABYSITTING',                          │
│    });                                                  │
│                                                         │
│    return (                                             │
│      <form onSubmit={handleSubmit}>                     │
│        <input                                           │
│          value={formData.title}                         │
│          onChange={(e) => setFormData({                 │
│            ...formData,                                 │
│            title: e.target.value                        │
│          })}                                            │
│        />                                               │
│        {/* ... alte câmpuri */}                         │
│        <button type="submit">Postează</button>          │
│      </form>                                            │
│    );                                                   │
│  }                                                      │
└─────────────────────────────────────────────────────────┘
```

### Pasul 2: User-ul apasă "Postează" → handleSubmit

```typescript
// În același fișier - apps/web/src/app/(main)/jobs/new/page.tsx

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault(); // Previne refresh-ul paginii

  // 1. Validare client-side cu Zod (opțional, pentru UX rapid)
  const validation = createJobSchema.safeParse(formData);
  if (!validation.success) {
    setErrors(validation.error.errors);
    return;
  }

  // 2. Obține token-ul Firebase pentru autentificare
  const token = await auth.currentUser?.getIdToken();

  // 3. Trimite request-ul către API
  const response = await fetch('/api/jobs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // Token-ul Firebase
    },
    body: JSON.stringify(formData),
  });

  // 4. Gestionează răspunsul
  if (response.ok) {
    const job = await response.json();
    router.push(`/jobs/${job.id}`); // Redirect la job-ul creat
  } else {
    const error = await response.json();
    setErrors(error.details);
  }
}
```

```
Browser                           Server (Next.js API Route)
   │                                        │
   │  POST /api/jobs                        │
   │  Headers:                              │
   │    Authorization: Bearer eyJhbG...     │
   │  Body:                                 │
   │    { title, description, budget, ... } │
   │ ─────────────────────────────────────► │
   │                                        │
```

### Pasul 3: API Route primește request-ul

```typescript
// apps/web/src/app/api/jobs/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@localservices/database';
import { createJobSchema } from '@localservices/shared';
import { authenticate } from '@/lib/auth-middleware';

export async function POST(request: NextRequest) {
  try {
    // ═══════════════════════════════════════════════════════════════
    // PASUL 3.1: Autentificare - Verifică cine face request-ul
    // ═══════════════════════════════════════════════════════════════
    const user = await authenticate(request);
    //                    │
    //                    └─► Extrage token din header
    //                        Verifică cu Firebase Admin SDK
    //                        Găsește user-ul în DB
    //                        Returnează user sau null

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
```

### Pasul 3.1 (detaliat): Funcția authenticate()

```typescript
// apps/web/src/lib/auth-middleware.ts

export async function authenticate(request: NextRequest) {
  // 1. Extrage token-ul din header
  const authHeader = request.headers.get('Authorization');
  // authHeader = "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6Ikp..."

  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '');
  // token = "eyJhbGciOiJSUzI1NiIsInR5cCI6Ikp..."

  try {
    // 2. Verifică token-ul cu Firebase Admin SDK
    const decodedToken = await verifyIdToken(token);
    //                         │
    //                         └─► Comunică cu Firebase servers
    //                             Verifică semnătura JWT
    //                             Verifică expirarea
    //                             Returnează { uid: "firebase-uid-123", email: "..." }

    // 3. Găsește user-ul în baza noastră de date
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
      select: {
        id: true,      // ID-ul nostru intern (cuid)
        email: true,
        name: true,
        role: true,
      },
    });

    return user; // { id: "clx123...", email: "user@email.com", ... }
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}
```

```
                    Firebase Auth Servers
                           │
                           │ Verifică JWT
                           │
API Route ────────────────►│
   │                       │
   │◄──────────────────────┤ { uid: "firebase-123" }
   │
   │     Prisma Query
   │          │
   ▼          ▼
┌─────────────────────┐
│   PostgreSQL DB     │
│                     │
│  SELECT * FROM User │
│  WHERE firebaseUid  │
│    = 'firebase-123' │
└─────────────────────┘
```

### Pasul 3.2: Validare date

```typescript
// Continuare din apps/web/src/app/api/jobs/route.ts

    // ═══════════════════════════════════════════════════════════════
    // PASUL 3.2: Validare - Verifică dacă datele sunt corecte
    // ═══════════════════════════════════════════════════════════════
    const body = await request.json();
    // body = { title: "Caut bonă", description: "...", budget: 100, ... }

    const validationResult = createJobSchema.safeParse(body);
    //                                         │
    //                                         └─► Zod verifică:
    //                                             - title: string, min 3 chars
    //                                             - description: string, min 10 chars
    //                                             - budget: number, positive
    //                                             - category: enum valid

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.errors,
          // details = [
          //   { path: ['title'], message: 'Minim 3 caractere' },
          //   { path: ['budget'], message: 'Trebuie să fie pozitiv' }
          // ]
        },
        { status: 400 }
      );
    }

    const { title, description, budget, category, location, latitude, longitude } =
      validationResult.data;
    // Acum avem date validate și tipate corect!
```

### Pasul 3.3: Salvare în baza de date

```typescript
// Continuare din apps/web/src/app/api/jobs/route.ts

    // ═══════════════════════════════════════════════════════════════
    // PASUL 3.3: Creare în DB - Salvează job-ul
    // ═══════════════════════════════════════════════════════════════
    const job = await prisma.job.create({
      data: {
        title,
        description,
        budget,
        category,
        location,
        latitude,
        longitude,
        status: 'OPEN',
        posterId: user.id,  // Legătura cu user-ul autentificat
      },
      include: {
        poster: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // job = {
    //   id: "clx456abc...",
    //   title: "Caut bonă",
    //   description: "...",
    //   budget: 100,
    //   status: "OPEN",
    //   posterId: "clx123...",
    //   poster: { id: "clx123...", name: "Ion", avatar: "..." },
    //   createdAt: "2024-01-15T10:30:00Z"
    // }
```

```
Prisma Client                    PostgreSQL Database
     │                                   │
     │  INSERT INTO "Job"                │
     │  (id, title, description,         │
     │   budget, category, status,       │
     │   "posterId", ...)                │
     │  VALUES (...)                     │
     │  RETURNING *                      │
     │ ────────────────────────────────► │
     │                                   │
     │◄──────────────────────────────────│
     │  { id: "clx456abc", ... }         │
     │                                   │
```

### Pasul 4: Răspuns către client

```typescript
// Continuare din apps/web/src/app/api/jobs/route.ts

    // ═══════════════════════════════════════════════════════════════
    // PASUL 4: Răspuns - Trimite job-ul creat înapoi
    // ═══════════════════════════════════════════════════════════════
    return NextResponse.json(job, { status: 201 });

  } catch (error) {
    console.error('Create job error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

```
Server                            Browser
   │                                 │
   │  HTTP 201 Created               │
   │  {                              │
   │    "id": "clx456abc",           │
   │    "title": "Caut bonă",        │
   │    "status": "OPEN",            │
   │    "poster": { ... }            │
   │  }                              │
   │ ──────────────────────────────► │
   │                                 │
   │                    router.push(`/jobs/${job.id}`)
   │                                 │
   │                                 ▼
   │                         Redirect la pagina job-ului
```

### Diagrama completă a flow-ului

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BROWSER                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  1. User completează form                                                    │
│  2. Click "Postează"                                                        │
│  3. handleSubmit() → fetch('/api/jobs', { ... })                           │
│                          │                                                   │
└──────────────────────────┼──────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         NEXT.JS SERVER                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  apps/web/src/app/api/jobs/route.ts                                         │
│                                                                              │
│  4. authenticate(request)                                                    │
│       │                                                                      │
│       ├──► Extrage token din Authorization header                           │
│       │                                                                      │
│       ├──► verifyIdToken(token) ─────────────────►  Firebase Auth          │
│       │         │                                     Servers               │
│       │         │◄────────────────────────────────  { uid: "..." }         │
│       │                                                                      │
│       └──► prisma.user.findUnique({ firebaseUid }) ──► PostgreSQL          │
│                    │◄────────────────────────────────  User object          │
│                                                                              │
│  5. createJobSchema.safeParse(body) → Validare Zod                          │
│                                                                              │
│  6. prisma.job.create({ ... }) ─────────────────────► PostgreSQL           │
│           │◄────────────────────────────────────────  Job object           │
│                                                                              │
│  7. return NextResponse.json(job, { status: 201 })                          │
│                          │                                                   │
└──────────────────────────┼──────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BROWSER                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  8. Primește răspuns JSON                                                   │
│  9. router.push(`/jobs/${job.id}`) → Redirect                               │
│ 10. User vede pagina job-ului creat                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Flow Complet: Trimitere Ofertă (Mobile)

Acum să vedem cum funcționează pe mobil când un provider trimite o ofertă.

### Pasul 1: User-ul vede un job și apasă "Trimite Ofertă"

```typescript
// apps/mobile/app/job/[id].tsx

function JobDetailScreen() {
  const { id } = useLocalSearchParams(); // Obține ID-ul din URL
  const [job, setJob] = useState<Job | null>(null);
  const [showOfferModal, setShowOfferModal] = useState(false);

  // Încarcă job-ul la mount
  useEffect(() => {
    fetchJob();
  }, [id]);

  async function fetchJob() {
    const token = await auth.currentUser?.getIdToken();
    const response = await fetch(
      `${API_URL}/api/jobs/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await response.json();
    setJob(data);
  }

  return (
    <ScrollView>
      {/* Detalii job */}
      <Text style={styles.title}>{job?.title}</Text>
      <Text style={styles.budget}>{job?.budget} RON</Text>

      {/* Buton ofertă */}
      <TouchableOpacity
        onPress={() => setShowOfferModal(true)}
        style={styles.offerButton}
      >
        <Text>Trimite Ofertă</Text>
      </TouchableOpacity>

      {/* Modal pentru ofertă */}
      <OfferModal
        visible={showOfferModal}
        jobId={id}
        onClose={() => setShowOfferModal(false)}
        onSuccess={() => {
          setShowOfferModal(false);
          Alert.alert('Succes', 'Oferta a fost trimisă!');
        }}
      />
    </ScrollView>
  );
}
```

### Pasul 2: User-ul completează și trimite oferta

```typescript
// apps/mobile/components/OfferModal.tsx

function OfferModal({ visible, jobId, onClose, onSuccess }) {
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);

    try {
      // 1. Obține token-ul de autentificare
      const token = await auth.currentUser?.getIdToken();

      // 2. Trimite oferta către API
      const response = await fetch(
        `${API_URL}/api/jobs/${jobId}/offers`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            price: parseFloat(price),
            message,
          }),
        }
      );

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        Alert.alert('Eroare', error.message);
      }
    } catch (error) {
      Alert.alert('Eroare', 'Nu s-a putut trimite oferta');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <TextInput
          placeholder="Preț (RON)"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />
        <TextInput
          placeholder="Mesaj pentru client"
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text>{loading ? 'Se trimite...' : 'Trimite Oferta'}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
```

### Pasul 3: API Route procesează oferta

```typescript
// apps/web/src/app/api/jobs/[id]/offers/route.ts

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Autentificare
    const user = await authenticate(request);
    if (!user) {
      return unauthorizedResponse();
    }

    const jobId = params.id;
    const body = await request.json();

    // 2. Validare
    const { price, message } = createOfferSchema.parse(body);

    // 3. Verificări business logic
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { poster: true },
    });

    if (!job) {
      return notFoundResponse('Job');
    }

    // Nu poți face ofertă la propriul job
    if (job.posterId === user.id) {
      return NextResponse.json(
        { error: 'Nu poți face ofertă la propriul job' },
        { status: 400 }
      );
    }

    // Verifică dacă ai deja o ofertă
    const existingOffer = await prisma.offer.findUnique({
      where: {
        jobId_providerId: {  // Constraint unic compus
          jobId,
          providerId: user.id,
        },
      },
    });

    if (existingOffer) {
      return NextResponse.json(
        { error: 'Ai deja o ofertă pentru acest job' },
        { status: 400 }
      );
    }

    // 4. Creează oferta și notificarea în tranzacție
    const result = await prisma.$transaction(async (tx) => {
      // Creează oferta
      const offer = await tx.offer.create({
        data: {
          jobId,
          providerId: user.id,
          price,
          message,
        },
        include: {
          provider: {
            select: { id: true, name: true, avatar: true, rating: true },
          },
        },
      });

      // Creează notificare pentru poster
      await tx.notification.create({
        data: {
          type: 'NEW_OFFER',
          title: 'Ofertă nouă!',
          body: `${user.name} a făcut o ofertă de ${price} RON`,
          data: { jobId, offerId: offer.id },
          userId: job.posterId,
        },
      });

      return offer;
    });

    // 5. Trimite răspunsul
    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    // Gestionare erori...
  }
}
```

### Diagrama flow mobil

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MOBILE APP (React Native)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   1. User deschide JobDetailScreen                                          │
│   2. useEffect → fetchJob() → GET /api/jobs/{id}                           │
│   3. User apasă "Trimite Ofertă"                                            │
│   4. Se deschide OfferModal                                                  │
│   5. User completează preț + mesaj                                          │
│   6. handleSubmit() → POST /api/jobs/{id}/offers                           │
│                              │                                               │
└──────────────────────────────┼──────────────────────────────────────────────┘
                               │
                               │ HTTPS Request
                               │ (poate trece prin CDN/Load Balancer)
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         VERCEL (Next.js Server)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   7. authenticate() → Firebase + Prisma                                      │
│   8. createOfferSchema.safeParse()                                          │
│   9. Business logic checks                                                   │
│  10. prisma.$transaction([                                                   │
│        offer.create(),                                                       │
│        notification.create()                                                 │
│      ])                                                                      │
│  11. return NextResponse.json(offer)                                         │
│                              │                                               │
└──────────────────────────────┼──────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MOBILE APP                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  12. response.ok → onSuccess()                                               │
│  13. Modal se închide                                                        │
│  14. Alert.alert('Succes', 'Oferta a fost trimisă!')                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

                               ║
                               ║ În același timp...
                               ▼

┌─────────────────────────────────────────────────────────────────────────────┐
│                    POSTER PRIMEȘTE NOTIFICARE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Notificarea creată în DB este citită de:                                  │
│   - NotificationBell component (web) - polling sau websocket                │
│   - Push notification (mobile) - Firebase Cloud Messaging                    │
│                                                                              │
│   Poster vede: "Ion a făcut o ofertă de 150 RON"                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Flow Complet: Chat în Timp Real

Când o ofertă este acceptată, se creează o conversație și cei doi utilizatori pot comunica.

### Arhitectura Chat-ului

```
┌─────────────┐     ┌─────────────┐
│   User A    │     │   User B    │
│  (Poster)   │     │ (Provider)  │
└──────┬──────┘     └──────┬──────┘
       │                   │
       │   WebSocket       │   WebSocket
       │   (sau Polling)   │   (sau Polling)
       │                   │
       ▼                   ▼
┌─────────────────────────────────────┐
│         Socket.io Server            │
│    (sau Polling către Next.js)      │
├─────────────────────────────────────┤
│  • Gestionează conexiuni            │
│  • Broadcast mesaje                 │
│  • Typing indicators                │
└──────────────┬──────────────────────┘
               │
               │ Salvează în
               ▼
┌─────────────────────────────────────┐
│         PostgreSQL                  │
│    (Conversations + Messages)       │
└─────────────────────────────────────┘
```

### Pasul 1: Conectare la chat

```typescript
// apps/web/src/app/(main)/messages/[id]/page.tsx

function ChatPage() {
  const { id: conversationId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const pollerRef = useRef<MessagePoller | null>(null);

  useEffect(() => {
    // 1. Încarcă mesajele existente
    loadMessages();

    // 2. Setează polling pentru mesaje noi
    //    (sau WebSocket dacă e configurat)
    pollerRef.current = new MessagePoller(
      conversationId,
      (newMessages) => {
        setMessages(prev => [...prev, ...newMessages]);
      }
    );
    pollerRef.current.start(3000); // Poll la fiecare 3 secunde

    return () => {
      pollerRef.current?.stop();
    };
  }, [conversationId]);

  async function loadMessages() {
    const token = await auth.currentUser?.getIdToken();
    const response = await fetch(
      `/api/conversations/${conversationId}/messages`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await response.json();
    setMessages(data);

    // Setează ultimul mesaj pentru polling eficient
    if (data.length > 0) {
      pollerRef.current?.setLastMessageId(data[data.length - 1].id);
    }
  }

  // ... render messages
}
```

### Pasul 2: Trimitere mesaj

```typescript
// Continuare din ChatPage

async function sendMessage() {
  if (!newMessage.trim()) return;

  const token = await auth.currentUser?.getIdToken();

  // Optimistic update - arată mesajul imediat
  const tempMessage = {
    id: `temp-${Date.now()}`,
    content: newMessage,
    senderId: currentUser.id,
    createdAt: new Date().toISOString(),
    isRead: false,
  };
  setMessages(prev => [...prev, tempMessage]);
  setNewMessage('');

  try {
    const response = await fetch(
      `/api/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newMessage }),
      }
    );

    if (response.ok) {
      const savedMessage = await response.json();
      // Înlocuiește mesajul temporar cu cel real
      setMessages(prev =>
        prev.map(m => m.id === tempMessage.id ? savedMessage : m)
      );
    } else {
      // Eroare - elimină mesajul temporar
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      // Arată eroare
    }
  } catch (error) {
    // Gestionare eroare...
  }
}
```

### Pasul 3: API salvează și notifică

```typescript
// apps/web/src/app/api/conversations/[id]/messages/route.ts

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await authenticate(request);
  if (!user) return unauthorizedResponse();

  const conversationId = params.id;
  const { content, imageUrl } = await request.json();

  // Verifică că user-ul face parte din conversație
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId: user.id,
      },
    },
  });

  if (!participant) {
    return forbiddenResponse();
  }

  // Creează mesajul și trimite notificare
  const result = await prisma.$transaction(async (tx) => {
    // 1. Creează mesajul
    const message = await tx.message.create({
      data: {
        conversationId,
        senderId: user.id,
        content,
        imageUrl,
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    // 2. Actualizează timestamp conversație
    await tx.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // 3. Găsește celălalt participant pentru notificare
    const otherParticipant = await tx.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId: { not: user.id },
      },
    });

    // 4. Creează notificare
    if (otherParticipant) {
      await tx.notification.create({
        data: {
          type: 'NEW_MESSAGE',
          title: `Mesaj de la ${user.name}`,
          body: content.substring(0, 100),
          data: { conversationId },
          userId: otherParticipant.userId,
        },
      });
    }

    return message;
  });

  return NextResponse.json(result, { status: 201 });
}
```

### Diagrama completă chat

```
User A (trimite)                 Server                    User B (primește)
      │                            │                              │
      │  POST /messages            │                              │
      │  { content: "Salut!" }     │                              │
      │ ──────────────────────────►│                              │
      │                            │                              │
      │                            │  1. Salvează în DB           │
      │                            │  2. Creează notificare       │
      │                            │                              │
      │◄──────────────────────────│                              │
      │  { id, content, ... }      │                              │
      │                            │                              │
      │  Arată mesajul            │                              │
      │  în UI                     │                              │
      │                            │                              │
      │                            │   GET /messages?after=...    │
      │                            │◄──────────────────────────────│
      │                            │   (polling la 3 sec)         │
      │                            │                              │
      │                            │──────────────────────────────►│
      │                            │   [{ content: "Salut!" }]    │
      │                            │                              │
      │                            │   User B vede mesajul        │
      │                            │   + primește push notification│
```

---

## Structura Monorepo

### De ce Monorepo?

```
❌ Fără monorepo (repos separate):

repo-web/
  └── Trebuie să publici packages pe npm
      și să le instalezi în fiecare repo

repo-mobile/
  └── Versioning devine un coșmar
      "Ce versiune de shared am eu?"

repo-shared/
  └── Fiecare schimbare = publish + update în toate repo-urile


✅ Cu monorepo (Turborepo):

localservices/
├── apps/
│   ├── web/        → Importă direct din packages/
│   └── mobile/     → Același cod shared, fără npm publish
└── packages/
    ├── shared/     → O modificare = toate apps au acces instant
    └── database/   → Tipurile Prisma disponibile peste tot
```

### Cum funcționează imports între packages?

```typescript
// packages/shared/package.json
{
  "name": "@localservices/shared",
  "main": "./src/index.ts"
}

// packages/database/package.json
{
  "name": "@localservices/database",
  "main": "./src/index.ts"
}

// apps/web/package.json
{
  "dependencies": {
    "@localservices/shared": "workspace:*",   // ← Link local, nu npm
    "@localservices/database": "workspace:*"
  }
}

// Acum în apps/web/src/... poți face:
import { createJobSchema, COLORS } from '@localservices/shared';
import { prisma } from '@localservices/database';
```

### Turborepo - Build și cache inteligent

```bash
# turborepo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],  # Construiește dependencies mai întâi
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false
    },
    "typecheck": {
      "dependsOn": ["^build"]
    }
  }
}

# Când rulezi:
$ pnpm build

# Turborepo:
# 1. Detectează ce s-a schimbat
# 2. Construiește doar ce e necesar
# 3. Cache-uiește rezultatele
# 4. La următorul build, skip ce nu s-a schimbat

# Exemplu output:
#  @localservices/shared:build  cache hit ✓ (folosește cache)
#  @localservices/database:build  cache hit ✓
#  web:build  cache miss → building...
```

---

## Rezumat pentru Juniori

### Când folosești ce?

| Sarcina | Tehnologie | Fișier |
|---------|------------|--------|
| Formular UI | React + Tailwind | `page.tsx` |
| Validare date | Zod | `validators.ts` |
| Request HTTP | fetch | `page.tsx` sau hooks |
| Autentificare | Firebase + middleware | `auth-middleware.ts` |
| Interogare DB | Prisma | `route.ts` (API) |
| State global | Zustand | `stores/*.ts` |
| Cache & fetching | React Query | hooks sau components |

### Flow-ul standard pentru orice feature:

```
1. UI Component (React)
       │
       │ user action (click, submit)
       ▼
2. Event Handler (async function)
       │
       │ validate locally (optional)
       │ get auth token
       ▼
3. API Request (fetch)
       │
       │ POST/GET/PATCH /api/...
       ▼
4. API Route (Next.js)
       │
       │ authenticate()
       │ validate with Zod
       │ business logic
       ▼
5. Database (Prisma → PostgreSQL)
       │
       │ create/read/update/delete
       ▼
6. Response (JSON)
       │
       │ back through the chain
       ▼
7. UI Update (setState, router.push, etc.)
```

### Întrebări frecvente

**Q: Unde pun logica de business?**
A: În API routes (`apps/web/src/app/api/`), nu în componente.

**Q: Cum validez datele?**
A: Cu Zod, în `packages/shared/src/validators/`.

**Q: Cum accesez baza de date?**
A: Doar prin Prisma, doar în API routes (server-side).

**Q: Cum gestionez autentificarea?**
A: Firebase pe client, `authenticate()` pe server.

**Q: Unde pun tipurile TypeScript?**
A: În `packages/shared/src/types/` sau generate de Prisma.

**Q: Cum fac stiluri?**
A: Tailwind pe web, StyleSheet pe mobile.
