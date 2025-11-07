import admin from 'firebase-admin';

let authInstance: admin.auth.Auth | null = null;

if (process.env.FIREBASE_ADMIN_CREDENTIALS) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS);
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    authInstance = admin.auth();
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
  }
} else {
  console.warn('Firebase Admin: No credentials found. Using client-only authentication.');
}

export const auth = authInstance;

export async function verifyToken(token: string) {
  if (!authInstance) {
    console.error('Firebase Admin not initialized. Cannot verify token.');
    return null;
  }

  try {
    if (!token) {
      return null;
    }
    const decodedToken = await authInstance.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}
