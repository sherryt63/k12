<template>

  <div class="main">
    
    <header class="header">
    <h2>1. Look and write (正确抄写下列句子，注意大小写和标点符号):</h2>
    <h2>【语法-句法-疑问句】</h2>
    <h2>难度：★★</h2>
    <div class="menu">
      <button @click="goBack">返回主页</button>
    <div v-if="isTeacher || isAdmin" class="class_select">
      <div class="choose">
        <h2>选择对比类型：</h2>
          <select v-model="selectedViewOption" @change="handleViewOptionChange">
            <option value="singleClass">单个班级</option>
            <option value="classComparison">两个班级</option>
            <option v-if="isAdmin" value="campusComparison">两个校区</option>
            <option v-if="isAdmin" value="overallSituation">整体情况</option>
          </select>
      </div>
      <div v-if="selectedViewOption === 'singleClass'" class="single">
        <h2>选择班级：</h2>
        <select v-model="selectedClass1" @change="handleClassSelection">
          <option v-for="option in classOptions" :key="option.value" :value="option.value">{{ option.text }}</option>
        </select>
      </div>

      <div v-if="selectedViewOption === 'classComparison'" class="compare">
        <h2>选择班级 1：</h2>
        <select v-model="selectedClass1" @change="handleClassSelection">
          <option v-for="option in classOptions" :key="option.value" :value="option.value">{{ option.text }}</option>
        </select>
        <h2> 选择班级 2：</h2>
        <select v-model="selectedClass2" @change="handleClassSelection">
        <option v-for="option in classOptions" :key="option.value" :value="option.value">{{ option.text }}</option>
        </select>
      </div>
    </div>
  </div>
 </header>
    <div class="test">
     <img src="/images/PART2_1.png" alt="Part2_1" />
    </div>
    <!-- 学生视图 -->
    <div v-if="isStudent">
      <div>
        <h2>学生答案：</h2>
        <div stu_img>
        <img v-if="studentImage" :src="'data:image/jpeg;base64,' + studentImage" alt="Student Answer" />
        </div>
      </div>
      <div>
        <h2>学生得分：{{ studentScore }}</h2>
      </div>
      <div>
        <h2>同伴均分：{{ peerAverage }}</h2>
      </div>
      <div>
        <h2>参考解析：</h2>
        <p>Can you draw yourself, Danny? Yes, of course</p>
      </div>
      <div>
        <h2>错误表格：</h2>
        <canvas id="errorChart"></canvas>
      </div>
    </div>
    <!-- 新增的拉取框 -->
    <div v-if="isTeacher || isAdmin">
        <!-- 单个班级 -->
        <div v-if="selectedViewOption === 'singleClass'">
         
          <h2>班级1得分均分：{{ class1Average }}</h2>
          <h2>错误表格：</h2>
          <canvas id="errorChart"></canvas>
        </div>

        <!-- 班级对比 -->
        <div v-if="selectedViewOption === 'classComparison'">
        <br>
        <br>
         <div class="flex-container">
          <table border="1" cellspacing="0" width="500" height="130">
            <tbody>
              <tr>
               <td style="text-align: center; color: black; font-size:18px">&nbsp;</td>
               <td style="text-align: center; color: black; font-size:18px">得分均分</td>
              </tr>
              <tr>
               <td style="text-align: center; color: black; font-size:18px">班级1</td>
               <td style="text-align: center; color: black; font-size:18px">{{ class1Average }}</td>
              </tr>
              <tr v-if="selectedClass2">
               <td style="text-align: center; color: black; font-size:18px">班级2</td>
               <td style="text-align: center; color: black; font-size:18px">{{ class2Average }}</td>
              </tr>
            </tbody>
        </table>
       </div>

          <h2>错误表格：</h2>
          <canvas id="errorChart"></canvas>
        </div>

        <!-- 校区对比 -->
        <div v-if="selectedViewOption === 'campusComparison'">
        <br>
        <br>
          <div class="flex-container">
          <table border="1" cellspacing="0" width="500" height="130">
            <tbody>
              <tr>
               <td style="text-align: center; color: black; font-size:18px">&nbsp;</td>
               <td style="text-align: center; color: black; font-size:18px">得分均分</td>
              </tr>
              <tr>
               <td style="text-align: center; color: black; font-size:18px">张江</td>
               <td style="text-align: center; color: black; font-size:18px">{{ zhangjiangAverageScore }}</td>
              </tr>
              <tr>
               <td style="text-align: center; color: black; font-size:18px">滨江</td>
               <td style="text-align: center; color: black; font-size:18px">{{ binjiangAverageScore }}</td>
              </tr>
            </tbody>
        </table>
       </div>
          <h2>错误表格：</h2>
          <canvas id="campusErrorChart"></canvas>
        </div>

        <!-- 整体情况 -->
        <div v-if="selectedViewOption === 'overallSituation'">
          <h2>所有班级学生得分均分：{{ overallAverageScore }}</h2>
          <h2>所有班级错误表格：</h2>
          <canvas id="overallErrorChart"></canvas>
        </div>
      </div>
    
    <h2>典型错误案例：</h2>
  <div class="image_container">
    <div class="image">
    <img src="/images/1.png" alt="Typical Error 1" />
    <img src="/images/2.png" alt="Typical Error 2" />
    <img src="/images/3.png" alt="Typical Error 3" />
    <img src="/images/4.png" alt="Typical Error 4" />
  </div>

  </div>

  <div class="container">  </div>
</div>
</template>

<script>
import axios from 'axios';
import { ref, onMounted, watch } from 'vue';
import { Chart, registerables } from 'chart.js';
import "./Part.css";

Chart.register(...registerables);

export default {
  methods: {
    goBack() {
      this.$router.go(-1); // 返回上一个页面
    },
  },
  name: 'Part2_1View',
  props: {
    userName: {
      type: String,
      required: true
    },
    permission: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const isStudent = props.permission === 1;
    const isTeacher = props.permission === 0;
    const isAdmin = props.permission === 2;

    const studentImage = ref(null);
    const studentScore = ref(null);
    const peerAverage = ref(null);
    const class1Average = ref(null);
    const class2Average = ref(null);
    const overallAverageScore = ref(null);
    const zhangjiangAverageScore = ref(null);
    const binjiangAverageScore = ref(null);
    const classOptions = ref([]);
    const selectedClass1 = ref('');
    const selectedClass2 = ref('');
    const class1Info = ref({ school_no: '', class_no: '', errorCounts: {} });
    const class2Info = ref({ school_no: '', class_no: '', errorCounts: {} });
    let chartInstance = null;
    let campusChartInstance = null;

    const getCampusName = (school_no) => {
      switch (school_no) {
        case '1':
          return '张江';
        case '2':
          return '滨江';
        default:
          return '未知校区';
      }
    };

    const selectedViewOption = ref('singleClass'); // 默认选项

    onMounted(async () => {
      if (isStudent) {
        try {
          const { data: studentData } = await axios.get(`http://localhost:3000/part2_1/${props.userName}`);
          studentImage.value = studentData.image;
          studentScore.value = parseFloat(studentData.score).toFixed(2);

          const { data: averageData } = await axios.get(`http://localhost:3000/part2_1/average/${studentData.school_no}/${studentData.class_no}`);
          peerAverage.value = averageData.average.toFixed(2);

          // 错误数据
          let errorDataArray = [
            { label: '人名大小写错误', value: studentData.capital_name },
            { label: '首句单词大小写错误', value: studentData.capital_first_word },
            { label: '抄写错误', value: studentData.copy },
            { label: '标点符号使用错误', value: studentData.punctuation },
            { label: '其他', value: studentData.others }
          ];

          // 按错误次数排序
          errorDataArray.sort((a, b) => b.value - a.value);

          const errorData = {
            labels: errorDataArray.map(item => item.label),
            datasets: [{
              label: '错误次数',
              data: errorDataArray.map(item => item.value),
              backgroundColor: 'rgb(109, 228, 198,0.5)',
              
              borderWidth: 1
            }]
          };

          const ctx = document.getElementById('errorChart').getContext('2d');
          chartInstance = new Chart(ctx, {
            type: 'bar',
            data: errorData,
            options: {
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1  // 设置最小单位为 1
                  }
                }
              }
            }
          });
        } catch (error) {
          console.error('Failed to fetch student data:', error);
        }
      } else if (isTeacher || isAdmin) {
        try {
          if (isAdmin) {
            const { data: classData } = await axios.get('http://localhost:3000/part2_1/classes');
            classOptions.value = classData.map(cls => {
              const { school_no, class_no } = parseClassValue(cls.value);
              return {
                value: `${school_no}&${class_no}`,
                text: `${getCampusName(school_no)} ${class_no}班`
              };
            });

            if (classData.length) {
              const firstClass = classData[0].value;
              const { school_no, class_no } = parseClassValue(firstClass);
              selectedClass1.value = `${school_no}&${class_no}`;
              // selectedClass2.value = `${school_no}&${class_no}`;
              // fetchFilteredData(1); // Fetch data for the default selected class
            }

            const { data: overallData } = await axios.get('http://localhost:3000/part2_1/summary');
            overallAverageScore.value = overallData.averageScore.toFixed(2);

// 总体错误数据
            let overallErrorDataArray = [
              { label: '人名大小写错误', value: overallData.errorCounts.capital_name },
              { label: '首句单词大小写错误', value: overallData.errorCounts.capital_first_word },
              { label: '抄写错误', value: overallData.errorCounts.copy },
              { label: '标点符号使用错误', value: overallData.errorCounts.punctuation },
              { label: '其他', value: overallData.errorCounts.others }
            ];

// 按错误次数从大到小排序
            overallErrorDataArray.sort((a, b) => b.value - a.value);

            console.log('Sorted overallErrorDataArray:', overallErrorDataArray); // 检查排序结果

            const overallErrorData = {
              labels: overallErrorDataArray.map(item => item.label),
              datasets: [{
                label: '错误次数',
                data: overallErrorDataArray.map(item => item.value),
                backgroundColor: 'rgb(109, 228, 198, 1)',
                
                borderWidth: 1
              }]
            };

            console.log('overallErrorData:', overallErrorData); // 检查数据传递

            const overallCtx = document.getElementById('overallErrorChart').getContext('2d');
            new Chart(overallCtx, {
              type: 'bar',
              data: overallErrorData,
              options: {
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 5  // 设置最小单位为 1
                    }
                  }
                }
              }
            });

            const { data: zhangjiangData } = await axios.get('http://localhost:3000/part2_1/school/1');
            zhangjiangAverageScore.value = zhangjiangData.averageScore.toFixed(2);

            const { data: binjiangData } = await axios.get('http://localhost:3000/part2_1/school/2');
            binjiangAverageScore.value = binjiangData.averageScore.toFixed(2);

            // 校区错误数据
            let campusErrorDataArray = [
              { label: '人名大小写错误', zhangjiang: zhangjiangData.errorCounts.capital_name, binjiang: binjiangData.errorCounts.capital_name },
              { label: '首句单词大小写错误', zhangjiang: zhangjiangData.errorCounts.capital_first_word, binjiang: binjiangData.errorCounts.capital_first_word },
              { label: '抄写错误', zhangjiang: zhangjiangData.errorCounts.copy, binjiang: binjiangData.errorCounts.copy },
              { label: '标点符号使用错误', zhangjiang: zhangjiangData.errorCounts.punctuation, binjiang: binjiangData.errorCounts.punctuation },
              { label: '其他', zhangjiang: zhangjiangData.errorCounts.others, binjiang: binjiangData.errorCounts.others }
            ];

            // 按滨江校区错误次数排序
            campusErrorDataArray.sort((a, b) => b.binjiang - a.binjiang);

            const campusErrorData = {
              labels: campusErrorDataArray.map(item => item.label),
              datasets: [
                {
                  label: '张江校区错误次数',
                  data: campusErrorDataArray.map(item => item.zhangjiang),
                  backgroundColor: 'rgb(109, 228, 198,0.5)',
                  
                  borderWidth: 1
                },
                {
                  label: '滨江校区错误次数',
                  data: campusErrorDataArray.map(item => item.binjiang),
                  backgroundColor: 'rgb(255, 127, 80,0.5)',
                  
                  borderWidth: 1
                }
              ]
            };

            if (campusChartInstance) {
              campusChartInstance.destroy();
            }

            const campusCtx = document.getElementById('campusErrorChart').getContext('2d');
            campusChartInstance = new Chart(campusCtx, {
              type: 'bar',
              data: campusErrorData,
              options: {
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }
            });
          } else if (isTeacher) {
            const { data: teacherData } = await axios.get(`http://localhost:3000/teacher/${props.userName}`);
            const permissions = teacherData.permission.split(',');

            const options = permissions.map(permission => {
              const { school_no, class_no } = parseClassValue(permission);
              return {
                value: `${school_no}${class_no}`,
                text: `${getCampusName(school_no)} ${class_no}班`
              };
            });

            classOptions.value = options;
            if (options.length) {
              const { school_no, class_no } = parseClassValue(options[0].value);
              selectedClass1.value = `${school_no}${class_no}`;
              class1Info.value = { school_no, class_no };
            }
          }
        } catch (error) {
          console.error('Failed to fetch data:', error);
        }
      }
    });


    watch([selectedClass1, selectedClass2, selectedViewOption], ([newClass1, newClass2, newViewOption]) => {
      if (newClass1) {
        const { school_no, class_no } = parseClassValue(newClass1);
        class1Info.value = { school_no, class_no, errorCounts: {} };
        // fetchFilteredData(1);
      }
      if (newClass2) {
        const { school_no, class_no } = parseClassValue(newClass2);
        class2Info.value = { school_no, class_no, errorCounts: {} };
        // fetchFilteredData(2);
      } else {
        class2Info.value = { school_no: '', class_no: '', errorCounts: {} };
        class2Average.value = null;
      }
      handleViewOptionChange(newViewOption);
    });

    const handleClassSelection = () => {
      if (selectedClass1.value) {
        fetchFilteredData(1);
      }
      if (selectedClass2.value) {
        fetchFilteredData(2);
      }
    };


    // 新增的方法
    const handleViewOptionChange = async (viewOption) => {
      if (viewOption === 'singleClass') {
        if (selectedClass1.value) {
          selectedClass2.value = ""
          await fetchFilteredData(1);
          console.log('single');
        }
      } else if (viewOption === 'classComparison') {
        if (selectedClass1.value) {
          await fetchFilteredData(1);
          console.log('classComparison');
        }
        if (selectedClass2.value) {
          await fetchFilteredData(2);
        }
      } else if (viewOption === 'overallSituation') {
        console.log('overall');
        const { data: overallData } = await axios.get('http://localhost:3000/part2_1/summary');

        overallAverageScore.value = overallData.averageScore.toFixed(2);

// 总体错误数据
        let overallErrorDataArray = [
          { label: '人名大小写错误', value: overallData.errorCounts.capital_name },
          { label: '首句单词大小写错误', value: overallData.errorCounts.capital_first_word },
          { label: '抄写错误', value: overallData.errorCounts.copy },
          { label: '标点符号使用错误', value: overallData.errorCounts.punctuation },
          { label: '其他', value: overallData.errorCounts.others }
        ];

// 按错误次数从大到小排序
        overallErrorDataArray.sort((a, b) => b.value - a.value);
        console.log('Sorted overallErrorDataArray:', overallErrorDataArray); // 检查排序结果

        const overallErrorData = {
          labels: overallErrorDataArray.map(item => item.label),
          datasets: [{
            label: '错误次数',
            data: overallErrorDataArray.map(item => item.value),
            backgroundColor: 'rgb(109, 228, 198,0.5)',
            
            borderWidth: 1
          }]
        };

        console.log('overallErrorData:', overallErrorData); // 检查数据传递

        if (chartInstance) {
          chartInstance.destroy();
        }

        const overallCtx = document.getElementById('overallErrorChart').getContext('2d');
        chartInstance = new Chart(overallCtx, {
          type: 'bar',
          data: overallErrorData,
          options: {
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });

      } else if (viewOption === 'campusComparison') {
        console.log('campus');

        const { data: zhangjiangData } = await axios.get('http://localhost:3000/part2_1/school/1');
        zhangjiangAverageScore.value = zhangjiangData.averageScore.toFixed(2);

        const { data: binjiangData } = await axios.get('http://localhost:3000/part2_1/school/2');
        binjiangAverageScore.value = binjiangData.averageScore.toFixed(2);

        // 校区错误数据
        let campusErrorDataArray = [
          { label: '人名大小写错误', zhangjiang: zhangjiangData.errorCounts.capital_name, binjiang: binjiangData.errorCounts.capital_name },
          { label: '首句单词大小写错误', zhangjiang: zhangjiangData.errorCounts.capital_first_word, binjiang: binjiangData.errorCounts.capital_first_word },
          { label: '抄写错误', zhangjiang: zhangjiangData.errorCounts.copy, binjiang: binjiangData.errorCounts.copy },
          { label: '标点符号使用错误', zhangjiang: zhangjiangData.errorCounts.punctuation, binjiang: binjiangData.errorCounts.punctuation },
          { label: '其他', zhangjiang: zhangjiangData.errorCounts.others, binjiang: binjiangData.errorCounts.others }
        ];

        // 按滨江校区错误次数排序
        campusErrorDataArray.sort((a, b) => b.zhangjiang - a.zhangjiang);

        const campusErrorData = {
          labels: campusErrorDataArray.map(item => item.label),
          datasets: [
            {
              label: '张江校区错误次数',
              data: campusErrorDataArray.map(item => item.zhangjiang),
              backgroundColor: 'rgb(109, 228, 198,0.5)',
              
              borderWidth: 1
            },
            {
              label: '滨江校区错误次数',
              data: campusErrorDataArray.map(item => item.binjiang),
              backgroundColor: 'rgb(255, 127, 80,0.5)',
              
              borderWidth: 1
            }
          ]
        };

        if (campusChartInstance) {
          campusChartInstance.destroy();
        }

        const campusCtx = document.getElementById('campusErrorChart').getContext('2d');
        campusChartInstance = new Chart(campusCtx, {
          type: 'bar',
          data: campusErrorData,
          options: {
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });

      }
    };



    const fetchFilteredData = async (classIndex) => {
      let classInfo;
      if (classIndex === 1) {
        classInfo = class1Info.value;
      } else {
        classInfo = class2Info.value;
      }

      if (!classInfo.school_no || !classInfo.class_no) {
        console.error('Class information is not available.');
        return;
      }

      try {
        const { school_no, class_no } = classInfo;

        const { data: filteredData } = await axios.get('http://localhost:3000/part2_1/filter', {
          params: {
            school_no,
            class_no
          }
        });

        const averageScore = filteredData.averageScore.toFixed(2);

        if (classIndex === 1) {
          class1Average.value = averageScore;
          class1Info.value.errorCounts = filteredData.errorCounts;
        } else {
          class2Average.value = averageScore;
          class2Info.value.errorCounts = filteredData.errorCounts;
        }

        const class1ErrorCounts = [
          { label: '人名大小写错误', count: class1Info.value.errorCounts.capital_name },
          { label: '首句单词大小写错误', count: class1Info.value.errorCounts.capital_first_word },
          { label: '抄写错误', count: class1Info.value.errorCounts.copy },
          { label: '标点符号使用错误', count: class1Info.value.errorCounts.punctuation },
          { label: '其他', count: class1Info.value.errorCounts.others }
        ];

        class1ErrorCounts.sort((a, b) => b.count - a.count);

        const sortedLabels = class1ErrorCounts.map(item => item.label);
        const sortedClass1Counts = class1ErrorCounts.map(item => item.count);

        const sortedClass2Counts = sortedLabels.map(label => {
          switch (label) {
            case '人名大小写错误':
              return class2Info.value.errorCounts.capital_name;
            case '首句单词大小写错误':
              return class2Info.value.errorCounts.capital_first_word;
            case '抄写错误':
              return class2Info.value.errorCounts.copy;
            case '标点符号使用错误':
              return class2Info.value.errorCounts.punctuation;
            case '其他':
              return class2Info.value.errorCounts.others;
            default:
              return 0;
          }
        });

        const errorData = {
          labels: sortedLabels,
          datasets: [
            {
              label: '班级1错误次数',
              data: sortedClass1Counts,
              backgroundColor: 'rgb(109, 228, 198,0.5)',
              
              borderWidth: 1
            },
            ...(selectedClass2.value ? [{
              label: '班级2错误次数',
              data: sortedClass2Counts,
              backgroundColor: 'rgb(255, 127, 80,0.5)',
             
              borderWidth: 1
            }] : [])
          ]
        };

        if (chartInstance) {
          chartInstance.destroy();
        }

        const ctx = document.getElementById('errorChart').getContext('2d');
        chartInstance = new Chart(ctx, {
          type: 'bar',
          data: errorData,
          options: {
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });


        // const errorData = {
        //   labels: ['人名大小写错误', '首句单词大小写错误', '抄写错误', '标点符号使用错误', '其他'],
        //   datasets: [
        //     {
        //       label: `班级1错误次数`,
        //       data: [
        //         class1Info.value.errorCounts.capital_name,
        //         class1Info.value.errorCounts.capital_first_word,
        //         class1Info.value.errorCounts.copy,
        //         class1Info.value.errorCounts.punctuation,
        //         class1Info.value.errorCounts.others
        //       ],
        //       backgroundColor: 'rgb(109, 228, 198,0.5)',
        //       borderColor: 'rgba(75, 192, 192, 1)',
        //       borderWidth: 1
        //     },
        //     ...(selectedClass2.value ? [{
        //       label: `班级2错误次数`,
        //       data: [
        //         class2Info.value.errorCounts.capital_name,
        //         class2Info.value.errorCounts.capital_first_word,
        //         class2Info.value.errorCounts.copy,
        //         class2Info.value.errorCounts.punctuation,
        //         class2Info.value.errorCounts.others
        //       ],
        //       backgroundColor: 'rgb(255, 127, 80,0.5)',
        //       borderColor: 'rgba(153, 102, 255, 1)',
        //       borderWidth: 1
        //     }] : [])
        //   ]
        // };
        //
        // if (chartInstance) {
        //   chartInstance.destroy();
        // }
        //
        // const ctx = document.getElementById('errorChart').getContext('2d');
        // chartInstance = new Chart(ctx, {
        //   type: 'bar',
        //   data: errorData,
        //   options: {
        //     scales: {
        //       y: {
        //         beginAtZero: true
        //       }
        //     }
        //   }
        // });
      } catch (error) {
        console.error('Failed to fetch filtered data:', error);
      }
    };

    const parseClassValue = (value) => {
      const school_no = value.charAt(0);
      const class_no = value.slice(1).replace('&', ''); // 去掉 '&' 符号
      return { school_no, class_no };
    };

    return {
      isStudent,
      isTeacher,
      isAdmin,
      studentImage,
      studentScore,
      peerAverage,
      class1Average,
      class2Average,
      overallAverageScore,
      zhangjiangAverageScore,
      binjiangAverageScore,
      classOptions,
      selectedClass1,
      selectedClass2,
      selectedViewOption,
      handleViewOptionChange,
      fetchFilteredData,
      handleClassSelection
    };
  }
};
</script>

<style scoped>
.container {
  padding-bottom: 50px;
}

.single{
  display: flex;
  align-items: center; /* 垂直居中对齐 */
}
.single select{
  font-size: 16px; /* 字体大小 */
    padding: 8px; /* 内边距 */
    color: #ffffff; /* 字体颜色，黑色 */
    background-color: #6DE4C6; /* 背景颜色，白色 */
    border: 1px solid #aaa; /* 边框颜色，灰色 */
    border-radius: 4px; /* 圆角边框 */
    font-weight: bold; /* 加粗字体 */
    margin-right: 20px;
}
.compare{
  display: flex;
  align-items: center; /* 垂直居中对齐 */
}
.compare select{
  font-size: 16px; /* 字体大小 */
    padding: 8px; /* 内边距 */
    color: #ffffff; /* 字体颜色，黑色 */
    background-color: #6DE4C6; /* 背景颜色，白色 */
    border: 1px solid #aaa; /* 边框颜色，灰色 */
    border-radius: 4px; /* 圆角边框 */
    font-weight: bold; /* 加粗字体 */
    margin-right: 20px;
}
.choose{
  display: flex;
  align-items: center; /* 垂直居中对齐 */
}
.choose select{
  font-size: 16px; /* 字体大小 */
    padding: 8px; /* 内边距 */
    color: #ffffff; /* 字体颜色，黑色 */
    background-color: #6DE4C6; /* 背景颜色，白色 */
    border: 1px solid #aaa; /* 边框颜色，灰色 */
    border-radius: 4px; /* 圆角边框 */
    font-weight: bold; /* 加粗字体 */
    margin-right: 20px;
}
.class_select{
  display: flex;
  align-items: center; /* 垂直居中对齐 */
}
.class_select h2{
  font-size: 20px;
}


 .image_container {
      display: flex;
      flex-direction: column; /* 使内容垂直排列 */
      align-items: center; /* 水平居中内容 */
      text-align: center; /* 使标题居中对齐 */
      height:500px;
    }

    .image {
      display: flex;
      flex-direction: column; /* 垂直排列图片 */
      align-items: center; /* 水平居中图片 */
      gap: 30px; /* 图片之间的间距 */
    }

    .image img {
      width: 900px; /* 图片宽度 */
      height: auto; /* 保持图片纵横比 */
    }
.test{
   display: flex;
      flex-direction: column; /* 使内容垂直排列 */
      align-items: center; /* 水平居中内容 */
}
.stu_img{
  display: flex;
      flex-direction: column; /* 使内容垂直排列 */
      align-items: center; /* 水平居中内容 */

}

/* 水平居中 */ 
.flex-container {  
    display: flex;  
    justify-content: center;   
} 
</style>
