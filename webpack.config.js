module.exports = {
    // ... other webpack configurations
    resolve: {
      fallback: {
        fs: false,
        path: false,
        util: false
      }
    },
    module: {
      rules: [
        // ... other rules
        {
          test: /\.wasm$/,
          type: 'webassembly/async'
        }
      ]
    },
    experiments: {
      asyncWebAssembly: true
    }
  };