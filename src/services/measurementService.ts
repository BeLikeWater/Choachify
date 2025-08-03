import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Measurement } from '../types';

const COLLECTION_NAME = 'measurements';

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

export class MeasurementService {
  // Ölçüm ekleme
  static async addMeasurement(measurementData: Omit<Measurement, 'id' | 'createdAt' | 'updatedAt' | 'bmi'>): Promise<Measurement> {
    try {
      console.log('Adding measurement to Firebase...', measurementData.patientName);
      
      const now = new Date().toISOString().split('T')[0];
      
      // BMI hesaplama için hastanın boy bilgisini almak gerekiyor
      // Şimdilik sadece kilo kaydedelim, BMI'yi hasta profiliyle birlikte hesaplayabiliriz
      const measurementWithTimestamp = {
        ...measurementData,
        createdAt: now,
        updatedAt: now,
      };

      // Undefined değerleri temizle
      const cleanedData = cleanUndefinedValues(measurementWithTimestamp);
      console.log('Cleaned measurement data keys:', Object.keys(cleanedData));

      console.log('Attempting to add document to collection:', COLLECTION_NAME);
      
      // Timeout ekle (10 saniye)
      const addPromise = addDoc(collection(db, COLLECTION_NAME), cleanedData);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Ölçüm ekleme işlemi 10 saniye içinde tamamlanamadı')), 10000)
      );
      
      console.log('⏳ Firebase ölçüm yazma işlemi başlatıldı...');
      const docRef = await Promise.race([addPromise, timeoutPromise]) as any;
      console.log('✅ Measurement document written with ID: ', docRef.id);
      
      const newMeasurement: Measurement = {
        id: docRef.id,
        ...cleanedData,
      };

      return newMeasurement;
    } catch (error) {
      console.error('❌ Ölçüm eklenirken hata oluştu:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      throw error;
    }
  }

  // Tüm ölçümleri getirme
  static async getAllMeasurements(): Promise<Measurement[]> {
    try {
      console.log('Fetching measurements from Firebase...');
      const q = query(collection(db, COLLECTION_NAME), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      console.log('Measurement query snapshot size:', querySnapshot.size);
      
      const measurements: Measurement[] = [];
      querySnapshot.forEach((doc) => {
        measurements.push({
          id: doc.id,
          ...doc.data(),
        } as Measurement);
      });

      // Client tarafında tarih ve saate göre sırala
      measurements.sort((a, b) => {
        const dateTimeA = new Date(`${a.date}T${a.time}`);
        const dateTimeB = new Date(`${b.date}T${b.time}`);
        return dateTimeB.getTime() - dateTimeA.getTime(); // En yeni önce
      });

      console.log('Fetched measurements count:', measurements.length);
      return measurements;
    } catch (error) {
      console.error('Ölçümler getirilirken hata oluştu:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  }

  // Belirli hasta için ölçümleri getirme
  static async getMeasurementsByPatient(patientId: string): Promise<Measurement[]> {
    try {
      console.log('Fetching measurements for patient:', patientId);
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('patientId', '==', patientId)
      );
      const querySnapshot = await getDocs(q);
      
      const measurements: Measurement[] = [];
      querySnapshot.forEach((doc) => {
        measurements.push({
          id: doc.id,
          ...doc.data(),
        } as Measurement);
      });

      // Client tarafında tarih ve saate göre sırala
      measurements.sort((a, b) => {
        const dateTimeA = new Date(`${a.date}T${a.time}`);
        const dateTimeB = new Date(`${b.date}T${b.time}`);
        return dateTimeB.getTime() - dateTimeA.getTime(); // En yeni önce
      });

      console.log(`Found ${measurements.length} measurements for patient ${patientId}`);
      return measurements;
    } catch (error) {
      console.error('Hasta ölçümleri getirilirken hata oluştu:', error);
      throw error;
    }
  }

  // Ölçüm güncelleme
  static async updateMeasurement(measurementId: string, measurementData: Partial<Omit<Measurement, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const measurementRef = doc(db, COLLECTION_NAME, measurementId);
      const updatedData = {
        ...measurementData,
        updatedAt: new Date().toISOString().split('T')[0],
      };

      // Undefined değerleri temizle
      const cleanedData = cleanUndefinedValues(updatedData);
      await updateDoc(measurementRef, cleanedData);
      console.log('✅ Measurement updated successfully');
    } catch (error) {
      console.error('Ölçüm güncellenirken hata oluştu:', error);
      throw error;
    }
  }

  // Ölçüm silme
  static async deleteMeasurement(measurementId: string): Promise<void> {
    try {
      const measurementRef = doc(db, COLLECTION_NAME, measurementId);
      await deleteDoc(measurementRef);
      console.log('✅ Measurement deleted successfully');
    } catch (error) {
      console.error('Ölçüm silinirken hata oluştu:', error);
      throw error;
    }
  }

  // Belirli tarih aralığında ölçümleri getirme
  static async getMeasurementsByDateRange(patientId: string, startDate: string, endDate: string): Promise<Measurement[]> {
    try {
      console.log(`Fetching measurements for patient ${patientId} between ${startDate} and ${endDate}`);
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('patientId', '==', patientId)
      );
      const querySnapshot = await getDocs(q);
      
      const measurements: Measurement[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Measurement;
        // Client tarafında tarih filtreleme
        if (data.date >= startDate && data.date <= endDate) {
          measurements.push({
            id: doc.id,
            ...data,
          });
        }
      });

      // Client tarafında tarih ve saate göre sırala
      measurements.sort((a, b) => {
        const dateTimeA = new Date(`${a.date}T${a.time}`);
        const dateTimeB = new Date(`${b.date}T${b.time}`);
        return dateTimeA.getTime() - dateTimeB.getTime(); // Eskiden yeniye
      });

      console.log(`Found ${measurements.length} measurements in date range`);
      return measurements;
    } catch (error) {
      console.error('Tarih aralığındaki ölçümler getirilirken hata oluştu:', error);
      throw error;
    }
  }

  // Son N gün ölçümlerini getirme (grafik için)
  static async getRecentMeasurements(patientId: string, days: number = 30): Promise<Measurement[]> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);
      
      const startDateString = startDate.toISOString().split('T')[0];
      const endDateString = endDate.toISOString().split('T')[0];
      
      return this.getMeasurementsByDateRange(patientId, startDateString, endDateString);
    } catch (error) {
      console.error('Son ölçümler getirilirken hata oluştu:', error);
      throw error;
    }
  }

  // BMI hesaplama (hasta bilgisiyle birlikte)
  static calculateBMI(weight: number, height: number): number {
    if (height <= 0 || weight <= 0) return 0;
    const heightInMeters = height / 100; // cm to m
    return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
  }
}