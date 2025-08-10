import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  TextInput,
  Animated,
  RefreshControl,
} from 'react-native';
import { Patient, DietPlan } from '../types';
import { DietService } from '../services/dietService';
import { colors, typography, spacing, borderRadius, shadows, buttonStyles, iconSizes } from '../styles/designSystem';

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
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<7 | 30 | 90>(30);
  
  // Animated search bar
  const searchBarHeight = useRef(new Animated.Value(60)).current;
  const lastScrollY = useRef(0);

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
  
  // Pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadDietPlans();
    setRefreshing(false);
  };
  
  // Scroll handler for search bar animation
  const handleScroll = (event: any) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const direction = currentOffset > lastScrollY.current ? 'down' : 'up';
    const diff = Math.abs(currentOffset - lastScrollY.current);
    
    if (diff > 10) {
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
  
  // Search filtering
  const filteredDietPlans = dietPlans.filter(plan =>
    plan.title.toLowerCase().includes(searchText.toLowerCase()) ||
    plan.generalNotes?.toLowerCase().includes(searchText.toLowerCase()) ||
    plan.createdBy.toLowerCase().includes(searchText.toLowerCase())
  );

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
    <SafeAreaView style={[styles.safeContainer, isDarkMode && styles.darkSafeContainer]}>
      {/* Fixed Header */}
      <View style={[styles.fixedHeader, isDarkMode && styles.darkHeader]}>
        <TouchableOpacity onPress={onBack} style={styles.headerLeftButton}>
          <Text style={styles.headerLeftIcon}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, isDarkMode && styles.darkHeaderTitle]}>
            Diyet Planları
          </Text>
          <Text style={[styles.headerSubtitle, isDarkMode && styles.darkHeaderSubtitle]}>
            {patient.firstName} {patient.lastName}
          </Text>
        </View>
        
        <TouchableOpacity onPress={() => onAddDietPlan(patient)} style={styles.headerRightButton}>
          <Text style={styles.headerRightIcon}>➕</Text>
        </TouchableOpacity>
      </View>
      
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>

        {/* Modern Tab Bar */}
        <View style={[styles.tabContainer, isDarkMode && styles.darkTabContainer]}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.value}
              style={[
                styles.tabButton,
                selectedPeriod === period.value && styles.tabButtonActive,
                isDarkMode && styles.darkTabButton,
                selectedPeriod === period.value && isDarkMode && styles.darkTabButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period.value as 7 | 30 | 90)}
            >
              <Text style={[
                styles.tabButtonText,
                selectedPeriod === period.value && styles.tabButtonTextActive,
                isDarkMode && styles.darkTabButtonText,
                selectedPeriod === period.value && isDarkMode && styles.darkTabButtonTextActive,
              ]}>
                📊 {period.label} ({filteredDietPlans.length})
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Animated Search Bar */}
        <Animated.View style={[styles.searchContainer, { height: searchBarHeight }]}>
          <View style={[styles.searchInputContainer, isDarkMode && styles.darkInputContainer]}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={[styles.searchInput, isDarkMode && styles.darkInput]}
              placeholder="Diyet planı ara..."
              placeholderTextColor={isDarkMode ? '#999' : '#666'}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </Animated.View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, isDarkMode && styles.darkSubtitle]}>
            Diyet planları yükleniyor...
          </Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.content} 
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
              title="Yenileniyor..."
              titleColor={isDarkMode ? colors.textDark.secondary : colors.text.secondary}
            />
          }
        >

          {filteredDietPlans.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, isDarkMode && styles.darkSubtitle]}>
                Henüz diyet planı yok. Yeni plan ekleyebilirsiniz.
              </Text>
            </View>
          ) : (
            <>
              {/* Latest Diet Plan Summary */}
              {/* Diet Plans List - Modern Cards */}
              {filteredDietPlans.slice(0, 10).map((dietPlan, index) => (
                <TouchableOpacity
                  key={dietPlan.id}
                  style={[styles.modernCard, isDarkMode && styles.darkCard]}
                  onPress={() => {
                    console.log('🔥 DIET PLAN PRESSED - Title:', dietPlan.title);
                    console.log('🔥 DIET PLAN PRESSED - ID:', dietPlan.id);
                    console.log('🔥 CALLING onDietPlanPress...');
                    onDietPlanPress(dietPlan);
                    console.log('🔥 onDietPlanPress CALLED');
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardTitleRow}>
                      <Text style={styles.cardIcon}>🥗</Text>
                      <View style={styles.titleContainer}>
                        <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>
                          {dietPlan.title}
                        </Text>
                        <Text style={[styles.cardDate, isDarkMode && styles.darkSubtitle]}>
                          {formatDate(dietPlan.date)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.cardInfo}>
                    <View style={styles.infoRow}>
                      <Text style={[styles.infoItem, isDarkMode && styles.darkSubtitle]}>
                        💧 {dietPlan.waterTarget} ml su
                      </Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                      <Text style={[styles.infoItem, isDarkMode && styles.darkSubtitle]}>
                        👨‍⚕️ {dietPlan.createdBy}
                      </Text>
                    </View>

                    {dietPlan.supplements && dietPlan.supplements.length > 0 && (
                      <View style={styles.infoRow}>
                        <Text style={[styles.infoItem, isDarkMode && styles.darkSubtitle]}>
                          💊 {dietPlan.supplements.join(', ')}
                        </Text>
                      </View>
                    )}

                    {dietPlan.generalNotes && (
                      <View style={styles.infoRow}>
                        <Text style={[styles.infoItem, isDarkMode && styles.darkSubtitle]}>
                          💭 {dietPlan.generalNotes}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>
      )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // SafeArea
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  darkSafeContainer: {
    backgroundColor: colors.backgroundDark,
  },
  
  // Fixed Header
  fixedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    ...shadows.level1,
  },
  darkHeader: {
    backgroundColor: colors.surfaceDark,
    borderBottomColor: colors.outlineDark,
  },
  
  headerLeftButton: {
    ...buttonStyles.icon,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  headerLeftIcon: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: '600',
  },
  
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    ...typography.titleMedium,
    color: colors.text.primary,
  },
  darkHeaderTitle: {
    color: colors.textDark.primary,
  },
  headerSubtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: 2,
  },
  darkHeaderSubtitle: {
    color: colors.textDark.secondary,
  },
  
  headerRightButton: {
    ...buttonStyles.icon,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  headerRightIcon: {
    fontSize: 18,
    color: colors.success,
    fontWeight: '600',
  },
  
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
  // Modern Tab Bar
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    borderRadius: borderRadius.xl,
    padding: spacing.xs,
    ...shadows.level1,
  },
  darkTabContainer: {
    backgroundColor: colors.surfaceDark,
  },

  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  darkTabButton: {
    backgroundColor: 'transparent',
  },
  darkTabButtonActive: {
    backgroundColor: colors.primary,
  },

  tabButtonText: {
    ...typography.labelMedium,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  tabButtonTextActive: {
    color: colors.onPrimary,
    fontWeight: '600',
  },
  darkTabButtonText: {
    color: colors.textDark.secondary,
  },
  darkTabButtonTextActive: {
    color: colors.onPrimary,
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
  
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  // Modern Cards
  modernCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.level2,
  },
  darkCard: {
    backgroundColor: colors.surfaceDark,
  },
  
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  cardIcon: {
    fontSize: iconSizes.xl,
    marginRight: spacing.sm,
  },
  
  titleContainer: {
    flex: 1,
  },
  
  cardTitle: {
    ...typography.titleMedium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  
  cardDate: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  
  cardInfo: {
    gap: spacing.xs,
  },
  
  infoRow: {
    marginBottom: spacing.xs,
  },
  
  infoItem: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  // Loading and Empty States
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
});

export default DietDetailScreen;