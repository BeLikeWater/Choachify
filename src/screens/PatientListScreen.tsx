import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  TextInput,
  ActivityIndicator,
  Animated,
  RefreshControl,
} from 'react-native';
import { Patient } from '../types';
import { colors, typography, spacing, borderRadius, shadows, cardStyles, buttonStyles, iconSizes } from '../styles/designSystem';

interface PatientListScreenProps {
  patients: Patient[];
  loading?: boolean;
  onPatientPress: (patient: Patient) => void;
  onAddPatient: () => void;
  onUploadMockData?: () => void;
  onAddAppointment?: (patient: Patient) => void;
  onViewMeasurements?: (patient: Patient) => void;
  onViewDietPlans?: (patient: Patient) => void;
  onRefresh?: () => void; // Yenileme fonksiyonu eklendi
}

const PatientListScreen: React.FC<PatientListScreenProps> = ({
  patients,
  loading = false,
  onPatientPress,
  onAddPatient,
  onUploadMockData,
  onAddAppointment,
  onViewMeasurements,
  onViewDietPlans,
  onRefresh,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const searchBarHeight = useRef(new Animated.Value(60)).current;
  const lastScrollY = useRef(0);

  // Pull-to-refresh handler
  const handleRefresh = async () => {
    if (onRefresh) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
    patient.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { text: 'Zayıf', color: '#2196f3' };
    if (bmi < 25) return { text: 'Normal', color: '#4caf50' };
    if (bmi < 30) return { text: 'Fazla Kilolu', color: '#ff9800' };
    return { text: 'Obez', color: '#f44336' };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
  };

  const handleScroll = (event: any) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const direction = currentOffset > lastScrollY.current ? 'down' : 'up';
    const diff = Math.abs(currentOffset - lastScrollY.current);
    
    if (diff > 10) { // Minimum scroll difference to trigger
      if (direction === 'up' && currentOffset > 50) {
        // Scrolling up - hide search bar
        Animated.timing(searchBarHeight, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start();
      } else if (direction === 'down') {
        // Scrolling down - show search bar
        Animated.timing(searchBarHeight, {
          toValue: 60,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
      lastScrollY.current = currentOffset;
    }
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>

      {/* Arama Çubuğu - Animated */}
      <Animated.View style={[styles.searchContainer, { height: searchBarHeight }]}>
        <View style={[styles.searchInputContainer, isDarkMode && styles.darkInputContainer]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, isDarkMode && styles.darkInput]}
            placeholder="Hasta ara..."
            placeholderTextColor={isDarkMode ? '#999' : '#666'}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </Animated.View>


      {/* Mock Data Upload Butonu (sadece geliştirme amaçlı) */}
      {onUploadMockData && patients.length === 0 && !loading && (
        <TouchableOpacity 
          style={[styles.addButton, styles.mockDataButton]}
          onPress={onUploadMockData}
        >
          <Text style={[styles.addButtonText, { color: colors.success }]}>📤 Mock Verileri Yükle</Text>
        </TouchableOpacity>
      )}

      {/* Hasta Listesi */}
      <Animated.ScrollView 
        style={styles.patientList}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#007bff']} // Android
            tintColor="#007bff" // iOS
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={[styles.loadingText, isDarkMode && styles.darkSubtitle]}>
              Hastalar yükleniyor...
            </Text>
          </View>
        ) : filteredPatients.map((patient, index) => {
          try {
            console.log(`Rendering patient ${index}:`, patient);
            
            return (
              <TouchableOpacity
                key={patient?.id || `patient-${index}`}
                style={[styles.patientCard, isDarkMode && styles.darkCard]}
                onPress={() => onPatientPress(patient)}
              >
                <View style={styles.patientHeader}>
                  <Text style={[styles.patientName, isDarkMode && styles.darkText]}>
                    {String(patient?.firstName || 'Ad Yok')} {String(patient?.lastName || 'Soyad Yok')}
                  </Text>
                </View>
                
                <View style={styles.patientInfo}>
                  <Text style={[styles.infoLabel, isDarkMode && styles.darkSubtitle]}>
                    📧 {String(patient?.email || 'Email yok')}
                  </Text>
                  
                  {/* Butonlar */}
                  <View style={styles.actionButtons}>
                    {onAddAppointment && (
                      <TouchableOpacity
                        style={styles.appointmentButton}
                        onPress={() => onAddAppointment(patient)}
                      >
                        <Text style={styles.appointmentButtonText}>
                          📅 Randevu
                        </Text>
                      </TouchableOpacity>
                    )}
                    
                    {onViewMeasurements && (
                      <TouchableOpacity
                        style={styles.measurementButton}
                        onPress={() => onViewMeasurements(patient)}
                      >
                        <Text style={styles.measurementButtonText}>
                          📊 Ölçümler
                        </Text>
                      </TouchableOpacity>
                    )}
                    
                    {onViewDietPlans && (
                      <TouchableOpacity
                        style={styles.dietButton}
                        onPress={() => onViewDietPlans(patient)}
                      >
                        <Text style={styles.dietButtonText}>
                          🥗 Diyet
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          } catch (error) {
            console.error(`Error rendering patient ${index}:`, error);
            return (
              <View key={`error-${index}`} style={styles.patientCard}>
                <Text style={styles.infoLabel}>Hasta render hatası</Text>
              </View>
            );
          }
        })}

        {!loading && filteredPatients.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, isDarkMode && styles.darkSubtitle]}>
              {patients.length === 0 
                ? 'Henüz hasta kaydı yok. Yeni hasta ekleyebilir veya mock verileri yükleyebilirsiniz.'
                : 'Arama kriterlerinize uygun hasta bulunamadı.'
              }
            </Text>
          </View>
        )}
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  darkContainer: {
    backgroundColor: colors.backgroundDark,
  },
  darkText: {
    color: colors.textDark.primary,
  },
  darkSubtitle: {
    color: colors.textDark.secondary,
  },
  
  // Modern search container
  searchContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  searchInputContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...shadows.level1,
  },
  darkInputContainer: {
    backgroundColor: colors.surfaceDark,
    borderColor: colors.outlineDark,
  },
  searchIcon: {
    fontSize: iconSizes.md,
    marginRight: spacing.sm,
    opacity: 0.6,
    color: colors.text.tertiary,
  },
  searchInput: {
    flex: 1,
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  darkInput: {
    color: colors.textDark.primary,
  },
  
  
  // Modern patient list
  patientList: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  
  // Modern patient cards
  patientCard: {
    ...cardStyles.patient,
    backgroundColor: colors.surface,
  },
  darkCard: {
    backgroundColor: colors.surfaceDark,
  },
  
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  patientNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  genderIcon: {
    fontSize: iconSizes.xl,
    marginRight: spacing.sm,
  },
  nameContainer: {
    flex: 1,
  },
  patientName: {
    ...typography.titleMedium,
    color: colors.text.primary,
  },
  patientAge: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  
  // Modern BMI badge
  bmiBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  bmiText: {
    ...typography.labelSmall,
    color: colors.onPrimary,
  },
  
  patientInfo: {
    gap: spacing.xs,
  },
  infoRow: {
    marginBottom: spacing.xs,
  },
  infoLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  
  // Modern divider and date
  dateRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  dateText: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  
  // Empty and loading states
  emptyContainer: {
    padding: spacing.xxxxl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxxl,
  },
  loadingText: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  
  // Mock data button - Apple style soft tint
  mockDataButton: {
    ...buttonStyles.success,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  
  // Apple-style borderless action buttons
  actionButtons: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  appointmentButton: {
    backgroundColor: 'rgba(78, 205, 196, 0.08)',
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  appointmentButtonText: {
    ...typography.buttonMicro,
    color: colors.health,
  },
  measurementButton: {
    backgroundColor: 'rgba(81, 207, 102, 0.08)',
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  measurementButtonText: {
    ...typography.buttonMicro,
    color: colors.success,
  },
  dietButton: {
    backgroundColor: 'rgba(255, 146, 43, 0.08)',
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  dietButtonText: {
    ...typography.buttonMicro,
    color: colors.warning,
  },
  
});

export default PatientListScreen;