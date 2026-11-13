import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.velocity.speedmeter',
  appName: 'Velocity',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    // 启动屏幕与状态栏深色模式配置
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: '#000000',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false
    }
  },
  ios: {
    contentInset: 'always',
    preferredContentMode: 'mobile',
    scheme: 'Velocity'
  }
}

export default config
