<template>
  <div>
    <h1>1. Look and write (正确抄写下列句子，注意大小写和标点符号):【语法-句法-疑问句】难度【D】</h1>
    <img src="/images/PART2_1.png" alt="Part2_1" />

    <!-- 学生视图 -->
    <div v-if="isStudent">
      <div>
        <h2>学生答案：</h2>
        <img v-if="studentImage" :src="'data:image/jpeg;base64,' + studentImage" alt="Student Answer" />
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

    <!-- 教师视图 -->
    <div v-else-if="isTeacher || isAdmin">
      <div v-if="isAdmin">
        <h2>所有班级学生得分均分：{{ overallAverageScore }}</h2>
        <h2>所有班级错误表格：</h2>
        <canvas id="overallErrorChart"></canvas>
        <h2>张江校区学生得分均分：{{ zhangjiangAverageScore }}</h2>
        <h2>滨江校区学生得分均分：{{ binjiangAverageScore }}</h2>
        <h2>错误表格：</h2>
        <canvas id="campusErrorChart"></canvas>
      </div>
      <div>
        <h2>班级筛选：</h2>
        <select v-model="selectedClass1" @change="handleClassSelection">
          <option v-for="option in classOptions" :key="option.value" :value="option.value">{{ option.text }}</option>
        </select>
        <select v-model="selectedClass2" @change="handleClassSelection">
          <option value="">请选择第二个班级（可选）</option>
          <option v-for="option in classOptions" :key="option.value" :value="option.value">{{ option.text }}</option>
        </select>
      </div>
      <div>
        <h2>班级1得分均分：{{ class1Average }}</h2>
        <h2 v-if="selectedClass2">班级2得分均分：{{ class2Average }}</h2>
      </div>
      <div>
        <h2>参考解析：</h2>
        <p>Can you draw yourself, Danny? Yes, of course</p>
      </div>
      <div>
        <h2>错误表格：</h2>
        <canvas id="errorChart"></canvas>
      </div>
      <div>
        <h2>典型错误案例：</h2>
        <img src="/images/1.png" alt="Typical Error 1" />
        <img src="/images/2.png" alt="Typical Error 2" />
        <img src="/images/3.png" alt="Typical Error 3" />
        <img src="/images/4.png" alt="Typical Error 4" />
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ref, onMounted, watch } from 'vue';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default {
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

    onMounted(async () => {
      if (isStudent) {
        try {
          const { data: studentData } = await axios.get(`http://localhost:3000/part2_1/${props.userName}`);
          studentImage.value = studentData.image;
          studentScore.value = studentData.score;

          const { data: averageData } = await axios.get(`http://localhost:3000/part2_1/average/${studentData.school_no}/${studentData.class_no}`);
          peerAverage.value = averageData.average;

          const errorData = {
            labels: ['人名大小写错误', '首句单词大小写错误', '抄写错误', '标点符号使用错误', '其他'],
            datasets: [{
              label: '错误次数',
              data: [
                studentData.capital_name,
                studentData.capital_first_word,
                studentData.copy,
                studentData.punctuation,
                studentData.others
              ],
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
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
                  beginAtZero: true
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
                text: `school_no: ${school_no}, class_no: ${class_no}`
              };
            });

            if (classData.length) {
              const firstClass = classData[0].value;
              const { school_no, class_no } = parseClassValue(firstClass);
              selectedClass1.value = `${school_no}&${class_no}`;
              fetchFilteredData(1); // Fetch data for the default selected class
            }

            const { data: overallData } = await axios.get('http://localhost:3000/part2_1/summary');
            overallAverageScore.value = overallData.averageScore;

            const overallErrorData = {
              labels: ['人名大小写错误', '首句单词大小写错误', '抄写错误', '标点符号使用错误', '其他'],
              datasets: [{
                label: '错误次数',
                data: [
                  overallData.errorCounts.capital_name,
                  overallData.errorCounts.capital_first_word,
                  overallData.errorCounts.copy,
                  overallData.errorCounts.punctuation,
                  overallData.errorCounts.others
                ],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
              }]
            };

            const overallCtx = document.getElementById('overallErrorChart').getContext('2d');
            new Chart(overallCtx, {
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
            
            const { data: zhangjiangData } = await axios.get('http://localhost:3000/part2_1/school/1');
            zhangjiangAverageScore.value = zhangjiangData.averageScore;
            
            const { data: binjiangData } = await axios.get('http://localhost:3000/part2_1/school/2');
            binjiangAverageScore.value = binjiangData.averageScore;

            const campusErrorData = {
              labels: ['人名大小写错误', '首句单词大小写错误', '抄写错误', '标点符号使用错误', '其他'],
              datasets: [
                {
                  label: '张江校区错误次数',
                  data: [
                    zhangjiangData.errorCounts.capital_name,
                    zhangjiangData.errorCounts.capital_first_word,
                    zhangjiangData.errorCounts.copy,
                    zhangjiangData.errorCounts.punctuation,
                    zhangjiangData.errorCounts.others
                  ],
                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                  borderColor: 'rgba(75, 192, 192, 1)',
                  borderWidth: 1
                },
                {
                  label: '滨江校区错误次数',
                  data: [
                    binjiangData.errorCounts.capital_name,
                    binjiangData.errorCounts.capital_first_word,
                    binjiangData.errorCounts.copy,
                    binjiangData.errorCounts.punctuation,
                    binjiangData.errorCounts.others
                  ],
                  backgroundColor: 'rgba(153, 102, 255, 0.2)',
                  borderColor: 'rgba(153, 102, 255, 1)',
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
                text: `school_no: ${school_no}, class_no: ${class_no}`
              };
            });

            classOptions.value = options;
            if (options.length) {
              const { school_no, class_no } = parseClassValue(options[0].value);
              selectedClass1.value = `${school_no}${class_no}`;
              class1Info.value = { school_no, class_no };
              fetchFilteredData(1); // Fetch data for the default selected class
            }
          }
        } catch (error) {
          console.error('Failed to fetch data:', error);
        }
      }
    });

    watch([selectedClass1, selectedClass2], ([newClass1, newClass2]) => {
      if (newClass1) {
        const { school_no, class_no } = parseClassValue(newClass1);
        class1Info.value = { school_no, class_no, errorCounts: {} };
        fetchFilteredData(1);
      }
      if (newClass2) {
        const { school_no, class_no } = parseClassValue(newClass2);
        class2Info.value = { school_no, class_no, errorCounts: {} };
        fetchFilteredData(2);
      } else {
        class2Info.value = { school_no: '', class_no: '', errorCounts: {} };
        class2Average.value = null;
      }
    });

    const handleClassSelection = () => {
      if (selectedClass1.value) {
        fetchFilteredData(1);
      }
      if (selectedClass2.value) {
        fetchFilteredData(2);
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

        const averageScore = filteredData.averageScore;

        if (classIndex === 1) {
          class1Average.value = averageScore;
          class1Info.value.errorCounts = filteredData.errorCounts;
        } else {
          class2Average.value = averageScore;
          class2Info.value.errorCounts = filteredData.errorCounts;
        }

        const errorData = {
          labels: ['人名大小写错误', '首句单词大小写错误', '抄写错误', '标点符号使用错误', '其他'],
          datasets: [
            {
              label: `班级1错误次数`,
              data: [
                class1Info.value.errorCounts.capital_name,
                class1Info.value.errorCounts.capital_first_word,
                class1Info.value.errorCounts.copy,
                class1Info.value.errorCounts.punctuation,
                class1Info.value.errorCounts.others
              ],
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            },
            ...(selectedClass2.value ? [{
              label: `班级2错误次数`,
              data: [
                class2Info.value.errorCounts.capital_name,
                class2Info.value.errorCounts.capital_first_word,
                class2Info.value.errorCounts.copy,
                class2Info.value.errorCounts.punctuation,
                class2Info.value.errorCounts.others
              ],
              backgroundColor: 'rgba(153, 102, 255, 0.2)',
              borderColor: 'rgba(153, 102, 255, 1)',
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
      fetchFilteredData,
      handleClassSelection
    };
  }
};
</script>

<style scoped>

</style>
