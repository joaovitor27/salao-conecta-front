// .eslintrc.cjs
const ts = require('typescript-eslint');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const reactRefresh = require('eslint-plugin-react-refresh');
const sonarjs = require('eslint-plugin-sonarjs');
const importPlugin = require('eslint-plugin-import');

module.exports = [
  // Configurações base
  require('eslint').configs.recommended,
  ...ts.configs.recommended,
  sonarjs.configs.recommended,
  require('eslint-config-prettier'), // Sempre por último para desativar regras conflitantes

  // Configurações e regras específicas
  {
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      import: importPlugin,
      sonarjs,
    },

    languageOptions: {
      globals: {
        browser: true,
        es2020: true,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    settings: {
      react: {
        version: 'detect', // Detecta a versão do React automaticamente
      },
      'import/resolver': {
        typescript: true,
        node: true,
      },
    },

    rules: {
      // -- REGRAS DE BOAS PRÁTICAS --
      'no-console': ['warn', { allow: ['warn', 'error'] }], // Avisa sobre console.log, mas permite console.warn e error
      'no-unused-vars': 'off', // Desligado para usar a versão do TypeScript
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ], // Avisa sobre variáveis não usadas
      '@typescript-eslint/no-explicit-any': 'error', // Proíbe o uso do tipo `any`

      // -- REGRAS DO REACT --
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // Desnecessário com o novo JSX transform
      'react/prop-types': 'off', // Desnecessário quando se usa TypeScript
      'react/jsx-uses-react': 'off', // Desnecessário com o novo JSX transform
      'react/self-closing-comp': 'warn', // Componentes sem filhos devem se fechar
      'react/jsx-sort-props': [
        // Ordena as props de um componente
        'warn',
        {
          callbacksLast: true,
          shorthandFirst: true,
          noSortAlphabetically: false,
          reservedFirst: true,
        },
      ],
      'react-refresh/only-export-components': 'warn',

      // -- REGRAS DE ORGANIZAÇÃO DE IMPORTS --
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          pathGroups: [
            {
              pattern: 'react',
              group: 'external',
              position: 'before',
            },
            {
              pattern: '@/**',
              group: 'internal',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['react'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },
];
