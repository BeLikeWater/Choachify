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
import { DietPlan } from '../types';

const COLLECTION_NAME = 'dietPlans';

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

export class DietService {
  // Diyet planı ekleme
  static async addDietPlan(dietPlanData: Omit<DietPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<DietPlan> {
    try {
      console.log('Adding diet plan to Firebase...', dietPlanData.title);
      
      const now = new Date().toISOString().split('T')[0];
      const dietPlanWithTimestamp = {
        ...dietPlanData,
        createdAt: now,
        updatedAt: now,
      };

      // Undefined değerleri temizle
      const cleanedData = cleanUndefinedValues(dietPlanWithTimestamp);
      console.log('Cleaned diet plan data keys:', Object.keys(cleanedData));

      console.log('Attempting to add document to collection:', COLLECTION_NAME);
      
      // Timeout ekle (10 saniye)
      const addPromise = addDoc(collection(db, COLLECTION_NAME), cleanedData);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Diyet planı ekleme işlemi 10 saniye içinde tamamlanamadı')), 10000)
      );
      
      console.log('⏳ Firebase diyet planı yazma işlemi başlatıldı...');
      const docRef = await Promise.race([addPromise, timeoutPromise]) as any;
      console.log('✅ Diet plan document written with ID: ', docRef.id);
      
      const newDietPlan: DietPlan = {
        id: docRef.id,
        ...cleanedData,
      };

      return newDietPlan;
    } catch (error) {
      console.error('❌ Diyet planı eklenirken hata oluştu:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      throw error;
    }
  }

  // Tüm diyet planlarını getirme
  static async getAllDietPlans(): Promise<DietPlan[]> {
    try {
      console.log('Fetching diet plans from Firebase...');
      const q = query(collection(db, COLLECTION_NAME), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      console.log('Diet plan query snapshot size:', querySnapshot.size);
      
      const dietPlans: DietPlan[] = [];
      querySnapshot.forEach((doc) => {
        dietPlans.push({
          id: doc.id,
          ...doc.data(),
        } as DietPlan);
      });

      // Client tarafında tarihe göre sırala
      dietPlans.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime(); // En yeni önce
      });

      console.log('Fetched diet plans count:', dietPlans.length);
      return dietPlans;
    } catch (error) {
      console.error('Diyet planları getirilirken hata oluştu:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  }

  // Belirli hasta için diyet planlarını getirme
  static async getDietPlansByPatient(patientId: string): Promise<DietPlan[]> {
    try {
      console.log('Fetching diet plans for patient:', patientId);
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('patientId', '==', patientId)
      );
      const querySnapshot = await getDocs(q);
      
      const dietPlans: DietPlan[] = [];
      querySnapshot.forEach((doc) => {
        dietPlans.push({
          id: doc.id,
          ...doc.data(),
        } as DietPlan);
      });

      // Client tarafında tarihe göre sırala
      dietPlans.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime(); // En yeni önce
      });

      console.log(`Found ${dietPlans.length} diet plans for patient ${patientId}`);
      return dietPlans;
    } catch (error) {
      console.error('Hasta diyet planları getirilirken hata oluştu:', error);
      throw error;
    }
  }

  // Diyet planı güncelleme
  static async updateDietPlan(dietPlanId: string, dietPlanData: Partial<Omit<DietPlan, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const dietPlanRef = doc(db, COLLECTION_NAME, dietPlanId);
      const updatedData = {
        ...dietPlanData,
        updatedAt: new Date().toISOString().split('T')[0],
      };

      // Undefined değerleri temizle
      const cleanedData = cleanUndefinedValues(updatedData);
      await updateDoc(dietPlanRef, cleanedData);
      console.log('✅ Diet plan updated successfully');
    } catch (error) {
      console.error('Diyet planı güncellenirken hata oluştu:', error);
      throw error;
    }
  }

  // Diyet planı silme
  static async deleteDietPlan(dietPlanId: string): Promise<void> {
    try {
      const dietPlanRef = doc(db, COLLECTION_NAME, dietPlanId);
      await deleteDoc(dietPlanRef);
      console.log('✅ Diet plan deleted successfully');
    } catch (error) {
      console.error('Diyet planı silinirken hata oluştu:', error);
      throw error;
    }
  }

  // Belirli tarih için diyet planı getirme
  static async getDietPlanByDate(patientId: string, date: string): Promise<DietPlan | null> {
    try {
      console.log(`Fetching diet plan for patient ${patientId} on date ${date}`);
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('patientId', '==', patientId),
        where('date', '==', date)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log('No diet plan found for the specified date');
        return null;
      }

      const doc = querySnapshot.docs[0];
      const dietPlan: DietPlan = {
        id: doc.id,
        ...doc.data(),
      } as DietPlan;

      console.log(`Found diet plan for date ${date}`);
      return dietPlan;
    } catch (error) {
      console.error('Tarihli diyet planı getirilirken hata oluştu:', error);
      throw error;
    }
  }

  // Belirli tarih aralığında diyet planlarını getirme
  static async getDietPlansByDateRange(patientId: string, startDate: string, endDate: string): Promise<DietPlan[]> {
    try {
      console.log(`Fetching diet plans for patient ${patientId} between ${startDate} and ${endDate}`);
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('patientId', '==', patientId)
      );
      const querySnapshot = await getDocs(q);
      
      const dietPlans: DietPlan[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as DietPlan;
        // Client tarafında tarih filtreleme
        if (data.date >= startDate && data.date <= endDate) {
          dietPlans.push({
            id: doc.id,
            ...data,
          });
        }
      });

      // Client tarafında tarihe göre sırala
      dietPlans.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime(); // Eskiden yeniye
      });

      console.log(`Found ${dietPlans.length} diet plans in date range`);
      return dietPlans;
    } catch (error) {
      console.error('Tarih aralığındaki diyet planları getirilirken hata oluştu:', error);
      throw error;
    }
  }

  // Son N gün diyet planlarını getirme
  static async getRecentDietPlans(patientId: string, days: number = 30): Promise<DietPlan[]> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);
      
      const startDateString = startDate.toISOString().split('T')[0];
      const endDateString = endDate.toISOString().split('T')[0];
      
      return this.getDietPlansByDateRange(patientId, startDateString, endDateString);
    } catch (error) {
      console.error('Son diyet planları getirilirken hata oluştu:', error);
      throw error;
    }
  }

  // Kalori hesaplama yardımcı fonksiyonu (gelecekte geliştirilebilir)
  static estimateCalories(dietPlan: DietPlan): number {
    // Basit kalori tahmini - gelecekte daha detaylandırılabilir
    const mealCount = [
      dietPlan.breakfast,
      dietPlan.snack1,
      dietPlan.lunch,
      dietPlan.snack2,
      dietPlan.dinner,
      dietPlan.nightSnack
    ].filter(meal => meal && meal.items.length > 0).length;
    
    // Ortalama kalori tahmini (çok basit)
    return mealCount * 300; // Her öğün için ~300 kalori
  }
}