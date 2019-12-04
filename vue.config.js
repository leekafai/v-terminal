console.log(process.env.NODE_ENV, 'env', process.env.NODE_ENV === 'development' ? null : '/static/')
module.exports = {
  productionSourceMap: false,
  configureWebpack: {
    module: {
      rules: [
          {
              test: /\.worker\.js$/,
              loader: 'worker-loader',
              options: {
                inline: true,
                fallback: false,
                name: '[name].js'
              }
          }
      ]
  },
  },
  devServer: {
    host: '0.0.0.0',
    disableHostCheck: true,
    port: 80
  }
  // publicPath: process.env.NODE_ENV === 'development' ? undefined : '/static/'
}
