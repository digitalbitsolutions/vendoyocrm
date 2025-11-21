// eslint.config.cjs
const { FlatCompat } = require('@eslint/eslintrc');
const legacy = require('./.eslintrc.cjs');

const compat = new FlatCompat({ baseDirectory: __dirname });

// Convert legacy config to flat config
module.exports = compat.fromLegacyConfig(legacy);
