const path = require('path');
const fs = require('fs');

const envFile =
  process.env.NODE_ENV === 'development' ? '.env.development' : '.env'; // Default to .env for other environments

// Ensure the file exists
if (!fs.existsSync(path.resolve(__dirname, envFile))) {
  throw new Error(`Environment file ${envFile} does not exist.`);
}

module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
    ['@babel/plugin-transform-private-methods', { loose: true }],
    ['@babel/plugin-transform-class-properties', { loose: true }],
    ['@babel/plugin-transform-private-property-in-object', { loose: true }],
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: envFile, // Dynamically set the path based on environment
        blocklist: null,
        allowlist: null,
        safe: false,
        allowUndefined: true,
      },
    ],
  ],
  overrides: [
    {
      test: (fileName) => !fileName.includes('node_modules'),
      plugins: [
        [require('@babel/plugin-proposal-class-properties'), { loose: true }],
      ],
    },
  ],
};
