
<script>
import { Bar } from 'vue-chartjs';
import axios from 'axios';
import moment from 'moment'
import countArray from 'count-array-values';

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
      }).slice(-30);

      // 直近30日の全てのデータ配列を取得
      const latestData = array.filter((value) => {
        return value.date >= latest[0]
      });

      const group = latestData.reduce((result, current) => {
        const element = result.find((p) => p.date === current.date);
        // console.log(element)
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
      console.log(group)

      const gender = group.map(value => {
        return value.gender.match(/.{2}/g)
      })
      console.log(gender)

      // const genderTaxonomy = countArray(gender[0])

      const genderTaxonomy = gender.map(value => {
        return countArray(value)
      })
      console.log(genderTaxonomy)



      // const genderTaxonomy = gender.reduce((a, b) => {
      //   console.log(a + b)
      // })



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
