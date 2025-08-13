module.exports = {
  extends: [
    'react-app',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript'
  ],
  plugins: [
    'import'
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json'
      },
      alias: {
        map: [
          ['@', './src'],
          ['@app', './src/app'],
          ['@features', './src/features'],
          ['@shared', './src/shared'],
          ['@core', './src/core'],
          ['@components', './src/components'],
          ['@hooks', './src/hooks'],
          ['@utils', './src/utils'],
          ['@services', './src/services'],
          ['@styles', './src/styles'],
          ['@config', './src/config'],
          ['@types', './src/types'],
          ['@lib', './src/lib'],
          ['@pages', './src/pages'],
          ['@assets', './src/assets'],
          ['@infrastructure', './src/infrastructure'],
          ['@security', './src/security'],
          ['@keyboard', './src/keyboard'],
          ['@accessibility', './src/accessibility']
        ],
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
      }
    },
    react: {
      version: 'detect'
    }
  },
  rules: {
    // Import 순서 규칙
    'import/order': [
      'error',
      {
        groups: [
          'builtin',      // Node.js 내장 모듈
          'external',     // 외부 라이브러리 (react, styled-components 등)
          'internal',     // 절대 경로 (@로 시작하는 내부 모듈)
          'parent',       // 상위 디렉토리 (../)
          'sibling',      // 같은 디렉토리 (./)
          'index',        // index 파일
          'type'          // 타입 import
        ],
        pathGroups: [
          // React 관련을 가장 먼저
          {
            pattern: 'react',
            group: 'external',
            position: 'before'
          },
          {
            pattern: 'react-*',
            group: 'external',
            position: 'before'
          },
          // 절대 경로 그룹화
          {
            pattern: '@app/**',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '@features/**',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '@shared/**',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '@core/**',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '@components/**',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '@hooks/**',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '@utils/**',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '@services/**',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '@styles/**',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '@config/**',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '@types/**',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '@lib/**',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '@pages/**',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '@assets/**',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '@infrastructure/**',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '@security/**',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '@keyboard/**',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '@accessibility/**',
            group: 'internal',
            position: 'before'
          }
        ],
        pathGroupsExcludedImportTypes: ['react'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true
        }
      }
    ],

    // 상대 경로 사용 제한
    'import/no-relative-packages': 'error',

    // 중복 import 방지
    'import/no-duplicates': 'error',

    // 절대 경로 선호
    'import/prefer-default-export': 'off',

    // 순환 참조 방지
    'import/no-cycle': ['error', { maxDepth: 10 }]
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      rules: {
        'import/no-relative-parent-imports': 'off'
      }
    }
  ]
};