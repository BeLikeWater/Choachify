import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, initializeFirestore } from 'firebase/firestore';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyB108o4JyD9-yxQAPzBWd1osGyfRMRisWs",
  authDomain: "medora-traking.firebaseapp.com",
  projectId: "medora-traking",
  storageBucket: "medora-traking.firebasestorage.app",
  messagingSenderId: "574014690091",
  appId: "1:574014690091:web:1f4dd146bdc1e206856b6e",
  measurementId: "G-8SZW63JT8C"
};

// Prevent multiple app initialization
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Firestore'u offline persistence olmadan başlat (sorun giderme için)
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true, // WebChannel sorunları için long polling kullan
  localCache: {
    kind: 'memory', // Memory cache kullan, persistent cache değil
  },
});

// Auth'u React Native persistence ile başlat
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Test bağlantısı için
console.log('Firebase initialized with project:', firebaseConfig.projectId);
console.log('Firestore initialized with long polling enabled');
console.log('Auth initialized with AsyncStorage persistence');

export default app;