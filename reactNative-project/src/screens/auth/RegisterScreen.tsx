import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import {
  Text,
  TextInput,
  Button,
  Surface,
  SegmentedButtons,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Department, departmentApi } from '../../services/api';
import { Picker } from '@react-native-picker/picker';
import { Colors } from '../../theme'; // Import Colors

const { width } = Dimensions.get('window');

const validationSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  role: Yup.string().required('Role is required'),
  department: Yup.string().when('role', {
    is: 'nurse',
    then: Yup.string().required('Department is required'),
    otherwise: Yup.string().notRequired(),
  }),
});

export default function RegisterScreen() {
  const { register } = useAuth();
  const navigation = useNavigation<NavigationProp<any>>();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await departmentApi.getAll();
        setDepartments(response.departments);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    fetchDepartments();
  }, []);

  const handleSubmit = async (values: any) => {
    try {
      await register(values);
      Alert.alert(
        'Success',
        'Registration successful! Please login.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      Alert.alert('Error', 'Registration failed. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={[Colors.primary, Colors.secondary]} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(200)} style={styles.headerContainer}>
          <Surface style={styles.logoContainer}>
            <Icon name="account-plus" size={60} color={Colors.text} />
          </Surface>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join our healthcare community</Text>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(400)}
          style={styles.formContainer}
          layout={Layout.springify()}
        >
          <BlurView intensity={80} style={styles.formBlur}>
            <Formik
              initialValues={{
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                confirmPassword: '',
                role: 'patient',
                department: '',
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <View style={styles.form}>
                  <TextInput
                    label="First Name"
                    mode="outlined"
                    style={styles.input}
                    value={values.firstName}
                    onChangeText={handleChange('firstName')}
                    error={touched.firstName && !!errors.firstName}
                  />
                  <TextInput
                    label="Last Name"
                    mode="outlined"
                    style={styles.input}
                    value={values.lastName}
                    onChangeText={handleChange('lastName')}
                    error={touched.lastName && !!errors.lastName}
                  />
                  <TextInput
                    label="Email"
                    mode="outlined"
                    style={styles.input}
                    value={values.email}
                    onChangeText={handleChange('email')}
                    error={touched.email && !!errors.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <TextInput
                    label="Password"
                    mode="outlined"
                    style={styles.input}
                    value={values.password}
                    onChangeText={handleChange('password')}
                    error={touched.password && !!errors.password}
                    secureTextEntry={!showPassword}
                    right={
                      <TextInput.Icon
                        icon={showPassword ? 'eye-off' : 'eye'}
                        onPress={() => setShowPassword(!showPassword)}
                      />
                    }
                  />
                  <TextInput
                    label="Confirm Password"
                    mode="outlined"
                    style={styles.input}
                    value={values.confirmPassword}
                    onChangeText={handleChange('confirmPassword')}
                    error={touched.confirmPassword && !!errors.confirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    right={
                      <TextInput.Icon
                        icon={showConfirmPassword ? 'eye-off' : 'eye'}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      />
                    }
                  />

                  <SegmentedButtons
                    value={values.role}
                    onValueChange={handleChange('role')}
                    buttons={[
                      { value: 'patient', label: 'Patient' },
                      { value: 'nurse', label: 'Nurse' },
                      { value: 'admin', label: 'Admin' },
                    ]}
                    style={styles.segmentedButtons}
                  />

                  {values.role === 'nurse' && (
                    <Picker
                      selectedValue={values.department}
                      onValueChange={handleChange('department')}
                      style={styles.picker}
                    >
                      <Picker.Item label="Select Department" value="" />
                      {departments.map(dept => (
                        <Picker.Item key={dept.id} label={dept.name} value={dept.id} />
                      ))}
                    </Picker>
                  )}

                  <Button
                    mode="contained"
                    style={styles.button}
                    onPress={() => handleSubmit()}
                    contentStyle={styles.buttonContent}
                  >
                    Register
                  </Button>
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
    marginBottom: 12,
    backgroundColor: Colors.background,
  },
  button: {
    marginTop: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  segmentedButtons: {
    marginVertical: 16,
  },
  picker: {
    marginBottom: 16,
  },
});
