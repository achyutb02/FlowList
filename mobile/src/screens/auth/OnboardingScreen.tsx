import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, getEnergyColor } from '../../theme/colors';
import { AuthStackScreenProps } from '../../navigation/types';

const { width } = Dimensions.get('window');

const STEPS = [
  {
    title: 'Welcome to FlowList',
    description: 'Your compassionate AI coach for sustainable productivity. We\'ll help you do the right work at the right time.',
    icon: '✨',
  },
  {
    title: 'Energy Matters',
    description: 'We match tasks to your energy level. Low energy? We\'ll suggest lighter tasks. High energy? Time for deep work.',
    icon: '⚡',
  },
  {
    title: 'One Task at a Time',
    description: 'No more decision paralysis. We\'ll tell you exactly what to do next based on how you feel right now.',
    icon: '🎯',
  },
];

export default function OnboardingScreen({ navigation }: AuthStackScreenProps<'Onboarding'>) {
  const [currentStep, setCurrentStep] = useState(0);
  const [energy, setEnergy] = useState(3);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      navigation.getParent()?.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    }
  };

  const handleSkip = () => {
    navigation.getParent()?.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  const step = STEPS[currentStep];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <View style={styles.stepContent}>
          <Text style={styles.icon}>{step.icon}</Text>
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.description}>{step.description}</Text>

          {currentStep === 1 && (
            <View style={styles.energyDemo}>
              <Text style={styles.energyLabel}>Try it: How's your energy right now?</Text>
              <View style={styles.energyButtons}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.energyButton,
                      { backgroundColor: getEnergyColor(level) + (energy === level ? 'FF' : '40') },
                      energy === level && styles.energyButtonActive,
                    ]}
                    onPress={() => setEnergy(level)}
                  >
                    <Text style={[
                      styles.energyButtonText,
                      energy === level && styles.energyButtonTextActive,
                    ]}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.energyHint}>
                {energy <= 2 ? '💤 Low energy - we\'ll suggest lighter tasks' :
                 energy >= 4 ? '🔥 High energy - time for challenging work!' :
                 '🌤 Moderate energy - balanced task selection'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <View style={styles.pagination}>
            {STEPS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentStep && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentStep === STEPS.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  skipButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  skipText: {
    color: colors.textMuted,
    fontSize: 16,
  },
  stepContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 80,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  energyDemo: {
    marginTop: 32,
    alignItems: 'center',
    width: '100%',
  },
  energyLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  energyButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  energyButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  energyButtonActive: {
    transform: [{ scale: 1.1 }],
  },
  energyButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    opacity: 0.7,
  },
  energyButtonTextActive: {
    opacity: 1,
    fontWeight: '700',
  },
  energyHint: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  footer: {
    paddingTop: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  paginationDotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  nextButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
});

