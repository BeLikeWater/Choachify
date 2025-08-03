import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Patient, DietPlan } from '../types';
import { DietService } from '../services/dietService';

interface DietDetailScreenProps {
  patient: Patient;
  onBack: () => void;
  onAddDietPlan: (patient: Patient) => void;
  onDietPlanPress: (dietPlan: DietPlan) => void;
}

const DietDetailScreen: React.FC<DietDetailScreenProps> = ({
  patient,
  onBack,
  onAddDietPlan,
  onDietPlanPress,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<7 | 30 | 90>(30);

  useEffect(() => {
    loadDietPlans();
  }, [patient.id, selectedPeriod]);

  const loadDietPlans = async () => {
    try {
      setLoading(true);
      const fetchedDietPlans = await DietService.getRecentDietPlans(patient.id, selectedPeriod);
      setDietPlans(fetchedDietPlans);
    } catch (error) {
      console.error('Diyet planları yüklenemedi:', error);
      Alert.alert('Hata', 'Diyet planları yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getLatestDietPlan = () => {
    if (dietPlans.length === 0) return null;
    return dietPlans.reduce((latest, current) => {
      const latestDate = new Date(latest.date);
      const currentDate = new Date(current.date);
      return currentDate > latestDate ? current : latest;
    });
  };

  const periods = [
    { value: 7, label: '7 Gün' },
    { value: 30, label: '30 Gün' },
    { value: 90, label: '90 Gün' },
  ];

  const mealIcons = {
    breakfast: '🍳',
    snack1: '☕',
    lunch: '🍽️',
    snack2: '🍵',
    dinner: '🥗',
    nightSnack: '🌙',
  };

  const latestDietPlan = getLatestDietPlan();

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Geri</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.title, isDarkMode && styles.darkText]}>
            🥗 Diyet Takibi
          </Text>
          <Text style={[styles.subtitle, isDarkMode && styles.darkSubtitle]}>
            {patient.firstName} {patient.lastName}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => onAddDietPlan(patient)}
        >
          <Text style={styles.addButtonText}>+ Ekle</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#28a745" />
          <Text style={[styles.loadingText, isDarkMode && styles.darkSubtitle]}>
            Diyet planları yükleniyor...
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Period Selector */}
          <View style={styles.periodSelector}>
            {periods.map((period) => (
              <TouchableOpacity
                key={period.value}
                style={[
                  styles.periodButton,
                  selectedPeriod === period.value && styles.activePeriodButton,
                  isDarkMode && styles.darkPeriodButton,
                  selectedPeriod === period.value && isDarkMode && styles.darkActivePeriodButton,
                ]}
                onPress={() => setSelectedPeriod(period.value as 7 | 30 | 90)}
              >
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === period.value && styles.activePeriodButtonText,
                  isDarkMode && styles.darkText,
                ]}>
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {dietPlans.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, isDarkMode && styles.darkSubtitle]}>
                Henüz diyet planı yok. Yeni plan ekleyebilirsiniz.
              </Text>
            </View>
          ) : (
            <>
              {/* Latest Diet Plan Summary */}
              {latestDietPlan && (
                <View style={[styles.summaryCard, isDarkMode && styles.darkCard]}>
                  <Text style={[styles.summaryTitle, isDarkMode && styles.darkText]}>
                    Son Diyet Planı
                  </Text>
                  <Text style={[styles.summaryDate, isDarkMode && styles.darkSubtitle]}>
                    {formatDate(latestDietPlan.date)}
                  </Text>
                  <Text style={[styles.planTitle, isDarkMode && styles.darkText]}>
                    {latestDietPlan.title}
                  </Text>
                  
                  <View style={styles.summaryInfo}>
                    <View style={styles.summaryItem}>
                      <Text style={[styles.summaryLabel, isDarkMode && styles.darkSubtitle]}>Su Hedefi</Text>
                      <Text style={[styles.summaryValue, isDarkMode && styles.darkText]}>
                        {latestDietPlan.waterTarget} ml
                      </Text>
                    </View>
                    
                    <View style={styles.summaryItem}>
                      <Text style={[styles.summaryLabel, isDarkMode && styles.darkSubtitle]}>Hazırlayan</Text>
                      <Text style={[styles.summaryValue, isDarkMode && styles.darkText]}>
                        {latestDietPlan.createdBy}
                      </Text>
                    </View>
                  </View>

                  {latestDietPlan.exerciseRecommendation && (
                    <View style={styles.exerciseInfo}>
                      <Text style={[styles.exerciseLabel, isDarkMode && styles.darkSubtitle]}>
                        🏃‍♂️ Egzersiz Önerisi
                      </Text>
                      <Text style={[styles.exerciseText, isDarkMode && styles.darkText]}>
                        {latestDietPlan.exerciseRecommendation}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Diet Plans List */}
              <View style={[styles.listCard, isDarkMode && styles.darkCard]}>
                <Text style={[styles.listTitle, isDarkMode && styles.darkText]}>
                  📋 Diyet Planları
                </Text>
                {dietPlans.slice(0, 10).map((dietPlan, index) => (
                  <TouchableOpacity
                    key={dietPlan.id}
                    style={[styles.dietPlanItem, isDarkMode && styles.darkDietPlanItem]}
                    onPress={() => {
                      console.log('🔥 DIET PLAN PRESSED - Title:', dietPlan.title);
                      console.log('🔥 DIET PLAN PRESSED - ID:', dietPlan.id);
                      console.log('🔥 CALLING onDietPlanPress...');
                      onDietPlanPress(dietPlan);
                      console.log('🔥 onDietPlanPress CALLED');
                    }}
                    activeOpacity={0.7}
                    underlayColor={isDarkMode ? '#444' : '#f0f0f0'}
                  >
                    <View style={styles.dietPlanHeader}>
                      <Text style={[styles.dietPlanDate, isDarkMode && styles.darkText]}>
                        {formatDate(dietPlan.date)}
                      </Text>
                      <Text style={[styles.dietPlanCreatedBy, isDarkMode && styles.darkSubtitle]}>
                        {dietPlan.createdBy}
                      </Text>
                    </View>
                    
                    <Text style={[styles.dietPlanTitle, isDarkMode && styles.darkText]}>
                      {dietPlan.title}
                    </Text>

                    <View style={styles.dietPlanInfo}>
                      <Text style={[styles.waterTarget, isDarkMode && styles.darkSubtitle]}>
                        💧 {dietPlan.waterTarget} ml su
                      </Text>
                      {dietPlan.supplements && dietPlan.supplements.length > 0 && (
                        <Text style={[styles.supplements, isDarkMode && styles.darkSubtitle]}>
                          💊 {dietPlan.supplements.join(', ')}
                        </Text>
                      )}
                    </View>

                    {dietPlan.generalNotes && (
                      <Text style={[styles.generalNotes, isDarkMode && styles.darkSubtitle]}>
                        💭 {dietPlan.generalNotes}
                      </Text>
                    )}
                    
                    <View style={styles.tapIndicator}>
                      <Text style={[styles.tapText, isDarkMode && styles.darkSubtitle]}>
                        👆 Detayları görmek için tıklayın
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      )}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 12,
    minWidth: 60,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#28a745',
    fontWeight: '600',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 60,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  darkText: {
    color: '#ffffff',
  },
  darkSubtitle: {
    color: '#adb5bd',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  darkPeriodButton: {
    backgroundColor: '#2d2d2d',
    borderColor: '#444',
  },
  activePeriodButton: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  darkActivePeriodButton: {
    backgroundColor: '#198754',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '600',
  },
  activePeriodButtonText: {
    color: '#ffffff',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkCard: {
    backgroundColor: '#2d2d2d',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  summaryDate: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
  },
  summaryInfo: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  exerciseInfo: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
  },
  exerciseLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  exerciseText: {
    fontSize: 14,
    color: '#212529',
  },
  listCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 16,
  },
  dietPlanItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    paddingVertical: 16,
    paddingHorizontal: 4,
    minHeight: 60,
    zIndex: 1,
  },
  darkDietPlanItem: {
    borderBottomColor: '#444',
  },
  dietPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dietPlanDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
  },
  dietPlanCreatedBy: {
    fontSize: 12,
    color: '#6c757d',
  },
  dietPlanTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 12,
  },
  mealsPreview: {
    marginBottom: 12,
  },
  mealPreview: {
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
    minWidth: 70,
  },
  darkMealPreview: {
    backgroundColor: '#3d3d3d',
  },
  mealIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  mealName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#212529',
    textAlign: 'center',
    marginBottom: 2,
  },
  mealItemCount: {
    fontSize: 9,
    color: '#6c757d',
    textAlign: 'center',
  },
  dietPlanInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  waterTarget: {
    fontSize: 12,
    color: '#6c757d',
  },
  supplements: {
    fontSize: 12,
    color: '#6c757d',
    flex: 1,
  },
  generalNotes: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  tapIndicator: {
    marginTop: 8,
    alignItems: 'center',
  },
  tapText: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default DietDetailScreen;