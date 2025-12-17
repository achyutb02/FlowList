import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, getEnergyColor, getFocusColor } from '../../theme/colors';
import { useAppDispatch, useAppSelector } from '../../store';
import { createTask } from '../../store/slices/tasksSlice';
import { TaskStackScreenProps } from '../../navigation/types';

const TIME_OPTIONS = [15, 30, 45, 60, 90, 120];
const CATEGORIES = ['Work', 'Study', 'Personal', 'Health', 'Creative', 'Admin'];

export default function CreateTaskScreen({ navigation }: TaskStackScreenProps<'CreateTask'>) {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.tasks);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [energyRequired, setEnergyRequired] = useState(3);
  const [focusRequired, setFocusRequired] = useState(3);
  const [timeEstimate, setTimeEstimate] = useState(30);
  const [category, setCategory] = useState<string | null>(null);
  const [importance, setImportance] = useState(0.5);

  const handleCreate = async () => {
    if (!title.trim()) return;

    await dispatch(createTask({
      title: title.trim(),
      description: description.trim() || undefined,
      energy_required: energyRequired,
      focus_required: focusRequired,
      time_estimate_minutes: timeEstimate,
      category: category || undefined,
      importance_score: importance,
    }));

    navigation.goBack();
  };

  const getImportanceLabel = (value: number) => {
    if (value <= 0.3) return 'Low';
    if (value <= 0.7) return 'Medium';
    return 'High';
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Title Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Task Title *</Text>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="What do you need to do?"
              placeholderTextColor={colors.textMuted}
              multiline
            />
          </View>

          {/* Description Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description (optional)</Text>
            <TextInput
              style={styles.descriptionInput}
              value={description}
              onChangeText={setDescription}
              placeholder="Add more details..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Energy Required */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Energy Required</Text>
              <Text style={[styles.labelValue, { color: getEnergyColor(energyRequired) }]}>
                {energyRequired}/5
              </Text>
            </View>
            <Text style={styles.hint}>How much energy will this task need?</Text>
            <View style={styles.levelButtons}>
              {[1, 2, 3, 4, 5].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.levelButton,
                    { backgroundColor: getEnergyColor(level) + (energyRequired === level ? 'FF' : '30') },
                    energyRequired === level && styles.levelButtonActive,
                  ]}
                  onPress={() => setEnergyRequired(level)}
                >
                  <Text style={[
                    styles.levelButtonText,
                    energyRequired === level && styles.levelButtonTextActive,
                  ]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Focus Required */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Focus Required</Text>
              <Text style={[styles.labelValue, { color: getFocusColor(focusRequired) }]}>
                {focusRequired}/5
              </Text>
            </View>
            <Text style={styles.hint}>How much concentration will this need?</Text>
            <View style={styles.levelButtons}>
              {[1, 2, 3, 4, 5].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.levelButton,
                    { backgroundColor: getFocusColor(level) + (focusRequired === level ? 'FF' : '30') },
                    focusRequired === level && styles.levelButtonActive,
                  ]}
                  onPress={() => setFocusRequired(level)}
                >
                  <Text style={[
                    styles.levelButtonText,
                    focusRequired === level && styles.levelButtonTextActive,
                  ]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Time Estimate */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Time Estimate</Text>
              <Text style={styles.labelValue}>{timeEstimate} min</Text>
            </View>
            <View style={styles.timeButtons}>
              {TIME_OPTIONS.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeButton,
                    timeEstimate === time && styles.timeButtonActive,
                  ]}
                  onPress={() => setTimeEstimate(time)}
                >
                  <Text style={[
                    styles.timeButtonText,
                    timeEstimate === time && styles.timeButtonTextActive,
                  ]}>
                    {time < 60 ? `${time}m` : `${time / 60}h${time % 60 ? time % 60 : ''}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Category */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category (optional)</Text>
            <View style={styles.categoryButtons}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    category === cat && styles.categoryButtonActive,
                  ]}
                  onPress={() => setCategory(category === cat ? null : cat)}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    category === cat && styles.categoryButtonTextActive,
                  ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Importance */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Importance</Text>
              <Text style={styles.labelValue}>{getImportanceLabel(importance)}</Text>
            </View>
            <View style={styles.importanceButtons}>
              {[0.2, 0.5, 0.8].map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.importanceButton,
                    importance === value && styles.importanceButtonActive,
                  ]}
                  onPress={() => setImportance(value)}
                >
                  <Ionicons 
                    name="flag" 
                    size={18} 
                    color={importance === value ? colors.accent : colors.textMuted} 
                  />
                  <Text style={[
                    styles.importanceButtonText,
                    importance === value && styles.importanceButtonTextActive,
                  ]}>
                    {getImportanceLabel(value)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Create Button */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.createButton, !title.trim() && styles.createButtonDisabled]}
            onPress={handleCreate}
            disabled={isLoading || !title.trim()}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="add-circle" size={20} color={colors.white} />
                <Text style={styles.createButtonText}>Create Task</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  hint: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 12,
  },
  titleInput: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    fontSize: 18,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 56,
  },
  descriptionInput: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  levelButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  levelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelButtonActive: {
    transform: [{ scale: 1.05 }],
  },
  levelButtonText: {
    fontSize: 18,
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
    gap: 10,
  },
  timeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  timeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  timeButtonTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  categoryButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  categoryButtonTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  importanceButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  importanceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  importanceButtonActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent + '20',
  },
  importanceButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  importanceButtonTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 32,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 18,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
});

