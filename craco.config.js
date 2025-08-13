const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

// 성능 최적화 플래그들
const isProduction = process.env.NODE_ENV === 'production';
const shouldAnalyze = process.env.ANALYZE === 'true';
const isAPKBuild = process.env.APK_BUILD === 'true';

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@app': path.resolve(__dirname, 'src/app'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@core': path.resolve(__dirname, 'src/core'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@config': path.resolve(__dirname, 'src/config'),
      '@types': path.resolve(__dirname, 'src/types'),
      '@lib': path.resolve(__dirname, 'src/lib'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@infrastructure': path.resolve(__dirname, 'src/infrastructure'),
      '@security': path.resolve(__dirname, 'src/security'),
      '@keyboard': path.resolve(__dirname, 'src/keyboard'),
      '@accessibility': path.resolve(__dirname, 'src/accessibility')
    },
    
    // APK 크기 50% 감소를 위한 고급 웹팩 최적화
    configure: (webpackConfig, { env, paths }) => {
      // 개발 환경 최적화
      if (env === 'development') {
        // 개발 환경에서 빠른 빌드를 위한 설정
        webpackConfig.cache = {
          type: 'filesystem',
          buildDependencies: {
            config: [__filename],
          },
        };
        
        // HMR 최적화
        webpackConfig.optimization.moduleIds = 'named';
        webpackConfig.optimization.chunkIds = 'named';
      }

      // 프로덕션에서만 최적화 적용
      if (isProduction) {
        
        // 1. Source maps 완전 제거 (1-2MB 절약)
        webpackConfig.devtool = false;
        
        // 2. 최적화 설정 강화
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          
          // 초고급 코드 분할 전략
          splitChunks: {
            chunks: 'all',
            maxAsyncRequests: isAPKBuild ? 20 : 30,
            maxInitialRequests: isAPKBuild ? 15 : 30,
            minSize: isAPKBuild ? 30000 : 20000,
            maxSize: isAPKBuild ? 200000 : 300000,
            enforceSizeThreshold: 50000,
            cacheGroups: {
              // React 핵심 라이브러리 (가장 높은 우선순위)
              react: {
                test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                name: 'react-core',
                priority: 50,
                reuseExistingChunk: true,
                enforce: true,
              },
              
              // React Router (중간 우선순위)
              router: {
                test: /[\\/]node_modules[\\/](react-router|react-router-dom)[\\/]/,
                name: 'react-router',
                priority: 40,
                reuseExistingChunk: true,
                enforce: true,
              },
              
              // React Query (데이터 페칭)
              reactQuery: {
                test: /[\\/]node_modules[\\/]@tanstack[\\/]react-query[\\/]/,
                name: 'react-query',
                priority: 35,
                reuseExistingChunk: true,
                enforce: true,
              },
              
              // Styled Components (스타일링)
              styles: {
                test: /[\\/]node_modules[\\/](styled-components)[\\/]/,
                name: 'styled-components',
                priority: 30,
                reuseExistingChunk: true,
                enforce: true,
              },
              
              // Supabase (백엔드 서비스)
              supabase: {
                test: /[\\/]node_modules[\\/]@supabase[\\/]/,
                name: 'supabase',
                priority: 25,
                reuseExistingChunk: true,
                enforce: true,
              },
              
              // Capacitor (모바일 브릿지)
              capacitor: {
                test: /[\\/]node_modules[\\/]@capacitor[\\/]/,
                name: 'capacitor',
                priority: 20,
                reuseExistingChunk: true,
                enforce: true,
              },
              
              // 큰 라이브러리들 분리
              heavyLibs: {
                test: /[\\/]node_modules[\\/](lodash|moment|date-fns|rxjs)[\\/]/,
                name: 'heavy-libs',
                priority: 18,
                reuseExistingChunk: true,
                enforce: true,
              },
              
              // 나머지 vendor 라이브러리들
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                priority: 10,
                reuseExistingChunk: true,
                minChunks: 1,
              },
              
              // 공통 컴포넌트들
              common: {
                name: 'common',
                minChunks: 2,
                priority: 5,
                reuseExistingChunk: true,
                maxSize: 100000,
              },
              
              // 페이지별 청크 (지연 로딩)
              pages: {
                test: /[\\/]src[\\/](features|pages)[\\/]/,
                name: 'pages',
                priority: 8,
                reuseExistingChunk: true,
                chunks: 'async',
              }
            }
          },
          runtimeChunk: 'single',
          concatenateModules: true,
          
          // 사용하지 않는 코드 제거 강화
          usedExports: true,
          sideEffects: false,
          providedExports: true,
          innerGraph: true,
          
          // Tree shaking 최적화
          mangleExports: 'size',
          removeAvailableModules: true,
          removeEmptyChunks: true,
          mergeDuplicateChunks: true,
          flagIncludedChunks: true,
          
          // Terser 초고급 최적화 설정
          minimizer: [
            new TerserPlugin({
              terserOptions: {
                parse: {
                  ecma: 2020,
                },
                compress: {
                  ecma: 2015,
                  warnings: false,
                  comparisons: false,
                  inline: 3,
                  
                  // 프로덕션 최적화
                  drop_console: isAPKBuild,
                  drop_debugger: true,
                  pure_funcs: isAPKBuild ? [
                    'console.log', 
                    'console.info', 
                    'console.debug', 
                    'console.warn',
                    'console.trace'
                  ] : ['console.debug', 'console.trace'],
                  
                  // 고급 압축 옵션
                  dead_code: true,
                  global_defs: {
                    '@alert': 'console.log',
                    DEBUG: false,
                  },
                  
                  // 조건부 제거
                  conditionals: true,
                  unused: true,
                  if_return: true,
                  join_vars: true,
                  sequences: true,
                  
                  // 함수 인라인화
                  collapse_vars: true,
                  reduce_vars: true,
                  hoist_funs: true,
                  hoist_vars: false,
                  
                  // 루프 최적화
                  loops: true,
                  
                  // 수학 최적화
                  evaluate: true,
                  unsafe_math: true,
                  
                  // 문자열 최적화
                  unsafe_comps: true,
                  unsafe_regexp: true,
                  
                  // 메서드 최적화
                  unsafe_methods: true,
                  
                  // 속성 접근 최적화
                  properties: true,
                  keep_fargs: false,
                  
                  // APK 빌드시 추가 최적화
                  ...(isAPKBuild && {
                    passes: 3,
                    unsafe_arrows: true,
                    unsafe_proto: true,
                    unsafe_undefined: true,
                    typeofs: false,
                  })
                },
                mangle: {
                  safari10: true,
                  properties: {
                    regex: /^_/,
                  },
                  toplevel: true,
                  eval: true,
                },
                output: {
                  ecma: 2015,
                  comments: false,
                  ascii_only: true,
                  beautify: false,
                  semicolons: false,
                },
                toplevel: true,
                nameCache: {},
                ie8: false,
                keep_fnames: false,
                safari10: true,
              },
              parallel: true,
              extractComments: false,
            }),
          ],
        };
        
        // 3. 성능 힌트 설정
        webpackConfig.performance = {
          maxAssetSize: isAPKBuild ? 300000 : 500000,      // APK: 300KB, 웹: 500KB
          maxEntrypointSize: isAPKBuild ? 400000 : 600000, // APK: 400KB, 웹: 600KB
          hints: isAPKBuild ? 'error' : 'warning'
        };
        
        // 4. 압축 플러그인들
        const compressionPlugins = [
          // Gzip 압축 (모든 빌드)
          new CompressionPlugin({
            algorithm: 'gzip',
            test: /\.(js|css|html|svg|woff|woff2)$/,
            threshold: isAPKBuild ? 4096 : 8192,
            minRatio: 0.8,
            deleteOriginalAssets: false,
          })
        ];

        // Brotli 압축 (웹 빌드만)
        if (!isAPKBuild) {
          compressionPlugins.push(
            new CompressionPlugin({
              filename: '[path][base].br',
              algorithm: 'brotliCompress',
              test: /\.(js|css|html|svg)$/,
              compressionOptions: {
                level: 11,
              },
              threshold: 10240,
              minRatio: 0.8,
              deleteOriginalAssets: false,
            })
          );
        }

        webpackConfig.plugins.push(...compressionPlugins);

        // 5. 번들 분석기 (필요시)
        if (shouldAnalyze) {
          webpackConfig.plugins.push(
            new BundleAnalyzerPlugin({
              analyzerMode: 'static',
              openAnalyzer: false,
              reportFilename: 'bundle-report.html',
            })
          );
        }

        // 6. 리소스 최적화
        webpackConfig.module.rules.forEach(rule => {
          // 이미지 최적화
          if (rule.test && rule.test.toString().includes('png|jpe?g|gif|svg')) {
            if (rule.use && Array.isArray(rule.use)) {
              rule.use = rule.use.map(useItem => {
                if (typeof useItem === 'object' && useItem.loader && useItem.loader.includes('file-loader')) {
                  return {
                    ...useItem,
                    options: {
                      ...useItem.options,
                      limit: isAPKBuild ? 4096 : 8192, // APK에서는 더 작은 인라인 제한
                    }
                  };
                }
                return useItem;
              });
            }
          }
        });

        // 7. 모듈 해상도 최적화
        webpackConfig.resolve.modules = [
          path.resolve(__dirname, 'src'),
          'node_modules'
        ];

        // 8. 외부 라이브러리 최적화 (APK 빌드시)
        if (isAPKBuild) {
          webpackConfig.externals = {
            // 런타임에 CDN에서 로드할 라이브러리들
            // 'react': 'React',
            // 'react-dom': 'ReactDOM',
          };
        }
      }

      // 공통 최적화 (개발/프로덕션)
      
      // 1. 해상도 확장자 우선순위 최적화
      webpackConfig.resolve.extensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];
      
      // 2. 모듈 최적화
      webpackConfig.resolve.symlinks = false;
      
      // 3. 빌드 시간 최적화를 위한 thread-loader 활성화 (개발 환경)
      if (env === 'development') {
        const threadLoaderRule = {
          test: /\.(js|mjs|jsx|ts|tsx)$/,
          include: path.resolve(__dirname, 'src'),
          use: [
            {
              loader: require.resolve('thread-loader'),
              options: {
                poolTimeout: 2000,
                workers: require('os').cpus().length - 1,
              },
            },
          ],
        };
        
        // 기존 JS/TS 룰 앞에 추가
        const jsRuleIndex = webpackConfig.module.rules.findIndex(
          rule => rule.test && rule.test.toString().includes('\\.(js|mjs|jsx|ts|tsx)$')
        );
        
        if (jsRuleIndex !== -1) {
          webpackConfig.module.rules.splice(jsRuleIndex, 0, threadLoaderRule);
        }
      }
      
      return webpackConfig;
    }
  }
};