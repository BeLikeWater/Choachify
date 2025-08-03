import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User, LoginData, RegisterData } from '../types';

const USERS_COLLECTION = 'users';

// Firebase User'ı custom User tipimize dönüştür
const firebaseUserToUser = async (firebaseUser: FirebaseUser): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, firebaseUser.uid));
    if (userDoc.exists()) {
      return {
        id: firebaseUser.uid,
        ...userDoc.data()
      } as User;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

export class AuthService {
  // Login işlemi
  static async login(loginData: LoginData): Promise<User> {
    try {
      console.log('Login attempt for:', loginData.email);
      const userCredential = await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
      
      const user = await firebaseUserToUser(userCredential.user);
      if (!user) {
        throw new Error('Kullanıcı bilgileri alınamadı');
      }
      
      console.log('Login successful for user:', user.firstName, user.lastName, 'Type:', user.userType);
      return user;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // Register işlemi
  static async register(registerData: RegisterData): Promise<User> {
    try {
      console.log('Register attempt for:', registerData.email, 'Type:', registerData.userType);
      
      // Email ile kullanıcı oluştur
      const userCredential = await createUserWithEmailAndPassword(auth, registerData.email, registerData.password);
      
      // Kullanıcı verilerini Firestore'a kaydet
      const now = new Date().toISOString().split('T')[0];
      const userData: Omit<User, 'id'> = {
        email: registerData.email,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        userType: registerData.userType,
        createdAt: now,
        updatedAt: now,
        ...(registerData.specialization && { specialization: registerData.specialization }),
        ...(registerData.licenseNumber && { licenseNumber: registerData.licenseNumber }),
        ...(registerData.doctorId && { doctorId: registerData.doctorId })
      };

      await setDoc(doc(db, USERS_COLLECTION, userCredential.user.uid), userData);
      
      const user: User = {
        id: userCredential.user.uid,
        ...userData
      };
      
      console.log('Register successful for user:', user.firstName, user.lastName, 'Type:', user.userType);
      return user;
    } catch (error: any) {
      console.error('Register error:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // Logout işlemi
  static async logout(): Promise<void> {
    try {
      await signOut(auth);
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Çıkış yapılırken bir hata oluştu');
    }
  }

  // Auth state değişikliklerini dinle
  static onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user = await firebaseUserToUser(firebaseUser);
        callback(user);
      } else {
        callback(null);
      }
    });
  }

  // Mevcut kullanıcıyı al
  static async getCurrentUser(): Promise<User | null> {
    try {
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        return await firebaseUserToUser(firebaseUser);
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Doktorları listele (hasta kayıt için)
  static async getDoctors(): Promise<User[]> {
    try {
      const q = query(collection(db, USERS_COLLECTION), where('userType', '==', 'doktor'));
      const querySnapshot = await getDocs(q);
      
      const doctors: User[] = [];
      querySnapshot.forEach((doc) => {
        doctors.push({
          id: doc.id,
          ...doc.data()
        } as User);
      });

      return doctors;
    } catch (error) {
      console.error('Error fetching doctors:', error);
      throw new Error('Doktor listesi alınırken hata oluştu');
    }
  }

  // Auth hata mesajlarını Türkçe'ye çevir
  private static getAuthErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'Bu email adresi ile kayıtlı kullanıcı bulunamadı';
      case 'auth/wrong-password':
        return 'Hatalı şifre';
      case 'auth/email-already-in-use':
        return 'Bu email adresi zaten kullanımda';
      case 'auth/weak-password':
        return 'Şifre çok zayıf. En az 6 karakter olmalıdır';
      case 'auth/invalid-email':
        return 'Geçersiz email adresi';
      case 'auth/too-many-requests':
        return 'Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin';
      case 'auth/network-request-failed':
        return 'İnternet bağlantısı hatası';
      default:
        return 'Bilinmeyen bir hata oluştu';
    }
  }
}