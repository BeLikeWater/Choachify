import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme, Alert, ScrollView, SafeAreaView } from 'react-native';
import { commonStyles } from '../styles/commonStyles';
import DashboardScreen from '../screens/DashboardScreen';
import PatientListScreen from '../screens/PatientListScreen';
import AddPatientScreen from '../screens/AddPatientScreen';
import AppointmentListScreen from '../screens/AppointmentListScreen';
import AddAppointmentScreen from '../screens/AddAppointmentScreen';
import AddMeasurementScreen from '../screens/AddMeasurementScreen';
import MeasurementDetailScreen from '../screens/MeasurementDetailScreen';
import AddDietPlanScreen from '../screens/AddDietPlanScreen';
import DietDetailScreen from '../screens/DietDetailScreen';
import DietPlanViewScreen from '../screens/DietPlanViewScreen';
import DoctorPendingApprovalsScreen from '../screens/DoctorPendingApprovalsScreen';
import { PatientDetailScreen } from '../screens/PatientDetailScreen';
import TimeManagementScreen from '../screens/TimeManagementScreen';
import { Patient, Appointment, Measurement, DietPlan, User } from '../types';
import { PatientService } from '../services/patientService';
import { AuthService } from '../services/authService';
import { uploadMockDataToFirebase } from '../utils/uploadMockData';
import { mockPatients } from '../data/mockData';

interface DoctorNavigatorProps {
  user: User;
  onLogout: () => void;
}

const DoctorNavigator: React.FC<DoctorNavigatorProps> = ({ user, onLogout }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'patients' | 'appointments' | 'timeManagement'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showAddAppointment, setShowAddAppointment] = useState(false);
  const [showAddMeasurement, setShowAddMeasurement] = useState(false);
  const [showMeasurementDetail, setShowMeasurementDetail] = useState(false);
  const [showAddDietPlan, setShowAddDietPlan] = useState(false);
  const [showDietDetail, setShowDietDetail] = useState(false);
  const [showDietPlanView, setShowDietPlanView] = useState(false);
  const [showPatientDetail, setShowPatientDetail] = useState(false);
  const [showTimeManagement, setShowTimeManagement] = useState(false);
  const [selectedPatientForAppointment, setSelectedPatientForAppointment] = useState<Patient | undefined>();
  const [selectedPatientForPatientDetail, setSelectedPatientForPatientDetail] = useState<Patient | undefined>();
  const [selectedPatientForMeasurement, setSelectedPatientForMeasurement] = useState<Patient | undefined>();
  const [selectedPatientForDetail, setSelectedPatientForDetail] = useState<Patient | undefined>();
  const [selectedPatientForDiet, setSelectedPatientForDiet] = useState<Patient | undefined>();
  const [selectedPatientForDietDetail, setSelectedPatientForDietDetail] = useState<Patient | undefined>();
  const [selectedDietPlan, setSelectedDietPlan] = useState<DietPlan | undefined>();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Firebase'den hastaları yükle (doktora özel)
  const loadPatients = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading patients for doctor:', user.id);
      
      const fetchedPatients = await PatientService.getPatientsByDoctorFromUsers(user.id);
      console.log(`📋 Loaded ${fetchedPatients.length} patients`);
      
      setPatients(fetchedPatients);
    } catch (error) {
      console.error('❌ Hastalar yüklenemedi:', error);
      Alert.alert('Hata', 'Hastalar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Uygulama başladığında hastaları yükle
  useEffect(() => {
    loadPatients();
  }, []);

  const handleAddPatient = async (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newPatient = await PatientService.addPatient(patientData);
      setPatients(prev => [newPatient, ...prev]);
      setShowAddPatient(false);
      setCurrentTab('patients');
      Alert.alert('Başarılı', 'Hasta başarıyla kaydedildi!');
      
      // Liste yenile
      await loadPatients();
    } catch (error) {
      console.error('Hasta eklenemedi:', error);
      Alert.alert('Hata', 'Hasta kaydedilirken bir hata oluştu.');
    }
  };

  const handlePatientPress = (patient: Patient) => {
    setSelectedPatientForPatientDetail(patient);
    setShowPatientDetail(true);
  };

  const handlePatientUpdated = (updatedPatient: Patient) => {
    setPatients(patients.map(p => p.id === updatedPatient.id ? updatedPatient : p));
  };

  const handleAddAppointmentFromPatient = (patient: Patient) => {
    setSelectedPatientForAppointment(patient);
    setShowAddAppointment(true);
  };

  const handleAddAppointmentFromList = () => {
    setSelectedPatientForAppointment(undefined);
    setShowAddAppointment(true);
  };

  const handleAppointmentSave = (appointment: Appointment) => {
    setShowAddAppointment(false);
    setSelectedPatientForAppointment(undefined);
    setCurrentTab('appointments');
    // Alert AddAppointmentScreen'de gösteriliyor, burada tekrar göstermiyoruz
  };

  const handleAppointmentPress = (appointment: Appointment) => {
    // Future: Navigate to appointment detail screen
    console.log('Appointment pressed:', appointment.title);
  };

  const handleViewMeasurements = (patient: Patient) => {
    setSelectedPatientForDetail(patient);
    setShowMeasurementDetail(true);
  };

  const handleAddMeasurementFromPatient = (patient: Patient) => {
    setSelectedPatientForMeasurement(patient);
    setShowAddMeasurement(true);
  };

  const handleAddMeasurementFromList = () => {
    setSelectedPatientForMeasurement(undefined);
    setShowAddMeasurement(true);
  };

  const handleMeasurementSave = (measurement: Measurement) => {
    setMeasurements(prev => [measurement, ...prev]);
    setShowAddMeasurement(false);
    setSelectedPatientForMeasurement(undefined);
    setCurrentTab('measurements');
    Alert.alert('Başarılı', 'Ölçüm başarıyla eklendi!');
  };

  const handleViewDietPlans = (patient: Patient) => {
    setSelectedPatientForDietDetail(patient);
    setShowDietDetail(true);
  };

  const handleAddDietPlanFromPatient = (patient: Patient) => {
    setSelectedPatientForDiet(patient);
    setShowAddDietPlan(true);
  };

  const handleAddDietPlanFromList = () => {
    setSelectedPatientForDiet(undefined);
    setShowAddDietPlan(true);
  };

  const handleDietPlanSave = (dietPlan: DietPlan) => {
    setDietPlans(prev => [dietPlan, ...prev]);
    setShowAddDietPlan(false);
    setSelectedPatientForDiet(undefined);
    setCurrentTab('diets');
    Alert.alert('Başarılı', 'Diyet planı başarıyla eklendi!');
  };

  const handleDietPlanPress = (dietPlan: DietPlan) => {
    console.log('Diet plan pressed:', dietPlan.title); // Debug log
    setSelectedDietPlan(dietPlan);
    setShowDietDetail(false); // Önce diet detail ekranını kapat
    // selectedPatientForDietDetail'i temizleme - hasta seçimini koru!
    setShowDietPlanView(true); // Sonra diet plan view'ı aç
  };

  // Mock verileri Firebase'e yükle (tek seferlik - geliştirme amaçlı)
  const handleUploadMockData = async () => {
    Alert.alert(
      'Mock Veriler',
      'Mock veriler Firebase\'e yüklensin mi? Bu işlem sadece bir kez yapılmalıdır.',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Yükle', 
          onPress: async () => {
            try {
              await uploadMockDataToFirebase();
              await loadPatients(); // Listeyi yenile
              Alert.alert('Başarılı', 'Mock veriler başarıyla yüklendi!');
            } catch (error) {
              Alert.alert('Hata', 'Mock veriler yüklenirken hata oluştu.');
            }
          }
        }
      ]
    );
  };

  if (showAddPatient) {
    return (
      <AddPatientScreen
        doctorId={user.id}
        onSave={handleAddPatient}
        onCancel={() => setShowAddPatient(false)}
      />
    );
  }

  if (showAddAppointment) {
    return (
      <AddAppointmentScreen
        patients={patients}
        selectedPatient={selectedPatientForAppointment}
        user={user}
        onSave={handleAppointmentSave}
        onCancel={() => {
          setShowAddAppointment(false);
          setSelectedPatientForAppointment(undefined);
        }}
      />
    );
  }

  if (showAddMeasurement) {
    return (
      <AddMeasurementScreen
        patients={patients}
        selectedPatient={selectedPatientForMeasurement}
        onSave={handleMeasurementSave}
        onCancel={() => {
          setShowAddMeasurement(false);
          setSelectedPatientForMeasurement(undefined);
        }}
      />
    );
  }

  if (showMeasurementDetail && selectedPatientForDetail) {
    return (
      <MeasurementDetailScreen
        patient={selectedPatientForDetail}
        onBack={() => {
          setShowMeasurementDetail(false);
          setSelectedPatientForDetail(undefined);
        }}
        onAddMeasurement={handleAddMeasurementFromPatient}
      />
    );
  }

  if (showAddDietPlan) {
    return (
      <AddDietPlanScreen
        patients={patients}
        selectedPatient={selectedPatientForDiet}
        onSave={handleDietPlanSave}
        onCancel={() => {
          setShowAddDietPlan(false);
          setSelectedPatientForDiet(undefined);
        }}
      />
    );
  }

  if (showDietDetail && selectedPatientForDietDetail) {
    return (
      <DietDetailScreen
        patient={selectedPatientForDietDetail}
        onBack={() => {
          setShowDietDetail(false);
          setSelectedPatientForDietDetail(undefined);
        }}
        onAddDietPlan={handleAddDietPlanFromPatient}
        onDietPlanPress={handleDietPlanPress}
      />
    );
  }

  if (showPatientDetail && selectedPatientForPatientDetail) {
    return (
      <PatientDetailScreen
        patient={selectedPatientForPatientDetail}
        onBack={() => setShowPatientDetail(false)}
        onPatientUpdated={handlePatientUpdated}
      />
    );
  }

  if (showDietPlanView && selectedDietPlan) {
    return (
      <DietPlanViewScreen
        dietPlan={selectedDietPlan}
        onBack={() => {
          console.log('Closing diet plan view, returning to diet detail'); // Debug log
          console.log('Current selectedPatientForDietDetail:', selectedPatientForDietDetail?.firstName); // Debug log
          setShowDietPlanView(false);
          setSelectedDietPlan(undefined);
          // selectedPatientForDietDetail zaten set edilmiş olmalı, sadece DietDetailScreen'ı aç
          setShowDietDetail(true); // Diet detail ekranına geri dön
        }}
      />
    );
  }

  if (showTimeManagement) {
    return (
      <TimeManagementScreen
        user={user}
        onBack={() => setShowTimeManagement(false)}
      />
    );
  }

  const handleLogout = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          onPress: async () => {
            try {
              await AuthService.logout();
              onLogout();
            } catch (error) {
              Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu');
            }
          },
        },
      ]
    );
  };


  const handleTabChange = (tab: 'dashboard' | 'patients' | 'appointments' | 'timeManagement') => {
    if (tab === 'timeManagement') {
      setShowTimeManagement(true);
    } else {
      setCurrentTab(tab);
    }
    setSidebarOpen(false); // Menüyü kapat
  };

  // Ekran adlarını al
  const getScreenTitle = () => {
    if (showAddPatient) return 'Yeni Hasta Ekle';
    if (showAddAppointment) return 'Yeni Randevu';
    if (showAddMeasurement) return 'Yeni Ölçüm';
    if (showMeasurementDetail) return 'Ölçüm Detayları';
    if (showAddDietPlan) return 'Yeni Diyet Planı';
    if (showDietDetail) return 'Diyet Planları';
    if (showPatientDetail) return 'Hasta Detayları';
    if (showDietPlanView) return 'Diyet Planı';
    if (showTimeManagement) return 'Zaman Yönetimi';
    
    switch (currentTab) {
      case 'dashboard': return 'Dashboard';
      case 'patients': return 'Hastalar';
      case 'appointments': return 'Randevular';
      default: return 'Coachify';
    }
  };

  // Geri butonu gerekli mi?
  const needsBackButton = () => {
    return showAddPatient || showAddAppointment || showAddMeasurement || 
           showMeasurementDetail || showAddDietPlan || showDietDetail || 
           showPatientDetail || showDietPlanView || showTimeManagement;
  };

  // Sağ taraftaki işlem butonları
  const getRightActions = () => {
    if (needsBackButton()) return null;
    
    switch (currentTab) {
      case 'dashboard':
        return (
          <TouchableOpacity onPress={handleLogout} style={styles.headerActionButton}>
            <Text style={styles.headerActionIcon}>⬅️</Text>
          </TouchableOpacity>
        );
      case 'patients':
        return (
          <TouchableOpacity onPress={() => setShowAddPatient(true)} style={styles.headerActionButton}>
            <Text style={styles.headerActionIcon}>➕</Text>
          </TouchableOpacity>
        );
      case 'appointments':
        return (
          <TouchableOpacity onPress={handleAddAppointmentFromList} style={styles.headerActionButton}>
            <Text style={styles.headerActionIcon}>➕</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  // Geri butonu işlemi
  const handleBackPress = () => {
    if (showAddPatient) setShowAddPatient(false);
    else if (showAddAppointment) {
      setShowAddAppointment(false);
      setSelectedPatientForAppointment(undefined);
    }
    else if (showAddMeasurement) {
      setShowAddMeasurement(false);
      setSelectedPatientForMeasurement(undefined);
    }
    else if (showMeasurementDetail) {
      setShowMeasurementDetail(false);
      setSelectedPatientForDetail(undefined);
    }
    else if (showAddDietPlan) {
      setShowAddDietPlan(false);
      setSelectedPatientForDiet(undefined);
    }
    else if (showDietDetail) {
      setShowDietDetail(false);
      setSelectedPatientForDietDetail(undefined);
    }
    else if (showPatientDetail) setShowPatientDetail(false);
    else if (showDietPlanView) {
      setShowDietPlanView(false);
      setSelectedDietPlan(undefined);
      setShowDietDetail(true);
    }
    else if (showTimeManagement) setShowTimeManagement(false);
  };

  return (
    <SafeAreaView style={[styles.safeContainer, isDarkMode && styles.darkSafeContainer]}>
      {/* Fixed Header - Tüm ekranlarda */}
      <View style={[styles.fixedHeader, isDarkMode && styles.darkHeader]}>
        {/* Sol: Menu/Geri Butonu */}
        <TouchableOpacity 
          onPress={needsBackButton() ? handleBackPress : () => setSidebarOpen(!sidebarOpen)} 
          style={styles.headerLeftButton}
        >
          <Text style={styles.headerLeftIcon}>
            {needsBackButton() ? '←' : '☰'}
          </Text>
        </TouchableOpacity>

        {/* Orta: Ekran Başlığı */}
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, isDarkMode && styles.darkHeaderTitle]}>
            {getScreenTitle()}
          </Text>
          {currentTab === 'dashboard' && !needsBackButton() && (
            <Text style={[styles.headerSubtitle, isDarkMode && styles.darkHeaderSubtitle]}>
              Dr. {user.firstName} {user.lastName}
            </Text>
          )}
        </View>

        {/* Sağ: İşlem Butonları */}
        <View style={styles.headerRight}>
          {getRightActions()}
        </View>
      </View>

      {/* Overlay Sidebar - Accordion Style */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <TouchableOpacity 
            style={styles.backdrop}
            onPress={() => setSidebarOpen(false)}
            activeOpacity={1}
          />
          
          {/* Accordion Menu */}
          <View style={[styles.accordionMenu, isDarkMode && styles.darkAccordionMenu]}>
            <TouchableOpacity
              style={styles.accordionItem}
              onPress={() => handleTabChange('dashboard')}
            >
              <Text style={styles.accordionIcon}>📊</Text>
              <Text style={[styles.accordionText, isDarkMode && styles.darkAccordionText]}>
                Dashboard
              </Text>
              {currentTab === 'dashboard' && (
                <View style={styles.activeIndicator} />
              )}
            </TouchableOpacity>

            <View style={styles.accordionDivider} />

            <TouchableOpacity
              style={styles.accordionItem}
              onPress={() => handleTabChange('patients')}
            >
              <Text style={styles.accordionIcon}>👥</Text>
              <Text style={[styles.accordionText, isDarkMode && styles.darkAccordionText]}>
                Hastalar
              </Text>
              {currentTab === 'patients' && (
                <View style={styles.activeIndicator} />
              )}
            </TouchableOpacity>

            <View style={styles.accordionDivider} />

            <TouchableOpacity
              style={styles.accordionItem}
              onPress={() => handleTabChange('appointments')}
            >
              <Text style={styles.accordionIcon}>📅</Text>
              <Text style={[styles.accordionText, isDarkMode && styles.darkAccordionText]}>
                Randevular
              </Text>
              {currentTab === 'appointments' && (
                <View style={styles.activeIndicator} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.accordionItem}
              onPress={() => handleTabChange('timeManagement')}
            >
              <Text style={styles.accordionIcon}>🕒</Text>
              <Text style={[styles.accordionText, isDarkMode && styles.darkAccordionText]}>
                Zaman Yönetimi
              </Text>
              {showTimeManagement && (
                <View style={styles.activeIndicator} />
              )}
            </TouchableOpacity>

          </View>
        </>
      )}

      {/* Content Area */}
      <View style={styles.contentArea}>
        {currentTab === 'dashboard' ? (
          <DashboardScreen />
        ) : currentTab === 'patients' ? (
          <PatientListScreen
            patients={patients}
            loading={loading}
            onPatientPress={handlePatientPress}
            onAddPatient={() => setShowAddPatient(true)}
            onUploadMockData={handleUploadMockData}
            onAddAppointment={handleAddAppointmentFromPatient}
            onViewMeasurements={handleViewMeasurements}
            onViewDietPlans={handleViewDietPlans}
            onRefresh={loadPatients}
          />
        ) : currentTab === 'appointments' ? (
          <AppointmentListScreen
            patients={patients}
            user={user}
            onAppointmentPress={handleAppointmentPress}
            onAddAppointment={handleAddAppointmentFromList}
          />
        ) : null}
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  
  // SafeArea - iPhone notch uyumluluğu
  safeContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  darkSafeContainer: {
    backgroundColor: '#0f172a',
  },
  
  // Fixed Header - Tüm ekranlarda sabit
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
    zIndex: 100,
  },
  darkHeader: {
    backgroundColor: '#1e293b',
    borderBottomColor: '#475569',
  },
  
  // Sol Menu/Geri Butonu
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
  
  // Orta Başlık Alanı
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },
  darkHeaderTitle: {
    color: '#f1f5f9',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 2,
  },
  darkHeaderSubtitle: {
    color: '#94a3b8',
  },
  
  // Sağ İşlem Butonları
  headerRight: {
    minWidth: 40,
    alignItems: 'center',
  },
  headerActionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    minWidth: 40,
    alignItems: 'center',
  },
  headerActionIcon: {
    fontSize: 18,
    color: '#667eea',
    fontWeight: '600',
  },
  
  // Overlay Accordion Menu
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 1000,
  },
  
  accordionMenu: {
    position: 'absolute',
    top: 95, // Header'ın altına pozisyon
    left: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1001,
  },
  darkAccordionMenu: {
    backgroundColor: '#1e293b',
  },
  
  accordionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    position: 'relative',
  },
  
  accordionIcon: {
    fontSize: 18,
    marginRight: 12,
    opacity: 0.8,
  },
  
  accordionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  darkAccordionText: {
    color: '#f3f4f6',
  },
  
  accordionDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 16,
  },
  
  activeIndicator: {
    position: 'absolute',
    right: 16,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#667eea',
  },
  
  // Content area - full width
  contentArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  
  // Legacy styles for compatibility
  darkCard: {
    backgroundColor: '#262626',
  },
  
  logoutButton: {
    padding: 12,
    borderRadius: 50,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  logoutIcon: {
    fontSize: 24,
    color: '#dc3545',
  },
  
  userInfo: {
    flex: 1,
  },
  
  viewMeasurementsText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
  },
});


export default DoctorNavigator;