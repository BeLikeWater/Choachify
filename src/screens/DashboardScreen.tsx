import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { mockDashboardData, mockWeightLossChart, mockPatientProgressChart } from '../data/mockData';

const { width } = Dimensions.get('window');

const DashboardScreen: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const chartConfig = {
    backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff',
    backgroundGradientFrom: isDarkMode ? '#2d2d2d' : '#ffffff',
    backgroundGradientTo: isDarkMode ? '#2d2d2d' : '#ffffff',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
    labelColor: (opacity = 1) => isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#2e7d32',
    },
  };

  const progressChartConfig = {
    ...chartConfig,
    color: (opacity = 1) => `rgba(25, 118, 210, ${opacity})`,
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#1976d2',
    },
  };

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>
          📊 Dashboard
        </Text>
        <Text style={[styles.subtitle, isDarkMode && styles.darkSubtitle]}>
          Genel bakış ve istatistikler
        </Text>
      </View>

      {/* İstatistik Kartları */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, isDarkMode && styles.darkCard]}>
            <Text style={[styles.statNumber, { color: '#2e7d32' }]}>
              {mockDashboardData.totalPatients}
            </Text>
            <Text style={[styles.statLabel, isDarkMode && styles.darkSubtitle]}>
              Toplam Hasta
            </Text>
          </View>
          
          <View style={[styles.statCard, isDarkMode && styles.darkCard]}>
            <Text style={[styles.statNumber, { color: '#1976d2' }]}>
              {mockDashboardData.activePatients}
            </Text>
            <Text style={[styles.statLabel, isDarkMode && styles.darkSubtitle]}>
              Aktif Hasta
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, isDarkMode && styles.darkCard]}>
            <Text style={[styles.statNumber, { color: '#f57c00' }]}>
              {mockDashboardData.appointmentsToday}
            </Text>
            <Text style={[styles.statLabel, isDarkMode && styles.darkSubtitle]}>
              Bugünkü Randevu
            </Text>
          </View>
          
          <View style={[styles.statCard, isDarkMode && styles.darkCard]}>
            <Text style={[styles.statNumber, { color: '#7b1fa2' }]}>
              %{mockDashboardData.successRate}
            </Text>
            <Text style={[styles.statLabel, isDarkMode && styles.darkSubtitle]}>
              Başarı Oranı
            </Text>
          </View>
        </View>
      </View>

      {/* Kilo Kaybı Grafiği */}
      <View style={[styles.chartCard, isDarkMode && styles.darkCard]}>
        <Text style={[styles.chartTitle, isDarkMode && styles.darkText]}>
          📈 Aylık Ortalama Kilo Kaybı (kg)
        </Text>
        <LineChart
          data={mockWeightLossChart}
          width={width - 60}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Hasta İlerleme Grafiği */}
      <View style={[styles.chartCard, isDarkMode && styles.darkCard]}>
        <Text style={[styles.chartTitle, isDarkMode && styles.darkText]}>
          👥 Haftalık Aktif Hasta Sayısı
        </Text>
        <BarChart
          data={mockPatientProgressChart}
          width={width - 60}
          height={220}
          chartConfig={progressChartConfig}
          style={styles.chart}
          showValuesOnTopOfBars
        />
      </View>

      {/* Özet Bilgiler */}
      <View style={[styles.summaryCard, isDarkMode && styles.darkCard]}>
        <Text style={[styles.chartTitle, isDarkMode && styles.darkText]}>
          📋 Bu Ay Özeti
        </Text>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, isDarkMode && styles.darkSubtitle]}>
            • Haftalık randevu sayısı: {mockDashboardData.appointmentsWeek}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, isDarkMode && styles.darkSubtitle]}>
            • Ortalama kilo kaybı: {mockDashboardData.weightLossAverage} kg
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, isDarkMode && styles.darkSubtitle]}>
            • Hedef başarı oranı: %{mockDashboardData.successRate}
          </Text>
        </View>
      </View>
    </ScrollView>
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
  },
  darkText: {
    color: '#ffffff',
  },
  darkSubtitle: {
    color: '#adb5bd',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkCard: {
    backgroundColor: '#2d2d2d',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    margin: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    margin: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 40,
  },
  summaryRow: {
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
});

export default DashboardScreen;