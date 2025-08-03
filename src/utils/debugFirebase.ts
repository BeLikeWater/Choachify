import { db } from '../config/firebase';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';

export const debugFirebaseOperations = async () => {
  console.log('🔧 Firebase debug işlemleri başlatılıyor...');
  
  try {
    // 1. Basit doküman oluştur
    console.log('1️⃣ Basit doküman oluşturuluyor...');
    const testDocRef = doc(db, 'debug', 'test1');
    
    const startTime = Date.now();
    await setDoc(testDocRef, { 
      test: true, 
      timestamp: Date.now(),
      device: 'iOS'
    });
    const writeTime = Date.now() - startTime;
    console.log(`✅ Yazma işlemi ${writeTime}ms'de tamamlandı`);
    
    // 2. Dokümanı oku
    console.log('2️⃣ Doküman okunuyor...');
    const readStartTime = Date.now();
    const docSnap = await getDoc(testDocRef);
    const readTime = Date.now() - readStartTime;
    
    if (docSnap.exists()) {
      console.log(`✅ Okuma işlemi ${readTime}ms'de tamamlandı:`, docSnap.data());
    } else {
      console.log('❌ Doküman bulunamadı');
    }
    
    // 3. Dokümanı sil
    console.log('3️⃣ Doküman siliniyor...');
    await deleteDoc(testDocRef);
    console.log('✅ Silme işlemi tamamlandı');
    
    return true;
    
  } catch (error) {
    console.error('❌ Firebase debug işleminde hata:', error);
    console.error('Hata kodu:', error.code);
    console.error('Hata mesajı:', error.message);
    
    // Detaylı hata analizi
    if (error.code === 'permission-denied') {
      console.error('🚫 SORUN: Firestore Security Rules izin vermiyor');
      console.error('💡 ÇÖZÜM: Firebase Console > Firestore > Rules > Test mode kullanın');
    } else if (error.code === 'unavailable') {
      console.error('📡 SORUN: Firebase servisi erişilemez');
      console.error('💡 ÇÖZÜM: İnternet bağlantısını ve Firebase proje durumunu kontrol edin');
    } else if (error.message?.includes('timeout') || error.message?.includes('zaman aşımı')) {
      console.error('⏰ SORUN: İşlem zaman aşımına uğradı');
      console.error('💡 ÇÖZÜM: Ağ bağlantısı yavaş veya Firebase rules sorunu olabilir');
    }
    
    return false;
  }
};