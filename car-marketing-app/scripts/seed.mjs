/**
 * Seed script for populating Firebase Auth + Firestore with test data.
 * 
 * Usage:
 *   node scripts/seed.mjs
 * 
 * This script will:
 *   1. Create test users in Firebase Auth
 *   2. Create user profiles in /users collection
 *   3. Create stores in /stores collection
 *   4. Create agencies in /agencies collection
 *   5. Create the /settings/global document
 *   6. Create sample promotions in /promotions collection
 *   7. Create sample clients in /clients collection
 */

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ── Load .env manually (no dotenv dependency needed) ──
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env');
const envContent = readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
  }
});

// ── Firebase Config ──
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ═══════════════════════════════════════════
//  TEST DATA
// ═══════════════════════════════════════════

const TEST_USERS = [
  { email: 'admin@carmarketing.mx',     password: 'admin123',     role: 'admin',   name: 'Administrador Global', storeId: null },
  { email: 'gerente@carmarketing.mx',   password: 'gerente123',   role: 'manager', name: 'Gerente Tienda Polanco', storeId: 'store_polanco' },
  { email: 'gerente2@carmarketing.mx',  password: 'gerente123',   role: 'manager', name: 'Gerente Tienda Satélite', storeId: 'store_satelite' },
  { email: 'vendedor@carmarketing.mx',  password: 'vendedor123',  role: 'vendor',  name: 'Vendedor Estrella', storeId: 'store_polanco' },
  { email: 'vendedor2@carmarketing.mx', password: 'vendedor123',  role: 'vendor',  name: 'Vendedor Novato', storeId: 'store_polanco' },
  { email: 'vendedor3@carmarketing.mx', password: 'vendedor123',  role: 'vendor',  name: 'Vendedor Tienda 2', storeId: 'store_satelite' },
];

const TEST_STORES = [
  { id: 'store_polanco',   name: 'Sucursal Polanco',   phone: '5555550001', address: 'Av. Presidente Masaryk 123', city: 'CDMX' },
  { id: 'store_satelite',  name: 'Sucursal Satélite',  phone: '5555550002', address: 'Blvd. Manuel Ávila Camacho 456', city: 'Edo. Mex' },
];

const TEST_AGENCIES = [
  { name: 'Volkswagen CDMX',   phone: '5555551001', address: 'Av. Insurgentes Sur 1234', city: 'CDMX' },
  { name: 'Toyota Polanco',    phone: '5555551002', address: 'Av. Horacio 789',           city: 'CDMX' },
  { name: 'BMW Satélite',      phone: '5555551003', address: 'Periférico Norte 321',      city: 'Edo. Mex' },
];

const SETTINGS_GLOBAL = {
  rates: {
    credito_normal: 12.9,
    pagos_programados: 18.49,
    smart_credit: 14.9,
    pink_credit: 15.9,
    green_credit: 12.9,
    moto_credit: 16.9,
    arrendamiento: 0,
    green_leasing: 0,
    leasing_moto: 0,
  },
  storeRates: {},
  exchangeRates: {
    USD: 19.5,
    COP: 0.0045,
    CLP: 0.021,
    PEN: 5.2,
    ARS: 0.016,
    BRL: 3.4,
    UYU: 0.47,
    BOB: 2.82,
    GTQ: 2.52,
    DOP: 0.33,
    CRC: 0.037,
    PAB: 19.5,
  },
  currencies: [
    { code: 'MXN', flag: '🇲🇽', name: 'Peso Mexicano' },
    { code: 'USD', flag: '🇺🇸', name: 'Dólar USA' },
    { code: 'COP', flag: '🇨🇴', name: 'Peso Colombiano' },
    { code: 'CLP', flag: '🇨🇱', name: 'Peso Chileno' },
    { code: 'PEN', flag: '🇵🇪', name: 'Sol Peruano' },
    { code: 'ARS', flag: '🇦🇷', name: 'Peso Argentino' },
    { code: 'BRL', flag: '🇧🇷', name: 'Real Brasileño' },
    { code: 'UYU', flag: '🇺🇾', name: 'Peso Uruguayo' },
    { code: 'BOB', flag: '🇧🇴', name: 'Boliviano' },
    { code: 'GTQ', flag: '🇬🇹', name: 'Quetzal' },
    { code: 'DOP', flag: '🇩🇴', name: 'Peso Dominicano' },
    { code: 'CRC', flag: '🇨🇷', name: 'Colón' },
    { code: 'PAB', flag: '🇵🇦', name: 'Balboa' },
  ],
};

const TEST_PROMOTIONS = [
  {
    name: 'Promoción Día del Padre',
    description: 'Aprovecha esta promoción especial por el día del padre y llévate tu auto nuevo con un descuento especial en tasa.',
    tasa: 10.9,
    plazos: [12, 24, 36, 48, 60],
    enganche: [10, 20, 30],
    comisionApertura: 0.02,
    planId: 'all',
    agencieId: 'all',
    initDate: '2026-06-01T00:00:00.000Z',
    endDate: '2026-06-30T23:59:59.000Z',
  },
  {
    name: 'Promoción Smart Sin Comisión',
    description: 'Especial para clientes Smart Credit: 0% comisión por apertura durante marzo.',
    tasa: 14.9,
    plazos: [24, 36, 48],
    enganche: [20, 30, 40, 50],
    comisionApertura: 0,
    planId: 'smart_credit',
    agencieId: 'all',
    initDate: '2026-03-01T00:00:00.000Z',
    endDate: '2026-03-31T23:59:59.000Z',
  },
];

const TEST_CLIENTS = [
  { name: 'Juan Pérez López',    email: 'juan.perez@email.com',    phone: '5512345678', rfc: 'PELJ900101ABC', gender: 'male' },
  { name: 'María García Ruiz',   email: 'maria.garcia@email.com',  phone: '5587654321', rfc: 'GARM850515XYZ', gender: 'female' },
  { name: 'Carlos Hernández',    email: 'carlos.hdz@email.com',    phone: '5511223344', rfc: '',               gender: 'male' },
  { name: 'Ana Torres Méndez',   email: 'ana.torres@email.com',    phone: '5544556677', rfc: 'TOMA920830DEF', gender: 'female' },
];

// ═══════════════════════════════════════════
//  SEED FUNCTIONS
// ═══════════════════════════════════════════

async function createAuthAndProfile(userData) {
  const { email, password, role, name, storeId } = userData;
  try {
    // Try creating the user
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;
    console.log(`  ✅ Auth created: ${email} → ${uid}`);

    // Create Firestore profile
    await setDoc(doc(db, 'users', uid), {
      name,
      email,
      role,
      storeId,
      phone: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log(`  ✅ Profile created: /users/${uid}`);
    return uid;
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      console.log(`  ⚠️  Auth already exists: ${email} — signing in to get UID...`);
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const uid = cred.user.uid;
        // Update profile just in case
        await setDoc(doc(db, 'users', uid), {
          name, email, role, storeId, phone: '',
          updatedAt: new Date().toISOString(),
        }, { merge: true });
        console.log(`  ✅ Profile updated: /users/${uid}`);
        return uid;
      } catch (signInErr) {
        console.error(`  ❌ Could not sign in ${email}:`, signInErr.message);
        return null;
      }
    }
    console.error(`  ❌ Error creating ${email}:`, err.message);
    return null;
  }
}

async function seedStores() {
  console.log('\n📦 Seeding Stores...');
  for (const store of TEST_STORES) {
    const { id, ...data } = store;
    await setDoc(doc(db, 'stores', id), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log(`  ✅ Store: ${store.name} → /stores/${id}`);
  }
}

async function seedAgencies() {
  console.log('\n🏢 Seeding Agencies...');
  for (const agency of TEST_AGENCIES) {
    const ref = await addDoc(collection(db, 'agencies'), {
      ...agency,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log(`  ✅ Agency: ${agency.name} → /agencies/${ref.id}`);
  }
}

async function seedSettings() {
  console.log('\n⚙️  Seeding Settings...');
  await setDoc(doc(db, 'settings', 'global'), {
    ...SETTINGS_GLOBAL,
    updatedAt: new Date().toISOString(),
  });
  console.log('  ✅ Settings: /settings/global');
}

async function seedPromotions() {
  console.log('\n🏷️  Seeding Promotions...');
  for (const promo of TEST_PROMOTIONS) {
    const ref = await addDoc(collection(db, 'promotions'), {
      ...promo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log(`  ✅ Promotion: ${promo.name} → /promotions/${ref.id}`);
  }
}

async function seedClients() {
  console.log('\n👤 Seeding Clients...');
  for (const client of TEST_CLIENTS) {
    const ref = await addDoc(collection(db, 'clients'), {
      ...client,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log(`  ✅ Client: ${client.name} → /clients/${ref.id}`);
  }
}

// ═══════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════

async function main() {
  console.log('🚀 Car Marketing Quoter — Firebase Seed Script');
  console.log('═'.repeat(50));
  console.log(`Project: ${firebaseConfig.projectId}`);
  console.log('');

  // Already seeded — uncomment to re-run:
  // await seedStores();
  // await seedAgencies();
  // await seedSettings();
  // await seedPromotions();
  // await seedClients();

  // Only users remaining
  console.log('\n👥 Seeding Users (Auth + Firestore)...');
  for (const user of TEST_USERS) {
    await createAuthAndProfile(user);
  }

  console.log('\n' + '═'.repeat(50));
  console.log('✅ Seed complete!');
  console.log('');
  console.log('Test credentials:');
  console.log('  Admin:    admin@carmarketing.mx    / admin123');
  console.log('  Gerente:  gerente@carmarketing.mx  / gerente123');
  console.log('  Vendedor: vendedor@carmarketing.mx / vendedor123');
  console.log('');

  process.exit(0);
}

main().catch((err) => {
  console.error('\n❌ Seed failed:', err);
  process.exit(1);
});
