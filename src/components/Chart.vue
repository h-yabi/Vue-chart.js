
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
            fill: false,
            type: 'bar',
            lineTension: 0.3,
          },
          {
            label: '女性',
            data: [],
            backgroundColor: 'rgba(255, 0, 0, 0.4)',
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
              labelString: "日付"
            },
            stacked: true,
            ticks: {
              max: 24,
              stepSize: 4,
            }
          }],
          yAxes: [{
            stacked: true
          }]
        },
      },
      headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Access-Control-Allow-Origin': '*',
      }
    }
  },
  methods: {
    setData (response) {

      // csvファイルを1行ごとに分割
      const splitOneLine = response.data.split('\n');

      // 取得したい情報を配列にオブジェクトとして格納（日付、性別、年齢）
      let array = []
      for(let i = 1; i < splitOneLine.length - 1; i++) {
        array.push({
          date: splitOneLine[i].split(',')[4],
          gender: splitOneLine[i].split(',')[9],
          age: splitOneLine[i].split(',')[8]
        });
      }

      // 【日付】を取得
      let dateArray = []
      array.map((value) => {
        dateArray.push(value.date)
      });

      // 直近15日を取得、重複を削除
      const latest = dateArray.filter((x, i, self) => {
        return self.indexOf(x) === i;
      }).slice(-15);

      // 直近15日の全てのデータ配列を取得
      const latestData = array.filter((value) => {
        return value.date >= latest[0]
      });

      // 日毎の【性別】を全てgenderに格納 → gender: "女性男性男性男性男性男性女性女性男性"
      const group = latestData.reduce((result, current) => {
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

      // 配列に分割 → ["女性", "男性", "女性", "男性", "女性"]
      const gender = group.map(value => {
        return value.gender.match(/.{2}/g)
      });

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

      // 日付フォーマットを変更
      const formatDate = group.map(value => {
        return moment(value.date, "YYYY-MM-DD").format('M/D')
      });
      this.data.labels = formatDate
    }
  },
  mounted () {
    axios.get('/data/130001_tokyo_covid19_patients.csv', this.headers)
    .then(response => {
      console.log(response)
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
