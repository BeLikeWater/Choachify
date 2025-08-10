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
import { Patient, DietPlan, DietMeal } from '../types';
import { DietService } from '../services/dietService';

interface AddDietPlanScreenProps {
  patients: Patient[];
  selectedPatient?: Patient;
  onSave: (dietPlan: DietPlan) => void;
  onCancel: () => void;
}

const AddDietPlanScreen: React.FC<AddDietPlanScreenProps> = ({
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
    patientEmail: selectedPatient?.email || '',
    date: new Date().toISOString().split('T')[0],
    title: '',
    waterTarget: '2500',
    exerciseRecommendation: '',
    supplements: '',
    generalNotes: '',
    createdBy: 'Diyetisyen',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  const [meals, setMeals] = useState({
    breakfast: { name: 'Kahvaltı', items: [''], notes: '' },
    snack1: { name: 'Ara Öğün 1', items: [''], notes: '' },
    lunch: { name: 'Öğle Yemeği', items: [''], notes: '' },
    snack2: { name: 'Ara Öğün 2', items: [''], notes: '' },
    dinner: { name: 'Akşam Yemeği', items: [''], notes: '' },
    nightSnack: { name: 'Gece Öğünü', items: [''], notes: '' },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (selectedPatient) {
      setFormData(prev => ({
        ...prev,
        patientId: selectedPatient.id,
        patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
        patientEmail: selectedPatient.email,
        title: `${selectedPatient.firstName} ${selectedPatient.lastName} - Günlük Diyet Planı`,
      }));
    }
  }, [selectedPatient]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.patientId) {
      newErrors.patient = 'Hasta seçimi zorunludur';
    }
    if (!formData.title.trim()) {
      newErrors.title = 'Plan başlığı zorunludur';
    }
    if (!formData.date) {
      newErrors.date = 'Tarih seçimi zorunludur';
    }
    if (!formData.waterTarget || parseFloat(formData.waterTarget) <= 0) {
      newErrors.waterTarget = 'Geçerli bir su hedefi girin (ml)';
    }

    // En az bir öğün dolu olmalı
    const hasAnyMeal = Object.values(meals).some(meal => 
      meal.items.some(item => item.trim().length > 0)
    );
    if (!hasAnyMeal) {
      newErrors.meals = 'En az bir öğün için yiyecek girmelisiniz';
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
      
      // Boş itemları temizle ve meals nesnesini oluştur
      const cleanedMeals: any = {};
      Object.entries(meals).forEach(([key, meal]) => {
        const cleanedItems = meal.items.filter(item => item.trim().length > 0);
        if (cleanedItems.length > 0 || meal.notes?.trim()) {
          cleanedMeals[key] = {
            name: meal.name,
            items: cleanedItems,
            notes: meal.notes?.trim() || undefined,
          };
        }
      });

      const dietPlanData = {
        patientId: formData.patientId,
        patientName: formData.patientName,
        patientEmail: formData.patientEmail,
        date: formData.date,
        title: formData.title,
        ...cleanedMeals,
        waterTarget: parseFloat(formData.waterTarget),
        exerciseRecommendation: formData.exerciseRecommendation?.trim() || undefined,
        supplements: formData.supplements ? formData.supplements.split(',').map(s => s.trim()).filter(s => s) : undefined,
        generalNotes: formData.generalNotes?.trim() || undefined,
        createdBy: formData.createdBy,
      };

      const newDietPlan = await DietService.addDietPlan(dietPlanData);
      onSave(newDietPlan);
      Alert.alert('Başarılı', 'Diyet planı başarıyla eklendi!');
    } catch (error) {
      console.error('Diyet planı eklenirken hata:', error);
      Alert.alert('Hata', 'Diyet planı eklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    setFormData(prev => ({
      ...prev,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientEmail: patient.email,
      title: `${patient.firstName} ${patient.lastName} - Günlük Diyet Planı`,
    }));
    setErrors(prev => ({ ...prev, patient: '' }));
  };

  const updateMealItem = (mealKey: string, itemIndex: number, value: string) => {
    setMeals(prev => ({
      ...prev,
      [mealKey]: {
        ...prev[mealKey],
        items: prev[mealKey].items.map((item, index) => 
          index === itemIndex ? value : item
        )
      }
    }));
    
    // Eğer son item'a yazı yazılmışsa yeni item ekle
    const meal = meals[mealKey];
    if (itemIndex === meal.items.length - 1 && value.trim().length > 0) {
      addMealItem(mealKey);
    }
  };

  const addMealItem = (mealKey: string) => {
    setMeals(prev => ({
      ...prev,
      [mealKey]: {
        ...prev[mealKey],
        items: [...prev[mealKey].items, '']
      }
    }));
  };

  const removeMealItem = (mealKey: string, itemIndex: number) => {
    setMeals(prev => ({
      ...prev,
      [mealKey]: {
        ...prev[mealKey],
        items: prev[mealKey].items.filter((_, index) => index !== itemIndex)
      }
    }));
  };

  const updateMealNotes = (mealKey: string, notes: string) => {
    setMeals(prev => ({
      ...prev,
      [mealKey]: {
        ...prev[mealKey],
        notes
      }
    }));
  };

  const mealIcons = {
    breakfast: '🍳',
    snack1: '☕',
    lunch: '🍽️',
    snack2: '🍵',
    dinner: '🥗',
    nightSnack: '🌙',
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
            Yeni Diyet Planı
          </Text>
          <Text style={[styles.headerSubtitle, isDarkMode && styles.darkHeaderSubtitle]}>
            Günlük menü oluşturun
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

        {/* Plan Bilgileri */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            📋 Plan Bilgileri
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDarkMode && styles.darkText]}>Plan Başlığı *</Text>
            <TextInput
              style={[styles.input, isDarkMode && styles.darkInput, errors.title && styles.errorInput]}
              placeholder="Örnek: Ahmet Yılmaz - Günlük Diyet Planı"
              placeholderTextColor={isDarkMode ? '#999' : '#666'}
              value={formData.title}
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, title: text }));
                setErrors(prev => ({ ...prev, title: '' }));
              }}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
          </View>

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
              <Text style={[styles.label, isDarkMode && styles.darkText]}>Su Hedefi (ml) *</Text>
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput, errors.waterTarget && styles.errorInput]}
                placeholder="2500"
                placeholderTextColor={isDarkMode ? '#999' : '#666'}
                value={formData.waterTarget}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, waterTarget: text }));
                  setErrors(prev => ({ ...prev, waterTarget: '' }));
                }}
                keyboardType="numeric"
              />
              {errors.waterTarget && <Text style={styles.errorText}>{errors.waterTarget}</Text>}
            </View>
          </View>
        </View>

        {/* Öğünler */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            🍽️ Günlük Öğünler
          </Text>
          {errors.meals && <Text style={styles.errorText}>{errors.meals}</Text>}
          
          {Object.entries(meals).map(([mealKey, meal]) => (
            <View key={mealKey} style={[styles.mealCard, isDarkMode && styles.darkCard]}>
              <Text style={[styles.mealTitle, isDarkMode && styles.darkText]}>
                {mealIcons[mealKey]} {meal.name}
              </Text>
              
              {meal.items.map((item, index) => (
                <View key={index} style={styles.mealItemRow}>
                  <TextInput
                    style={[styles.mealItemInput, isDarkMode && styles.darkInput]}
                    placeholder="Örnek: 2 dilim tam buğday ekmeği"
                    placeholderTextColor={isDarkMode ? '#999' : '#666'}
                    value={item}
                    onChangeText={(text) => updateMealItem(mealKey, index, text)}
                    multiline
                  />
                  {meal.items.length > 1 && index < meal.items.length - 1 && (
                    <TouchableOpacity
                      style={styles.removeItemButton}
                      onPress={() => removeMealItem(mealKey, index)}
                    >
                      <Text style={styles.removeItemText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              
              <TextInput
                style={[styles.mealNotesInput, isDarkMode && styles.darkInput]}
                placeholder="Öğünle ilgili not (opsiyonel)"
                placeholderTextColor={isDarkMode ? '#999' : '#666'}
                value={meal.notes}
                onChangeText={(text) => updateMealNotes(mealKey, text)}
                multiline
              />
            </View>
          ))}
        </View>

        {/* Genel Bilgiler */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            📌 Genel Bilgiler
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDarkMode && styles.darkText]}>Egzersiz Önerisi</Text>
            <TextInput
              style={[styles.textarea, isDarkMode && styles.darkInput]}
              placeholder="Örnek: 30 dk yürüyüş önerilir"
              placeholderTextColor={isDarkMode ? '#999' : '#666'}
              value={formData.exerciseRecommendation}
              onChangeText={(text) => setFormData(prev => ({ ...prev, exerciseRecommendation: text }))}
              multiline
              numberOfLines={2}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDarkMode && styles.darkText]}>Günlük Takviyeler</Text>
            <TextInput
              style={[styles.input, isDarkMode && styles.darkInput]}
              placeholder="Örnek: Omega-3, D vitamini (virgülle ayırın)"
              placeholderTextColor={isDarkMode ? '#999' : '#666'}
              value={formData.supplements}
              onChangeText={(text) => setFormData(prev => ({ ...prev, supplements: text }))}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDarkMode && styles.darkText]}>Genel Notlar</Text>
            <TextInput
              style={[styles.textarea, isDarkMode && styles.darkInput]}
              placeholder="Diyet planıyla ilgili genel notlar ve öneriler"
              placeholderTextColor={isDarkMode ? '#999' : '#666'}
              value={formData.generalNotes}
              onChangeText={(text) => setFormData(prev => ({ ...prev, generalNotes: text }))}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDarkMode && styles.darkText]}>Hazırlayan</Text>
            <TextInput
              style={[styles.input, isDarkMode && styles.darkInput]}
              placeholder="Diyetisyen/Doktor adı"
              placeholderTextColor={isDarkMode ? '#999' : '#666'}
              value={formData.createdBy}
              onChangeText={(text) => setFormData(prev => ({ ...prev, createdBy: text }))}
            />
          </View>
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
  mealCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 12,
  },
  mealItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealItemInput: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e9ecef',
    minHeight: 40,
    textAlignVertical: 'top',
  },
  removeItemButton: {
    backgroundColor: '#dc3545',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  removeItemText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
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
  mealNotesInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e9ecef',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  errorInput: {
    borderColor: '#dc3545',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4,
  },
  darkText: {
    color: '#ffffff',
  },
  darkSubtitle: {
    color: '#adb5bd',
  },
});

export default AddDietPlanScreen;