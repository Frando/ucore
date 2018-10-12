import buble from 'rollup-plugin-buble'
import cjs from 'rollup-plugin-commonjs'
import globals from 'rollup-plugin-node-globals'
import builtins from 'rollup-plugin-node-builtins'
import replace from 'rollup-plugin-replace'
import resolve from 'rollup-plugin-node-resolve'

export default {
  input: 'client-react.js',
  output: {
    file: 'client-react.build.js',
    format: 'iife',
    sourcemap: true
  },
  plugins: [
    replace({ 
      delimiters: ['', ''],
      'process.env.NODE_ENV': JSON.stringify('development') ,
      exclude: /rollup-plugin-node-builtins/,
      // exclude: /node_modules/,
      // google for "rollup readable-stream" on why this is needed...
      'const cache = require.cache': 'const cache = {}',
      'process.env.NODE_ENV': JSON.stringify('development'),
      'require(\'readable-stream/transform\')': 'require(\'stream\').Transform',
      'require("readable-stream/transform")': 'require("stream").Transform',
      'require("readable-stream")': 'require("stream")',
      'require(\'readable-stream\')': 'require(\'stream\')',
      'readable-stream': 'stream'
    }),
    buble({
      exclude: /node_modules/,
      objectAssign: 'Object.assign',
      transforms: {
        arrow: true,
        classes: true, 
        computedProperty: true, 
        conciseMethodProperty: true, 
        dangerousForOf: true, 
        dangerousTaggedTemplateString: true, 
        defaultParameter: true, 
        destructuring: true, 
        forOf: true, 
        generator: false, 
        letConst: true, 
        modules: false, 
        numericLiteral: true, 
        parameterDestructuring: true, 
        reservedProperties: true, 
        spreadRest: true, 
        stickyRegExp: true, 
        templateString: true, 
        unicodeRegExp: true
      }
    }),
    resolve({
      browser: true,
      main: true,
      jsnext: true
    }),
    cjs({
      // include: /node_modules/,
      namedExports: {
        'react': [ 'Children', 'Component', 'PropTypes', 'createElement' ],
        'react-dom': [ 'render' ],
        'immer': [ 'produce' ],
        '**process/browser.js': ['nextTick']
      }
    }),
    globals(),
    builtins()
  ]
}
