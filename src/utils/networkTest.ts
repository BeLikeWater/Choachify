// Basit internet erişim testi
export const testInternetConnection = async (): Promise<boolean> => {
  try {
    console.log('🌐 İnternet bağlantısı test ediliyor...');
    
    // Google DNS'e basit bir HTTP isteği
    const response = await fetch('https://www.google.com', {
      method: 'HEAD',
      timeout: 5000,
    });
    
    if (response.ok) {
      console.log('✅ İnternet bağlantısı başarılı (Google erişilebilir)');
      return true;
    } else {
      console.log('❌ İnternet bağlantısı başarısız - HTTP status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ İnternet bağlantısı test hatası:', error.message);
    return false;
  }
};

// Firebase özel servislerine erişim testi
export const testFirebaseNetworkAccess = async (): Promise<boolean> => {
  try {
    console.log('🔥 Firebase network erişimi test ediliyor...');
    
    // Firebase API'sine basit HEAD isteği
    const firebaseResponse = await fetch('https://firebase.googleapis.com/', {
      method: 'HEAD',
      timeout: 10000,
    });
    
    console.log('Firebase API Response Status:', firebaseResponse.status);
    
    // Firestore API'sine basit HEAD isteği
    const firestoreResponse = await fetch('https://firestore.googleapis.com/', {
      method: 'HEAD', 
      timeout: 10000,
    });
    
    console.log('Firestore API Response Status:', firestoreResponse.status);
    
    if (firebaseResponse.ok || firestoreResponse.ok) {
      console.log('✅ Firebase API\'lerine erişim mümkün');
      return true;
    } else {
      console.log('❌ Firebase API\'lerine erişim başarısız');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Firebase network erişim hatası:', error.message);
    return false;
  }
};