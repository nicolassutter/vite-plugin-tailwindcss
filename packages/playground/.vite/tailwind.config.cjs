const TW_CONFIG = require('./_tailwind.config.cjs');
const config = 'default' in TW_CONFIG ? TW_CONFIG.default : TW_CONFIG
module.exports = config;