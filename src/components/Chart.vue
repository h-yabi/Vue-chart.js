
<script>
import { Bar } from 'vue-chartjs'
import axios from 'axios'
import moment from 'moment'
import countArray from 'count-array-values'

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
            data: [],
            backgroundColor: 'rgba(0, 108, 255, 0.4)',
            borderColor: 'rgba(0, 108, 255, 0.4)',
            fill: false,
            type: 'line',
            lineTension: 0.5,
          },
          {
            label: '女性',
            data: [],
            backgroundColor: 'rgba(255, 0, 0, 0.4)',
            borderColor: 'rgba(255, 0, 0, 0.4)',
            fill: false,
            type: 'line',
            lineTension: 0.3,
          },
          {
            label: '合計',
            data: [],
            backgroundColor: 'rgba(210, 210, 210, 0.9)',
            borderColor: 'rgba(210, 210, 210, 0.9)',
            fill: false,
            type: 'bar',
            lineTension: 0.3,
          },
        ]
      },
      options: {
        scales: {
          // 横ラベル設定
          xAxes: [{
            scaleLabel: {
              display: true,
              fontColor: "#999",
              labelString: "日付"
            },
            stacked: true,
            ticks: {
              max: 24,
              stepSize: 4,
            }
          }],
        },
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
        },
      },
    }
  },
  methods: {
    setData (response) {

      // csvファイルを1行ごとに分割
      const splitOneLine = response.data.split('\n')


      // 現在日の【30日前】の日付を取得
      // ※APIが当日データを提供していないため、31日としている
      const getDate = moment().subtract(31, "days").format("Y-MM-DD")


      // 取得したい情報を配列にオブジェクトとして格納（日付、性別、年齢）
      let array = []
      for(let i = 1; i < splitOneLine.length - 1; i++) {
        if(moment(splitOneLine[i].split(',')[4]).isAfter(getDate)) {
          array.push({
            date: splitOneLine[i].split(',')[4],
            gender: splitOneLine[i].split(',')[9],
            age: splitOneLine[i].split(',')[8]
          });
        }
      }
      // console.log(array)


      // 日毎の【性別】を全てgenderに格納 → gender: "女性男性男性男性男性男性女性女性男性"
      const group = array.reduce((result, current) => {
        const element = result.find((p) => p.date === current.date);
        if (element) {
          element.gender += current.gender;
        } else {
          result.push({
            date: current.date,
            gender: current.gender
          });
        }
        return result;
      }, []);
      // console.log(group)


      // 配列に分割 → ["女性", "男性", "女性", "男性", "女性"]
      const gender = group.map(value => {
        return value.gender.match(/.{2}/g)
      });

      // 日毎の合計数を集計
      const totalCount = gender.map(value => {
        return value.length
      })

      // 男女別に日毎集計
      // 0: {value: "男性", count: 6}
      // 1: {value: "女性", count: 3}
      const genderTaxonomy = gender.map(value => {
        return countArray(value)
      });


      // 男女の感染者数をそれぞれの配列に格納
      let maleCount = []
      let femaleCount = []
      genderTaxonomy.map((value) => {

        const countUp = (gender, array) => {
          if(value[0] === undefined || value[1] === undefined && value[0].value !== gender) {
            array.push(0)
          } else {
            if(value[0].value === gender) {
              array.push(value[0].count)
            } else if(value[1].value === gender) {
              array.push(value[1].count)
            }
          }
        }

        if(value.length === 2 || value.length === 1) {
          countUp('女性', femaleCount)
          countUp('男性', maleCount)
        }
      });

      // data配列に男女それぞれの集計数を反映
      this.data.datasets[0].data = maleCount
      this.data.datasets[1].data = femaleCount
      this.data.datasets[2].data = totalCount

      // 日付フォーマットを変更
      const formatDate = group.map(value => {
        return moment(value.date, "YYYY-MM-DD").format('M/D')
      });
      this.data.labels = formatDate
    }
  },
  mounted () {
    const url = 'https://stopcovid19.metro.tokyo.lg.jp';
    axios.get(`/cors-proxy/${url}/data/130001_tokyo_covid19_patients.csv`)

    // axios.get('/data/130001_tokyo_covid19_patients.csv')
    .then(response => {

      this.setData(response)
    })
    .finally(() => {
      this.renderChart(this.data, this.options)
    });
    axios.defaults.withCredentials = true;
  }
}
</script>

<style scoped>
</style>
