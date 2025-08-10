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
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Patient, Measurement } from '../types';
import { MeasurementService } from '../services/measurementService';

interface MeasurementDetailScreenProps {
  patient: Patient;
  onBack: () => void;
  onAddMeasurement: (patient: Patient) => void;
}

const MeasurementDetailScreen: React.FC<MeasurementDetailScreenProps> = ({
  patient,
  onBack,
  onAddMeasurement,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<7 | 30 | 90>(30);

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 40;

  useEffect(() => {
    loadMeasurements();
  }, [patient.id, selectedPeriod]);

  const loadMeasurements = async () => {
    try {
      setLoading(true);
      const fetchedMeasurements = await MeasurementService.getRecentMeasurements(patient.id, selectedPeriod);
      setMeasurements(fetchedMeasurements);
    } catch (error) {
      console.error('Ölçümler yüklenemedi:', error);
      Alert.alert('Hata', 'Ölçümler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
  };

  const formatDateTime = (dateString: string, timeString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }) + ' ' + timeString;
  };

  const getChartConfig = () => ({
    backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff',
    backgroundGradientFrom: isDarkMode ? '#2d2d2d' : '#ffffff',
    backgroundGradientTo: isDarkMode ? '#2d2d2d' : '#ffffff',
    color: (opacity = 1) => isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 1,
  });

  const prepareWeightChartData = () => {
    if (measurements.length === 0) return null;

    const sortedMeasurements = [...measurements].sort((a, b) => 
      new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()
    );

    const labels = sortedMeasurements.map(m => formatDate(m.date));
    const weights = sortedMeasurements.map(m => m.weight);

    return {
      labels: labels.length > 10 ? labels.filter((_, i) => i % Math.ceil(labels.length / 10) === 0) : labels,
      datasets: [
        {
          data: weights.length > 10 ? weights.filter((_, i) => i % Math.ceil(weights.length / 10) === 0) : weights,
          color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
          strokeWidth: 3,
        },
      ],
    };
  };

  const prepareWaterChartData = () => {
    if (measurements.length === 0) return null;

    const sortedMeasurements = [...measurements].sort((a, b) => 
      new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()
    );

    const last7Days = sortedMeasurements.slice(-7);
    const labels = last7Days.map(m => formatDate(m.date));
    const waterIntakes = last7Days.map(m => m.waterIntake);

    return {
      labels,
      datasets: [
        {
          data: waterIntakes,
        },
      ],
    };
  };

  const prepareExerciseChartData = () => {
    if (measurements.length === 0) return null;

    const sortedMeasurements = [...measurements].sort((a, b) => 
      new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()
    );

    const last7Days = sortedMeasurements.slice(-7);
    const labels = last7Days.map(m => formatDate(m.date));
    const exerciseDurations = last7Days.map(m => m.exerciseDuration);

    return {
      labels,
      datasets: [
        {
          data: exerciseDurations,
        },
      ],
    };
  };

  const getLatestMeasurement = () => {
    if (measurements.length === 0) return null;
    return measurements.reduce((latest, current) => {
      const latestDateTime = new Date(`${latest.date}T${latest.time}`);
      const currentDateTime = new Date(`${current.date}T${current.time}`);
      return currentDateTime > latestDateTime ? current : latest;
    });
  };

  const getWeightTrend = () => {
    if (measurements.length < 2) return { trend: 'stable', change: 0 };
    
    const sortedMeasurements = [...measurements].sort((a, b) => 
      new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()
    );
    
    const oldest = sortedMeasurements[0];
    const newest = sortedMeasurements[sortedMeasurements.length - 1];
    const change = newest.weight - oldest.weight;
    
    return {
      trend: change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'stable',
      change: Math.abs(change)
    };
  };

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { text: 'Zayıf', color: '#2196f3' };
    if (bmi < 25) return { text: 'Normal', color: '#4caf50' };
    if (bmi < 30) return { text: 'Fazla Kilolu', color: '#ff9800' };
    return { text: 'Obez', color: '#f44336' };
  };

  const latestMeasurement = getLatestMeasurement();
  const weightTrend = getWeightTrend();
  const weightChartData = prepareWeightChartData();
  const waterChartData = prepareWaterChartData();
  const exerciseChartData = prepareExerciseChartData();

  const periods = [
    { value: 7, label: '7 Gün' },
    { value: 30, label: '30 Gün' },
    { value: 90, label: '90 Gün' },
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
            Ölçüm Takibi
          </Text>
          <Text style={[styles.headerSubtitle, isDarkMode && styles.darkHeaderSubtitle]}>
            {patient.firstName} {patient.lastName}
          </Text>
        </View>
        
        <TouchableOpacity 
          onPress={() => onAddMeasurement(patient)}
          style={styles.headerRightButton}
        >
          <Text style={styles.headerRightText}>Ekle</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.container, isDarkMode && styles.darkContainer]}>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={[styles.loadingText, isDarkMode && styles.darkSubtitle]}>
            Ölçümler yükleniyor...
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

          {measurements.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, isDarkMode && styles.darkSubtitle]}>
                Henüz ölçüm kaydı yok. Yeni ölçüm ekleyebilirsiniz.
              </Text>
            </View>
          ) : (
            <>
              {/* Latest Measurement Summary */}
              {latestMeasurement && (
                <View style={[styles.summaryCard, isDarkMode && styles.darkCard]}>
                  <Text style={[styles.summaryTitle, isDarkMode && styles.darkText]}>
                    Son Ölçüm
                  </Text>
                  <Text style={[styles.summaryDate, isDarkMode && styles.darkSubtitle]}>
                    {formatDateTime(latestMeasurement.date, latestMeasurement.time)}
                  </Text>
                  
                  <View style={styles.summaryGrid}>
                    <View style={styles.summaryItem}>
                      <Text style={[styles.summaryLabel, isDarkMode && styles.darkSubtitle]}>Kilo</Text>
                      <Text style={[styles.summaryValue, isDarkMode && styles.darkText]}>
                        {latestMeasurement.weight} kg
                      </Text>
                      {weightTrend.trend !== 'stable' && (
                        <Text style={[
                          styles.trendText,
                          { color: weightTrend.trend === 'up' ? '#f44336' : '#4caf50' }
                        ]}>
                          {weightTrend.trend === 'up' ? '↗' : '↘'} {weightTrend.change.toFixed(1)} kg
                        </Text>
                      )}
                    </View>
                    
                    <View style={styles.summaryItem}>
                      <Text style={[styles.summaryLabel, isDarkMode && styles.darkSubtitle]}>VKİ</Text>
                      <Text style={[styles.summaryValue, isDarkMode && styles.darkText]}>
                        {latestMeasurement.bmi || MeasurementService.calculateBMI(latestMeasurement.weight, patient.height)}
                      </Text>
                      <View style={[
                        styles.bmiStatus,
                        { backgroundColor: getBMIStatus(latestMeasurement.bmi || MeasurementService.calculateBMI(latestMeasurement.weight, patient.height)).color }
                      ]}>
                        <Text style={styles.bmiStatusText}>
                          {getBMIStatus(latestMeasurement.bmi || MeasurementService.calculateBMI(latestMeasurement.weight, patient.height)).text}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.summaryItem}>
                      <Text style={[styles.summaryLabel, isDarkMode && styles.darkSubtitle]}>Su</Text>
                      <Text style={[styles.summaryValue, isDarkMode && styles.darkText]}>
                        {latestMeasurement.waterIntake} ml
                      </Text>
                    </View>
                    
                    <View style={styles.summaryItem}>
                      <Text style={[styles.summaryLabel, isDarkMode && styles.darkSubtitle]}>Egzersiz</Text>
                      <Text style={[styles.summaryValue, isDarkMode && styles.darkText]}>
                        {latestMeasurement.exerciseDuration} dk
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Weight Chart */}
              {weightChartData && (
                <View style={[styles.chartCard, isDarkMode && styles.darkCard]}>
                  <Text style={[styles.chartTitle, isDarkMode && styles.darkText]}>
                    ⚖️ Kilo Değişimi
                  </Text>
                  <LineChart
                    data={weightChartData}
                    width={chartWidth}
                    height={200}
                    chartConfig={getChartConfig()}
                    style={styles.chart}
                    bezier
                  />
                </View>
              )}

              {/* Water Intake Chart */}
              {waterChartData && waterChartData.labels.length > 0 && (
                <View style={[styles.chartCard, isDarkMode && styles.darkCard]}>
                  <Text style={[styles.chartTitle, isDarkMode && styles.darkText]}>
                    💧 Su Tüketimi (Son 7 Gün)
                  </Text>
                  <BarChart
                    data={waterChartData}
                    width={chartWidth}
                    height={200}
                    chartConfig={{
                      ...getChartConfig(),
                      color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                    }}
                    style={styles.chart}
                    showValuesOnTopOfBars
                  />
                </View>
              )}

              {/* Exercise Duration Chart */}
              {exerciseChartData && exerciseChartData.labels.length > 0 && (
                <View style={[styles.chartCard, isDarkMode && styles.darkCard]}>
                  <Text style={[styles.chartTitle, isDarkMode && styles.darkText]}>
                    🏃‍♂️ Egzersiz Süresi (Son 7 Gün)
                  </Text>
                  <BarChart
                    data={exerciseChartData}
                    width={chartWidth}
                    height={200}
                    chartConfig={{
                      ...getChartConfig(),
                      color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                    }}
                    style={styles.chart}
                    showValuesOnTopOfBars
                  />
                </View>
              )}

              {/* Recent Measurements List */}
              <View style={[styles.listCard, isDarkMode && styles.darkCard]}>
                <Text style={[styles.listTitle, isDarkMode && styles.darkText]}>
                  📋 Son Ölçümler
                </Text>
                {measurements.slice(0, 10).map((measurement, index) => (
                  <View key={measurement.id} style={[styles.measurementItem, isDarkMode && styles.darkMeasurementItem]}>
                    <View style={styles.measurementHeader}>
                      <Text style={[styles.measurementDate, isDarkMode && styles.darkText]}>
                        {formatDateTime(measurement.date, measurement.time)}
                      </Text>
                    </View>
                    <View style={styles.measurementData}>
                      <Text style={[styles.measurementValue, isDarkMode && styles.darkSubtitle]}>
                        ⚖️ {measurement.weight} kg
                      </Text>
                      <Text style={[styles.measurementValue, isDarkMode && styles.darkSubtitle]}>
                        💧 {measurement.waterIntake} ml
                      </Text>
                      <Text style={[styles.measurementValue, isDarkMode && styles.darkSubtitle]}>
                        🏃‍♂️ {measurement.exerciseDuration} dk
                      </Text>
                    </View>
                    {measurement.notes && (
                      <Text style={[styles.measurementNotes, isDarkMode && styles.darkSubtitle]}>
                        💭 {measurement.notes}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
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
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  darkActivePeriodButton: {
    backgroundColor: '#0056b3',
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
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  summaryItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  bmiStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  bmiStatusText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  chartCard: {
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
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 8,
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
  measurementItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    paddingVertical: 12,
  },
  darkMeasurementItem: {
    borderBottomColor: '#444',
  },
  measurementHeader: {
    marginBottom: 8,
  },
  measurementDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
  },
  measurementData: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 4,
  },
  measurementValue: {
    fontSize: 12,
    color: '#6c757d',
  },
  measurementNotes: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
    marginTop: 4,
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
});

export default MeasurementDetailScreen;