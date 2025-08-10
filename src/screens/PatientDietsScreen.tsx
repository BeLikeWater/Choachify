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
  RefreshControl,
} from 'react-native';
import { User, DietPlan } from '../types';
import { DietService } from '../services/dietService';
import DietPlanViewScreen from './DietPlanViewScreen';
import { fixDietPlansEmail, debugDietPlansForEmail } from '../utils/fixDietPlansEmail';

interface PatientDietsScreenProps {
  user: User;
}

const PatientDietsScreen: React.FC<PatientDietsScreenProps> = ({ user }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDietPlan, setSelectedDietPlan] = useState<DietPlan | null>(null);

  useEffect(() => {
    loadDietPlans();
  }, []);

  const loadDietPlans = async () => {
    try {
      console.log('🔍 Loading diet plans for user email:', user.email);
      console.log('🔍 Loading diet plans for user ID:', user.id);
      
      // Direkt email ile ara
      const plans = await DietService.getDietPlansByEmail(user.email);
      console.log('📋 Found diet plans by email:', plans.length);
      
      // Eğer email ile bulunamadıyorsa user ID ile de dene
      if (plans.length === 0) {
        console.log('🔄 No plans found by email, trying with user ID...');
        const plansByUserId = await DietService.getDietPlansByPatientId(user.id);
        console.log('📋 Found diet plans by user ID:', plansByUserId.length);
        setDietPlans(plansByUserId.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      } else {
        setDietPlans(plans.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }
      
    } catch (error) {
      console.error('Diyet planları yüklenemedi:', error);
      Alert.alert('Hata', 'Diyet planları yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDietPlans();
    setRefreshing(false);
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

  const getDietPlanStatus = (dateString: string) => {
    const planDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    planDate.setHours(0, 0, 0, 0);
    
    if (planDate.getTime() === today.getTime()) {
      return { text: 'Bugün', color: '#28a745', bgColor: '#d4edda' };
    } else if (planDate.getTime() > today.getTime()) {
      return { text: 'Gelecek', color: '#007bff', bgColor: '#d1ecf1' };
    } else {
      return { text: 'Geçmiş', color: '#6c757d', bgColor: '#e9ecef' };
    }
  };

  const getMealCount = (dietPlan: DietPlan) => {
    let count = 0;
    const meals = ['breakfast', 'snack1', 'lunch', 'snack2', 'dinner', 'nightSnack'];
    meals.forEach(mealKey => {
      const meal = dietPlan[mealKey];
      if (meal && meal.items && meal.items.length > 0) {
        count++;
      }
    });
    return count;
  };

  if (selectedDietPlan) {
    return (
      <DietPlanViewScreen
        dietPlan={selectedDietPlan}
        onBack={() => setSelectedDietPlan(null)}
      />
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={[styles.loadingText, isDarkMode && styles.darkSubtitle]}>
            Diyet planları yükleniyor...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      {dietPlans.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={[styles.emptyIcon, isDarkMode && styles.darkText]}>🥗</Text>
          <Text style={[styles.emptyTitle, isDarkMode && styles.darkText]}>
            Henüz Diyet Planınız Yok
          </Text>
          <Text style={[styles.emptyText, isDarkMode && styles.darkSubtitle]}>
            Doktorunuz size özel diyet planı hazırladığında burada görüntüleyebileceksiniz.
          </Text>
          <Text style={[styles.emptyHint, isDarkMode && styles.darkSubtitle]}>
            ↓ Yenilemek için aşağı çekin
          </Text>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, isDarkMode && styles.darkText]}>
              🥗 Diyet Planlarım
            </Text>
            <Text style={[styles.subtitle, isDarkMode && styles.darkSubtitle]}>
              Toplam {dietPlans.length} plan
            </Text>
          </View>

          {/* Diet Plans List */}
          <View style={styles.plansList}>
            {dietPlans.map((plan) => {
              const status = getDietPlanStatus(plan.date);
              const mealCount = getMealCount(plan);
              
              return (
                <TouchableOpacity
                  key={plan.id}
                  style={[styles.planCard, isDarkMode && styles.darkCard]}
                  onPress={() => setSelectedDietPlan(plan)}
                  activeOpacity={0.7}
                >
                  {/* Plan Header */}
                  <View style={styles.planHeader}>
                    <View style={styles.planInfo}>
                      <Text style={[styles.planTitle, isDarkMode && styles.darkText]}>
                        {plan.title}
                      </Text>
                      <Text style={[styles.planDate, isDarkMode && styles.darkSubtitle]}>
                        {formatDate(plan.date)}
                      </Text>
                    </View>
                    
                    <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
                      <Text style={[styles.statusText, { color: status.color }]}>
                        {status.text}
                      </Text>
                    </View>
                  </View>

                  {/* Plan Summary */}
                  <View style={styles.planSummary}>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryIcon}>🍽️</Text>
                      <Text style={[styles.summaryText, isDarkMode && styles.darkSubtitle]}>
                        {mealCount} öğün
                      </Text>
                    </View>
                    
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryIcon}>💧</Text>
                      <Text style={[styles.summaryText, isDarkMode && styles.darkSubtitle]}>
                        {plan.waterTarget} ml su
                      </Text>
                    </View>
                    
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryIcon}>👨‍⚕️</Text>
                      <Text style={[styles.summaryText, isDarkMode && styles.darkSubtitle]}>
                        {plan.createdBy}
                      </Text>
                    </View>
                  </View>

                  {/* Exercise Recommendation Preview */}
                  {plan.exerciseRecommendation && (
                    <View style={styles.exercisePreview}>
                      <Text style={styles.exerciseIcon}>🏃‍♂️</Text>
                      <Text 
                        style={[styles.exerciseText, isDarkMode && styles.darkSubtitle]}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                      >
                        {plan.exerciseRecommendation}
                      </Text>
                    </View>
                  )}

                  {/* View Button */}
                  <View style={styles.viewButton}>
                    <Text style={styles.viewButtonText}>Detayları Gör →</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Info Card */}
          <View style={[styles.infoCard, isDarkMode && styles.darkCard]}>
            <Text style={styles.infoIcon}>💡</Text>
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, isDarkMode && styles.darkText]}>
                Diyet Planı Takibi
              </Text>
              <Text style={[styles.infoText, isDarkMode && styles.darkSubtitle]}>
                Planlarınızı düzenli takip ederek hedeflerinize ulaşın. Her plan, doktorunuz tarafından size özel hazırlanmıştır.
              </Text>
            </View>
          </View>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  emptyHint: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  darkText: {
    color: '#ffffff',
  },
  darkSubtitle: {
    color: '#adb5bd',
  },
  plansList: {
    gap: 16,
    marginBottom: 20,
  },
  planCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f8f9fa',
  },
  darkCard: {
    backgroundColor: '#2d2d2d',
    borderColor: '#444',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planInfo: {
    flex: 1,
    marginRight: 12,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  planDate: {
    fontSize: 14,
    color: '#6c757d',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  planSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  summaryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  summaryText: {
    fontSize: 12,
    color: '#6c757d',
  },
  exercisePreview: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  exerciseIcon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  exerciseText: {
    flex: 1,
    fontSize: 13,
    color: '#6c757d',
    lineHeight: 18,
  },
  viewButton: {
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f8f9fa',
  },
  viewButtonText: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e3f2fd',
    backgroundColor: '#e3f2fd',
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
});

export default PatientDietsScreen;