import { db } from '../config/firebase';
import { doc, setDoc, getDoc, enableNetwork, disableNetwork } from 'firebase/firestore';

export const testFirebaseConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing Firebase connection...');
    
    // Ağ bağlantısını etkinleştir
    try {
      await enableNetwork(db);
      console.log('Network enabled successfully');
    } catch (networkError) {
      console.log('Network already enabled or error:', networkError);
    }
    
    // Basit test belgesi oluştur
    const testDocRef = doc(db, 'test', 'connection-test');
    const testData = {
      timestamp: Date.now(),
      message: 'Firebase connection test',
      platform: 'react-native'
    };
    
    console.log('Attempting to write test document...');
    await setDoc(testDocRef, testData, { merge: true });
    console.log('✅ Test document created successfully');
    
    // Test belgesini oku
    console.log('Attempting to read test document...');
    const docSnap = await getDoc(testDocRef);
    if (docSnap.exists()) {
      console.log('✅ Test document read successfully:', docSnap.data());
      return true;
    } else {
      console.log('❌ Test document does not exist after creation');
      return false;
    }
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    return false;
  }
};