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
import { Patient, Appointment } from '../types';
import { AppointmentService } from '../services/appointmentService';

interface AddAppointmentScreenProps {
  patients: Patient[];
  selectedPatient?: Patient;
  onSave: (appointment: Appointment) => void;
  onCancel: () => void;
}

const AddAppointmentScreen: React.FC<AddAppointmentScreenProps> = ({
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
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    duration: 30,
    type: 'consultation' as const,
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (selectedPatient) {
      setFormData(prev => ({
        ...prev,
        patientId: selectedPatient.id,
        patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
      }));
    }
  }, [selectedPatient]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.patientId) {
      newErrors.patient = 'Hasta seçimi zorunludur';
    }
    if (!formData.title.trim()) {
      newErrors.title = 'Randevu başlığı zorunludur';
    }
    if (!formData.date) {
      newErrors.date = 'Tarih seçimi zorunludur';
    }
    if (!formData.time) {
      newErrors.time = 'Saat seçimi zorunludur';
    }
    if (formData.duration < 15 || formData.duration > 240) {
      newErrors.duration = 'Süre 15-240 dakika arasında olmalıdır';
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
      const appointmentData = {
        patientId: formData.patientId,
        patientName: formData.patientName,
        title: formData.title,
        description: formData.description || undefined,
        date: formData.date,
        time: formData.time,
        duration: formData.duration,
        status: 'scheduled' as const,
        type: formData.type,
        notes: formData.notes || undefined,
      };

      const newAppointment = await AppointmentService.addAppointment(appointmentData);
      onSave(newAppointment);
      Alert.alert('Başarılı', 'Randevu başarıyla eklendi!');
    } catch (error) {
      console.error('Randevu eklenirken hata:', error);
      Alert.alert('Hata', 'Randevu eklenirken bir hata oluştu.');
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

  const appointmentTypes = [
    { value: 'consultation', label: 'Konsültasyon', icon: '👨‍⚕️' },
    { value: 'follow-up', label: 'Takip', icon: '🔄' },
    { value: 'check-up', label: 'Kontrol', icon: '🩺' },
    { value: 'emergency', label: 'Acil', icon: '🚨' },
    { value: 'other', label: 'Diğer', icon: '📋' },
  ];

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>
          📅 Yeni Randevu
        </Text>
        <Text style={[styles.subtitle, isDarkMode && styles.darkSubtitle]}>
          {selectedPatient ? 'Hasta seçili' : 'Hasta seçin ve randevu detaylarını girin'}
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
              <Text style={[styles.selectedPatientPhone, isDarkMode && styles.darkSubtitle]}>
                📞 {selectedPatient.phone}
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
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          {errors.patient && <Text style={styles.errorText}>{errors.patient}</Text>}
        </View>

        {/* Randevu Bilgileri */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            📋 Randevu Bilgileri
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDarkMode && styles.darkText]}>Başlık *</Text>
            <TextInput
              style={[styles.input, isDarkMode && styles.darkInput, errors.title && styles.errorInput]}
              placeholder="Randevu başlığı"
              placeholderTextColor={isDarkMode ? '#999' : '#666'}
              value={formData.title}
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, title: text }));
                setErrors(prev => ({ ...prev, title: '' }));
              }}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDarkMode && styles.darkText]}>Açıklama</Text>
            <TextInput
              style={[styles.textarea, isDarkMode && styles.darkInput]}
              placeholder="Randevu açıklaması"
              placeholderTextColor={isDarkMode ? '#999' : '#666'}
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={3}
            />
          </View>
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

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDarkMode && styles.darkText]}>Süre (dakika) *</Text>
            <TextInput
              style={[styles.input, isDarkMode && styles.darkInput, errors.duration && styles.errorInput]}
              placeholder="30"
              placeholderTextColor={isDarkMode ? '#999' : '#666'}
              value={formData.duration.toString()}
              onChangeText={(text) => {
                const duration = parseInt(text) || 30;
                setFormData(prev => ({ ...prev, duration }));
                setErrors(prev => ({ ...prev, duration: '' }));
              }}
              keyboardType="numeric"
            />
            {errors.duration && <Text style={styles.errorText}>{errors.duration}</Text>}
          </View>
        </View>

        {/* Randevu Tipi */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            🏷️ Randevu Tipi
          </Text>
          
          <View style={styles.typeGrid}>
            {appointmentTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeCard,
                  isDarkMode && styles.darkCard,
                  formData.type === type.value && styles.selectedTypeCard,
                ]}
                onPress={() => setFormData(prev => ({ ...prev, type: type.value as any }))}
              >
                <Text style={styles.typeIcon}>{type.icon}</Text>
                <Text style={[
                  styles.typeLabel,
                  isDarkMode && styles.darkText,
                  formData.type === type.value && styles.selectedTypeText,
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notlar */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            💭 Notlar
          </Text>
          
          <TextInput
            style={[styles.textarea, isDarkMode && styles.darkInput]}
            placeholder="Randevu ile ilgili notlar"
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
  selectedPatientPhone: {
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
    marginTop: 4,
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
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    minWidth: 100,
  },
  selectedTypeCard: {
    borderColor: '#2196f3',
    backgroundColor: '#e3f2fd',
  },
  typeIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    textAlign: 'center',
  },
  selectedTypeText: {
    color: '#2196f3',
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

export default AddAppointmentScreen;