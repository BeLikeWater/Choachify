import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Alert,
  SafeAreaView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { colors, typography, spacing, borderRadius, shadows, buttonStyles } from '../styles/designSystem';

interface TimeManagementScreenProps {
  user: User;
  onBack: () => void;
}

const TimeManagementScreen: React.FC<TimeManagementScreenProps> = ({
  user,
  onBack,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [disabledSlots, setDisabledSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Zaman slotları oluştur
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 18) slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Tarih seçenekleri oluştur (gelecek 30 gün)
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('tr-TR', { weekday: 'short' });
      const dayMonth = date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
      dates.push({
        value: dateStr,
        label: `${dayName} ${dayMonth}`,
        isToday: i === 0
      });
    }
    return dates;
  };

  const dateOptions = generateDates();

  // Kapalı slotları yükle
  const loadDisabledSlots = async () => {
    try {
      const key = `disabled_slots_${user.id}_${selectedDate}`;
      const saved = await AsyncStorage.getItem(key);
      const slots = saved ? JSON.parse(saved) : [];
      setDisabledSlots(slots);
    } catch (error) {
      console.error('Kapalı slotlar yüklenirken hata:', error);
    }
  };

  // Kapalı slotları kaydet
  const saveDisabledSlots = async (slots: string[]) => {
    try {
      const key = `disabled_slots_${user.id}_${selectedDate}`;
      await AsyncStorage.setItem(key, JSON.stringify(slots));
      setDisabledSlots(slots);
    } catch (error) {
      console.error('Kapalı slotlar kaydedilirken hata:', error);
      Alert.alert('Hata', 'Ayarlar kaydedilirken bir hata oluştu.');
    }
  };

  // Slot durumunu değiştir
  const toggleSlotStatus = async (slot: string) => {
    const newDisabledSlots = [...disabledSlots];
    const index = newDisabledSlots.indexOf(slot);
    
    if (index > -1) {
      // Slot kapalı, aç
      newDisabledSlots.splice(index, 1);
    } else {
      // Slot açık, kapat
      newDisabledSlots.push(slot);
    }
    
    await saveDisabledSlots(newDisabledSlots);
  };

  // Tüm slotları aç
  const enableAllSlots = () => {
    Alert.alert(
      'Tüm Slotları Aç',
      'Bu tarihteki tüm zaman slotları açılsın mı?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Evet', onPress: async () => await saveDisabledSlots([]) }
      ]
    );
  };

  // Tüm slotları kapat
  const disableAllSlots = () => {
    Alert.alert(
      'Tüm Slotları Kapat',
      'Bu tarihteki tüm zaman slotları kapatılsın mı?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Evet', onPress: async () => await saveDisabledSlots([...timeSlots]) }
      ]
    );
  };

  useEffect(() => {
    loadDisabledSlots();
  }, [selectedDate]);

  return (
    <SafeAreaView style={[styles.safeContainer, isDarkMode && styles.darkSafeContainer]}>
      {/* Fixed Header */}
      <View style={[styles.fixedHeader, isDarkMode && styles.darkHeader]}>
        <TouchableOpacity onPress={onBack} style={styles.headerLeftButton}>
          <Text style={styles.headerLeftIcon}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, isDarkMode && styles.darkHeaderTitle]}>
            Zaman Yönetimi
          </Text>
          <Text style={[styles.headerSubtitle, isDarkMode && styles.darkHeaderSubtitle]}>
            Çalışma saatlerinizi ayarlayın
          </Text>
        </View>
        
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Tarih Seçimi */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            📅 Tarih Seçin
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
            {dateOptions.map((date) => (
              <TouchableOpacity
                key={date.value}
                style={[
                  styles.dateCard,
                  isDarkMode && styles.darkCard,
                  selectedDate === date.value && styles.selectedDateCard,
                  date.isToday && styles.todayDateCard,
                ]}
                onPress={() => setSelectedDate(date.value)}
              >
                <Text style={[
                  styles.dateCardText,
                  isDarkMode && styles.darkText,
                  selectedDate === date.value && styles.selectedDateText,
                  date.isToday && styles.todayDateText,
                ]}>
                  {date.label}
                </Text>
                {date.isToday && (
                  <Text style={styles.todayLabel}>Bugün</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Hızlı İşlemler */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            ⚡ Hızlı İşlemler
          </Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={[styles.quickActionButton, styles.enableAllButton]}
              onPress={enableAllSlots}
            >
              <Text style={styles.quickActionIcon}>✅</Text>
              <Text style={styles.quickActionText}>Tümünü Aç</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickActionButton, styles.disableAllButton]}
              onPress={disableAllSlots}
            >
              <Text style={styles.quickActionIcon}>❌</Text>
              <Text style={styles.quickActionText}>Tümünü Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Zaman Slotları */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            🕒 Çalışma Saatleri
          </Text>
          <Text style={[styles.sectionSubtitle, isDarkMode && styles.darkSubtitle]}>
            Kapalı slotlarda randevu alınamaz. Toplam {disabledSlots.length} slot kapalı.
          </Text>
          
          <View style={styles.slotsGrid}>
            {timeSlots.map((slot) => {
              const isDisabled = disabledSlots.includes(slot);
              
              return (
                <TouchableOpacity
                  key={slot}
                  style={[
                    styles.slotButton,
                    isDarkMode && styles.darkSlotButton,
                    isDisabled && styles.disabledSlotButton,
                  ]}
                  onPress={() => toggleSlotStatus(slot)}
                >
                  <Text style={[
                    styles.slotTime,
                    isDarkMode && styles.darkText,
                    isDisabled && styles.disabledSlotText,
                  ]}>
                    {slot}
                  </Text>
                  <Text style={[
                    styles.slotStatus,
                    isDisabled ? styles.closedStatus : styles.openStatus,
                  ]}>
                    {isDisabled ? 'Kapalı' : 'Açık'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Bilgi */}
        <View style={[styles.infoSection, isDarkMode && styles.darkCard]}>
          <Text style={styles.infoIcon}>💡</Text>
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, isDarkMode && styles.darkText]}>
              Nasıl Çalışır?
            </Text>
            <Text style={[styles.infoText, isDarkMode && styles.darkSubtitle]}>
              • Yeşil slotlar: Randevu alınabilir{'\n'}
              • Kırmızı slotlar: Randevu alınamaz{'\n'}
              • Her slot 30 dakikalık zaman dilimini temsil eder{'\n'}
              • Ayarlar otomatik olarak kaydedilir
            </Text>
          </View>
        </View>
      </ScrollView>
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
  
  headerRight: {
    minWidth: 40,
  },

  // Container
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Sections
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.titleMedium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  sectionSubtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  darkText: {
    color: colors.textDark.primary,
  },
  darkSubtitle: {
    color: colors.textDark.secondary,
  },
  
  // Date Selection
  dateScroll: {
    marginTop: spacing.sm,
  },
  dateCard: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    ...shadows.level1,
  },
  darkCard: {
    backgroundColor: colors.surfaceDark,
    borderColor: colors.outlineDark,
  },
  selectedDateCard: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary,
  },
  todayDateCard: {
    borderColor: colors.accent,
  },
  dateCardText: {
    ...typography.labelMedium,
    color: colors.text.primary,
    fontWeight: '500',
  },
  selectedDateText: {
    color: colors.primary,
    fontWeight: '600',
  },
  todayDateText: {
    color: colors.accent,
  },
  todayLabel: {
    ...typography.labelSmall,
    color: colors.accent,
    marginTop: 2,
    fontWeight: '600',
  },
  
  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  enableAllButton: {
    backgroundColor: 'rgba(81, 207, 102, 0.1)',
  },
  disableAllButton: {
    backgroundColor: 'rgba(250, 82, 82, 0.1)',
  },
  quickActionIcon: {
    fontSize: 16,
  },
  quickActionText: {
    ...typography.labelMedium,
    fontWeight: '600',
  },
  
  // Slots Grid
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  slotButton: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    minWidth: '22%',
    borderWidth: 1,
    borderColor: colors.success,
    ...shadows.level1,
  },
  darkSlotButton: {
    backgroundColor: colors.surfaceDark,
  },
  disabledSlotButton: {
    backgroundColor: colors.errorContainer,
    borderColor: colors.error,
  },
  slotTime: {
    ...typography.labelMedium,
    fontWeight: '600',
    color: colors.text.primary,
  },
  disabledSlotText: {
    color: colors.error,
  },
  slotStatus: {
    ...typography.bodySmall,
    marginTop: 2,
    fontWeight: '500',
  },
  openStatus: {
    color: colors.success,
  },
  closedStatus: {
    color: colors.error,
  },
  
  // Info Section
  infoSection: {
    flexDirection: 'row',
    backgroundColor: colors.primaryContainer,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...typography.titleSmall,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});

export default TimeManagementScreen;