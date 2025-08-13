const path = require('path');

module.exports = function override(config, env) {
  // Production optimizations
  if (env === 'production') {
    // Enable code splitting
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
          },
          common: {
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      },
    };

    // Minimize bundle size
    config.optimization.minimize = true;
    
    // Add performance hints
    config.performance = {
      hints: 'warning',
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    };
  }

  return config;
};