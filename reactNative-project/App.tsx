import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { AuthProvider } from './src/contexts/AuthContext';
import { LLMProvider } from './src/contexts/LLMContext';
import RootNavigator from './src/navigation/RootNavigator';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from './src/theme'; // Import Colors

export default function App() {
  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: Colors.primary,
      background: Colors.background,
      text: Colors.text,
      accent: Colors.secondary,
      placeholder: Colors.mutedText,
    },
  };

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <AuthProvider>
          <LLMProvider>
            <RootNavigator />
          </LLMProvider>
        </AuthProvider>
      </NavigationContainer>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
