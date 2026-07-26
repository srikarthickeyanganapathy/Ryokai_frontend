import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import boundaries from 'eslint-plugin-boundaries'
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
    plugins: {
      boundaries,
    },
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
      },
      'boundaries/include': ['src/**/*'],
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app/**/*' },
        { type: 'shared', pattern: 'src/shared/**/*' },
        { type: 'entity', pattern: 'src/entities/*/**/*' },
        { type: 'feature-task', pattern: ['src/features/task/**/*', 'src/features/tasks/**/*'] },
        { type: 'feature-personal', pattern: ['src/features/personal/**/*', 'src/features/notes/**/*', 'src/features/focus/**/*', 'src/features/calendar/**/*', 'src/features/saved/**/*'] },
        { type: 'feature-crew', pattern: ['src/features/crew/**/*', 'src/features/crews/**/*', 'src/features/whiteboards/**/*', 'src/features/projects/**/*'] },
        { type: 'feature-organization', pattern: ['src/features/organization/**/*', 'src/features/organizations/**/*', 'src/features/workload/**/*', 'src/features/goals/**/*'] },
        { type: 'feature-admin', pattern: 'src/features/admin/**/*' },
        { type: 'feature-other', pattern: ['src/features/analytics/**/*', 'src/features/auth/**/*', 'src/features/command-palette/**/*', 'src/features/notifications/**/*'] },
        { type: 'widget', pattern: 'src/widgets/*/**/*' },
        { type: 'page-personal', pattern: ['src/pages/personal/**/*', 'src/pages/notes/**/*', 'src/pages/focus/**/*', 'src/pages/calendar/**/*', 'src/pages/saved/**/*'] },
        { type: 'page-crew', pattern: ['src/pages/crew/**/*', 'src/pages/crews/**/*', 'src/pages/projects/**/*', 'src/pages/whiteboards/**/*'] },
        { type: 'page-organization', pattern: ['src/pages/organization/**/*', 'src/pages/organizations/**/*', 'src/pages/teams/**/*', 'src/pages/workload/**/*', 'src/pages/goals/**/*'] },
        { type: 'page-overview', pattern: ['src/pages/overview/**/*', 'src/pages/inbox/**/*', 'src/pages/workspace/**/*', 'src/pages/analytics/**/*'] },
        { type: 'page-other', pattern: ['src/pages/auth/**/*', 'src/pages/platform/**/*', 'src/pages/settings/**/*', 'src/pages/ui/**/*', 'src/pages/tasks/**/*'] },
      ],
    },
    rules: {
      'no-unused-vars': 'off',
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            // app can import anything
            { from: { element: { type: 'app' } }, allow: [{ to: '*' }] },
            // shared cannot import from layers above it
            { from: { element: { type: 'shared' } }, allow: [{ element: { type: 'shared' } }] },
            // entity can import shared and other entities (or itself)
            { from: { element: { type: 'entity' } }, allow: [{ element: { type: 'shared' } }, { element: { type: 'entity' } }] },
            // feature-task (shared task engine) can import shared, entity
            { from: { element: { type: 'feature-task' } }, allow: [{ element: { type: 'shared' } }, { element: { type: 'entity' } }, { element: { type: 'feature-task' } }] },
            // feature-personal can import shared, entity, feature-task, feature-other, and itself
            { from: { element: { type: 'feature-personal' } }, allow: [{ element: { type: 'shared' } }, { element: { type: 'entity' } }, { element: { type: 'feature-task' } }, { element: { type: 'feature-personal' } }, { element: { type: 'feature-other' } }] },
            // feature-crew can import shared, entity, feature-task, feature-other, and itself
            { from: { element: { type: 'feature-crew' } }, allow: [{ element: { type: 'shared' } }, { element: { type: 'entity' } }, { element: { type: 'feature-task' } }, { element: { type: 'feature-crew' } }, { element: { type: 'feature-other' } }] },
            // feature-organization can import shared, entity, feature-task, feature-other, and itself
            { from: { element: { type: 'feature-organization' } }, allow: [{ element: { type: 'shared' } }, { element: { type: 'entity' } }, { element: { type: 'feature-task' } }, { element: { type: 'feature-organization' } }, { element: { type: 'feature-other' } }] },
            // feature-admin (AC-7: Super Admin cannot access organization task data or any workspace feature)
            { from: { element: { type: 'feature-admin' } }, allow: [{ element: { type: 'shared' } }, { element: { type: 'entity' } }, { element: { type: 'feature-admin' } }, { element: { type: 'feature-other' } }] },
            // feature-other (auth, analytics, notifications, command-palette)
            { from: { element: { type: 'feature-other' } }, allow: [{ element: { type: 'shared' } }, { element: { type: 'entity' } }, { element: { type: 'feature-task' } }, { element: { type: 'feature-personal' } }, { element: { type: 'feature-crew' } }, { element: { type: 'feature-organization' } }, { element: { type: 'feature-other' } }] },
            // widgets can import shared, entity, any feature, or other widgets
            { from: { element: { type: 'widget' } }, allow: [{ element: { type: 'shared' } }, { element: { type: 'entity' } }, { element: { type: 'feature-task' } }, { element: { type: 'feature-personal' } }, { element: { type: 'feature-crew' } }, { element: { type: 'feature-organization' } }, { element: { type: 'feature-admin' } }, { element: { type: 'feature-other' } }, { element: { type: 'widget' } }] },
            // mode pages can import shared, entity, widgets, feature-task + their OWN workspace features
            { from: { element: { type: 'page-personal' } }, allow: [{ element: { type: 'shared' } }, { element: { type: 'entity' } }, { element: { type: 'widget' } }, { element: { type: 'feature-task' } }, { element: { type: 'feature-personal' } }, { element: { type: 'feature-other' } }, { element: { type: 'page-personal' } }] },
            { from: { element: { type: 'page-crew' } }, allow: [{ element: { type: 'shared' } }, { element: { type: 'entity' } }, { element: { type: 'widget' } }, { element: { type: 'feature-task' } }, { element: { type: 'feature-crew' } }, { element: { type: 'feature-other' } }, { element: { type: 'page-crew' } }] },
            { from: { element: { type: 'page-organization' } }, allow: [{ element: { type: 'shared' } }, { element: { type: 'entity' } }, { element: { type: 'widget' } }, { element: { type: 'feature-task' } }, { element: { type: 'feature-organization' } }, { element: { type: 'feature-other' } }, { element: { type: 'page-organization' } }] },
            // page-overview (dashboard, inbox) can import shared, entity, widgets, feature-other (NOT feature-personal/crew/org/task directly)
            { from: { element: { type: 'page-overview' } }, allow: [{ element: { type: 'shared' } }, { element: { type: 'entity' } }, { element: { type: 'widget' } }, { element: { type: 'feature-other' } }, { element: { type: 'page-overview' } }] },
            // page-other can import shared, entity, widget, any feature
            { from: { element: { type: 'page-other' } }, allow: [{ element: { type: 'shared' } }, { element: { type: 'entity' } }, { element: { type: 'widget' } }, { element: { type: 'feature-task' } }, { element: { type: 'feature-personal' } }, { element: { type: 'feature-crew' } }, { element: { type: 'feature-organization' } }, { element: { type: 'feature-admin' } }, { element: { type: 'feature-other' } }, { element: { type: 'page-other' } }] },
          ],
        },
      ],
    },
  },
])
