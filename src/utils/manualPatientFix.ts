import { 
  collection, 
  getDocs, 
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

// MANUEL FİX: Tüm hastaları bu doktora ata
export const assignAllPatientsToDoctor = async (doctorId: string) => {
  try {
    console.log('🚨 MANUEL FİX: Tüm hastaları doktora atıyor...');
    console.log('Doctor ID:', doctorId);
    
    // Tüm hastaları getir
    const patientsRef = collection(db, 'patients');
    const snapshot = await getDocs(patientsRef);
    
    console.log(`Found ${snapshot.size} patients to update`);
    
    const updates: Promise<void>[] = [];
    
    snapshot.forEach((patientDoc) => {
      console.log(`Updating patient ${patientDoc.id} with doctorId: ${doctorId}`);
      const updatePromise = updateDoc(doc(db, 'patients', patientDoc.id), {
        doctorId: doctorId
      });
      updates.push(updatePromise);
    });
    
    await Promise.all(updates);
    
    console.log('✅ MANUEL FİX TAMAMLANDI! Tüm hastalar güncellendi.');
    return snapshot.size;
    
  } catch (error) {
    console.error('❌ Manuel fix hatası:', error);
    throw error;
  }
};