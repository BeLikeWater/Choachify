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
  SafeAreaView,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

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
    <SafeAreaView style={[styles.safeContainer, isDarkMode && styles.darkSafeContainer]}>
      {/* Fixed Header */}
      <View style={[styles.fixedHeader, isDarkMode && styles.darkHeader]}>
        <TouchableOpacity onPress={onCancel} style={styles.headerLeftButton}>
          <Text style={styles.headerLeftIcon}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, isDarkMode && styles.darkHeaderTitle]}>
            Yeni Ölçüm
          </Text>
          <Text style={[styles.headerSubtitle, isDarkMode && styles.darkHeaderSubtitle]}>
            Hasta ölçüm değerleri
          </Text>
        </View>
        
        <TouchableOpacity 
          onPress={handleSave}
          style={[styles.headerRightButton, loading && styles.disabledHeaderButton]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#22c55e" />
          ) : (
            <Text style={styles.headerRightText}>Kaydet</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={[styles.container, isDarkMode && styles.darkContainer]}>

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
              <TouchableOpacity
                style={[styles.dateSelector, isDarkMode && styles.darkCard, errors.date && styles.errorInput]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={[styles.dateSelectorText, isDarkMode && styles.darkText]}>
                  {formData.date ? 
                    new Date(formData.date).toLocaleDateString('tr-TR', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })
                    : 'Tarih seç'
                  }
                </Text>
                <Text style={styles.chevron}>📅</Text>
              </TouchableOpacity>
              {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
            </View>

            <View style={styles.halfInput}>
              <Text style={[styles.label, isDarkMode && styles.darkText]}>Saat *</Text>
              <TouchableOpacity
                style={[styles.dateSelector, isDarkMode && styles.darkCard, errors.time && styles.errorInput]}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={[styles.dateSelectorText, isDarkMode && styles.darkText]}>
                  {formData.time || 'Saat seç'}
                </Text>
                <Text style={styles.chevron}>🕐</Text>
              </TouchableOpacity>
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

      {/* Date Picker Modal */}
      {showDatePicker && (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, isDarkMode && styles.darkModalContent]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>
                  Tarih Seçin
                </Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                testID="dateTimePicker"
                value={formData.date ? new Date(formData.date) : new Date()}
                mode="date"
                is24Hour={true}
                display="spinner"
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    setFormData(prev => ({ 
                      ...prev, 
                      date: selectedDate.toISOString().split('T')[0] 
                    }));
                    setErrors(prev => ({ ...prev, date: '' }));
                  }
                  setShowDatePicker(false);
                }}
                locale="tr-TR"
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Time Picker Modal */}
      {showTimePicker && (
        <Modal
          visible={showTimePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowTimePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, isDarkMode && styles.darkModalContent]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>
                  Saat Seçin
                </Text>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                testID="timeTimePicker"
                value={formData.time ? new Date(`2000-01-01T${formData.time}:00`) : new Date()}
                mode="time"
                is24Hour={true}
                display="spinner"
                onChange={(event, selectedTime) => {
                  if (selectedTime) {
                    const timeString = selectedTime.toTimeString().split(' ')[0].substring(0, 5);
                    setFormData(prev => ({ 
                      ...prev, 
                      time: timeString 
                    }));
                    setErrors(prev => ({ ...prev, time: '' }));
                  }
                  setShowTimePicker(false);
                }}
                locale="tr-TR"
              />
            </View>
          </View>
        </Modal>
      )}
      
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // SafeArea
  safeContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  darkSafeContainer: {
    backgroundColor: '#0f172a',
  },
  
  // Fixed Header
  fixedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  darkHeader: {
    backgroundColor: '#1e293b',
    borderBottomColor: '#475569',
  },
  
  headerLeftButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    minWidth: 40,
    alignItems: 'center',
  },
  headerLeftIcon: {
    fontSize: 20,
    color: '#667eea',
    fontWeight: '600',
  },
  
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  darkHeaderTitle: {
    color: '#f1f5f9',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  darkHeaderSubtitle: {
    color: '#94a3b8',
  },
  
  headerRightButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    minWidth: 60,
    alignItems: 'center',
  },
  headerRightText: {
    fontSize: 16,
    color: '#22c55e',
    fontWeight: '600',
  },
  disabledHeaderButton: {
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
  },
  
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  darkContainer: {
    backgroundColor: '#1a1a1a',
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
  dateSelector: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateSelectorText: {
    fontSize: 14,
    color: '#212529',
  },
  chevron: {
    fontSize: 16,
    color: '#6c757d',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    margin: 20,
    minWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  darkModalContent: {
    backgroundColor: '#2d2d2d',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  closeButton: {
    fontSize: 20,
    color: '#6c757d',
    padding: 4,
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
  errorInput: {
    borderColor: '#dc3545',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4,
  },
});

export default AddMeasurementScreen;