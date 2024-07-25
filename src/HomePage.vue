<template>
  <div class="container">
    <h1>欢迎, {{ name }}!</h1>
    <p>你的身份是: {{ permissionLabel }}</p>

    <div class="images">
      <img src="/images/paper_title.png" alt="Image 0" />
    </div>

    <div v-if="permission === 0">
      <button @click="fetchTeacherClasses">获取班级</button>
      <select v-if="classes.length" v-model="selectedClass" @change="fetchData">
        <option v-for="cls in classes" :key="cls" :value="cls">{{ cls }}</option>
      </select>
    </div>

    <div v-if="permission === 2">
        <!-- 分析类型选择 -->
      
        <label for="analysis-type">选择分析类型：</label>
        <select v-model="selectedAnalysisType" id="analysis-type">
          <option value="single">单个班级</option>
          <option value="comparison">两个班级对比</option>
          <option value="campus-comparison">两个校区对比</option>
        </select>
        

        <!-- 单个班级选择 -->
        <div v-if="selectedAnalysisType === 'single'">
          <label for="single-class">选择班级：</label>
          <select v-model="selectedClass" id="single-class" @change="fetchData">
            <option value="1_1">张江一班</option>
            <option value="1_2">张江二班</option>
            <option value="1_3">张江三班</option>
            <option value="2_1">滨江一班</option>
            <option value="2_2">滨江二班</option>
            <option value="2_3">滨江三班</option>
          </select>

          <!-- 显示单个班级的考情分析箱型图 -->
          <div id="score-summary" class="chart-container"></div>

          <!-- 显示各题得分表格 -->
          <div>
            <h3>各题得分表</h3>
            <div class="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>题号</th>
                      <th>各小题得分率</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in scoreDistributionData" :key="item.question">
                      <td>{{ item.question }}</td>
                      <td>{{ formatNumber(item.avg_score) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
        </div>

        <!-- 班级对比选择 -->
        <div v-else-if="selectedAnalysisType === 'comparison'">
          <label for="compare-classes">选择对比班级：</label>
          <select v-model="selectedComparison" id="compare-classes">
            <option value="1_1&1_2">张江一班&张江二班</option>
            <option value="1_1&1_3">张江一班&张江三班</option>
            <option value="1_2&1_3">张江二班&张江三班</option>
            <option value="2_1&2_2">滨江一班&滨江二班</option>
            <option value="2_1&2_3">滨江一班&滨江三班</option>
            <option value="2_2&2_3">滨江二班&滨江三班</option>
          </select>

          <!-- 显示两个班级的考情分析箱型图 -->
          <div id="score-summary-com" class="chart-container"></div>

          <!-- 显示各题得分表格 -->
          <div>
            <h3>各题得分表</h3>
            <div class="table-container">
              <table>
                <thead>
                    <tr>
                      <th>题号</th>
                      <th>{{ getClassName(selectedComparison.split('&')[0]) }}各小题得分率</th>
                      <th>{{ getClassName(selectedComparison.split('&')[1]) }}各小题得分率</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(score, index) in comparisonScores" :key="index">
                      <td>{{ score.question }}</td>
                      <td>{{ formatNumber(score.class1) }}</td>
                      <td>{{ formatNumber(score.class2) }}</td>
                    </tr>
                  </tbody>
              </table>
            </div>
          </div>

        </div>


        <!-- 校区对比选择 -->
        <div v-else-if="selectedAnalysisType === 'campus-comparison'">
          <label for="compare-campuses">选择对比校区：</label>
          <select v-model="selectedCampusComparison" id="compare-campuses">
            <option value="1&2">张江校区&滨江校区</option>
          </select>

          <!-- 显示两个校区的考情分析箱型图 -->
          <div id="score-summary-campuscom" class="chart-container"></div>

          <!-- 显示各题得分表格 -->
          <div>
            <h3>各题得分表</h3>
            <div class="table-container">
              <table>
              <thead>
                <tr>
                  <th>题号</th>
                  <th>张江校区各小题得分率</th>
                  <th>滨江校区各小题得分率</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(score, index) in campusComparisonScores" :key="index">
                  <td>{{ score.question }}</td>
                  <td>{{ formatNumber(score.campus1) }}</td>
                  <td>{{ formatNumber(score.campus2) }}</td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>
        </div>
      </div>

    <div v-if="permission !==2 ">
      <div id="score-summary" class="chart-container"></div>
    
      <div>
        <h2>各题得分表</h2>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>题目</th>
                <th>得分率</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in scoreDistributionData" :key="item.question">
                <td>{{ item.question }}</td>
                <td>{{ formatNumber(item.avg_score) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="images">
      <img src="/images/PART1_1.png" alt="Image 1" @click="goToPage('Part1_1')" />
      <img src="/images/PART1_2.png" alt="Image 2" @click="goToPage('Part1_2')" />
      <img src="/images/PART1_3.png" alt="Image 3" @click="goToPage('Part1_3')" />
      <img src="/images/PART1_4.png" alt="Image 4" @click="goToPage('Part1_4')" />
      <img src="/images/PART1_5.png" alt="Image 5" @click="goToPage('Part1_5')" />
      <img src="/images/PART1_6.png" alt="Image 6" @click="goToPage('Part1_6')" />
      <img src="/images/PART1_7.png" alt="Image 7" @click="goToPage('Part1_7')" />
      <img src="/images/PART1_8.png" alt="Image 8" @click="goToPage('Part1_8')" />
      <img src="/images/PART2_1.png" alt="Image 9" @click="goToPage('Part2_1')" />
      <img src="/images/PART2_1_1.png" alt="Image 10" @click="goToPage('Part2_2')" />
      <img src="/images/PART2_1_2.png" alt="Image 11" @click="goToPage('Part2_2')" />
      <img src="/images/PART2_3.png" alt="Image 12" @click="goToPage('Part2_3')" />
      <img src="/images/PART2_4.png" alt="Image 13" @click="goToPage('Part2_4')" />
      <img src="/images/PART2_5.png" alt="Image 14" @click="goToPage('Part2_5')" />
      <img src="/images/PART2_6.png" alt="Image 15" @click="goToPage('Part2_6')" />
      <img src="/images/PART2_7.png" alt="Image 16" @click="goToPage('Part2_7')" />
      <img src="/images/PART2_8.png" alt="Image 17" @click="goToPage('Part2_8')" />
      <img src="/images/PART2_9.png" alt="Image 18" @click="goToPage('Part2_9')" />
<!--      <img src="@/assets/PART1_1.png" alt="Image 1" @click="goToPage('Part1_1')" />-->
<!--      <img src="@/assets/PART1_2.png" alt="Image 2" @click="goToPage('Part1_2')" />-->
<!--      <img src="@/assets/PART1_3.png" alt="Image 3" @click="goToPage('Part1_3')" />-->
<!--      <img src="@/assets/PART1_4.png" alt="Image 4" @click="goToPage('Part1_4')" />-->
<!--      <img src="@/assets/PART1_5.png" alt="Image 5" @click="goToPage('Part1_5')" />-->
<!--      <img src="@/assets/PART1_6.png" alt="Image 6" @click="goToPage('Part1_6')" />-->
<!--      <img src="@/assets/PART1_7.png" alt="Image 7" @click="goToPage('Part1_7')" />-->
<!--      <img src="@/assets/PART1_8.png" alt="Image 8" @click="goToPage('Part1_8')" />-->
<!--      <img src="@/assets/PART2_1.png" alt="Image 9" @click="goToPage('Part2_1')" />-->
<!--      <img src="@/assets/PART2_1_1.png" alt="Image 10" @click="goToPage('Part2_2')" />-->
<!--      <img src="@/assets/PART2_1_2.png" alt="Image 11" @click="goToPage('Part2_2')" />-->
<!--      <img src="@/assets/PART2_3.png" alt="Image 12" @click="goToPage('Part2_3')" />-->
<!--      <img src="@/assets/PART2_4.png" alt="Image 13" @click="goToPage('Part2_4')" />-->
<!--      <img src="@/assets/PART2_5.png" alt="Image 14" @click="goToPage('Part2_5')" />-->
<!--      <img src="@/assets/PART2_6.png" alt="Image 15" @click="goToPage('Part2_6')" />-->
<!--      <img src="@/assets/PART2_7.png" alt="Image 16" @click="goToPage('Part2_7')" />-->
<!--      <img src="@/assets/PART2_8.png" alt="Image 17" @click="goToPage('Part2_8')" />-->
<!--      <img src="@/assets/PART2_9.png" alt="Image 18" @click="goToPage('Part2_9')" />-->
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import axios from 'axios';

export default {
  name: 'HomePage',
  props: {
    name: {
      type: String,
      required: true
    },
    permission: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      analysisType: '0',// Default to "全校分析"
      selectedClass: '1_1', //单个班级
      scoreDistributionData: [],
      scoreDistributionTotal: [],
      classes: [],
      selectedAnalysisType: 'single',//分析类型：单个还是爽哥
      selectedComparison: '', //双个班级
      selectedCampusComparison: '',
      boxplotOptionSingle: {},  //单个箱型图
      boxplotOptionComparison: {}, //双箱型图
      boxplotOptionCampusComparison: {}, //两个校区的箱型图
      comparisonScores: [], 
      singleClassScores: [],
      campusComparisonScores: [],
    };
  },
  computed: {
    permissionLabel() {
      switch (this.permission) {
        case 0:
          return '老师';
        case 1:
          return '学生';
        case 2:
          return '管理员';
        default:
          return '未知';
      }
    }
  },
  watch: {
    selectedSingleClass(newVal) {
      if (newVal) {
        this.fetchData(newVal);
      }
    },
    selectedComparison(newVal) {
      if (newVal) {
        this.fetchComparisonData(newVal);
      }
    },
    selectedCampusComparison(newVal) {
      if (newVal) {
        this.fetchCampusComparisonData(newVal);
      }
    },
  },
  methods: {
    getClassName(classCode) {
      const classNames = {
        '1_1': '张江一班',
        '1_2': '张江二班',
        '1_3': '张江三班',
        '2_1': '滨江一班',
        '2_2': '滨江二班',
        '2_3': '滨江三班',
        '1': '张江校区',
        '2': '滨江校区'
      };
      return classNames[classCode] || '未知班级';
    },

    async fetchTeacherClasses() {
      try {
        const response = await axios.get('http://localhost:3000/api/teacher-classes', {
          params: { name: this.name }
        });

        this.classes = response.data.classes;
        console.log("班级", this.classes);
      } catch (error) {
        console.error('Error fetching teacher classes:', error);
      }
    },
    goToPage(page) {
      this.$router.push({
        name: page,
        query: {
          name: this.name,
          permission: this.permission
        }
      });
    },

    formatClass(selectedClass) {
      if (selectedClass && selectedClass.length === 2) {
        return `${selectedClass[0]}_${selectedClass[1]}`;
      }
      return selectedClass; // 如果格式不对，返回原始值
    },

    // 用于保留两位小数
    formatNumber(value) {
      return value.toFixed(2); 
    },

    //用于对于学生端、管理员端、教师端使用，返回单一班级的数据
    fetchData() {
      let url;
      let url_score;

      if (this.permission === 0) {
        const formattedClass = this.formatClass(this.selectedClass);
        url = `http://localhost:3000/api/admin-score-summary?name=${this.name}&class=${formattedClass}`;
      } else if (this.permission === 1) {
        url = `http://localhost:3000/api/student-score-summary?name=${this.name}&permission=${this.permission}`;
      } else if (this.permission === 2) {
        url = `http://localhost:3000/api/admin-score-summary?name=${this.name}&permission=${this.permission}&class=${this.selectedClass}`;
      }

      console.log(this.name);
      console.log(this.selectedClass);

      if (this.permission === 1) {
        url_score = `http://localhost:3000/api/student-scores?name=${this.name}`;
      } else if (this.permission === 2) {
        url_score = `http://localhost:3000/api/admin-scores?name=${this.name}&class=${this.selectedClass}`;
      } else if (this.permission == 0) {
        const formattedClass = this.formatClass(this.selectedClass);
        url_score = `http://localhost:3000/api/admin-scores?name=${this.name}&class=${formattedClass}`;
      }
      
      console.log('Fetching data from URL:', url);

      fetch(url)
        .then(response => response.json())
        .then(data => {
          console.log('Score Summary Data:', data);
          this.renderScoreSummary(data);
        })
        .catch(error => console.error('Fetching score summary failed:', error));

      fetch(url_score)
        .then(response => response.json())
        .then(data => {
          console.log("Total Score Data:", data);
          if (data && data.averages) {
            this.scoreDistributionData = Object.keys(data.averages).map(key => ({
              question: key,
              avg_score: data.averages[key],
            }));
          } else {
            this.scoreDistributionData = [];
          }

          console.log("赋值之后", this.scoreDistributionData);
        });

        fetch(url_score)
        .then(response => response.json())
        .then(data => {
          console.log("Total Score Data:", data);
          if (data && data.totals) {
            this.scoreDistributionTotal = Object.keys(data.totals).map(key => ({
              question: key,
              total: data.totals[key],
            }));
          } else {
            this.scoreDistributionTotal = [];
          }

          console.log("赋值之后大题情况", this.scoreDistributionTotal);
        });
    },

    ///返回两个班级对比的考情情况以及成绩
    fetchComparisonData(comparison) {
      const [class1, class2] = comparison.split('&');
      let url = '';
      let url_score = '';
      if (this.permission === 2) {
        url = `http://localhost:3000/api/admin-score-summary?name=${this.name}&class=${class1}`;
        url_score = `http://localhost:3000/api/admin-scores?name=${this.name}&class=${class1}`;
      }

      axios.get(url)
        .then(response => {
          const data1 = response.data;
          return axios.get(`http://localhost:3000/api/admin-score-summary?name=${this.name}&class=${class2}`)
            .then(response => {
              const data2 = response.data;
              this.boxplotOptionComparison = this.renderScoreSummaryCom(data1, data2);
              //this.comparisonScores = this.fetchComparisonScores(class1, class2);
            });
        })
        .catch(error => {
          console.error('Fetching comparison data failed:', error);
        });

        axios.get(url_score)
        .then(response => {
          const data1 = response.data;
          return axios.get(`http://localhost:3000/api/admin-scores?name=${this.name}&class=${class2}`)
            .then(response => {
              const data2 = response.data;
              //this.boxplotOptionComparison = this.renderScoreSummaryCom(data1, data2);
              const scores1 = data1.averages || {};
              const scores2 = data2.averages || {};

              // 组合数据以便比较
              const combinedScores = Object.keys(scores1).map(key => ({
                question: key,
                class1: scores1[key] || 0,
                class2: scores2[key] || 0
              }));

              // 更新组件的状态
              this.comparisonScores = combinedScores;
            });
        })
        .catch(error => {
          console.error('Fetching comparison data failed:', error);
        });
    },



    ////返回两个校区的考情成绩数据
    fetchCampusComparisonData(comparison) {
      const [school1, school2] = comparison.split('&');
      let url = '';
      let url_score = '';
      if (this.permission === 2) {
        url = `http://localhost:3000/api/admin-score-summary-campusCom?name=${this.name}&school=${school1}`;
        url_score = `http://localhost:3000/api/admin-scores-campusCom?name=${this.name}&school=${school1}`;
      }

      axios.get(url)
        .then(response => {
          const data1 = response.data;
          return axios.get(`http://localhost:3000/api/admin-score-summary-campusCom?name=${this.name}&school=${school2}`)
            .then(response => {
              const data2 = response.data;
              this.boxplotOptionComparison = this.renderScoreSummaryCampusCom(data1, data2);
              //this.comparisonScores = this.fetchComparisonScores(class1, class2);
            });
        })
        .catch(error => {
          console.error('Fetching comparison data failed:', error);
        });

        axios.get(url_score)
        .then(response => {
          const data1 = response.data;
          return axios.get(`http://localhost:3000/api/admin-scores-campusCom?name=${this.name}&school=${school2}`)
            .then(response => {
              const data2 = response.data;
              const scores1 = data1.averages || {};
              const scores2 = data2.averages || {};

              // 组合数据以便比较
              const combinedScores = Object.keys(scores1).map(key => ({
                question: key,
                campus1: scores1[key] || 0,
                campus2: scores2[key] || 0
              }));

              // 更新组件的状态
              this.campusComparisonScores = combinedScores;
            });
        })
        .catch(error => {
          console.error('Fetching comparison data failed:', error);
        });

      //if (this.permission === 2) {
      //url_score = `http://localhost:3000/api/admin-score-summary?name=${this.name}`;
      //}
    },

    //单个班级的考情分析--箱线图
    renderScoreSummary(data) {
      var mainContainer = document.getElementById('score-summary');
      var resizeMainContainer = function () {
        mainContainer.style.width = window.innerWidth + 'px';
        mainContainer.style.height = window.innerHeight * 0.8 + 'px';
      };
      resizeMainContainer();
      var myChart = echarts.init(mainContainer);
      window.addEventListener('resize', function () {
        resizeMainContainer();
        myChart.resize();
      });

      // 整理数据为箱线图格式
      var boxplotData = [
        [
          data.min_score,      // 最小值
          data.q1_score,       // 第一四分位数
          data.median_score,   // 中位数
          data.q3_score,       // 第三四分位数
          data.max_score       // 最大值
        ]
      ];

      var option = {
        title: {
          text: '    考情分析'
        },
        tooltip: {
          trigger: 'item',
          formatter: function (params) {
            return [
              '最大值: ' + params.data[4],
              '上四分位数: ' + params.data[3],
              '中位数: ' + params.data[2],
              '下四分位数: ' + params.data[1],
              '最小值: ' + params.data[0]
            ].join('<br/>');
          }
        },
        xAxis: {
          type: 'category',
          data: ['考情数据'],
          axisLabel: {
            interval: 0
          }
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '分数分布',
            type: 'boxplot',
            data: boxplotData,
            tooltip: {
              formatter: function (param) {
                return [
                  '最大值: ' + param.data[5],
                  '上四分位数: ' + param.data[4],
                  '中位数: ' + param.data[3],
                  '下四分位数: ' + param.data[2],
                  '最小值: ' + param.data[1]
                ].join('<br/>');
              }
            }
          }
        ]
      };
      myChart.setOption(option);
    },

    //两个班级对比的考情分析
    renderScoreSummaryCom(data, data2) {
      var mainContainer = document.getElementById('score-summary-com');
      var resizeMainContainer = function () {
        mainContainer.style.width = (window.innerWidth) + 'px';
        mainContainer.style.height = (window.innerHeight * 0.75) + 'px';
      };
      resizeMainContainer();
      var myChart = echarts.init(mainContainer);
      window.addEventListener('resize', function () {
        resizeMainContainer();
        myChart.resize();
      });

      var classNames = this.selectedComparison.split('&').map(classKey => this.getClassName(classKey));
      console.log("所要查询的班级", classNames);

      // 整理数据为箱线图格式
      var boxplotData = [
        [
          data.min_score,      // 最小值
          data.q1_score,       // 第一四分位数
          data.median_score,   // 中位数
          data.q3_score,       // 第三四分位数
          data.max_score       // 最大值
        ],
        [
          data2.min_score,     // 最小值
          data2.q1_score,      // 第一四分位数
          data2.median_score,  // 中位数
          data2.q3_score,      // 第三四分位数
          data2.max_score      // 最大值
        ]
      ];

      var option = {
        title: {
          text: '    考情分析对比'
        },
        tooltip: {
          trigger: 'item',
          formatter: function (params) {
            return [
              '班级 ' + classNames[0],
              '最大值: ' + params.data[5],
              '上四分位数: ' + params.data[4],
              '中位数: ' + params.data[3],
              '下四分位数: ' + params.data[2],
              '最小值: ' + params.data[1]
            ].join('<br/>');
          }
        },
        
        xAxis: {
          type: 'category',
          data: [classNames[0], classNames[1]], // 使用班级名称作为x轴数据
          boundaryGap: true,
          nameGap: 30,
          splitArea: {
            show: false
          },
          axisTick: {
            alignWithLabel: true
          }
        },

        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: classNames[0],
            type: 'boxplot',
            data: [boxplotData[0]],
            tooltip: {
              formatter: function (param) {
                return [
                  '最大值: ' + param.data[5],
                  '上四分位数: ' + param.data[4],
                  '中位数: ' + param.data[3],
                  '下四分位数: ' + param.data[2],
                  '最小值: ' + param.data[1]
                ].join('<br/>');
              }
            }
          },
          {
            name: classNames[1],
            type: 'boxplot',
            data: [boxplotData[1]],
            tooltip: {
              formatter: function (param) {
                return [
                  '最大值: ' + param.data[5],
                  '上四分位数: ' + param.data[4],
                  '中位数: ' + param.data[3],
                  '下四分位数: ' + param.data[2],
                  '最小值: ' + param.data[1]
                ].join('<br/>');
              }
            }
          }
        ]
      };
      myChart.setOption(option);
    },

    renderScoreSummaryCampusCom(data, data2) {
      var mainContainer = document.getElementById('score-summary-campuscom');
      var resizeMainContainer = function () {
        mainContainer.style.width = window.innerWidth + 'px';
        mainContainer.style.height = window.innerHeight * 0.8 + 'px';
      };
      resizeMainContainer();
      var myChart = echarts.init(mainContainer);
      window.addEventListener('resize', function () {
        resizeMainContainer();
        myChart.resize();
      });
      
      console.log("两个校区的数据能否收到", data, data2);

      // 整理数据为箱线图格式
      var boxplotData = [
        [
          data.min_score,      // 最小值
          data.q1_score,       // 第一四分位数
          data.median_score,   // 中位数
          data.q3_score,       // 第三四分位数
          data.max_score       // 最大值
        ],
        [
          data2.min_score,     // 最小值
          data2.q1_score,      // 第一四分位数
          data2.median_score,  // 中位数
          data2.q3_score,      // 第三四分位数
          data2.max_score      // 最大值
        ]
      ];

      var option = {
        title: {
          text: '    考情分析对比'
        },
        tooltip: {
          trigger: 'item',
          formatter: function (param) {
            return [
              '校区 ' + '张江',
              '最大值: ' + param.data[5],
              '上四分位数: ' + param.data[4],
              '中位数: ' + param.data[3],
              '下四分位数: ' + param.data[2],
              '最小值: ' + param.data[1]
            ].join('<br/>');
          }
        },
        xAxis: {
          type: 'category',
          data: ['张江', '滨江'] // 你可以根据需要自定义数据
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '张江',
            type: 'boxplot',
            data: [boxplotData[0]],
            tooltip: {
              formatter: function (param) {
                return [
                  '最大值: ' + param.data[5],
                  '上四分位数: ' + param.data[4],
                  '中位数: ' + param.data[3],
                  '下四分位数: ' + param.data[2],
                  '最小值: ' + param.data[1]
                ].join('<br/>');
              }
            }
          },
          {
            name: '滨江',
            type: 'boxplot',
            data: [boxplotData[1]],
            tooltip: {
              formatter: function (param) {
                return [
                  '最大值: ' + param.data[5],
                  '上四分位数: ' + param.data[4],
                  '中位数: ' + param.data[3],
                  '下四分位数: ' + param.data[2],
                  '最小值: ' + param.data[1]
                ].join('<br/>');
              }
            }
          }
        ]
      };
      myChart.setOption(option);
    },

  },
  mounted() {
    this.fetchData();
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100vh;
  margin: 0;
  padding: 20px;
  box-sizing: border-box;
}

h1 {
  text-align: center;
  color: #333;
}

p {
  text-align: center;
  margin: 10px 0;
}

.images {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-bottom: 20px;
  /* Add space between images and charts */
}

.images img {
  flex: 1 0 21%;
  max-width: 80%;
  max-height: 80%;
  object-fit: cover;
  cursor: pointer;
  margin: 8px;
}


.chart-container {
  width: 80%;
  height: 300px;
  margin: 20px 0;
}

.table-container {
  max-height: 300px; /* 设置最大高度 */
  overflow-y: auto; /* 竖向滚动 */
  border: 1px solid #ddd; /* 可选，给容器添加边框 */
  display: flex;
  justify-content: center; /* 水平居中 */
}

table {
  border-collapse: collapse;
  width: 80%;
  /* 可选：为表格添加边框和背景色以增强视觉效果 */
  border: 1px solid #ddd;
  background-color: #f9f9f9;
}


th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
}

.analysis-type {
  margin-left: 20px;
  white-space: nowrap;
}

</style>