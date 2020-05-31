module.exports = {
  pages: {
    index: {
      entry: 'src/main.js', // 必須パラメータ
      title: '【東京都】新型コロナ陽性患者数の集計（直近15日）',
    }
  },
  devServer: {
    proxy: 'https://stopcovid19.metro.tokyo.lg.jp'
  }
};