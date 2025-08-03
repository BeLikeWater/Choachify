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
import { Appointment } from '../types';

const COLLECTION_NAME = 'appointments';

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

export class AppointmentService {
  // Randevu ekleme
  static async addAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    try {
      console.log('Adding appointment to Firebase...', appointmentData.title);
      
      const now = new Date().toISOString().split('T')[0];
      const appointmentWithTimestamp = {
        ...appointmentData,
        createdAt: now,
        updatedAt: now,
      };

      // Undefined değerleri temizle
      const cleanedData = cleanUndefinedValues(appointmentWithTimestamp);
      console.log('Cleaned appointment data keys:', Object.keys(cleanedData));

      console.log('Attempting to add document to collection:', COLLECTION_NAME);
      
      // Timeout ekle (10 saniye)
      const addPromise = addDoc(collection(db, COLLECTION_NAME), cleanedData);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Randevu ekleme işlemi 10 saniye içinde tamamlanamadı')), 10000)
      );
      
      console.log('⏳ Firebase randevu yazma işlemi başlatıldı...');
      const docRef = await Promise.race([addPromise, timeoutPromise]) as any;
      console.log('✅ Appointment document written with ID: ', docRef.id);
      
      const newAppointment: Appointment = {
        id: docRef.id,
        ...cleanedData,
      };

      return newAppointment;
    } catch (error) {
      console.error('❌ Randevu eklenirken hata oluştu:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      throw error;
    }
  }

  // Tüm randevuları getirme
  static async getAllAppointments(): Promise<Appointment[]> {
    try {
      console.log('Fetching appointments from Firebase...');
      // Tek bir alanda sıralama yap, composite index gerekmez
      const q = query(collection(db, COLLECTION_NAME), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      console.log('Appointment query snapshot size:', querySnapshot.size);
      
      const appointments: Appointment[] = [];
      querySnapshot.forEach((doc) => {
        appointments.push({
          id: doc.id,
          ...doc.data(),
        } as Appointment);
      });

      // Client tarafında tarih ve saate göre sırala
      appointments.sort((a, b) => {
        const dateTimeA = new Date(`${a.date}T${a.time}`);
        const dateTimeB = new Date(`${b.date}T${b.time}`);
        return dateTimeB.getTime() - dateTimeA.getTime(); // En yeni önce
      });

      console.log('Fetched appointments count:', appointments.length);
      return appointments;
    } catch (error) {
      console.error('Randevular getirilirken hata oluştu:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  }

  // Belirli hasta için randevuları getirme
  static async getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
    try {
      console.log('Fetching appointments for patient:', patientId);
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('patientId', '==', patientId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const appointments: Appointment[] = [];
      querySnapshot.forEach((doc) => {
        appointments.push({
          id: doc.id,
          ...doc.data(),
        } as Appointment);
      });

      // Client tarafında tarih ve saate göre sırala
      appointments.sort((a, b) => {
        const dateTimeA = new Date(`${a.date}T${a.time}`);
        const dateTimeB = new Date(`${b.date}T${b.time}`);
        return dateTimeB.getTime() - dateTimeA.getTime(); // En yeni önce
      });

      console.log(`Found ${appointments.length} appointments for patient ${patientId}`);
      return appointments;
    } catch (error) {
      console.error('Hasta randevuları getirilirken hata oluştu:', error);
      throw error;
    }
  }

  // Randevu güncelleme
  static async updateAppointment(appointmentId: string, appointmentData: Partial<Omit<Appointment, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const appointmentRef = doc(db, COLLECTION_NAME, appointmentId);
      const updatedData = {
        ...appointmentData,
        updatedAt: new Date().toISOString().split('T')[0],
      };

      // Undefined değerleri temizle
      const cleanedData = cleanUndefinedValues(updatedData);
      await updateDoc(appointmentRef, cleanedData);
      console.log('✅ Appointment updated successfully');
    } catch (error) {
      console.error('Randevu güncellenirken hata oluştu:', error);
      throw error;
    }
  }

  // Randevu silme
  static async deleteAppointment(appointmentId: string): Promise<void> {
    try {
      const appointmentRef = doc(db, COLLECTION_NAME, appointmentId);
      await deleteDoc(appointmentRef);
      console.log('✅ Appointment deleted successfully');
    } catch (error) {
      console.error('Randevu silinirken hata oluştu:', error);
      throw error;
    }
  }

  // Bugünkü randevuları getirme
  static async getTodayAppointments(): Promise<Appointment[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      console.log('Fetching today appointments for date:', today);
      
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('date', '==', today)
      );
      const querySnapshot = await getDocs(q);
      
      const appointments: Appointment[] = [];
      querySnapshot.forEach((doc) => {
        appointments.push({
          id: doc.id,
          ...doc.data(),
        } as Appointment);
      });

      // Client tarafında saate göre sırala (sabahtan akşama)
      appointments.sort((a, b) => {
        const timeA = a.time;
        const timeB = b.time;
        return timeA.localeCompare(timeB);
      });

      console.log(`Found ${appointments.length} appointments for today`);
      return appointments;
    } catch (error) {
      console.error('Bugünkü randevular getirilirken hata oluştu:', error);
      throw error;
    }
  }
}