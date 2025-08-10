import { 
  collection, 
  getDocs, 
  doc,
  updateDoc,
  query,
  where
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Mevcut hastalara doctorId alanı ekle
export const fixPatientsDoctor = async (doctorId: string, doctorEmail: string) => {
  try {
    console.log('🔧 Fixing patients doctor assignment...');
    console.log('Doctor info:', { doctorId, doctorEmail });
    
    // Tüm hastaları getir
    const patientsRef = collection(db, 'patients');
    const patientsSnapshot = await getDocs(patientsRef);
    
    console.log(`Found ${patientsSnapshot.size} total patients`);
    
    let updatedCount = 0;
    let alreadyAssignedCount = 0;
    let noMatchCount = 0;
    
    for (const patientDoc of patientsSnapshot.docs) {
      const patientData = patientDoc.data();
      
      console.log(`📋 Patient: ${patientData.firstName} ${patientData.lastName}`, {
        email: patientData.email,
        currentDoctorId: patientData.doctorId || '❌ NONE'
      });
      
      // Eğer zaten doctorId varsa skip et
      if (patientData.doctorId) {
        alreadyAssignedCount++;
        console.log(`✅ Patient already has doctorId: ${patientData.doctorId}`);
        continue;
      }
      
      // Manuel atama - bu doktora ait olması gerekiyorsa
      console.log(`🔧 Updating patient ${patientDoc.id} with doctorId: ${doctorId}`);
      
      await updateDoc(doc(db, 'patients', patientDoc.id), {
        doctorId: doctorId
      });
      
      updatedCount++;
    }
    
    console.log(`✅ Patient doctor assignment completed!`);
    console.log(`   - Updated: ${updatedCount} patients`);
    console.log(`   - Already assigned: ${alreadyAssignedCount} patients`);
    console.log(`   - Total processed: ${patientsSnapshot.size} patients`);
    
    return {
      totalProcessed: patientsSnapshot.size,
      updated: updatedCount,
      alreadyAssigned: alreadyAssignedCount
    };
    
  } catch (error) {
    console.error('❌ Error fixing patients doctor assignment:', error);
    throw error;
  }
};

// Debug: Belirli doktor için hastaları listele
export const debugPatientsForDoctor = async (doctorId: string) => {
  try {
    console.log(`🔍 Debugging patients for doctor: ${doctorId}`);
    
    // Tüm hastaları getir ve kontrol et
    const patientsRef = collection(db, 'patients');
    const allSnapshot = await getDocs(patientsRef);
    
    console.log(`Found ${allSnapshot.size} total patients in database`);
    
    const matchingPatients: any[] = [];
    const otherPatients: any[] = [];
    
    allSnapshot.forEach((doc) => {
      const data = doc.data();
      const patient = {
        id: doc.id,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        doctorId: data.doctorId || '❌ NO DOCTOR'
      };
      
      if (data.doctorId === doctorId) {
        matchingPatients.push(patient);
      } else {
        otherPatients.push(patient);
      }
    });
    
    console.log(`👥 Patients assigned to doctor ${doctorId}:`, matchingPatients);
    console.log(`👥 Other patients:`, otherPatients);
    
    return { matchingPatients, otherPatients };
    
  } catch (error) {
    console.error('❌ Error debugging patients:', error);
    throw error;
  }
};