<template>
  <div>
    <h1>1. Look and write (正确抄写下列句子，注意大小写和标点符号):【语法-句法-疑问句】难度【D】</h1>
    <img src="/images/PART2_1.png" alt="Part2_1" />

    <!-- 学生视图 -->
    <div v-if="isStudent">
      <div>
        <h2>学生答案：</h2>
        <img v-if="studentImage" :src="`data:image/jpeg;base64,${studentImage}`" alt="Student Answer" />
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
      <div v-if="isTeacher">
        <div>
          <h2>班级筛选：</h2>
          <select v-model="selectedClass" @change="fetchFilteredData">
            <option v-for="option in classOptions" :key="option.value" :value="option.value">{{ option.text }}</option>
          </select>
        </div>
      </div>
      <div>
        <h2>学生得分均分：{{ studentAverage }}</h2>
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
<!--          <img :src="typicalError1" alt="Typical Error 1" />-->
<!--          <img :src="typicalError2" alt="Typical Error 2" />-->
<!--          <img :src="typicalError3" alt="Typical Error 3" />-->
<!--          <img :src="typicalError4" alt="Typical Error 4" />-->
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
    // const partImage = require('public/images/PART2_1.png');
    const studentImage = ref(null);
    const studentScore = ref(null);
    const peerAverage = ref(null);
    const studentAverage = ref(null);
    const classOptions = ref([]);
    const selectedClass = ref('');
    const selectedClassInfo = ref(null);
    // const typicalError1 = require('public/images/1.png');
    // const typicalError2 = require('public/images/2.png');
    // const typicalError3 = require('public/images/3.png');
    // const typicalError4 = require('public/images/4.png');
    let chartInstance = null;

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
          if (isTeacher) {
            const { data: teacherData } = await axios.get(`http://localhost:3000/teacher/${props.userName}`);
            const permissions = teacherData.permission.split(',');

            const options = permissions.map(permission => {
              const school_no = permission[0];
              const class_no = permission[1];
              return {
                value: `${school_no}&${class_no}`,
                text: `school_no: ${school_no}, class_no: ${class_no}`
              };
            });

            classOptions.value = options;

            selectedClass.value = options[0].value;
            selectedClassInfo.value = {
              school_no: options[0].value.split('&')[0],
              class_no: options[0].value.split('&')[1]
            };
          }

          fetchFilteredData();
        } catch (error) {
          console.error('Failed to fetch teacher data:', error);
        }
      }
    });

    watch(selectedClass, (newClass) => {
      if (isTeacher) {
        const parts = newClass.split('&');
        selectedClassInfo.value = {
          school_no: parts[0],
          class_no: parts[1]
        };
        fetchFilteredData();
      }
    });

    const fetchFilteredData = async () => {
      try {
        const { data: filteredData } = await axios.get(isAdmin ? 'http://localhost:3000/part2_1/all' : 'http://localhost:3000/part2_1/filter', {
          params: isAdmin ? {} : {
            school_no: selectedClassInfo.value.school_no,
            class_no: selectedClassInfo.value.class_no
          }
        });

        const averageScore = filteredData.averageScore;
        const errorCounts = filteredData.errorCounts;

        studentAverage.value = averageScore;

        const errorData = {
          labels: ['人名大小写错误', '首句单词大小写错误', '抄写错误', '标点符号使用错误', '其他'],
          datasets: [{
            label: '错误次数',
            data: [
              errorCounts.capital_name,
              errorCounts.capital_first_word,
              errorCounts.copy,
              errorCounts.punctuation,
              errorCounts.others
            ],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        };

        const ctx = document.getElementById('errorChart').getContext('2d');

        if (chartInstance) {
          chartInstance.destroy();
        }

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

    return {
      isStudent,
      isTeacher,
      isAdmin,
      // partImage,
      studentImage,
      studentScore,
      peerAverage,
      studentAverage,
      classOptions,
      selectedClass,
      selectedClassInfo,
      // typicalError1,
      // typicalError2,
      // typicalError3,
      // typicalError4,
      fetchFilteredData
    };
  }
};
</script>
