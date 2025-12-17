import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';

// API Base URL - change to your computer's IP for physical devices
const API_URL = 'http://192.168.0.30:8000';

// Types
interface Task {
  id: string;
  title: string;
  energy_required: number;
  time_estimate_minutes: number;
}

interface TaskRecommendation {
  task: Task;
  match_score: number;
  reason: string;
}

// Energy level colors
const getEnergyColor = (level: number) => {
  const colors = ['', '#EF4444', '#F97316', '#EAB308', '#84CC16', '#22C55E'];
  return colors[level] || '#EAB308';
};

export default function App() {
  // Task creation state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskEnergy, setNewTaskEnergy] = useState(3);
  const [newTaskTime, setNewTaskTime] = useState(30);
  const [isAddingTask, setIsAddingTask] = useState(false);

  // Context state
  const [userEnergy, setUserEnergy] = useState(3);
  const [availableTime, setAvailableTime] = useState(60);

  // Recommendations state
  const [recommendations, setRecommendations] = useState<TaskRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // All tasks
  const [allTasks, setAllTasks] = useState<Task[]>([]);

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks`);
      const data = await response.json();
      setAllTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  const addTask = async () => {
    if (!newTaskTitle.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    setIsAddingTask(true);
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          energy_required: newTaskEnergy,
          time_estimate_minutes: newTaskTime,
        }),
      });

      if (response.ok) {
        const task = await response.json();
        setAllTasks([...allTasks, task]);
        setNewTaskTitle('');
        Alert.alert('Success', 'Task added!');
      } else {
        Alert.alert('Error', 'Failed to add task');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not connect to server');
    }
    setIsAddingTask(false);
  };

  const findFlow = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_energy: userEnergy,
          available_time_minutes: availableTime,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data);
      } else {
        Alert.alert('Error', 'Failed to get recommendations');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not connect to server');
    }
    setIsLoading(false);
  };

  const timeOptions = [15, 30, 60, 90];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Text style={styles.header}>FlowList</Text>
        <Text style={styles.subheader}>Match your energy to your tasks</Text>

        {/* Add Task Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add New Task</Text>
          
          <TextInput
            style={styles.input}
            placeholder="What do you need to do?"
            placeholderTextColor="#64748B"
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
          />

          <Text style={styles.label}>Energy Required</Text>
          <View style={styles.buttonRow}>
            {[1, 2, 3, 4, 5].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.energyButton,
                  { backgroundColor: getEnergyColor(level) + (newTaskEnergy === level ? 'FF' : '40') },
                  newTaskEnergy === level && styles.selectedButton,
                ]}
                onPress={() => setNewTaskEnergy(level)}
              >
                <Text style={styles.energyButtonText}>{level}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Time Estimate</Text>
          <View style={styles.buttonRow}>
            {timeOptions.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeButton,
                  newTaskTime === time && styles.selectedTimeButton,
                ]}
                onPress={() => setNewTaskTime(time)}
              >
                <Text style={[
                  styles.timeButtonText,
                  newTaskTime === time && styles.selectedTimeText,
                ]}>
                  {time}m
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={addTask}
            disabled={isAddingTask}
          >
            {isAddingTask ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.addButtonText}>Add Task</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Context Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Current State</Text>

          <Text style={styles.label}>My Energy Level</Text>
          <View style={styles.buttonRow}>
            {[1, 2, 3, 4, 5].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.energyButton,
                  { backgroundColor: getEnergyColor(level) + (userEnergy === level ? 'FF' : '40') },
                  userEnergy === level && styles.selectedButton,
                ]}
                onPress={() => setUserEnergy(level)}
              >
                <Text style={styles.energyButtonText}>{level}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.energyHint}>
            {userEnergy <= 2 ? '😴 Low energy - lighter tasks recommended' :
             userEnergy >= 4 ? '⚡ High energy - ready for challenges!' :
             '🌤 Moderate energy'}
          </Text>

          <Text style={styles.label}>Time Available</Text>
          <View style={styles.buttonRow}>
            {timeOptions.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeButton,
                  availableTime === time && styles.selectedTimeButton,
                ]}
                onPress={() => setAvailableTime(time)}
              >
                <Text style={[
                  styles.timeButtonText,
                  availableTime === time && styles.selectedTimeText,
                ]}>
                  {time}m
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.flowButton}
            onPress={findFlow}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.flowButtonText}>✨ Find Flow</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommended Tasks</Text>
            {recommendations.map((rec, index) => (
              <View key={rec.task.id} style={styles.recommendationCard}>
                <View style={styles.recHeader}>
                  <View style={[
                    styles.rankBadge,
                    index === 0 && styles.topRankBadge,
                  ]}>
                    <Text style={styles.rankText}>#{index + 1}</Text>
                  </View>
                  <View style={[
                    styles.energyBadge,
                    { backgroundColor: getEnergyColor(rec.task.energy_required) + '30' },
                  ]}>
                    <View style={[
                      styles.energyDot,
                      { backgroundColor: getEnergyColor(rec.task.energy_required) },
                    ]} />
                    <Text style={[
                      styles.energyBadgeText,
                      { color: getEnergyColor(rec.task.energy_required) },
                    ]}>
                      {rec.task.energy_required}
                    </Text>
                  </View>
                </View>
                <Text style={styles.recTitle}>{rec.task.title}</Text>
                <Text style={styles.recReason}>{rec.reason}</Text>
                <Text style={styles.recTime}>⏱ {rec.task.time_estimate_minutes} min</Text>
              </View>
            ))}
          </View>
        )}

        {recommendations.length === 0 && allTasks.length > 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Tap "Find Flow" to get personalized task recommendations
            </Text>
          </View>
        )}

        {allTasks.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Add some tasks above to get started!
            </Text>
          </View>
        )}

        {/* Task Count */}
        <Text style={styles.taskCount}>
          {allTasks.length} task{allTasks.length !== 1 ? 's' : ''} in your list
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 36,
    fontWeight: '800',
    color: '#0D9488',
    textAlign: 'center',
    marginBottom: 4,
  },
  subheader: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
  },
  section: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#475569',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  energyButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedButton: {
    transform: [{ scale: 1.05 }],
    borderWidth: 2,
    borderColor: '#FFF',
  },
  energyButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  energyHint: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
  },
  timeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#334155',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#475569',
  },
  selectedTimeButton: {
    borderColor: '#0D9488',
    backgroundColor: '#0D948820',
  },
  timeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
  },
  selectedTimeText: {
    color: '#0D9488',
  },
  addButton: {
    backgroundColor: '#0D9488',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  flowButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
  },
  flowButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  recommendationCard: {
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  recHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rankBadge: {
    backgroundColor: '#475569',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  topRankBadge: {
    backgroundColor: '#0D9488',
  },
  rankText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  energyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  energyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  energyBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  recTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F1F5F9',
    marginBottom: 6,
  },
  recReason: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 8,
  },
  recTime: {
    fontSize: 13,
    color: '#64748B',
  },
  emptyState: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  taskCount: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    marginTop: 16,
  },
});
