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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Patient, Appointment, User } from '../types';
import { AppointmentService } from '../services/appointmentService';

interface AddAppointmentScreenProps {
  patients: Patient[];
  selectedPatient?: Patient;
  user: User;
  onSave: (appointment: Appointment) => void;
  onCancel: () => void;
}

const AddAppointmentScreen: React.FC<AddAppointmentScreenProps> = ({
  patients,
  selectedPatient,
  user,
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
    selectedSlots: [] as string[],
    type: 'consultation' as const,
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPatientPicker, setShowPatientPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [disabledSlots, setDisabledSlots] = useState<string[]>([]);

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
    if (formData.selectedSlots.length === 0) {
      newErrors.slots = 'En az bir zaman slotu seçmelisiniz';
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
      const selectedPatientData = patients.find(p => p.id === formData.patientId);
      
      const startTime = formData.selectedSlots[0];
      const duration = formData.selectedSlots.length * 30;
      
      const appointmentData = {
        patientId: formData.patientId,
        patientName: formData.patientName,
        patientEmail: selectedPatientData?.email || '',
        doctorId: user.id,
        doctorName: `Dr. ${user.firstName} ${user.lastName}`,
        title: formData.title,
        description: formData.description || undefined,
        date: formData.date,
        time: startTime,
        duration: duration,
        status: 'scheduled' as const,
        type: formData.type,
        notes: formData.notes || undefined,
        selectedSlots: formData.selectedSlots,
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

  // Generate time slots (half-hour intervals)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 18) slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Generate dates for next 30 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('tr-TR', { weekday: 'long' });
      const dayMonth = date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
      dates.push({
        value: dateStr,
        label: `${dayName}, ${dayMonth}`,
        disabled: date.getDay() === 0 // Pazar günleri devre dışı
      });
    }
    return dates;
  };

  const dateOptions = generateDates();

  const handlePatientPickerSelect = (patient: Patient) => {
    handlePatientSelect(patient);
    setShowPatientPicker(false);
  };

  const handleDateSelect = (date: string) => {
    setFormData(prev => ({ ...prev, date }));
    setErrors(prev => ({ ...prev, date: '' }));
    setShowDatePicker(false);
  };

  const handleSlotSelect = (slot: string) => {
    setFormData(prev => {
      const currentSlots = [...prev.selectedSlots];
      const slotIndex = currentSlots.indexOf(slot);
      
      if (slotIndex > -1) {
        // Slot zaten seçili, kaldır
        currentSlots.splice(slotIndex, 1);
      } else {
        // Yeni slot ekle
        currentSlots.push(slot);
        // Sırala ve ardışık kontrolü yap
        currentSlots.sort();
        
        // Ardışık olmayan slotları temizle
        const validSlots = [];
        const slotTimes = timeSlots.map(t => t);
        
        for (let i = 0; i < currentSlots.length; i++) {
          const currentSlotIndex = slotTimes.indexOf(currentSlots[i]);
          
          if (i === 0) {
            validSlots.push(currentSlots[i]);
          } else {
            const prevSlotIndex = slotTimes.indexOf(currentSlots[i-1]);
            if (currentSlotIndex === prevSlotIndex + 1) {
              validSlots.push(currentSlots[i]);
            } else {
              // Ardışık değil, bu slotu başlangıç yap ve öncekini temizle
              return { ...prev, selectedSlots: [slot] };
            }
          }
        }
        
        return { ...prev, selectedSlots: validSlots };
      }
      
      return { ...prev, selectedSlots: currentSlots };
    });
    
    setErrors(prev => ({ ...prev, slots: '' }));
  };
  
  const isSlotDisabled = (slot: string) => {
    return bookedSlots.includes(slot) || disabledSlots.includes(slot);
  };
  
  const isSlotSelected = (slot: string) => {
    return formData.selectedSlots.includes(slot);
  };
  
  // Randevuları ve kapalı slotları yükle
  useEffect(() => {
    const loadSlotAvailability = async () => {
      if (formData.date && user.id) {
        try {
          // Mevcut randevuları getir
          const appointments = await AppointmentService.getDoctorAppointmentsByDate(user.id, formData.date);
          const booked = appointments.flatMap(apt => apt.selectedSlots || [apt.time]);
          setBookedSlots(booked);
          
          // Kapalı slotları getir (AsyncStorage'dan)
          const disabledKey = `disabled_slots_${user.id}_${formData.date}`;
          const disabledData = await AsyncStorage.getItem(disabledKey);
          const disabled = disabledData ? JSON.parse(disabledData) : [];
          setDisabledSlots(disabled);
        } catch (error) {
          console.error('Slot durumu yüklenirken hata:', error);
        }
      }
    };
    
    loadSlotAvailability();
  }, [formData.date, user.id]);

  return (
    <SafeAreaView style={[styles.safeContainer, isDarkMode && styles.darkSafeContainer]}>
      {/* Fixed Header */}
      <View style={[styles.fixedHeader, isDarkMode && styles.darkHeader]}>
        {/* Sol: Geri Butonu */}
        <TouchableOpacity 
          onPress={onCancel} 
          style={styles.headerLeftButton}
        >
          <Text style={styles.headerLeftIcon}>←</Text>
        </TouchableOpacity>

        {/* Orta: Başlık */}
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, isDarkMode && styles.darkHeaderTitle]}>
            Yeni Randevu
          </Text>
        </View>

        {/* Sağ: Kaydet Butonu */}
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
        {/* Hasta Seçimi - Basitleştirilmiş */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            👤 Hasta Seçimi
          </Text>
          
          <TouchableOpacity 
            style={[styles.patientSelector, isDarkMode && styles.darkCard, errors.patient && styles.errorInput]}
            onPress={() => setShowPatientPicker(true)}
          >
            {formData.patientId ? (
              <View>
                <Text style={[styles.selectedPatientText, isDarkMode && styles.darkText]}>
                  {formData.patientName}
                </Text>
                <Text style={[styles.selectedPatientPhone, isDarkMode && styles.darkSubtitle]}>
                  Hasta seçildi - değiştirmek için dokun
                </Text>
              </View>
            ) : (
              <Text style={[styles.placeholderText, isDarkMode && styles.darkSubtitle]}>
                Hasta seçmek için dokun
              </Text>
            )}
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
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

        {/* Tarih ve Saat - Geliştirilmiş */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            🕒 Tarih ve Saat
          </Text>
          
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={[styles.label, isDarkMode && styles.darkText]}>Tarih *</Text>
              <TouchableOpacity
                style={[styles.dateTimeSelector, isDarkMode && styles.darkCard, errors.date && styles.errorInput]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={[styles.dateTimeSelectorText, isDarkMode && styles.darkText]}>
                  {formData.date ? 
                    dateOptions.find(d => d.value === formData.date)?.label.split(',')[1] || formData.date
                    : 'Tarih seç'
                  }
                </Text>
                <Text style={styles.chevron}>📅</Text>
              </TouchableOpacity>
              {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
            </View>

            <View style={styles.halfInput}>
              <Text style={[styles.label, isDarkMode && styles.darkText]}>Zaman Slotu *</Text>
              <TouchableOpacity
                style={[styles.dateTimeSelector, isDarkMode && styles.darkCard, errors.slots && styles.errorInput]}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={[styles.dateTimeSelectorText, isDarkMode && styles.darkText]}>
                  {formData.selectedSlots.length > 0 
                    ? `${formData.selectedSlots.length} slot (${formData.selectedSlots.length * 30} dk)`
                    : 'Slot seç'
                  }
                </Text>
                <Text style={styles.chevron}>🕐</Text>
              </TouchableOpacity>
              {errors.slots && <Text style={styles.errorText}>{errors.slots}</Text>}
            </View>
          </View>

          {formData.selectedSlots.length > 0 && (
            <View style={[styles.selectedSlotsInfo, isDarkMode && styles.darkCard]}>
              <Text style={[styles.selectedSlotsTitle, isDarkMode && styles.darkText]}>
                Seçili Zaman Slotları:
              </Text>
              <Text style={[styles.selectedSlotsText, isDarkMode && styles.darkSubtitle]}>
                {formData.selectedSlots.join(' - ')} ({formData.selectedSlots.length * 30} dakika)
              </Text>
            </View>
          )}
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

      {/* Patient Picker Modal */}
      <Modal
        visible={showPatientPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPatientPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode && styles.darkModalContent]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>
                Hasta Seçin
              </Text>
              <TouchableOpacity onPress={() => setShowPatientPicker(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {patients.map((patient) => (
                <TouchableOpacity
                  key={patient.id}
                  style={[styles.modalItem, isDarkMode && styles.darkModalItem]}
                  onPress={() => handlePatientPickerSelect(patient)}
                >
                  <Text style={[styles.modalItemName, isDarkMode && styles.darkText]}>
                    {patient.firstName} {patient.lastName}
                  </Text>
                  <Text style={[styles.modalItemPhone, isDarkMode && styles.darkSubtitle]}>
                    📞 {patient.phone}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal */}
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
            <ScrollView style={styles.modalList}>
              {dateOptions.map((date) => (
                <TouchableOpacity
                  key={date.value}
                  style={[
                    styles.modalItem,
                    isDarkMode && styles.darkModalItem,
                    date.disabled && styles.disabledItem
                  ]}
                  onPress={() => !date.disabled && handleDateSelect(date.value)}
                  disabled={date.disabled}
                >
                  <Text style={[
                    styles.modalItemName, 
                    isDarkMode && styles.darkText,
                    date.disabled && styles.disabledText
                  ]}>
                    {date.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Time Slot Picker Modal */}
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
                Zaman Slotları Seçin
              </Text>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.slotInstructions, isDarkMode && styles.darkSubtitle]}>
              Ardışık slotlar seçebilirsiniz. Her slot 30 dakikadır.
            </Text>
            <ScrollView style={styles.modalList}>
              <View style={styles.timeGrid}>
                {timeSlots.map((time) => {
                  const disabled = isSlotDisabled(time);
                  const selected = isSlotSelected(time);
                  
                  return (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.timeSlot,
                        isDarkMode && styles.darkCard,
                        selected && styles.selectedTimeSlot,
                        disabled && styles.disabledTimeSlot
                      ]}
                      onPress={() => !disabled && handleSlotSelect(time)}
                      disabled={disabled}
                    >
                      <Text style={[
                        styles.timeSlotText,
                        isDarkMode && styles.darkText,
                        selected && styles.selectedTimeSlotText,
                        disabled && styles.disabledTimeSlotText
                      ]}>
                        {time}
                      </Text>
                      {disabled && (
                        <Text style={styles.disabledLabel}>
                          {bookedSlots.includes(time) ? 'Dolu' : 'Kapalı'}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
            <View style={styles.slotSummary}>
              <Text style={[styles.slotSummaryText, isDarkMode && styles.darkText]}>
                Seçili: {formData.selectedSlots.length} slot ({formData.selectedSlots.length * 30} dakika)
              </Text>
            </View>
          </View>
        </View>
      </Modal>
      
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // SafeArea - iPhone notch uyumluluğu
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
  
  // Header Butonları
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
  // Basitleştirilmiş hasta seçimi
  patientSelector: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  darkCard: {
    backgroundColor: '#2d2d2d',
    borderColor: '#444',
  },
  selectedPatientText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
  },
  selectedPatientPhone: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  placeholderText: {
    fontSize: 16,
    color: '#6c757d',
  },
  chevron: {
    fontSize: 16,
    color: '#6c757d',
  },
  
  // Tarih/saat seçici
  dateTimeSelector: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateTimeSelectorText: {
    fontSize: 14,
    color: '#212529',
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
  errorInput: {
    borderColor: '#dc3545',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4,
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
    maxHeight: '70%',
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
  modalList: {
    maxHeight: 400,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  darkModalItem: {
    borderBottomColor: '#444',
  },
  modalItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
  },
  modalItemPhone: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
  },
  
  // Time picker grid
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 8,
  },
  timeSlot: {
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    minWidth: 60,
    alignItems: 'center',
  },
  selectedTimeSlot: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
  },
  selectedTimeSlotText: {
    color: '#2196f3',
  },
  
  disabledItem: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#9ca3af',
  },
  
  // Seçili slot bilgileri
  selectedSlotsInfo: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  selectedSlotsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  selectedSlotsText: {
    fontSize: 14,
    color: '#2196f3',
    fontWeight: '500',
  },
  
  // Slot seçimi için ek stiller
  slotInstructions: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  disabledTimeSlot: {
    backgroundColor: '#f5f5f5',
    opacity: 0.6,
  },
  disabledTimeSlotText: {
    color: '#9ca3af',
  },
  disabledLabel: {
    fontSize: 10,
    color: '#dc3545',
    marginTop: 2,
    fontWeight: '500',
  },
  slotSummary: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    backgroundColor: '#f8f9fa',
  },
  slotSummaryText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
  },
});

export default AddAppointmentScreen;