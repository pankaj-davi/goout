module.exports = {
  root: true,
  extends: [
    '@react-native',
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors.
  ],
  plugins: ['prettier'], // Adds the Prettier plugin.
  rules: {
    'prettier/prettier': 'error', // Makes Prettier errors show up as errors in ESLint.
    // Add additional custom rules here if needed
    'no-console': 'warn', // Example rule: warn when console.log is used
  },
};
