<template>
  <div id="app">
    <h1 class="title">【東京都】<br>新型コロナ陽性患者数の集計<span>（直近30日）</span></h1>
    <chart></chart>
  </div>
</template>

<script>
import Chart from './components/Chart.vue'

export default {
  name: 'App',
  components: {
    Chart
  }
}
</script>

<style lang="sass">
#app
  max-width: 800px
  font-family: Avenir, Helvetica, Arial, sans-serif
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
  text-align: center
  color: #2c3e50
  margin: 30px auto

.title
  margin-bottom: 40px
  font-size: 24px
  line-height: 1.5
  span
    display: block
    margin-top: 5px
    font-size: 18px
</style>
