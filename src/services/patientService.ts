import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Patient } from '../types';

const COLLECTION_NAME = 'patients';

// Undefined değerleri temizle
const cleanUndefinedValues = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return null;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefinedValues);
  }
  
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanUndefinedValues(value);
      }
    }
    return cleaned;
  }
  
  return obj;
};

export class PatientService {
  // Hasta ekleme
  static async addPatient(patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    try {
      console.log('Adding patient to Firebase...', patientData.firstName, patientData.lastName);
      
      const now = new Date().toISOString().split('T')[0];
      const patientWithTimestamp = {
        ...patientData,
        createdAt: now,
        updatedAt: now,
      };

      // Undefined değerleri temizle
      const cleanedData = cleanUndefinedValues(patientWithTimestamp);
      console.log('Cleaned patient data keys:', Object.keys(cleanedData));

      console.log('Attempting to add document to collection:', COLLECTION_NAME);
      
      // Timeout ekle (10 saniye)
      const addPromise = addDoc(collection(db, COLLECTION_NAME), cleanedData);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Firebase yazma işlemi 10 saniye içinde tamamlanamadı')), 10000)
      );
      
      console.log('⏳ Firebase yazma işlemi başlatıldı...');
      const docRef = await Promise.race([addPromise, timeoutPromise]) as any;
      console.log('✅ Document written with ID: ', docRef.id);
      
      const newPatient: Patient = {
        id: docRef.id,
        ...cleanedData,
      };

      return newPatient;
    } catch (error) {
      console.error('❌ Hasta eklenirken hata oluştu:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      throw error;
    }
  }

  // Tüm hastaları getirme
  static async getAllPatients(): Promise<Patient[]> {
    try {
      console.log('Fetching patients from Firebase...');
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      console.log('Query snapshot size:', querySnapshot.size);
      
      const patients: Patient[] = [];
      querySnapshot.forEach((doc) => {
        patients.push({
          id: doc.id,
          ...doc.data(),
        } as Patient);
      });

      console.log('Fetched patients count:', patients.length);
      return patients;
    } catch (error) {
      console.error('Hastalar getirilirken hata oluştu:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  }

  // Hasta güncelleme
  static async updatePatient(patientId: string, patientData: Partial<Omit<Patient, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const patientRef = doc(db, COLLECTION_NAME, patientId);
      const updatedData = {
        ...patientData,
        updatedAt: new Date().toISOString().split('T')[0],
      };

      // Undefined değerleri temizle
      const cleanedData = cleanUndefinedValues(updatedData);
      await updateDoc(patientRef, cleanedData);
    } catch (error) {
      console.error('Hasta güncellenirken hata oluştu:', error);
      throw error;
    }
  }

  // Hasta silme
  static async deletePatient(patientId: string): Promise<void> {
    try {
      const patientRef = doc(db, COLLECTION_NAME, patientId);
      await deleteDoc(patientRef);
    } catch (error) {
      console.error('Hasta silinirken hata oluştu:', error);
      throw error;
    }
  }

  // Mock verileri Firebase'e yükleme (tek seferlik)
  static async uploadMockData(patients: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<void> {
    try {
      const promises = patients.map(patient => this.addPatient(patient));
      await Promise.all(promises);
      console.log('Mock veriler başarıyla yüklendi!');
    } catch (error) {
      console.error('Mock veriler yüklenirken hata oluştu:', error);
      throw error;
    }
  }
}