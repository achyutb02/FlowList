import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, getEnergyColor, getFocusColor } from '../theme/colors';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchRecommendations, acceptTask, snoozeTask, completeTask } from '../store/slices/tasksSlice';
import { useNavigation } from '@react-navigation/native';
import { RootStackScreenProps } from '../navigation/types';

export default function DoNowScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<RootStackScreenProps<'Main'>['navigation']>();
  const { recommendations, isLoadingRecommendations } = useAppSelector((state) => state.tasks);
  const { user } = useAppSelector((state) => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    // Use current context if available, otherwise defaults
    const energy = user?.current_energy || 3;
    const timeAvailable = user?.time_available_minutes || 60;
    
    await dispatch(fetchRecommendations({ 
      energy, 
      timeAvailable,
      limit: 3 
    }));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRecommendations();
    setRefreshing(false);
  };

  const handleAccept = async (taskId: string, rank: number, score: number) => {
    await dispatch(acceptTask({ taskId, rank, score }));
    loadRecommendations();
  };

  const handleSnooze = async (taskId: string, rank: number, score: number) => {
    await dispatch(snoozeTask({ taskId, rank, score }));
    loadRecommendations();
  };

  const handleComplete = async (taskId: string) => {
    setCompletingId(taskId);
    await dispatch(completeTask(taskId));
    setCompletingId(null);
    loadRecommendations();
  };

  const openContextModal = () => {
    navigation.navigate('Context');
  };

  const topRecommendation = recommendations[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Context Bar */}
        <TouchableOpacity style={styles.contextBar} onPress={openContextModal}>
          <View style={styles.contextItem}>
            <View style={[styles.contextDot, { backgroundColor: getEnergyColor(user?.current_energy || 3) }]} />
            <Text style={styles.contextLabel}>Energy</Text>
            <Text style={styles.contextValue}>{user?.current_energy || 3}/5</Text>
          </View>
          <View style={styles.contextItem}>
            <View style={[styles.contextDot, { backgroundColor: getFocusColor(user?.current_focus || 3) }]} />
            <Text style={styles.contextLabel}>Focus</Text>
            <Text style={styles.contextValue}>{user?.current_focus || 3}/5</Text>
          </View>
          <View style={styles.contextItem}>
            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.contextLabel}>Time</Text>
            <Text style={styles.contextValue}>{user?.time_available_minutes || 60}m</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Main Content */}
        {isLoadingRecommendations && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Finding your best task...</Text>
          </View>
        ) : recommendations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🎉</Text>
            <Text style={styles.emptyTitle}>All clear!</Text>
            <Text style={styles.emptyText}>
              No active tasks found. Add some tasks to get personalized recommendations.
            </Text>
          </View>
        ) : (
          <>
            {/* Top Recommendation - The "Do Now" Task */}
            {topRecommendation && (
              <View style={styles.doNowSection}>
                <Text style={styles.sectionTitle}>Do Now</Text>
                <View style={styles.doNowCard}>
                  <View style={styles.doNowHeader}>
                    <View style={styles.rankBadge}>
                      <Text style={styles.rankText}>#1</Text>
                    </View>
                    <Text style={styles.scoreText}>
                      {Math.round(topRecommendation.score * 100)}% match
                    </Text>
                  </View>
                  
                  <Text style={styles.doNowTitle}>{topRecommendation.task.title}</Text>
                  
                  <View style={styles.taskMeta}>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>Energy</Text>
                      <View style={[styles.metaDot, { backgroundColor: getEnergyColor(topRecommendation.task.energy_required) }]} />
                      <Text style={styles.metaValue}>{topRecommendation.task.energy_required}/5</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>Focus</Text>
                      <View style={[styles.metaDot, { backgroundColor: getFocusColor(topRecommendation.task.focus_required) }]} />
                      <Text style={styles.metaValue}>{topRecommendation.task.focus_required}/5</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                      <Text style={styles.metaValue}>{topRecommendation.task.time_estimate_minutes}m</Text>
                    </View>
                  </View>

                  {/* Reasons */}
                  <View style={styles.reasonsContainer}>
                    {topRecommendation.reasons.slice(0, 2).map((reason, index) => (
                      <View key={index} style={styles.reasonItem}>
                        <Ionicons 
                          name={reason.score_contribution > 0 ? "checkmark-circle" : "alert-circle"} 
                          size={16} 
                          color={reason.score_contribution > 0 ? colors.success : colors.warning} 
                        />
                        <Text style={styles.reasonText}>{reason.description}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Actions */}
                  <View style={styles.actionButtons}>
                    <TouchableOpacity 
                      style={styles.snoozeButton}
                      onPress={() => handleSnooze(topRecommendation.task.id, topRecommendation.rank, topRecommendation.score)}
                    >
                      <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
                      <Text style={styles.snoozeText}>Later</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.acceptButton}
                      onPress={() => handleAccept(topRecommendation.task.id, topRecommendation.rank, topRecommendation.score)}
                    >
                      <Ionicons name="play" size={20} color={colors.white} />
                      <Text style={styles.acceptText}>Start Task</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.completeButton}
                      onPress={() => handleComplete(topRecommendation.task.id)}
                      disabled={completingId === topRecommendation.task.id}
                    >
                      {completingId === topRecommendation.task.id ? (
                        <ActivityIndicator size="small" color={colors.success} />
                      ) : (
                        <>
                          <Ionicons name="checkmark" size={20} color={colors.success} />
                          <Text style={styles.completeText}>Done</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Other Recommendations */}
            {recommendations.length > 1 && (
              <View style={styles.otherSection}>
                <Text style={styles.sectionTitle}>Up Next</Text>
                {recommendations.slice(1).map((rec) => (
                  <TouchableOpacity 
                    key={rec.task.id} 
                    style={styles.otherCard}
                    onPress={() => handleAccept(rec.task.id, rec.rank, rec.score)}
                  >
                    <View style={styles.otherRank}>
                      <Text style={styles.otherRankText}>#{rec.rank}</Text>
                    </View>
                    <View style={styles.otherContent}>
                      <Text style={styles.otherTitle} numberOfLines={1}>
                        {rec.task.title}
                      </Text>
                      <View style={styles.otherMeta}>
                        <View style={[styles.smallDot, { backgroundColor: getEnergyColor(rec.task.energy_required) }]} />
                        <Text style={styles.otherMetaText}>
                          {rec.task.time_estimate_minutes}m · {Math.round(rec.score * 100)}% match
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity 
                      style={styles.otherSnooze}
                      onPress={() => handleSnooze(rec.task.id, rec.rank, rec.score)}
                    >
                      <Ionicons name="time-outline" size={18} color={colors.textMuted} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  contextBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 16,
  },
  contextItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contextDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  contextLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  contextValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  doNowSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  doNowCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  doNowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rankBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rankText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  scoreText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  doNowTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  taskMeta: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  metaDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  reasonsContainer: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reasonText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  snoozeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    padding: 14,
  },
  snoozeText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 14,
  },
  acceptText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  completeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.success + '20',
    borderRadius: 12,
    padding: 14,
  },
  completeText: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '600',
  },
  otherSection: {
    gap: 12,
  },
  otherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  otherRank: {
    backgroundColor: colors.surfaceElevated,
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otherRankText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  otherContent: {
    flex: 1,
  },
  otherTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  otherMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  smallDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  otherMetaText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  otherSnooze: {
    padding: 8,
  },
});

