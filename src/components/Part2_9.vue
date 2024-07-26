<template>
  <div>
    <h1>IX. Think and write (写一写自己最喜欢的场所，描述它的特征，不少于五句话):【语篇-句与句】</h1>
    <img src="/images/title.png" alt="Title" />

    <div v-if="isStudent">
      <div>
        <h2>学生答案：</h2>
        <img v-if="studentData.image" :src="'data:image/jpeg;base64,' + studentData.image" alt="Student Answer" />
      </div>
      <div>
        <h2>学生得分：{{ studentData.score }}</h2>
      </div>
      <div>
        <h2>同伴均分：{{ peerAverage }}</h2>
      </div>
      <div>
        <h2>修改建议：</h2>
        <p v-html="studentData.suggestion"></p>
      </div>
      <div>
        <h2>表格：</h2>
        <table>
          <tr>
            <th>单词数量</th>
            <th>句子数量</th>
          </tr>
          <tr>
            <td>{{ studentData.word_counts }}</td>
            <td>{{ studentData.sentence_counts }}</td>
          </tr>
        </table>
      </div>
      <div>
        <h2>错误类型数量柱状图：</h2>
        <canvas id="studentErrorsChart"></canvas>
      </div>
    </div>

    <div v-if="isTeacher || isAdmin">
      <div>
        <h2>选择班级1：</h2>
        <select v-model="selectedClass1" @change="fetchFilteredData">
          <option v-for="option in classOptions" :key="option.value" :value="option.value">{{ option.text }}</option>
        </select>
      </div>

      <div>
        <h2>选择班级2：</h2>
        <select v-model="selectedClass2" @change="fetchFilteredData">
          <option v-for="option in classOptions" :key="option.value" :value="option.value">{{ option.text }}</option>
          <option value="">可不选</option>
        </select>
      </div>

      <h2>班级1得分均分：{{ class1AverageScore }}</h2>
      <h2>班级1单词数量平均值：{{ averageWordCounts1 }}</h2>
      <h2>班级1句子数量平均值：{{ averageSentenceCounts1 }}</h2>

      <h2>班级1低于均分的学生</h2>
      <ul>
        <li v-for="student in belowAverageStudents1" :key="student.name">
          <span @click="showStudentImage(student.name)">{{ student.name }}</span>
          <div v-if="selectedStudent === student.name" class="modal">
            <span @click="closeStudentImage" class="close">&times;</span>
            <img v-if="selectedStudentImage" :src="'data:image/jpeg;base64,' + selectedStudentImage" alt="Student Image" />
          </div>
        </li>
      </ul>

      <div v-if="selectedClass2">
        <h2>班级2得分均分：{{ class2AverageScore }}</h2>
        <h2>班级2单词数量平均值：{{ averageWordCounts2 }}</h2>
        <h2>班级2句子数量平均值：{{ averageSentenceCounts2 }}</h2>

        <h2>班级2低于均分的学生</h2>
        <ul>
          <li v-for="student in belowAverageStudents2" :key="student.name">
            <span @click="showStudentImage(student.name)">{{ student.name }}</span>
            <div v-if="selectedStudent === student.name" class="modal">
              <span @click="closeStudentImage" class="close">&times;</span>
              <img v-if="selectedStudentImage" :src="'data:image/jpeg;base64,' + selectedStudentImage" alt="Student Image" />
            </div>
          </li>
        </ul>
      </div>

      <div>
        <h2>错误类型数量柱状图：</h2>
        <canvas id="classComparisonErrorsChart"></canvas>
      </div>
    </div>

    <div>
      <h2>参考范文：</h2>
      <img src="/images/good_essay.png" alt="Good Essay" />
    </div>

    <div v-if="isAdmin">
      <div>
        <h2>所有数据的统计信息：</h2>
        <table>
          <tr>
            <th>学生得分均分</th>
            <td>{{ overallData.averageScore }}</td>
          </tr>
          <tr>
            <th>单词数量平均值</th>
            <td>{{ overallData.averageWordCounts }}</td>
          </tr>
          <tr>
            <th>句子数量平均值</th>
            <td>{{ overallData.averageSentenceCounts }}</td>
          </tr>
        </table>
      </div>
      <div>
        <h2>错误类型数量柱状图：</h2>
        <canvas id="overallErrorsChart"></canvas>
      </div>

      <div>
        <h2>张江校区数据：</h2>
        <table>
          <tr>
            <th>学生得分均分</th>
            <td>{{ zhangjiangData.averageScore }}</td>
          </tr>
          <tr>
            <th>单词数量平均值</th>
            <td>{{ zhangjiangData.averageWordCounts }}</td>
          </tr>
          <tr>
            <th>句子数量平均值</th>
            <td>{{ zhangjiangData.averageSentenceCounts }}</td>
          </tr>
        </table>
      </div>

      <div>
        <h2>滨江校区数据：</h2>
        <table>
          <tr>
            <th>学生得分均分</th>
            <td>{{ binjiangData.averageScore }}</td>
          </tr>
          <tr>
            <th>单词数量平均值</th>
            <td>{{ binjiangData.averageWordCounts }}</td>
          </tr>
          <tr>
            <th>句子数量平均值</th>
            <td>{{ binjiangData.averageSentenceCounts }}</td>
          </tr>
        </table>
        <div>
          <h2>错误类型数量柱状图：</h2>
          <canvas id="combinedErrorsChart"></canvas>
        </div>

      </div>
    </div>

  </div>
</template>



<script>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import Chart from 'chart.js/auto';

export default {
  name: 'Part2_9View',
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
    const selectedClass1 = ref('');
    const selectedClass2 = ref('');
    const belowAverageStudents1 = ref([]);
    const belowAverageStudents2 = ref([]);
    const averageWordCounts1 = ref(0);
    const averageSentenceCounts1 = ref(0);
    const studentAverageScore1 = ref(0);
    const averageWordCounts2 = ref(0);
    const averageSentenceCounts2 = ref(0);
    const studentAverageScore2 = ref(0);
    const class1Errors = ref({});
    const class2Errors = ref({});
    const class1AverageScore = ref(0);
    const class2AverageScore = ref(0);

    let classComparisonErrorsChart = null;


    const isStudent = props.permission === 1;
    const isTeacher = props.permission === 0;
    const isAdmin = props.permission === 2;
    const studentData = ref({});
    const peerAverage = ref(0);
    const classOptions = ref([]);
    const selectedStudent = ref(null);
    const selectedStudentImage = ref(null);
    const studentErrors = ref({});
    const overallData = ref({});
    const zhangjiangData = ref({});
    const binjiangData = ref({});

    let studentErrorsChart = null;
    let overallErrorsChart = null;
    let zhangjiangErrorsChart = null;
    let binjiangErrorsChart = null;


    onMounted(async () => {
      if (isStudent) {
        await fetchStudentData();
      } else if (isTeacher) {
        await fetchTeacherData();
      } else if (isAdmin) {
        await fetchAllClasses();
        await fetchOverallData();
        await fetchZhangjiangData();
        await fetchBinjiangData();
        renderCombinedErrorsChart();
      }
    });

    const processClassData = (data, classId) => {
      const averageScore = data.averageScore;
      const allScores = data.scores;
      const wordCounts = data.wordCounts;
      const sentenceCounts = data.sentenceCounts;

      if (classId === '1') {
        belowAverageStudents1.value = allScores.filter(student => student.score < averageScore).map(student => ({ name: student.name }));
        averageWordCounts1.value = (wordCounts.reduce((sum, count) => sum + count, 0) / wordCounts.length) || 0;
        averageSentenceCounts1.value = (sentenceCounts.reduce((sum, count) => sum + count, 0) / sentenceCounts.length) || 0;
        studentAverageScore1.value = averageScore;
        class1AverageScore.value = averageScore;
      } else {
        belowAverageStudents2.value = allScores.filter(student => student.score < averageScore).map(student => ({ name: student.name }));
        averageWordCounts2.value = (wordCounts.reduce((sum, count) => sum + count, 0) / wordCounts.length) || 0;
        averageSentenceCounts2.value = (sentenceCounts.reduce((sum, count) => sum + count, 0) / sentenceCounts.length) || 0;
        studentAverageScore2.value = averageScore;
        class2AverageScore.value = averageScore;
      }
    };

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


    const fetchPeerAverage = async (school_no, class_no) => {
      try {
        const { data: averageData } = await axios.get(`http://localhost:3000/part2_9/average/${school_no}/${class_no}`);
        peerAverage.value = averageData.average;
      } catch (error) {
        console.error('获取同伴均分失败:', error);
      }
    };

    const fetchStudentData = async () => {
      try {
        const { data: studentResponse } = await axios.get(`http://localhost:3000/part2_9/${props.userName}`);
        studentData.value = studentResponse;
        fetchPeerAverage(studentResponse.school_no, studentResponse.class_no);
        fetchStudentErrors(studentResponse.name);
      } catch (error) {
        console.error('获取学生数据失败:', error);
      }
    };

    const fetchStudentErrors = async (studentName) => {
      try {
        const { data: errorsData } = await axios.get(`http://localhost:3000/part2_9/errors/${studentName}`);
        studentErrors.value = errorsData;
        renderStudentErrorsChart();
      } catch (error) {
        console.error('获取学生错误数据失败:', error);
      }
    };


    const parseClassValue = (value) => {
      const school_no = value.charAt(0);
      const class_no = value.slice(1).replace('&', ''); // 去掉 '&' 符号
      return { school_no, class_no };
    };


    const fetchTeacherData = async () => {
      try {
        const { data: teacherData } = await axios.get(`http://localhost:3000/teacher/${props.userName}`);
        const permissions = teacherData.permission.split(',');

        const options = permissions.map(permission => {
          const { school_no, class_no } = parseClassValue(permission);
          return {
            value: `${school_no}&${class_no}`,
            text: `${getCampusName(school_no)} ${class_no}班`
          };
        });

        classOptions.value = options;

        // 设置默认选项为第一个
        if (options.length > 0) {
          selectedClass1.value = options[0].value;
          selectedClass2.value = options[1] ? options[1].value : options[0].value; // 如果只有一个选项，则选两个相同
        }

        fetchFilteredData();
      } catch (error) {
        console.error('Failed to fetch teacher data:', error);
      }
    };

    const fetchAllClasses = async () => {
      try {
        const { data: classes } = await axios.get('http://localhost:3000/part2_9/classes');

        classOptions.value = classes.map(cls => {
          const { school_no, class_no } = parseClassValue(`${cls.school_no}&${cls.class_no}`);
          return {
            value: `${school_no}&${class_no}`,
            text: `${getCampusName(school_no)} ${class_no}班`
          };
        });

        if (classOptions.value.length > 0) {
          selectedClass1.value = classOptions.value[0].value;
          selectedClass2.value = classOptions.value[1] ? classOptions.value[1].value : classOptions.value[0].value; // 如果只有一个选项，则选两个相同
        }

        fetchFilteredData();
      } catch (error) {
        console.error('获取班级数据失败:', error);
      }
    };


    const fetchFilteredData = async () => {
      try {
        const [school_no1, class_no1] = selectedClass1.value.split('&');

        // Fetch data for class 1
        const { data: class1Data } = await axios.get('http://localhost:3000/part2_9/filter', {
          params: { school_no: school_no1, class_no: class_no1 }
        });
        processClassData(class1Data, '1');

        if (selectedClass2.value) {
          const [school_no2, class_no2] = selectedClass2.value.split('&');

          // Fetch data for class 2
          const { data: class2Data } = await axios.get('http://localhost:3000/part2_9/filter', {
            params: { school_no: school_no2, class_no: class_no2 }
          });
          processClassData(class2Data, '2');

          // Fetch errors data for class 2
          await fetchClassErrors(school_no2, class_no2, '2');
        } else {
          // If no class 2 selected, reset class 2 data
          belowAverageStudents2.value = [];
          averageWordCounts2.value = 0;
          averageSentenceCounts2.value = 0;
          studentAverageScore2.value = 0;
          class2Errors.value = {};
        }

        // Fetch errors data for class 1
        await fetchClassErrors(school_no1, class_no1, '1');

      } catch (error) {
        console.error('获取筛选数据失败:', error);
      }
    };


    const fetchClassErrors = async (school_no, class_no, classId) => {
      try {
        const { data: classErrorsData } = await axios.get(`http://localhost:3000/part2_9/errors/class/${school_no}/${class_no}`);
        if (classId === '1') {
          class1Errors.value = classErrorsData;
        } else {
          class2Errors.value = classErrorsData;
        }
        renderClassComparisonErrorsChart();
      } catch (error) {
        console.error('获取班级错误数据失败:', error);
      }
    };

    const fetchOverallData = async () => {
      try {
        const { data } = await axios.get('http://localhost:3000/part2_9/overall');
        overallData.value = data;
        renderOverallErrorsChart();
      } catch (error) {
        console.error('获取所有数据统计信息失败:', error);
      }
    };

    const fetchZhangjiangData = async () => {
      try {
        const { data } = await axios.get('http://localhost:3000/part2_9/campus/1');
        zhangjiangData.value = data;
        renderZhangjiangErrorsChart();
      } catch (error) {
        console.error('获取张江校区数据失败:', error);
      }
    };

    const fetchBinjiangData = async () => {
      try {
        const { data } = await axios.get('http://localhost:3000/part2_9/campus/2');
        binjiangData.value = data;
        renderBinjiangErrorsChart();
      } catch (error) {
        console.error('获取滨江校区数据失败:', error);
      }
    };

    const renderStudentErrorsChart = () => {
      const ctx = document.getElementById('studentErrorsChart').getContext('2d');
      if (studentErrorsChart) {
        studentErrorsChart.destroy();
      }
      studentErrorsChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(studentErrors.value),
          datasets: [{
            label: '错误类型数量',
            data: Object.values(studentErrors.value),
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    };


    const renderOverallErrorsChart = () => {
      const ctx = document.getElementById('overallErrorsChart').getContext('2d');
      if (overallErrorsChart) {
        overallErrorsChart.destroy();
      }
      overallErrorsChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(overallData.value.errors),
          datasets: [{
            label: '错误类型数量',
            data: Object.values(overallData.value.errors),
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    };

    const renderZhangjiangErrorsChart = () => {
      const ctx = document.getElementById('zhangjiangErrorsChart').getContext('2d');
      if (zhangjiangErrorsChart) {
        zhangjiangErrorsChart.destroy();
      }
      zhangjiangErrorsChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(zhangjiangData.value.errors),
          datasets: [{
            label: '错误类型数量',
            data: Object.values(zhangjiangData.value.errors),
            backgroundColor: 'rgba(255, 159, 64, 0.2)',
            borderColor: 'rgba(255, 159, 64, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    };

    const renderBinjiangErrorsChart = () => {
      const ctx = document.getElementById('binjiangErrorsChart').getContext('2d');
      if (binjiangErrorsChart) {
        binjiangErrorsChart.destroy();
      }
      binjiangErrorsChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(binjiangData.value.errors),
          datasets: [{
            label: '错误类型数量',
            data: Object.values(binjiangData.value.errors),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    };
    const renderCombinedErrorsChart = () => {
      const ctx = document.getElementById('combinedErrorsChart').getContext('2d');
      if (zhangjiangErrorsChart) {
        zhangjiangErrorsChart.destroy();
      }
      if (binjiangErrorsChart) {
        binjiangErrorsChart.destroy();
      }

      const combinedLabels = Array.from(new Set([...Object.keys(zhangjiangData.value.errors), ...Object.keys(binjiangData.value.errors)]));

      const zhangjiangErrors = combinedLabels.map(label => zhangjiangData.value.errors[label] || 0);
      const binjiangErrors = combinedLabels.map(label => binjiangData.value.errors[label] || 0);

      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: combinedLabels,
          datasets: [
            {
              label: '张江校区 错误类型数量',
              data: zhangjiangErrors,
              backgroundColor: 'rgba(255, 159, 64, 0.5)',
              borderColor: 'rgba(255, 159, 64, 1)',
              borderWidth: 1
            },
            {
              label: '滨江校区 错误类型数量',
              data: binjiangErrors,
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    };

    const renderClassComparisonErrorsChart = () => {
      const ctx = document.getElementById('classComparisonErrorsChart').getContext('2d');
      if (classComparisonErrorsChart) {
        classComparisonErrorsChart.destroy();
      }

      const datasets = [
        {
          label: '班级1 错误类型数量',
          data: Object.keys(class1Errors.value).map(key => class1Errors.value[key]),
          backgroundColor: 'rgba(255, 99, 132, 0.5)'
        }
      ];

      if (selectedClass2.value) {
        datasets.push({
          label: '班级2 错误类型数量',
          data: Object.keys(class2Errors.value).map(key => class2Errors.value[key]),
          backgroundColor: 'rgba(54, 162, 235, 0.5)'
        });
      }

      classComparisonErrorsChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: selectedClass2.value ?
              Object.keys(class1Errors.value).concat(Object.keys(class2Errors.value)) :
              Object.keys(class1Errors.value),
          datasets: datasets
        },
        options: {
          scales: {
            x: { beginAtZero: true },
            y: { beginAtZero: true }
          }
        }
      });
    };



    const showStudentImage = async (studentName) => {
      selectedStudent.value = studentName;
      try {
        const { data: imageData } = await axios.get(`http://localhost:3000/part2_9/image/${studentName}`);
        selectedStudentImage.value = imageData.image;
      } catch (error) {
        console.error('获取学生图像失败:', error);
      }
    };

    const closeStudentImage = () => {
      selectedStudent.value = null;
      selectedStudentImage.value = null;
    };

    return {
      isStudent,
      isTeacher,
      isAdmin,
      studentData,
      peerAverage,
      classOptions,
      selectedClass1,
      selectedClass2,
      belowAverageStudents1,
      belowAverageStudents2,
      averageWordCounts1,
      averageSentenceCounts1,
      studentAverageScore1,
      averageWordCounts2,
      averageSentenceCounts2,
      studentAverageScore2,
      selectedStudent,
      selectedStudentImage,
      class1Errors,
      class2Errors,
      class1AverageScore,
      class2AverageScore,
      overallData,
      zhangjiangData,
      binjiangData,
      fetchFilteredData,
      showStudentImage,
      closeStudentImage
    };
  }
};
</script>

<style scoped>
.modal {
  display: block;
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgb(0,0,0);
  background-color: rgba(0,0,0,0.4);
  padding-top: 60px;
}

.modal img {
  margin: auto;
  display: block;
  width: 80%;
  max-width: 700px;
}

.close {
  color: white;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: #bbb;
  text-decoration: none;
  cursor: pointer;
}
</style>
