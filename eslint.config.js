import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: {
      'import/resolver': {
        alias: {
          map: [['@', './src']],
          extensions: ['.js', '.jsx', '.json'],
        },
      }
    },
    rules: {
      'no-unused-vars': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@/task/pages/**', '@/task/sections/**', '@/task/features/**', '@/task/entities/**',
                '@/organization/pages/**', '@/organization/sections/**', '@/organization/features/**', '@/organization/entities/**',
                '@/crew/pages/**', '@/crew/sections/**', '@/crew/features/**', '@/crew/entities/**',
                '@/project/pages/**', '@/project/sections/**', '@/project/features/**', '@/project/entities/**',
                '@/dashboard/pages/**', '@/dashboard/sections/**', '@/dashboard/features/**', '@/dashboard/entities/**',
                '@/calendar/pages/**', '@/calendar/sections/**', '@/calendar/features/**', '@/calendar/entities/**',
                '@/focus/pages/**', '@/focus/sections/**', '@/focus/features/**', '@/focus/entities/**',
                '@/note/pages/**', '@/note/sections/**', '@/note/features/**', '@/note/entities/**',
                '@/whiteboard/pages/**', '@/whiteboard/sections/**', '@/whiteboard/features/**', '@/whiteboard/entities/**',
                '@/identity/pages/**', '@/identity/sections/**', '@/identity/features/**', '@/identity/entities/**',
                '@/inbox/pages/**', '@/inbox/sections/**', '@/inbox/features/**', '@/inbox/entities/**',
                '@/analytics/pages/**', '@/analytics/sections/**', '@/analytics/features/**', '@/analytics/entities/**',
                '@/library/pages/**', '@/library/sections/**', '@/library/features/**', '@/library/entities/**',
                '@/settings/pages/**', '@/settings/sections/**', '@/settings/features/**', '@/settings/entities/**',
                '@/platform/pages/**', '@/platform/sections/**', '@/platform/features/**', '@/platform/entities/**'
              ],
              message: 'Deep imports from domains are forbidden. Please import from the domain public API (e.g., @/task).'
            },
            {
              group: [
                '@/pages/**', '@/features/**', '@/widgets/**', '@/entities/**'
              ],
              message: 'Legacy root-level folders are permanently banned by the Domain-Oriented FSD architecture. Use the proper domain.'
            }
          ]
        }
      ]
    },
  },
])
