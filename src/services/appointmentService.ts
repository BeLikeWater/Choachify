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
import { Appointment, AppointmentRequest, User } from '../types';

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
  // Hasta tarafından randevu talebi oluşturma
  static async requestAppointment(
    patientUser: User, 
    doctorUser: User, 
    appointmentRequest: AppointmentRequest
  ): Promise<Appointment> {
    try {
      console.log('Creating appointment request...', appointmentRequest.title);
      
      const now = new Date().toISOString().split('T')[0];
      const appointmentData: Omit<Appointment, 'id'> = {
        patientId: patientUser.id,
        patientName: `${patientUser.firstName} ${patientUser.lastName}`,
        patientEmail: patientUser.email,
        doctorId: doctorUser.id,
        doctorName: `Dr. ${doctorUser.firstName} ${doctorUser.lastName}`,
        title: appointmentRequest.title,
        description: appointmentRequest.description,
        date: appointmentRequest.date,
        time: appointmentRequest.time,
        duration: appointmentRequest.duration,
        type: appointmentRequest.type,
        status: 'pending', // Önce beklemede
        createdAt: now,
        updatedAt: now,
      };

      // Undefined değerleri temizle
      const cleanedData = cleanUndefinedValues(appointmentData);
      console.log('Cleaned appointment data keys:', Object.keys(cleanedData));

      const docRef = await addDoc(collection(db, COLLECTION_NAME), cleanedData);
      console.log('✅ Appointment request created with ID: ', docRef.id);
      
      const newAppointment: Appointment = {
        id: docRef.id,
        ...cleanedData,
      };

      return newAppointment;
    } catch (error) {
      console.error('❌ Randevu talebi oluşturulurken hata:', error);
      throw error;
    }
  }

  // Randevu ekleme (eski method)
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
      
      // Sadece patientId ile filtreleme yapalım, orderBy olmadan
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('patientId', '==', patientId)
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

  // Doktorun randevularını getirme
  static async getDoctorAppointments(doctorId: string): Promise<Appointment[]> {
    try {
      console.log('Fetching appointments for doctor:', doctorId);
      
      // Sadece doctorId ile filtreleme yapalım
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('doctorId', '==', doctorId)
      );
      const querySnapshot = await getDocs(q);
      
      const appointments: Appointment[] = [];
      querySnapshot.forEach((doc) => {
        appointments.push({
          id: doc.id,
          ...doc.data(),
        } as Appointment);
      });

      // Client tarafında tarih sıralaması
      appointments.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime(); // En yeni önce
      });

      console.log('Fetched doctor appointments count:', appointments.length);
      return appointments;
    } catch (error) {
      console.error('Doktor randevuları getirilirken hata:', error);
      throw error;
    }
  }

  // Bekleyen randevu taleplerini getirme (doktor için)
  static async getPendingAppointments(doctorId: string): Promise<Appointment[]> {
    try {
      console.log('Fetching pending appointments for doctor:', doctorId);
      
      // İlk önce sadece doctorId ile filtreleme yapalım
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('doctorId', '==', doctorId)
      );
      const querySnapshot = await getDocs(q);
      
      const appointments: Appointment[] = [];
      querySnapshot.forEach((doc) => {
        const appointmentData = doc.data() as Appointment;
        // Client tarafında status filtering yapalım
        if (appointmentData.status === 'pending') {
          appointments.push({
            id: doc.id,
            ...appointmentData,
          });
        }
      });

      // Client tarafında tarih sıralaması
      appointments.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime(); // En yeni önce
      });

      console.log('Fetched pending appointments count:', appointments.length);
      return appointments;
    } catch (error) {
      console.error('Bekleyen randevular getirilirken hata:', error);
      throw error;
    }
  }

  // Randevu onaylama
  static async approveAppointment(appointmentId: string, notes?: string): Promise<void> {
    try {
      console.log('Approving appointment:', appointmentId);
      const appointmentRef = doc(db, COLLECTION_NAME, appointmentId);
      const updatedData = {
        status: 'scheduled',
        notes: notes || '',
        updatedAt: new Date().toISOString().split('T')[0],
      };

      const cleanedData = cleanUndefinedValues(updatedData);
      await updateDoc(appointmentRef, cleanedData);
      console.log('✅ Appointment approved');
    } catch (error) {
      console.error('Randevu onaylanırken hata:', error);
      throw error;
    }
  }

  // Randevu reddetme
  static async rejectAppointment(appointmentId: string, rejectionReason: string): Promise<void> {
    try {
      console.log('Rejecting appointment:', appointmentId);
      const appointmentRef = doc(db, COLLECTION_NAME, appointmentId);
      const updatedData = {
        status: 'rejected',
        rejectionReason,
        updatedAt: new Date().toISOString().split('T')[0],
      };

      const cleanedData = cleanUndefinedValues(updatedData);
      await updateDoc(appointmentRef, cleanedData);
      console.log('✅ Appointment rejected');
    } catch (error) {
      console.error('Randevu reddedilirken hata:', error);
      throw error;
    }
  }

  // Doktorun belirli tarihteki randevularını getirme
  static async getDoctorAppointmentsByDate(doctorId: string, date: string): Promise<Appointment[]> {
    try {
      console.log('Fetching appointments for doctor on date:', doctorId, date);
      
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('doctorId', '==', doctorId),
        where('date', '==', date)
      );
      const querySnapshot = await getDocs(q);
      
      const appointments: Appointment[] = [];
      querySnapshot.forEach((doc) => {
        appointments.push({
          id: doc.id,
          ...doc.data(),
        } as Appointment);
      });

      console.log(`Found ${appointments.length} appointments for doctor on ${date}`);
      return appointments;
    } catch (error) {
      console.error('Doktor günlük randevuları getirilirken hata:', error);
      throw error;
    }
  }

  // Randevu durumunu güncelleme
  static async updateAppointmentStatus(
    appointmentId: string, 
    status: Appointment['status'], 
    notes?: string
  ): Promise<void> {
    try {
      console.log('Updating appointment status:', appointmentId, 'to', status);
      const appointmentRef = doc(db, COLLECTION_NAME, appointmentId);
      const updatedData = {
        status,
        ...(notes && { notes }),
        updatedAt: new Date().toISOString().split('T')[0],
      };

      const cleanedData = cleanUndefinedValues(updatedData);
      await updateDoc(appointmentRef, cleanedData);
      console.log('✅ Appointment status updated');
    } catch (error) {
      console.error('Randevu durumu güncellenirken hata:', error);
      throw error;
    }
  }
}