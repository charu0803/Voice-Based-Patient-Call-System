import { Platform } from 'react-native';

// Replace this with the correct IP address of your backend server
const BACKEND_IP = '192.168.29.224'; // Update this to match your backend server's IP

// Development environment configuration
const DEV_CONFIG = {
  HOST: Platform.select({
    ios: 'localhost', // For iOS simulator
    android: BACKEND_IP, // For Android emulator or physical devices
  }),
  PORT: '3000',
};

// Production environment configuration (update with actual production host and port if needed)
const PROD_CONFIG = {
  HOST: 'your-production-host.com',
  PORT: '443',
};

// Select configuration based on environment
const ENV = __DEV__ ? DEV_CONFIG : PROD_CONFIG;

// Export configuration
export const CONFIG = {
  API_URL: `http://${ENV.HOST}:${ENV.PORT}/api`, // Base URL for API
  SOCKET_URL: `http://${ENV.HOST}:${ENV.PORT}`, // Base URL for WebSocket
};
