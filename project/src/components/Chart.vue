
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
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            fill: false,
            type: 'bar',
            lineTension: 0.3,
          },
          {
            label: '女性',
            data: [],
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
      }
    }
  },
  methods: {
    setDate (response) {
      // 1行ごとの取得
      const splitOneLine = response.data.split('\n');

      // 取得したい情報を配列にオブジェクトとして格納（日付、性別、年齢）
      let array = []
      for(let i = 1; i < splitOneLine.length - 1; i++) {
        array.push({
          date: splitOneLine[i].split(',')[4],
          gender: splitOneLine[i].split(',')[9],
          age: splitOneLine[i].split(',')[8]
        })
      }

      // 日付を取得（直近30日を取得、重複を削除）
      let dateArray = []
      array.map((value) => {
        dateArray.push(value.date)
      });
      const latest = dateArray.filter((x, i, self) => {
        return self.indexOf(x) === i;
      }).slice(-15);

      // 直近30日の全てのデータ配列を取得
      const latestData = array.filter((value) => {
        return value.date >= latest[0]
      });

      const group = latestData.reduce((result, current) => {
        const element = result.find((p) => p.date === current.date);
        if (element) {
          element.count ++; // count
          element.gender += current.gender; // sum
        } else {
          result.push({
            date: current.date,
            count: 1,
            gender: current.gender
          });
        }
        return result;
      }, []);

      const gender = group.map(value => {
        return value.gender.match(/.{2}/g)
      })

      const genderTaxonomy = gender.map(value => {
        return countArray(value)
      })

      let maleCount = []
      let femaleCount = []
      genderTaxonomy.map((value) => {

        console.log(value)

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
      })
      console.log(maleCount)

      this.data.datasets[0].data = maleCount
      this.data.datasets[1].data = femaleCount

      // 日付フォーマットを変更
      const formatDate = group.map(value => {
        return moment(value.date, "YYYY-MM-DD").format('M/D')
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
