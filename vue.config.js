module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      chainWebpackRendererProcess(config) {
        config.plugins.delete('workbox')
        config.plugins.delete('pwa')
      },
      builderOptions: {
        "win": {
          "icon": "dist_electron/bigIcon.png"
        }, 
        "productName": "郭麒麟鼓励师"
      }
    }
  }
}
