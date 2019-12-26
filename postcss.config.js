module.exports = {
  plugins: {
    'postcss-import': {},
    'postcss-url': {},
    'postcss-aspect-ratio-mini': {},
    'postcss-write-svg': {
      utf8: false
    },
    'postcss-cssnext': {},
    'postcss-px-to-viewport': {
      viewportWidth: 750, // (Number) 设计稿宽度
      viewportHeight: 1334, // (Number) 随便填一个
      unitPrecision: 3, // (Number) 小数点后几位
      viewportUnit: 'vw', // (String) vw
      selectorBlackList: ['.ignore', '.hairlines'], // (Array) The selectors to ignore and leave as px.
      minPixelValue: 1, // (Number) 大于这个值才转换
      mediaQuery: false // (Boolean) 忽略媒体查询
    },
    'postcss-viewport-units': {},
    cssnano: {
      'cssnano-preset-advanced': {
        zindex: false,
        autoprefixer: false
      }
    }
  }
};
