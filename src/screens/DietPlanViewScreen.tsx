import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  SafeAreaView,
} from 'react-native';
import { DietPlan } from '../types';

interface DietPlanViewScreenProps {
  dietPlan: DietPlan;
  onBack: () => void;
  onEdit?: () => void;
}

const DietPlanViewScreen: React.FC<DietPlanViewScreenProps> = ({
  dietPlan,
  onBack,
  onEdit,
}) => {
  const isDarkMode = useColorScheme() === 'dark';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const mealSections = [
    { key: 'breakfast', icon: '🍳', name: 'Kahvaltı' },
    { key: 'snack1', icon: '☕', name: 'Ara Öğün 1' },
    { key: 'lunch', icon: '🍽️', name: 'Öğle Yemeği' },
    { key: 'snack2', icon: '🍵', name: 'Ara Öğün 2' },
    { key: 'dinner', icon: '🥗', name: 'Akşam Yemeği' },
    { key: 'nightSnack', icon: '🌙', name: 'Gece Öğünü' },
  ];

  return (
    <SafeAreaView style={[styles.safeContainer, isDarkMode && styles.darkSafeContainer]}>
      {/* Fixed Header */}
      <View style={[styles.fixedHeader, isDarkMode && styles.darkHeader]}>
        <TouchableOpacity onPress={onBack} style={styles.headerLeftButton}>
          <Text style={styles.headerLeftIcon}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, isDarkMode && styles.darkHeaderTitle]}>
            Diyet Planı
          </Text>
          <Text style={[styles.headerSubtitle, isDarkMode && styles.darkHeaderSubtitle]}>
            {formatDate(dietPlan.date)}
          </Text>
        </View>
        
        <View style={styles.headerRight} />
      </View>

      <View style={[styles.container, isDarkMode && styles.darkContainer]}>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Plan Info Header */}
        <View style={[styles.planInfoCard, isDarkMode && styles.darkCard]}>
          <Text style={[styles.planTitle, isDarkMode && styles.darkText]}>
            {dietPlan.title}
          </Text>
          
          <View style={styles.planMetaInfo}>
            <View style={styles.metaItem}>
              <Text style={[styles.metaLabel, isDarkMode && styles.darkSubtitle]}>Hasta</Text>
              <Text style={[styles.metaValue, isDarkMode && styles.darkText]}>
                {dietPlan.patientName}
              </Text>
            </View>
            
            <View style={styles.metaItem}>
              <Text style={[styles.metaLabel, isDarkMode && styles.darkSubtitle]}>Su Hedefi</Text>
              <Text style={[styles.metaValue, isDarkMode && styles.darkText]}>
                💧 {dietPlan.waterTarget} ml
              </Text>
            </View>
            
            <View style={styles.metaItem}>
              <Text style={[styles.metaLabel, isDarkMode && styles.darkSubtitle]}>Hazırlayan</Text>
              <Text style={[styles.metaValue, isDarkMode && styles.darkText]}>
                👨‍⚕️ {dietPlan.createdBy}
              </Text>
            </View>
          </View>
        </View>

        {/* Meals */}
        {mealSections.map((section) => {
          const meal = dietPlan[section.key];
          if (!meal || !meal.items || meal.items.length === 0) return null;

          return (
            <View key={section.key} style={[styles.mealCard, isDarkMode && styles.darkCard]}>
              <Text style={[styles.mealTitle, isDarkMode && styles.darkText]}>
                {section.icon} {section.name}
              </Text>
              
              <View style={styles.mealContent}>
                {meal.items.map((item, index) => (
                  <View key={index} style={styles.mealItem}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={[styles.mealItemText, isDarkMode && styles.darkText]}>
                      {item}
                    </Text>
                  </View>
                ))}
                
                {meal.notes && (
                  <View style={styles.mealNotes}>
                    <Text style={[styles.mealNotesLabel, isDarkMode && styles.darkSubtitle]}>
                      📝 Not:
                    </Text>
                    <Text style={[styles.mealNotesText, isDarkMode && styles.darkSubtitle]}>
                      {meal.notes}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}

        {/* Exercise Recommendation */}
        {dietPlan.exerciseRecommendation && (
          <View style={[styles.exerciseCard, isDarkMode && styles.darkCard]}>
            <Text style={[styles.exerciseTitle, isDarkMode && styles.darkText]}>
              🏃‍♂️ Egzersiz Önerisi
            </Text>
            <Text style={[styles.exerciseText, isDarkMode && styles.darkText]}>
              {dietPlan.exerciseRecommendation}
            </Text>
          </View>
        )}

        {/* Supplements */}
        {dietPlan.supplements && dietPlan.supplements.length > 0 && (
          <View style={[styles.supplementsCard, isDarkMode && styles.darkCard]}>
            <Text style={[styles.supplementsTitle, isDarkMode && styles.darkText]}>
              💊 Günlük Takviyeler
            </Text>
            <View style={styles.supplementsList}>
              {dietPlan.supplements.map((supplement, index) => (
                <View key={index} style={styles.supplementItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={[styles.supplementText, isDarkMode && styles.darkText]}>
                    {supplement}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* General Notes */}
        {dietPlan.generalNotes && (
          <View style={[styles.notesCard, isDarkMode && styles.darkCard]}>
            <Text style={[styles.notesTitle, isDarkMode && styles.darkText]}>
              📌 Genel Notlar
            </Text>
            <Text style={[styles.notesText, isDarkMode && styles.darkText]}>
              {dietPlan.generalNotes}
            </Text>
          </View>
        )}

        {/* Plan Creation Info */}
        <View style={[styles.creationInfoCard, isDarkMode && styles.darkCard]}>
          <Text style={[styles.creationInfoTitle, isDarkMode && styles.darkSubtitle]}>
            Plan Bilgileri
          </Text>
          <Text style={[styles.creationInfoText, isDarkMode && styles.darkSubtitle]}>
            Oluşturma: {dietPlan.createdAt}
          </Text>
          <Text style={[styles.creationInfoText, isDarkMode && styles.darkSubtitle]}>
            Son güncelleme: {dietPlan.updatedAt}
          </Text>
        </View>
      </ScrollView>
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
  
  headerRight: {
    minWidth: 40,
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
  content: {
    flex: 1,
    padding: 20,
  },
  planInfoCard: {
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
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 16,
    textAlign: 'center',
  },
  planMetaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flex: 1,
    minWidth: 100,
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212529',
    textAlign: 'center',
  },
  mealCard: {
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
  mealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    paddingBottom: 8,
  },
  mealContent: {
    gap: 8,
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#fd7e14',
    fontWeight: 'bold',
    marginTop: 2,
  },
  mealItemText: {
    fontSize: 16,
    color: '#212529',
    flex: 1,
    lineHeight: 22,
  },
  mealNotes: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  mealNotesLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  mealNotesText: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  exerciseCard: {
    backgroundColor: '#d4edda',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#c3e6cb',
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#155724',
    marginBottom: 8,
  },
  exerciseText: {
    fontSize: 14,
    color: '#155724',
    lineHeight: 20,
  },
  supplementsCard: {
    backgroundColor: '#d1ecf1',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bee5eb',
  },
  supplementsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0c5460',
    marginBottom: 12,
  },
  supplementsList: {
    gap: 6,
  },
  supplementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  supplementText: {
    fontSize: 14,
    color: '#0c5460',
    flex: 1,
  },
  notesCard: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  creationInfoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  creationInfoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6c757d',
    marginBottom: 8,
  },
  creationInfoText: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2,
  },
});

export default DietPlanViewScreen;