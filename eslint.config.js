// eslint.config.js
import antfu from '@antfu/eslint-config'

export default antfu({
  // Type of the project. 'lib' for libraries, the default is 'app'
  type: 'lib',

  // Enable stylistic formatting rules
  // stylistic: true,

  // Or customize the stylistic rules
  stylistic: {
    indent: 2, // 4, or 'tab'
    quotes: 'single', // or 'double'
  },

  // TypeScript and Vue are autodetected, you can also explicitly enable them:
  typescript: true,
  vue: true,

  // Disable jsonc and yaml support
  jsonc: false,
  yaml: false,

  // `.eslintignore` is no longer supported in Flat config, use `ignores` instead
  ignores: [
    '**/fixtures',
    '@typescript-eslint/ban-ts-comment',
    // ...globs
  ],

  // Custom rules
  rules: {
    // 关闭 console 警告
    'no-console': 'off',
    // 关闭 TypeScript 函数返回类型检查
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    // 关闭未使用变量检查
    '@typescript-eslint/no-unused-vars': 'off',
    'vue/no-restricted-v-bind': 'off',
    'n/prefer-global/process': 'off',
    'eslint/no-unused-vars': 'warn',
  },
})
