import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Patient, Measurement } from '../types';
import { MeasurementService } from '../services/measurementService';

interface AddMeasurementScreenProps {
  patients: Patient[];
  selectedPatient?: Patient;
  onSave: (measurement: Measurement) => void;
  onCancel: () => void;
}

const AddMeasurementScreen: React.FC<AddMeasurementScreenProps> = ({
  patients,
  selectedPatient,
  onSave,
  onCancel,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    patientId: selectedPatient?.id || '',
    patientName: selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : '',
    weight: '',
    waterIntake: '',
    exerciseDuration: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].substring(0, 5),
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [calculatedBMI, setCalculatedBMI] = useState<number | null>(null);

  useEffect(() => {
    if (selectedPatient) {
      setFormData(prev => ({
        ...prev,
        patientId: selectedPatient.id,
        patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
      }));
    }
  }, [selectedPatient]);

  // BMI hesaplama
  useEffect(() => {
    if (formData.weight && selectedPatient?.height) {
      const weight = parseFloat(formData.weight);
      const height = selectedPatient.height;
      if (weight > 0 && height > 0) {
        const bmi = MeasurementService.calculateBMI(weight, height);
        setCalculatedBMI(bmi);
      } else {
        setCalculatedBMI(null);
      }
    } else {
      setCalculatedBMI(null);
    }
  }, [formData.weight, selectedPatient?.height]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.patientId) {
      newErrors.patient = 'Hasta seçimi zorunludur';
    }
    if (!formData.weight || parseFloat(formData.weight) <= 0) {
      newErrors.weight = 'Geçerli bir kilo değeri girin (kg)';
    }
    if (!formData.waterIntake || parseFloat(formData.waterIntake) < 0) {
      newErrors.waterIntake = 'Su tüketimi değeri girin (ml)';
    }
    if (!formData.exerciseDuration || parseFloat(formData.exerciseDuration) < 0) {
      newErrors.exerciseDuration = 'Egzersiz süresi girin (dakika)';
    }
    if (!formData.date) {
      newErrors.date = 'Tarih seçimi zorunludur';
    }
    if (!formData.time) {
      newErrors.time = 'Saat seçimi zorunludur';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Hata', 'Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    try {
      setLoading(true);
      const measurementData = {
        patientId: formData.patientId,
        patientName: formData.patientName,
        weight: parseFloat(formData.weight),
        waterIntake: parseFloat(formData.waterIntake),
        exerciseDuration: parseFloat(formData.exerciseDuration),
        date: formData.date,
        time: formData.time,
        notes: formData.notes || undefined,
        bmi: calculatedBMI || undefined,
      };

      const newMeasurement = await MeasurementService.addMeasurement(measurementData);
      onSave(newMeasurement);
      Alert.alert('Başarılı', 'Ölçüm başarıyla eklendi!');
    } catch (error) {
      console.error('Ölçüm eklenirken hata:', error);
      Alert.alert('Hata', 'Ölçüm eklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    setFormData(prev => ({
      ...prev,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
    }));
    setErrors(prev => ({ ...prev, patient: '' }));
  };

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { text: 'Zayıf', color: '#2196f3' };
    if (bmi < 25) return { text: 'Normal', color: '#4caf50' };
    if (bmi < 30) return { text: 'Fazla Kilolu', color: '#ff9800' };
    return { text: 'Obez', color: '#f44336' };
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>
          📊 Yeni Ölçüm
        </Text>
        <Text style={[styles.subtitle, isDarkMode && styles.darkSubtitle]}>
          {selectedPatient ? 'Hasta seçili' : 'Hasta seçin ve ölçüm değerlerini girin'}
        </Text>
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        {/* Hasta Seçimi */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            👤 Hasta Seçimi
          </Text>
          
          {selectedPatient ? (
            <View style={[styles.selectedPatient, isDarkMode && styles.darkCard]}>
              <Text style={[styles.selectedPatientText, isDarkMode && styles.darkText]}>
                {formData.patientName}
              </Text>
              <Text style={[styles.selectedPatientInfo, isDarkMode && styles.darkSubtitle]}>
                📞 {selectedPatient.phone} • 📏 {selectedPatient.height} cm
              </Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.patientList}>
              {patients.map((patient) => (
                <TouchableOpacity
                  key={patient.id}
                  style={[
                    styles.patientCard,
                    isDarkMode && styles.darkCard,
                    formData.patientId === patient.id && styles.selectedPatientCard,
                  ]}
                  onPress={() => handlePatientSelect(patient)}
                >
                  <Text style={[styles.patientName, isDarkMode && styles.darkText]}>
                    {patient.firstName} {patient.lastName}
                  </Text>
                  <Text style={[styles.patientPhone, isDarkMode && styles.darkSubtitle]}>
                    📞 {patient.phone}
                  </Text>
                  <Text style={[styles.patientHeight, isDarkMode && styles.darkSubtitle]}>
                    📏 {patient.height} cm
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          {errors.patient && <Text style={styles.errorText}>{errors.patient}</Text>}
        </View>

        {/* Ölçüm Değerleri */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            ⚖️ Ölçüm Değerleri
          </Text>
          
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={[styles.label, isDarkMode && styles.darkText]}>Kilo (kg) *</Text>
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput, errors.weight && styles.errorInput]}
                placeholder="75.5"
                placeholderTextColor={isDarkMode ? '#999' : '#666'}
                value={formData.weight}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, weight: text }));
                  setErrors(prev => ({ ...prev, weight: '' }));
                }}
                keyboardType="decimal-pad"
              />
              {errors.weight && <Text style={styles.errorText}>{errors.weight}</Text>}
            </View>

            <View style={styles.halfInput}>
              <Text style={[styles.label, isDarkMode && styles.darkText]}>Su (ml) *</Text>
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput, errors.waterIntake && styles.errorInput]}
                placeholder="2000"
                placeholderTextColor={isDarkMode ? '#999' : '#666'}
                value={formData.waterIntake}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, waterIntake: text }));
                  setErrors(prev => ({ ...prev, waterIntake: '' }));
                }}
                keyboardType="numeric"
              />
              {errors.waterIntake && <Text style={styles.errorText}>{errors.waterIntake}</Text>}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDarkMode && styles.darkText]}>Egzersiz Süresi (dakika) *</Text>
            <TextInput
              style={[styles.input, isDarkMode && styles.darkInput, errors.exerciseDuration && styles.errorInput]}
              placeholder="45"
              placeholderTextColor={isDarkMode ? '#999' : '#666'}
              value={formData.exerciseDuration}
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, exerciseDuration: text }));
                setErrors(prev => ({ ...prev, exerciseDuration: '' }));
              }}
              keyboardType="numeric"
            />
            {errors.exerciseDuration && <Text style={styles.errorText}>{errors.exerciseDuration}</Text>}
          </View>

          {/* BMI Gösterimi */}
          {calculatedBMI && (
            <View style={[styles.bmiContainer, isDarkMode && styles.darkCard]}>
              <Text style={[styles.bmiLabel, isDarkMode && styles.darkText]}>
                Hesaplanan VKİ
              </Text>
              <View style={styles.bmiInfo}>
                <Text style={[styles.bmiValue, isDarkMode && styles.darkText]}>
                  {calculatedBMI}
                </Text>
                <View style={[styles.bmiStatus, { backgroundColor: getBMIStatus(calculatedBMI).color }]}>
                  <Text style={styles.bmiStatusText}>
                    {getBMIStatus(calculatedBMI).text}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Tarih ve Saat */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            🕒 Tarih ve Saat
          </Text>
          
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={[styles.label, isDarkMode && styles.darkText]}>Tarih *</Text>
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput, errors.date && styles.errorInput]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={isDarkMode ? '#999' : '#666'}
                value={formData.date}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, date: text }));
                  setErrors(prev => ({ ...prev, date: '' }));
                }}
              />
              {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
            </View>

            <View style={styles.halfInput}>
              <Text style={[styles.label, isDarkMode && styles.darkText]}>Saat *</Text>
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput, errors.time && styles.errorInput]}
                placeholder="HH:MM"
                placeholderTextColor={isDarkMode ? '#999' : '#666'}
                value={formData.time}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, time: text }));
                  setErrors(prev => ({ ...prev, time: '' }));
                }}
              />
              {errors.time && <Text style={styles.errorText}>{errors.time}</Text>}
            </View>
          </View>
        </View>

        {/* Notlar */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            💭 Notlar
          </Text>
          
          <TextInput
            style={[styles.textarea, isDarkMode && styles.darkInput]}
            placeholder="Ölçümle ilgili notlar veya gözlemler"
            placeholderTextColor={isDarkMode ? '#999' : '#666'}
            value={formData.notes}
            onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
            multiline
            numberOfLines={4}
          />
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.cancelButton, isDarkMode && styles.darkCancelButton]}
          onPress={onCancel}
          disabled={loading}
        >
          <Text style={[styles.cancelButtonText, isDarkMode && styles.darkCancelButtonText]}>
            İptal
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>Kaydet</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  darkText: {
    color: '#ffffff',
  },
  darkSubtitle: {
    color: '#adb5bd',
  },
  form: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 16,
  },
  selectedPatient: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2196f3',
  },
  darkCard: {
    backgroundColor: '#2d2d2d',
  },
  selectedPatientText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
  },
  selectedPatientInfo: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
  },
  patientList: {
    marginTop: 8,
  },
  patientCard: {
    backgroundColor: '#ffffff',
    padding: 12,
    marginRight: 12,
    borderRadius: 12,
    minWidth: 140,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedPatientCard: {
    borderColor: '#2196f3',
    backgroundColor: '#e3f2fd',
  },
  patientName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212529',
  },
  patientPhone: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  patientHeight: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  darkInput: {
    backgroundColor: '#2d2d2d',
    borderColor: '#444',
    color: '#ffffff',
  },
  textarea: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  bmiContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  bmiLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  bmiInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bmiValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  bmiStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  bmiStatusText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorInput: {
    borderColor: '#dc3545',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  darkCancelButton: {
    backgroundColor: '#495057',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  darkCancelButtonText: {
    color: '#ffffff',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#adb5bd',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddMeasurementScreen;