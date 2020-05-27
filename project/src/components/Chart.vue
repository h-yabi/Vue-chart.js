
<script>
import { Bar } from 'vue-chartjs';
import axios from 'axios';
import moment from 'moment'

export default {
  extends: Bar,
  name: 'chart',
  data () {
    return {
      data: {
        labels: [],
        datasets: [
          {
            label: '男性',
            data: [10, 30, 20, 30, 50, 10],
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            fill: false,
            type: 'bar',
            lineTension: 0.3,
          },
          {
            label: '女性',
            data: [20, 60, 10, 30, 30, 40],
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            fill: false,
            type: 'bar',
            lineTension: 0.3,
          },
        ]
      },
      options: {
        scales: {
          xAxes: [{
            scaleLabel: {
              display: true,
              fontColor: "#999",
              labelString: "日付（直近30日）"
            },
            stacked: true,
            ticks: {
              // 下記のように固定値ではなく、
              // データに応じて算出するのがいいと思います
              max: 24,
              stepSize: 4,
            }
          }],
          yAxes: [{
            stacked: true
          }]
        },
      }
    }
  },
  methods: {
    setDate (response) {
      // 1行ごとの取得
      const splitOneLine = response.data.split('\n');

      // 日付を取得
      let dateArray = []
      for(let i = 1; i < splitOneLine.length - 1; i++) {
        dateArray.push(splitOneLine[i].split(',')[4])
      }

      // 重複を削除
      const date = dateArray.filter((x, i, self) => {
        return self.indexOf(x) === i;
      }).slice(-30);

      // 日付フォーマットを変更
      const formatDate = date.map(value => {
        return moment(value, "YYYY-MM-DD").format('M/D')
      })
      this.data.labels = formatDate
    }
  },
  mounted () {
    axios.get('/data/130001_tokyo_covid19_patients.csv')
    .then(response => {
      this.setDate(response)
    })
    .finally(() => {
      this.renderChart(this.data, this.options)
    });
  }
}
</script>

<style scoped>

</style>
