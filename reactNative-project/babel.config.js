module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo'
    ],
    plugins: [
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
        blocklist: null, // Replacing deprecated "blacklist"
        allowlist: ['API_URL', 'SOCKET_URL'], // Replacing deprecated "whitelist"
        safe: false,
        allowUndefined: true,
      }]
    ],
  };
};
