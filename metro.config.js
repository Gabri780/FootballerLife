const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Habilita soporte para import.meta (requerido por Zustand v5 en web)
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
};

// Fuerza resolver a usar el campo "module" de package.json para web
config.resolver = {
  ...config.resolver,
  unstable_enablePackageExports: true,
  unstable_conditionNames: ['require', 'import', 'react-native', 'browser'],
};

module.exports = config;
