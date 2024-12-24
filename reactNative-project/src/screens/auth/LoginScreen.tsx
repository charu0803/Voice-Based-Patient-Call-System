import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Text, TextInput, Button, Surface, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../theme'; // Import Colors

const { width } = Dimensions.get('window');

const validationSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

export default function LoginScreen() {
  const { login } = useAuth();
  const navigation = useNavigation<NavigationProp<any>>();
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (values: any) => {
    try {
      await login(values.email, values.password);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={[Colors.primary, Colors.secondary]} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(200)} style={styles.headerContainer}>
          <Surface style={styles.logoContainer}>
            <Icon name="hospital-building" size={60} color={Colors.text} />
          </Surface>
          <Text style={styles.title}>Healthcare</Text>
          <Text style={styles.subtitle}>Management System</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400)} style={styles.formContainer}>
          <BlurView intensity={80} style={styles.formBlur}>
            <Formik initialValues={{ email: '', password: '' }} validationSchema={validationSchema} onSubmit={handleSubmit}>
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isValid, dirty }) => (
                <View style={styles.form}>
                  <TextInput
                    mode="outlined"
                    label="Email"
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    error={touched.email && !!errors.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    left={<TextInput.Icon icon="email" />}
                    style={styles.input}
                  />
                  {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                  <TextInput
                    mode="outlined"
                    label="Password"
                    value={values.password}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    error={touched.password && !!errors.password}
                    secureTextEntry={!showPassword}
                    left={<TextInput.Icon icon="lock" />}
                    right={<TextInput.Icon icon={showPassword ? 'eye-off' : 'eye'} onPress={() => setShowPassword(!showPassword)} />}
                    style={styles.input}
                  />
                  {touched.password && errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                  <TouchableOpacity style={styles.forgotPassword}>
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                  </TouchableOpacity>

                  <Button
                    mode="contained"
                    onPress={() => handleSubmit()}
                    disabled={!isValid || !dirty}
                    style={styles.button}
                    contentStyle={styles.buttonContent}
                  >
                    Login
                  </Button>

                  <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.registerText}>
                      Don't have an account? <Text style={styles.registerLink}>Register</Text>
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </Formik>
          </BlurView>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    marginBottom: 20,
    backgroundColor: Colors.primary,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: Colors.text,
    textAlign: 'center',
    marginTop: 8,
  },
  formContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    width: width - 40,
  },
  formBlur: {
    padding: 20,
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 8,
    backgroundColor: Colors.background,
  },
  errorText: {
    color: '#ff1744',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 12,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: Colors.primary,
    fontSize: 14,
  },
  button: {
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  registerButton: {
    alignItems: 'center',
  },
  registerText: {
    color: Colors.text,
    fontSize: 14,
  },
  registerLink: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    color: Colors.secondary,
  },
});
