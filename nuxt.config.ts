export default defineNuxtConfig({
  devtools: { enabled: true },
  app: {
    head: {
      title: 'Weather Finder',
      meta: [
        { name: 'description', content: '地域名と日付から天気を確認できる Nuxt アプリです。' }
      ]
    }
  }
})
