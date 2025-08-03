import { db } from '../config/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export const simpleFirebaseTest = async (): Promise<boolean> => {
  try {
    console.log('🔄 Basit Firebase testi başlatılıyor...');
    
    const testDoc = doc(db, 'test', 'simple-test');
    const testData = {
      message: 'Hello Firebase',
      timestamp: serverTimestamp(),
      device: 'iOS Simulator'
    };
    
    await setDoc(testDoc, testData);
    console.log('✅ Basit test başarılı!');
    return true;
    
  } catch (error) {
    console.error('❌ Basit test başarısız:', error);
    
    // Firebase proje durumunu kontrol et
    if (error.code === 'permission-denied') {
      console.error('🚫 Firestore Security Rules izin vermiyor');
      console.error('Firebase Console\'da Firestore Rules\'ı kontrol edin');
    } else if (error.code === 'unavailable') {
      console.error('📡 Firebase servisi erişilemez durumda');
      console.error('İnternet bağlantınızı ve Firebase proje durumunu kontrol edin');
    } else {
      console.error('❓ Bilinmeyen Firebase hatası:', error.code, error.message);
    }
    
    return false;
  }
};