import { 
  collection, 
  getDocs, 
  doc,
  updateDoc,
  query,
  where
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Mevcut diyet planlarına email alanı ekle
export const fixDietPlansEmail = async () => {
  try {
    console.log('🔄 Fixing diet plans email fields...');
    
    // Tüm diyet planlarını getir
    const dietPlansRef = collection(db, 'dietPlans');
    const dietPlansSnapshot = await getDocs(dietPlansRef);
    
    console.log(`Found ${dietPlansSnapshot.size} diet plans to check`);
    
    // Patients collection'ı da al (email eşleştirmesi için)
    const patientsRef = collection(db, 'patients');
    const patientsSnapshot = await getDocs(patientsRef);
    
    // Patient ID -> Email mapping oluştur
    const patientEmailMap: { [key: string]: string } = {};
    patientsSnapshot.forEach((patientDoc) => {
      const patientData = patientDoc.data();
      patientEmailMap[patientDoc.id] = patientData.email;
    });
    
    console.log('Patient email mapping:', patientEmailMap);
    
    let updatedCount = 0;
    let alreadyHasEmailCount = 0;
    
    for (const dietPlanDoc of dietPlansSnapshot.docs) {
      const dietPlanData = dietPlanDoc.data();
      
      // Eğer zaten email varsa skip et
      if (dietPlanData.patientEmail) {
        alreadyHasEmailCount++;
        console.log(`✅ Diet plan ${dietPlanDoc.id} already has email: ${dietPlanData.patientEmail}`);
        continue;
      }
      
      // Patient ID'si varsa email'i bul ve ekle
      if (dietPlanData.patientId && patientEmailMap[dietPlanData.patientId]) {
        const email = patientEmailMap[dietPlanData.patientId];
        
        console.log(`📧 Updating diet plan ${dietPlanDoc.id} with email: ${email}`);
        
        await updateDoc(doc(db, 'dietPlans', dietPlanDoc.id), {
          patientEmail: email
        });
        
        updatedCount++;
      } else {
        console.warn(`⚠️  Diet plan ${dietPlanDoc.id} has no matching patient or missing patientId`);
        console.warn(`    patientId: ${dietPlanData.patientId}`);
        console.warn(`    patientName: ${dietPlanData.patientName}`);
      }
    }
    
    console.log(`✅ Email fix completed!`);
    console.log(`   - Updated: ${updatedCount} diet plans`);
    console.log(`   - Already had email: ${alreadyHasEmailCount} diet plans`);
    console.log(`   - Total processed: ${dietPlansSnapshot.size} diet plans`);
    
    return {
      totalProcessed: dietPlansSnapshot.size,
      updated: updatedCount,
      alreadyHadEmail: alreadyHasEmailCount
    };
    
  } catch (error) {
    console.error('❌ Error fixing diet plans email:', error);
    throw error;
  }
};

// Debug: Belirli email için diyet planlarını listele
export const debugDietPlansForEmail = async (email: string) => {
  try {
    console.log(`🔍 Debugging diet plans for email: ${email}`);
    
    // Email ile diyet planlarını ara
    const dietPlansRef = collection(db, 'dietPlans');
    const emailQuery = query(dietPlansRef, where('patientEmail', '==', email));
    const emailSnapshot = await getDocs(emailQuery);
    
    console.log(`Found ${emailSnapshot.size} diet plans with patientEmail = ${email}`);
    
    emailSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`📋 Diet Plan ${doc.id}:`, {
        title: data.title,
        date: data.date,
        patientName: data.patientName,
        patientEmail: data.patientEmail,
        patientId: data.patientId
      });
    });
    
    // Ayrıca tüm diyet planlarını da listele
    console.log('🔍 All diet plans in database:');
    const allSnapshot = await getDocs(dietPlansRef);
    allSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`📋 All Diet Plan ${doc.id}:`, {
        title: data.title,
        date: data.date,
        patientName: data.patientName,
        patientEmail: data.patientEmail || '❌ NO EMAIL',
        patientId: data.patientId
      });
    });
    
  } catch (error) {
    console.error('❌ Error debugging diet plans:', error);
    throw error;
  }
};