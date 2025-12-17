import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// Auth stack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  Onboarding: undefined;
};

// Main tab navigator
export type MainTabParamList = {
  DoNow: undefined;
  Tasks: undefined;
  Profile: undefined;
};

// Task stack (nested in Tasks tab)
export type TaskStackParamList = {
  TaskList: undefined;
  TaskDetail: { taskId: string };
  CreateTask: undefined;
};

// Root navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Context: undefined;
};

// Screen props types
export type AuthStackScreenProps<T extends keyof AuthStackParamList> = 
  NativeStackScreenProps<AuthStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = 
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;

export type TaskStackScreenProps<T extends keyof TaskStackParamList> = 
  NativeStackScreenProps<TaskStackParamList, T>;

export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;

