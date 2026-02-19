import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getMessaging, Messaging } from 'firebase-admin/messaging';
import { logger } from './logger';
import { withTiming } from './timing';

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
  return withTiming('firebase.verifyIdToken', () => auth.verifyIdToken(token));
}

export async function getUser(uid: string) {
  const auth = getAdminAuth();
  return auth.getUser(uid);
}

let adminMessaging: Messaging;

function getAdminMessaging(): Messaging {
  if (!adminMessaging) {
    if (!adminApp) {
      initAdmin();
    }
    adminMessaging = getMessaging(adminApp);
  }
  return adminMessaging;
}

export async function sendPushNotification(
  fcmToken: string,
  notification: { title: string; body: string },
  data?: Record<string, string>
): Promise<boolean> {
  try {
    const messaging = getAdminMessaging();
    await withTiming('firebase.sendPushNotification', () =>
      messaging.send({
        token: fcmToken,
        notification,
        data,
        webpush: {
          fcmOptions: {
            link: data?.link || '/',
          },
        },
      })
    );
    return true;
  } catch (error: any) {
    if (
      error.code === 'messaging/invalid-registration-token' ||
      error.code === 'messaging/registration-token-not-registered'
    ) {
      logger.debug('FCM token invalid or unregistered', { errorCode: error.code });
      return false;
    }
    logger.error('FCM send failed', { error });
    return false;
  }
}
