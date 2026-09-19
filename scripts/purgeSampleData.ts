import { getFirestoreDb, fetchCollection, deleteDocument, saveDocument } from '../server/firestore.js';
import { collection, getDocs, deleteDoc } from 'firebase/firestore';

async function purgeAllSampleData() {
  console.log('[Purge] Starting complete purge of sample data and photos from Firestore...');
  const db = getFirestoreDb();

  const collectionsToClear = [
    'listings',
    'requirements',
    'transactions',
    'agentAssignments',
    'tradeDocuments',
    'notifications',
    'auditLogs',
    'interests',
    'purchases',
    'sales'
  ];

  for (const colName of collectionsToClear) {
    try {
      const colRef = collection(db, colName);
      const snap = await getDocs(colRef);
      console.log(`[Purge] Clearing ${snap.docs.length} docs from "${colName}"...`);
      for (const d of snap.docs) {
        await deleteDoc(d.ref);
      }
    } catch (e) {
      console.warn(`[Purge] Warning clearing collection ${colName}:`, e);
    }
  }

  // Purge sample users (usr-sup-*, usr-buy-*, usr-agt-*)
  try {
    const userCol = collection(db, 'users');
    const userSnap = await getDocs(userCol);
    for (const d of userSnap.docs) {
      const id = d.id;
      if (id.startsWith('usr-sup-') || id.startsWith('usr-buy-') || id.startsWith('usr-agt-') || d.data().email?.includes('@example.com')) {
        console.log(`[Purge] Removing sample user: ${id} (${d.data().name})`);
        await deleteDoc(d.ref);
      }
    }

    // Ensure clean admin account
    const cleanAdmin = {
      id: 'usr-admin-01',
      email: 'admin@alshaheedrecycling.com',
      name: 'admin',
      username: 'admin',
      password: 'admin123',
      role: 'ADMIN',
      companyName: 'Al Shaheed Trading and Equipment Co',
      phone: '+974 30437712',
      country: 'Qatar',
      city: 'Doha',
      status: 'ACTIVE',
      createdAt: '2026-01-10T08:00:00Z',
    };
    await saveDocument('users', cleanAdmin);
    console.log('[Purge] Ensured clean admin account in Firestore.');
  } catch (e) {
    console.warn('[Purge] Warning updating users:', e);
  }

  console.log('[Purge] Successfully purged all sample data from cloud database.');
  process.exit(0);
}

purgeAllSampleData().catch((err) => {
  console.error('[Purge] Fatal error:', err);
  process.exit(1);
});
