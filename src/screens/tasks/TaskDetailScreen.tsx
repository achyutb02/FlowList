import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, getEnergyColor, getFocusColor } from '../../theme/colors';
import { useAppDispatch, useAppSelector } from '../../store';
import { deleteTask, completeTask, updateTask } from '../../store/slices/tasksSlice';
import { TaskStackScreenProps } from '../../navigation/types';
import { tasksApi } from '../../api';

export default function TaskDetailScreen({ navigation, route }: TaskStackScreenProps<'TaskDetail'>) {
  const dispatch = useAppDispatch();
  const { selectedTask, isLoading } = useAppSelector((state) => state.tasks);
  const [task, setTask] = useState(selectedTask);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    loadTask();
  }, [route.params.taskId]);

  const loadTask = async () => {
    try {
      const fetchedTask = await tasksApi.getTask(route.params.taskId);
      setTask(fetchedTask);
    } catch (error) {
      Alert.alert('Error', 'Failed to load task');
      navigation.goBack();
    }
  };

  const handleComplete = async () => {
    if (!task) return;
    setCompleting(true);
    await dispatch(completeTask(task.id));
    setCompleting(false);
    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (task) {
              await dispatch(deleteTask(task.id));
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!task) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const isCompleted = task.status === 'completed';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Status Badge */}
      <View style={[styles.statusBadge, isCompleted && styles.statusBadgeCompleted]}>
        <Ionicons 
          name={isCompleted ? 'checkmark-circle' : 'radio-button-off'} 
          size={16} 
          color={isCompleted ? colors.success : colors.textMuted} 
        />
        <Text style={[styles.statusText, isCompleted && styles.statusTextCompleted]}>
          {isCompleted ? 'Completed' : 'Active'}
        </Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>{task.title}</Text>

      {/* Description */}
      {task.description && (
        <Text style={styles.description}>{task.description}</Text>
      )}

      {/* Requirements Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Requirements</Text>
        
        <View style={styles.requirementRow}>
          <View style={styles.requirementItem}>
            <Text style={styles.requirementLabel}>Energy</Text>
            <View style={styles.requirementValue}>
              <View style={[styles.levelDots]}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <View
                    key={level}
                    style={[
                      styles.levelDot,
                      {
                        backgroundColor: level <= task.energy_required 
                          ? getEnergyColor(task.energy_required) 
                          : colors.border,
                      },
                    ]}
                  />
                ))}
              </View>
              <Text style={[styles.requirementNumber, { color: getEnergyColor(task.energy_required) }]}>
                {task.energy_required}/5
              </Text>
            </View>
          </View>
          
          <View style={styles.requirementItem}>
            <Text style={styles.requirementLabel}>Focus</Text>
            <View style={styles.requirementValue}>
              <View style={styles.levelDots}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <View
                    key={level}
                    style={[
                      styles.levelDot,
                      {
                        backgroundColor: level <= task.focus_required 
                          ? getFocusColor(task.focus_required) 
                          : colors.border,
                      },
                    ]}
                  />
                ))}
              </View>
              <Text style={[styles.requirementNumber, { color: getFocusColor(task.focus_required) }]}>
                {task.focus_required}/5
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.requirementRow}>
          <View style={styles.requirementItem}>
            <Text style={styles.requirementLabel}>Time Estimate</Text>
            <View style={styles.requirementValue}>
              <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.requirementText}>{task.time_estimate_minutes} minutes</Text>
            </View>
          </View>
          
          <View style={styles.requirementItem}>
            <Text style={styles.requirementLabel}>Importance</Text>
            <View style={styles.requirementValue}>
              <Ionicons name="flag-outline" size={18} color={colors.accent} />
              <Text style={styles.requirementText}>{Math.round(task.importance_score * 100)}%</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Details Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Details</Text>
        
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={18} color={colors.textMuted} />
          <Text style={styles.detailLabel}>Due Date</Text>
          <Text style={styles.detailValue}>{formatDate(task.due_date)}</Text>
        </View>
        
        {task.category && (
          <View style={styles.detailRow}>
            <Ionicons name="folder-outline" size={18} color={colors.textMuted} />
            <Text style={styles.detailLabel}>Category</Text>
            <Text style={styles.detailValue}>{task.category}</Text>
          </View>
        )}
        
        {task.tags && (
          <View style={styles.detailRow}>
            <Ionicons name="pricetags-outline" size={18} color={colors.textMuted} />
            <Text style={styles.detailLabel}>Tags</Text>
            <Text style={styles.detailValue}>{task.tags}</Text>
          </View>
        )}
        
        <View style={styles.detailRow}>
          <Ionicons name="repeat-outline" size={18} color={colors.textMuted} />
          <Text style={styles.detailLabel}>Times Snoozed</Text>
          <Text style={styles.detailValue}>{task.times_snoozed}</Text>
        </View>
      </View>

      {/* Actions */}
      {!isCompleted && (
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.completeButton}
            onPress={handleComplete}
            disabled={completing}
          >
            {completing ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color={colors.white} />
                <Text style={styles.completeButtonText}>Mark Complete</Text>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      )}

      {isCompleted && task.completed_at && (
        <View style={styles.completedInfo}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={styles.completedText}>
            Completed on {formatDate(task.completed_at)}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 16,
  },
  statusBadgeCompleted: {
    backgroundColor: colors.success + '20',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
  },
  statusTextCompleted: {
    color: colors.success,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  requirementRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  requirementItem: {
    flex: 1,
  },
  requirementLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 8,
  },
  requirementValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelDots: {
    flexDirection: 'row',
    gap: 4,
  },
  levelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  requirementNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  requirementText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  completeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.success,
    borderRadius: 16,
    padding: 16,
  },
  completeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: colors.error + '15',
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.success + '15',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  completedText: {
    fontSize: 14,
    color: colors.success,
  },
});

