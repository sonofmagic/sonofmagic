import { icebreaker } from '@icebreakers/eslint-config'

export default icebreaker(
  {
    ignores: ['**/fixtures/**'],
    rules: {
      'ts/no-use-before-define': ['warn', {
        classes: true,
        functions: false,
        variables: true,
      }],
    },
    formatters: {
      css: true,
      graphql: true,
      html: true,
      markdown: true,
      prettierOptions: {
        endOfLine: 'lf',
      },
    },
  },
)
