import type { UserConfigExport } from '@tarojs/cli'

export default {
  defineConstants: {
    API_BASE_URL: '"https://your-domain.com/api/v1"',
  },
  mini: {},
  h5: {},
} satisfies UserConfigExport<'webpack5'>
