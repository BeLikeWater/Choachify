import { PatientService } from '../services/patientService';
import { mockPatients } from '../data/mockData';

export const uploadMockDataToFirebase = async (): Promise<void> => {
  try {
    console.log('Mock veriler Firebase\'e yükleniyor...');
    
    // Mock verileri Firebase formatına dönüştür (id, createdAt, updatedAt kaldır)
    const patientsToUpload = mockPatients.map(patient => {
      const { id, createdAt, updatedAt, ...patientData } = patient;
      return patientData;
    });
    
    await PatientService.uploadMockData(patientsToUpload);
    console.log('✅ Mock veriler başarıyla Firebase\'e yüklendi!');
  } catch (error) {
    console.error('❌ Mock veriler yüklenirken hata oluştu:', error);
  }
};