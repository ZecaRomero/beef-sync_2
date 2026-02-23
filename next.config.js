const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  outputFileTracingRoot: path.join(__dirname, './'),
  webpack: (config, { isServer }) => {
    // Twilio opcional - não falha build se não instalado
    config.resolve.fallback = { ...config.resolve.fallback, fs: false };
    if (isServer) {
      const orig = config.externals || [];
      config.externals = [...(Array.isArray(orig) ? orig : [orig]), ({ request }, cb) => {
        if (request === 'twilio') {
          try {
            require.resolve('twilio');
            return cb();
          } catch {
            return cb(null, 'commonjs ' + request);
          }
        }
        cb();
      }];
    }
    return config;
  },
}

module.exports = nextConfig
