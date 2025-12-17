import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TaskStackParamList } from './types';
import TaskListScreen from '../screens/tasks/TaskListScreen';
import TaskDetailScreen from '../screens/tasks/TaskDetailScreen';
import CreateTaskScreen from '../screens/tasks/CreateTaskScreen';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator<TaskStackParamList>();

export default function TaskNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="TaskList" 
        component={TaskListScreen}
        options={{ title: 'Tasks' }}
      />
      <Stack.Screen 
        name="TaskDetail" 
        component={TaskDetailScreen}
        options={{ title: 'Task Details' }}
      />
      <Stack.Screen 
        name="CreateTask" 
        component={CreateTaskScreen}
        options={{ 
          title: 'New Task',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
}

