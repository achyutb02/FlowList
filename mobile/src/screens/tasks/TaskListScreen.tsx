import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, getEnergyColor } from '../../theme/colors';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchTasks, completeTask, setSelectedTask } from '../../store/slices/tasksSlice';
import { TaskStackScreenProps } from '../../navigation/types';
import { Task } from '../../api/types';

type FilterType = 'all' | 'active' | 'completed';

export default function TaskListScreen({ navigation }: TaskStackScreenProps<'TaskList'>) {
  const dispatch = useAppDispatch();
  const { tasks, isLoading } = useAppSelector((state) => state.tasks);
  const [filter, setFilter] = useState<FilterType>('active');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    await dispatch(fetchTasks({}));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const handleTaskPress = (task: Task) => {
    dispatch(setSelectedTask(task));
    navigation.navigate('TaskDetail', { taskId: task.id });
  };

  const handleComplete = async (taskId: string) => {
    await dispatch(completeTask(taskId));
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true;
    if (filter === 'active') return task.status === 'active';
    if (filter === 'completed') return task.status === 'completed';
    return true;
  });

  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 0) return { text: 'Overdue', color: colors.error };
    if (hours < 24) return { text: 'Due today', color: colors.warning };
    if (hours < 48) return { text: 'Due tomorrow', color: colors.accent };
    
    const days = Math.floor(hours / 24);
    return { text: `${days} days`, color: colors.textMuted };
  };

  const renderTask = ({ item }: { item: Task }) => {
    const dueInfo = formatDueDate(item.due_date);
    const isCompleted = item.status === 'completed';

    return (
      <TouchableOpacity 
        style={[styles.taskCard, isCompleted && styles.taskCardCompleted]}
        onPress={() => handleTaskPress(item)}
        activeOpacity={0.7}
      >
        <TouchableOpacity 
          style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}
          onPress={() => !isCompleted && handleComplete(item.id)}
        >
          {isCompleted && <Ionicons name="checkmark" size={16} color={colors.white} />}
        </TouchableOpacity>
        
        <View style={styles.taskContent}>
          <Text style={[styles.taskTitle, isCompleted && styles.taskTitleCompleted]} numberOfLines={2}>
            {item.title}
          </Text>
          
          <View style={styles.taskMeta}>
            <View style={styles.metaRow}>
              <View style={[styles.energyBadge, { backgroundColor: getEnergyColor(item.energy_required) + '30' }]}>
                <View style={[styles.energyDot, { backgroundColor: getEnergyColor(item.energy_required) }]} />
                <Text style={[styles.energyText, { color: getEnergyColor(item.energy_required) }]}>
                  {item.energy_required}
                </Text>
              </View>
              
              <View style={styles.timeBadge}>
                <Ionicons name="time-outline" size={12} color={colors.textMuted} />
                <Text style={styles.timeText}>{item.time_estimate_minutes}m</Text>
              </View>
              
              {dueInfo && (
                <Text style={[styles.dueText, { color: dueInfo.color }]}>
                  {dueInfo.text}
                </Text>
              )}
            </View>
            
            {item.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>
            )}
          </View>
        </View>
        
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(['active', 'completed', 'all'] as FilterType[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Task List */}
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons 
                name={filter === 'completed' ? 'checkmark-done-circle-outline' : 'clipboard-outline'} 
                size={64} 
                color={colors.textMuted} 
              />
              <Text style={styles.emptyTitle}>
                {filter === 'completed' ? 'No completed tasks yet' : 'No tasks yet'}
              </Text>
              <Text style={styles.emptyText}>
                {filter === 'completed' 
                  ? 'Complete tasks to see them here'
                  : 'Tap the + button to add your first task'}
              </Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('CreateTask')}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  taskCardCompleted: {
    opacity: 0.6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  taskMeta: {
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  energyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  energyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  energyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  dueText: {
    fontSize: 12,
    fontWeight: '500',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

