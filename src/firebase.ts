import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export const firebaseConfig = {
  projectId: "thinking-arcanum-bf6jr",
  appId: "1:53423506288:web:d9d0264b59635348efc5b5",
  apiKey: "AIzaSyC_FGNs5MLce9ow85aNZOF0IeW_odDOtTs",
  authDomain: "thinking-arcanum-bf6jr.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-alshaheedrecycli-7c16bc9f-5cb7-425d-945e-52c57377d1bd",
  storageBucket: "thinking-arcanum-bf6jr.firebasestorage.app",
  messagingSenderId: "53423506288",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Connect specifically to the provisioned database ID
export const firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Initial test connection to validate database connectivity
export async function validateFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(firestore, 'test', 'connection'));
    console.log('Connected successfully to Firestore database:', firebaseConfig.firestoreDatabaseId);
    return true;
  } catch (error: any) {
    if (error?.message && error.message.includes('the client is offline')) {
      console.warn('Firestore offline or unreachable, will retry.');
      return false;
    }
    // Any other response means connectivity is functional
    return true;
  }
}
