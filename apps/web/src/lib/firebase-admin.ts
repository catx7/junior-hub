import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';

let adminApp: App;
let adminAuth: Auth;

function initAdmin() {
  if (getApps().length === 0) {
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

    adminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
  } else {
    adminApp = getApps()[0];
  }

  adminAuth = getAuth(adminApp);
  return { adminApp, adminAuth };
}

export function getAdminAuth(): Auth {
  if (!adminAuth) {
    initAdmin();
  }
  return adminAuth;
}

export async function verifyIdToken(token: string) {
  const auth = getAdminAuth();
  return auth.verifyIdToken(token);
}

export async function getUser(uid: string) {
  const auth = getAdminAuth();
  return auth.getUser(uid);
}
