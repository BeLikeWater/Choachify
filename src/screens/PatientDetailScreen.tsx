import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Patient } from '../types';
import { PatientService } from '../services/patientService';

interface PatientDetailScreenProps {
  patient: Patient;
  onBack: () => void;
  onPatientUpdated: (updatedPatient: Patient) => void;
}

export const PatientDetailScreen: React.FC<PatientDetailScreenProps> = ({
  patient,
  onBack,
  onPatientUpdated,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  
  const [formData, setFormData] = useState({
    firstName: String(patient.firstName || ''),
    lastName: String(patient.lastName || ''),
    email: String(patient.email || ''),
    phone: String(patient.phone || ''),
    age: patient.age ? String(patient.age) : '',
    gender: patient.gender || 'Erkek',
    address: String(patient.address || ''),
    emergencyContact: String(patient.emergencyContact || ''),
    medicalHistory: String(patient.medicalHistory || ''),
    allergies: String(patient.allergies || ''),
    currentMedications: String(patient.currentMedications || ''),
  });

  // Debug log to see what we're getting from patient data
  console.log('Patient data:', JSON.stringify(patient, null, 2));
  console.log('Initial formData:', JSON.stringify(formData, null, 2));

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!formData.firstName || !formData.firstName.trim() || !formData.lastName || !formData.lastName.trim()) {
      Alert.alert('Hata', 'Ad ve soyad alanları zorunludur.');
      return;
    }

    if (!formData.email || !formData.email.trim() || !formData.phone || !formData.phone.trim()) {
      Alert.alert('Hata', 'E-mail ve telefon alanları zorunludur.');
      return;
    }

    if (!formData.age || !formData.age.trim() || isNaN(parseInt(formData.age))) {
      Alert.alert('Hata', 'Geçerli bir yaş giriniz.');
      return;
    }

    try {
      setLoading(true);
      
      console.log('Form data before save:', JSON.stringify(formData, null, 2));
      
      // Debug each field individually 
      console.log('medicalHistory type:', typeof formData.medicalHistory, 'value:', formData.medicalHistory);
      console.log('allergies type:', typeof formData.allergies, 'value:', formData.allergies);
      console.log('currentMedications type:', typeof formData.currentMedications, 'value:', formData.currentMedications);
      
      // Safely extract and clean data - using String() to ensure string type
      const updateData = {
        firstName: String(formData.firstName || '').trim(),
        lastName: String(formData.lastName || '').trim(),
        email: String(formData.email || '').trim(),
        phone: String(formData.phone || '').trim(),
        age: parseInt(String(formData.age)) || 0,
        gender: formData.gender || 'Erkek',
        address: String(formData.address || '').trim(),
        emergencyContact: String(formData.emergencyContact || '').trim(),
        medicalHistory: String(formData.medicalHistory || '').trim(),
        allergies: String(formData.allergies || '').trim(),
        currentMedications: String(formData.currentMedications || '').trim(),
      };

      console.log('Update data to send:', JSON.stringify(updateData, null, 2));

      await PatientService.updatePatient(patient.id, updateData);
      
      const updatedPatient: Patient = {
        ...patient,
        ...updateData,
        updatedAt: new Date().toISOString().split('T')[0],
      };

      onPatientUpdated(updatedPatient);
      Alert.alert('Başarılı', 'Hasta bilgileri güncellendi.', [
        { text: 'Tamam', onPress: onBack }
      ]);
    } catch (error) {
      console.error('Hasta güncellenirken hata:', error);
      Alert.alert('Hata', 'Hasta güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backButtonText, isDarkMode && styles.darkText]}>← Geri</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>
          Hasta Detayları
        </Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            Kişisel Bilgiler
          </Text>
          
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={[styles.label, isDarkMode && styles.darkText]}>Ad *</Text>
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                value={formData.firstName}
                onChangeText={(text) => setFormData({...formData, firstName: String(text || '')})}
                placeholder="Ad"
                placeholderTextColor={isDarkMode ? '#999' : '#666'}
              />
            </View>
            
            <View style={styles.halfInput}>
              <Text style={[styles.label, isDarkMode && styles.darkText]}>Soyad *</Text>
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                value={formData.lastName}
                onChangeText={(text) => setFormData({...formData, lastName: String(text || '')})}
                placeholder="Soyad"
                placeholderTextColor={isDarkMode ? '#999' : '#666'}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDarkMode && styles.darkText]}>E-mail *</Text>
            <TextInput
              style={[styles.input, isDarkMode && styles.darkInput]}
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: String(text || '')})}
              placeholder="ornek@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={isDarkMode ? '#999' : '#666'}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={[styles.label, isDarkMode && styles.darkText]}>Telefon *</Text>
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                value={formData.phone}
                onChangeText={(text) => setFormData({...formData, phone: String(text || '')})}
                placeholder="0555 123 45 67"
                keyboardType="phone-pad"
                placeholderTextColor={isDarkMode ? '#999' : '#666'}
              />
            </View>
            
            <View style={styles.halfInput}>
              <Text style={[styles.label, isDarkMode && styles.darkText]}>Yaş *</Text>
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                value={formData.age}
                onChangeText={(text) => setFormData({...formData, age: String(text || '')})}
                placeholder="25"
                keyboardType="numeric"
                placeholderTextColor={isDarkMode ? '#999' : '#666'}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDarkMode && styles.darkText]}>Cinsiyet</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  formData.gender === 'Erkek' && styles.genderButtonActive,
                  isDarkMode && styles.darkGenderButton,
                  formData.gender === 'Erkek' && isDarkMode && styles.darkGenderButtonActive,
                ]}
                onPress={() => setFormData({...formData, gender: 'Erkek'})}
              >
                <Text style={[
                  styles.genderButtonText,
                  formData.gender === 'Erkek' && styles.genderButtonTextActive,
                  isDarkMode && styles.darkText,
                ]}>
                  Erkek
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  formData.gender === 'Kadın' && styles.genderButtonActive,
                  isDarkMode && styles.darkGenderButton,
                  formData.gender === 'Kadın' && isDarkMode && styles.darkGenderButtonActive,
                ]}
                onPress={() => setFormData({...formData, gender: 'Kadın'})}
              >
                <Text style={[
                  styles.genderButtonText,
                  formData.gender === 'Kadın' && styles.genderButtonTextActive,
                  isDarkMode && styles.darkText,
                ]}>
                  Kadın
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDarkMode && styles.darkText]}>Adres</Text>
            <TextInput
              style={[styles.input, styles.textArea, isDarkMode && styles.darkInput]}
              value={formData.address}
              onChangeText={(text) => setFormData({...formData, address: String(text || '')})}
              placeholder="Ev adresi"
              multiline
              numberOfLines={3}
              placeholderTextColor={isDarkMode ? '#999' : '#666'}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDarkMode && styles.darkText]}>Acil Durum İletişim</Text>
            <TextInput
              style={[styles.input, isDarkMode && styles.darkInput]}
              value={formData.emergencyContact}
              onChangeText={(text) => setFormData({...formData, emergencyContact: String(text || '')})}
              placeholder="Acil durum için iletişim bilgisi"
              placeholderTextColor={isDarkMode ? '#999' : '#666'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            Sağlık Bilgileri
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDarkMode && styles.darkText]}>Tıbbi Geçmiş</Text>
            <TextInput
              style={[styles.input, styles.textArea, isDarkMode && styles.darkInput]}
              value={formData.medicalHistory}
              onChangeText={(text) => setFormData({...formData, medicalHistory: String(text || '')})}
              placeholder="Geçmiş hastalıklar, ameliyatlar vb."
              multiline
              numberOfLines={4}
              placeholderTextColor={isDarkMode ? '#999' : '#666'}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDarkMode && styles.darkText]}>Alerjiler</Text>
            <TextInput
              style={[styles.input, styles.textArea, isDarkMode && styles.darkInput]}
              value={formData.allergies}
              onChangeText={(text) => setFormData({...formData, allergies: String(text || '')})}
              placeholder="Bilinen alerjiler"
              multiline
              numberOfLines={3}
              placeholderTextColor={isDarkMode ? '#999' : '#666'}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDarkMode && styles.darkText]}>Mevcut İlaçlar</Text>
            <TextInput
              style={[styles.input, styles.textArea, isDarkMode && styles.darkInput]}
              value={formData.currentMedications}
              onChangeText={(text) => setFormData({...formData, currentMedications: String(text || '')})}
              placeholder="Şu anda kullanılan ilaçlar"
              multiline
              numberOfLines={3}
              placeholderTextColor={isDarkMode ? '#999' : '#666'}
            />
          </View>
        </View>

        <View style={styles.patientInfo}>
          <Text style={[styles.infoText, isDarkMode && styles.darkText]}>
            Oluşturulma: {patient.createdAt}
          </Text>
          <Text style={[styles.infoText, isDarkMode && styles.darkText]}>
            Son Güncelleme: {patient.updatedAt}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  darkContainer: {
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  darkHeader: {
    backgroundColor: '#333',
    borderBottomColor: '#555',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#999',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  darkSection: {
    backgroundColor: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
    marginRight: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  darkText: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  darkInput: {
    backgroundColor: '#444',
    borderColor: '#555',
    color: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  darkGenderButton: {
    backgroundColor: '#444',
    borderColor: '#555',
  },
  genderButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  darkGenderButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  genderButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  genderButtonTextActive: {
    color: '#fff',
  },
  patientInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});