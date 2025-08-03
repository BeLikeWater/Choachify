import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Patient } from '../types';

interface AddPatientScreenProps {
  onSave: (patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const AddPatientScreen: React.FC<AddPatientScreenProps> = ({
  onSave,
  onCancel,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: 'female' as 'male' | 'female' | 'other',
    phone: '',
    email: '',
    height: '',
    weight: '',
    allergies: '',
    medicalHistory: '',
    medications: '',
    sleepHours: '',
    exerciseFrequency: 'sometimes' as 'none' | 'rarely' | 'sometimes' | 'often' | 'daily',
    stressLevel: 3 as 1 | 2 | 3 | 4 | 5,
    glucose: '',
    cholesterol: '',
    hemoglobin: '',
  });

  const updateField = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateBMI = (height: number, weight: number): number => {
    const heightInMeters = height / 100;
    return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
  };

  const validateForm = (): boolean => {
    const requiredFields = ['firstName', 'lastName', 'birthDate', 'phone', 'email', 'height', 'weight'];
    
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        Alert.alert('Eksik Bilgi', `${getFieldLabel(field)} alanı zorunludur.`);
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Hatalı Email', 'Geçerli bir email adresi giriniz.');
      return false;
    }

    // Phone validation
    const phoneRegex = /^(\+90|0)?[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      Alert.alert('Hatalı Telefon', 'Geçerli bir telefon numarası giriniz.');
      return false;
    }

    return true;
  };

  const getFieldLabel = (field: string): string => {
    const labels: { [key: string]: string } = {
      firstName: 'Ad',
      lastName: 'Soyad',
      birthDate: 'Doğum Tarihi',
      phone: 'Telefon',
      email: 'Email',
      height: 'Boy',
      weight: 'Kilo',
    };
    return labels[field] || field;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const height = Number(formData.height);
    const weight = Number(formData.weight);
    const bmi = calculateBMI(height, weight);

    const patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'> = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      birthDate: formData.birthDate,
      gender: formData.gender,
      phone: formData.phone.trim(),
      email: formData.email.trim().toLowerCase(),
      height,
      weight,
      bmi,
      bloodValues: {
        ...(formData.glucose && { glucose: Number(formData.glucose) }),
        ...(formData.cholesterol && { cholesterol: Number(formData.cholesterol) }),
        ...(formData.hemoglobin && { hemoglobin: Number(formData.hemoglobin) }),
        lastUpdated: new Date().toISOString().split('T')[0],
      },
      allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()).filter(a => a) : [],
      medicalHistory: formData.medicalHistory ? formData.medicalHistory.split(',').map(h => h.trim()).filter(h => h) : [],
      medications: formData.medications ? formData.medications.split(',').map(m => m.trim()).filter(m => m) : [],
      lifestyle: {
        sleepHours: formData.sleepHours ? Number(formData.sleepHours) : 8,
        exerciseFrequency: formData.exerciseFrequency,
        stressLevel: formData.stressLevel,
      },
    };

    onSave(patient);
  };

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={[styles.section, isDarkMode && styles.darkSection]}>
      <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
        {title}
      </Text>
      {children}
    </View>
  );

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    options?: {
      placeholder?: string;
      keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
      multiline?: boolean;
    }
  ) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>
        {label}
      </Text>
      <TextInput
        style={[
          styles.input,
          isDarkMode && styles.darkInput,
          options?.multiline && styles.multilineInput
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={options?.placeholder || label}
        placeholderTextColor={isDarkMode ? '#999' : '#666'}
        keyboardType={options?.keyboardType || 'default'}
        multiline={options?.multiline}
      />
    </View>
  );

  const renderGenderSelector = () => (
    <View style={styles.inputContainer}>
      <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>
        Cinsiyet
      </Text>
      <View style={styles.genderContainer}>
        {[
          { key: 'female', label: '👩 Kadın' },
          { key: 'male', label: '👨 Erkek' },
          { key: 'other', label: '👤 Diğer' },
        ].map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.genderButton,
              formData.gender === key && styles.selectedGenderButton,
            ]}
            onPress={() => updateField('gender', key)}
          >
            <Text style={[
              styles.genderButtonText,
              formData.gender === key && styles.selectedGenderButtonText,
            ]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderExerciseSelector = () => (
    <View style={styles.inputContainer}>
      <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>
        Egzersiz Sıklığı
      </Text>
      <View style={styles.exerciseContainer}>
        {[
          { key: 'none', label: 'Hiç' },
          { key: 'rarely', label: 'Nadiren' },
          { key: 'sometimes', label: 'Bazen' },
          { key: 'often', label: 'Sık' },
          { key: 'daily', label: 'Günlük' },
        ].map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.exerciseButton,
              formData.exerciseFrequency === key && styles.selectedExerciseButton,
            ]}
            onPress={() => updateField('exerciseFrequency', key)}
          >
            <Text style={[
              styles.exerciseButtonText,
              formData.exerciseFrequency === key && styles.selectedExerciseButtonText,
            ]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStressSelector = () => (
    <View style={styles.inputContainer}>
      <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>
        Stres Düzeyi (1-5)
      </Text>
      <View style={styles.stressContainer}>
        {[1, 2, 3, 4, 5].map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.stressButton,
              formData.stressLevel === level && styles.selectedStressButton,
            ]}
            onPress={() => updateField('stressLevel', level)}
          >
            <Text style={[
              styles.stressButtonText,
              formData.stressLevel === level && styles.selectedStressButtonText,
            ]}>
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={[styles.container, isDarkMode && styles.darkContainer]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>
          👤 Yeni Hasta Ekle
        </Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {renderSection('👤 Kimlik Bilgileri', (
          <>
            {renderInput('Ad *', formData.firstName, (text) => updateField('firstName', text))}
            {renderInput('Soyad *', formData.lastName, (text) => updateField('lastName', text))}
            {renderInput('Doğum Tarihi *', formData.birthDate, (text) => updateField('birthDate', text), {
              placeholder: 'YYYY-AA-GG (örn: 1990-05-15)'
            })}
            {renderGenderSelector()}
          </>
        ))}

        {renderSection('📞 İletişim Bilgileri', (
          <>
            {renderInput('Telefon *', formData.phone, (text) => updateField('phone', text), {
              keyboardType: 'phone-pad',
              placeholder: '+90 555 123 4567'
            })}
            {renderInput('E-posta *', formData.email, (text) => updateField('email', text), {
              keyboardType: 'email-address',
              placeholder: 'ornek@email.com'
            })}
          </>
        ))}

        {renderSection('📏 Fiziksel Bilgiler', (
          <>
            {renderInput('Boy (cm) *', formData.height, (text) => updateField('height', text), {
              keyboardType: 'numeric',
              placeholder: '170'
            })}
            {renderInput('Kilo (kg) *', formData.weight, (text) => updateField('weight', text), {
              keyboardType: 'numeric',
              placeholder: '65'
            })}
          </>
        ))}

        {renderSection('🩸 Kan Değerleri', (
          <>
            {renderInput('Glukoz (mg/dL)', formData.glucose, (text) => updateField('glucose', text), {
              keyboardType: 'numeric',
              placeholder: '90'
            })}
            {renderInput('Kolesterol (mg/dL)', formData.cholesterol, (text) => updateField('cholesterol', text), {
              keyboardType: 'numeric',
              placeholder: '180'
            })}
            {renderInput('Hemoglobin (g/dL)', formData.hemoglobin, (text) => updateField('hemoglobin', text), {
              keyboardType: 'numeric',
              placeholder: '13.5'
            })}
          </>
        ))}

        {renderSection('🏥 Sağlık Geçmişi', (
          <>
            {renderInput('Alerjiler', formData.allergies, (text) => updateField('allergies', text), {
              placeholder: 'Fıstık, süt, gluten (virgülle ayırın)',
              multiline: true
            })}
            {renderInput('Hastalık Geçmişi', formData.medicalHistory, (text) => updateField('medicalHistory', text), {
              placeholder: 'Diyabet, hipertansiyon (virgülle ayırın)',
              multiline: true
            })}
            {renderInput('İlaçlar', formData.medications, (text) => updateField('medications', text), {
              placeholder: 'Metformin 500mg, Aspirin (virgülle ayırın)',
              multiline: true
            })}
          </>
        ))}

        {renderSection('🏃‍♂️ Yaşam Tarzı', (
          <>
            {renderInput('Uyku Saati', formData.sleepHours, (text) => updateField('sleepHours', text), {
              keyboardType: 'numeric',
              placeholder: '8'
            })}
            {renderExerciseSelector()}
            {renderStressSelector()}
          </>
        ))}

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
          >
            <Text style={styles.cancelButtonText}>❌ İptal</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>✅ Kaydet</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  darkContainer: {
    backgroundColor: '#1a1a1a',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  darkText: {
    color: '#ffffff',
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkSection: {
    backgroundColor: '#2d2d2d',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#212529',
  },
  darkInput: {
    backgroundColor: '#404040',
    borderColor: '#555',
    color: '#ffffff',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e9ecef',
    alignItems: 'center',
  },
  selectedGenderButton: {
    borderColor: '#007bff',
    backgroundColor: '#e3f2fd',
  },
  genderButtonText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  selectedGenderButtonText: {
    color: '#007bff',
    fontWeight: '600',
  },
  exerciseContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  exerciseButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedExerciseButton: {
    borderColor: '#28a745',
    backgroundColor: '#d4edda',
  },
  exerciseButtonText: {
    fontSize: 12,
    color: '#6c757d',
  },
  selectedExerciseButtonText: {
    color: '#28a745',
    fontWeight: '600',
  },
  stressContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  stressButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e9ecef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedStressButton: {
    borderColor: '#dc3545',
    backgroundColor: '#f8d7da',
  },
  stressButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6c757d',
  },
  selectedStressButtonText: {
    color: '#dc3545',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  saveButton: {
    backgroundColor: '#28a745',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddPatientScreen;