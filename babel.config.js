const plugins = [
  ['component', {
    "libraryName": "element-ui",
    "styleLibraryName": "theme-chalk"
  }],["@babel/transform-runtime"]
]
if (process.env.NODE_ENV === 'production') {
  plugins.push('transform-remove-console')
}
module.exports = {
  plugins: plugins,
  presets: [
    [
      '@vue/app', {
        modules: false,
        targets: {
          browsers: ["> 1%", "last 2 versions", "not ie <= 8", "Android >= 7", "iOS >= 8"]
        },
        useBuiltIns: 'usage'
      }
    ],
    ["@babel/preset-env", {
      "modules": false, "targets": {
        "browsers": ["> 0.25%", "not dead"]
      }
    }],
  ]
}
