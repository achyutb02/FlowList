import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, getEnergyColor, getFocusColor } from '../theme/colors';
import { useAppDispatch, useAppSelector } from '../store';
import { updateContext } from '../store/slices/contextSlice';
import { updateUserContext } from '../store/slices/authSlice';
import { fetchRecommendations } from '../store/slices/tasksSlice';
import { useNavigation } from '@react-navigation/native';

const TIME_OPTIONS = [15, 30, 60, 90, 120];

export default function ContextScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { user } = useAppSelector((state) => state.auth);
  const { isLoading } = useAppSelector((state) => state.context);
  
  const [energy, setEnergy] = useState(user?.current_energy || 3);
  const [focus, setFocus] = useState(user?.current_focus || 3);
  const [timeAvailable, setTimeAvailable] = useState(user?.time_available_minutes || 60);

  const handleSave = async () => {
    await dispatch(updateContext({
      energy,
      focus,
      time_available_minutes: timeAvailable,
    }));
    
    // Update local user state
    dispatch(updateUserContext({
      energy,
      focus,
      time_available_minutes: timeAvailable,
    }));
    
    // Refresh recommendations with new context
    dispatch(fetchRecommendations(3));
    
    navigation.goBack();
  };

  const getEnergyLabel = (level: number) => {
    const labels = ['', 'Exhausted', 'Low', 'Moderate', 'Good', 'Energized'];
    return labels[level];
  };

  const getFocusLabel = (level: number) => {
    const labels = ['', 'Scattered', 'Distracted', 'Normal', 'Focused', 'Deep Focus'];
    return labels[level];
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Update Context</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Energy Slider */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Energy Level</Text>
            <Text style={[styles.sectionValue, { color: getEnergyColor(energy) }]}>
              {getEnergyLabel(energy)}
            </Text>
          </View>
          <Text style={styles.sectionDescription}>
            How physically and mentally energized do you feel right now?
          </Text>
          <View style={styles.levelButtons}>
            {[1, 2, 3, 4, 5].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.levelButton,
                  { backgroundColor: getEnergyColor(level) + (energy === level ? 'FF' : '30') },
                  energy === level && styles.levelButtonActive,
                ]}
                onPress={() => setEnergy(level)}
              >
                <Text style={[
                  styles.levelButtonText,
                  energy === level && styles.levelButtonTextActive,
                ]}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Focus Slider */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Focus Level</Text>
            <Text style={[styles.sectionValue, { color: getFocusColor(focus) }]}>
              {getFocusLabel(focus)}
            </Text>
          </View>
          <Text style={styles.sectionDescription}>
            How well can you concentrate on complex tasks right now?
          </Text>
          <View style={styles.levelButtons}>
            {[1, 2, 3, 4, 5].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.levelButton,
                  { backgroundColor: getFocusColor(level) + (focus === level ? 'FF' : '30') },
                  focus === level && styles.levelButtonActive,
                ]}
                onPress={() => setFocus(level)}
              >
                <Text style={[
                  styles.levelButtonText,
                  focus === level && styles.levelButtonTextActive,
                ]}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Time Available */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Time Available</Text>
            <Text style={styles.sectionValue}>{timeAvailable} minutes</Text>
          </View>
          <Text style={styles.sectionDescription}>
            How much time do you have to work on tasks right now?
          </Text>
          <View style={styles.timeButtons}>
            {TIME_OPTIONS.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeButton,
                  timeAvailable === time && styles.timeButtonActive,
                ]}
                onPress={() => setTimeAvailable(time)}
              >
                <Text style={[
                  styles.timeButtonText,
                  timeAvailable === time && styles.timeButtonTextActive,
                ]}>
                  {time < 60 ? `${time}m` : `${time / 60}h${time % 60 ? ` ${time % 60}m` : ''}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Preview */}
        <View style={styles.preview}>
          <Text style={styles.previewTitle}>Based on your context:</Text>
          <Text style={styles.previewText}>
            {energy <= 2 
              ? "We'll prioritize lighter tasks to protect your energy."
              : energy >= 4 
                ? "Great time for challenging work - we'll suggest high-impact tasks!"
                : "We'll find tasks that match your moderate energy level."}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.saveButtonText}>Find Flow</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 20,
    gap: 32,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  sectionValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  levelButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  levelButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelButtonActive: {
    transform: [{ scale: 1.05 }],
  },
  levelButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    opacity: 0.7,
  },
  levelButtonTextActive: {
    opacity: 1,
    fontWeight: '700',
  },
  timeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  timeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  timeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  timeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  timeButtonTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  preview: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 8,
  },
  previewText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  footer: {
    padding: 20,
    paddingBottom: 32,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

