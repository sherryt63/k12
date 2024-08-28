<template>
  <div class = "main">
    <header class="header">
    <h2>IX. Think and write (写一写自己最喜欢的场所，描述它的特征，不少于五句话):</h2>
    <h2>【语篇-句与句】</h2>
    <div class="menu">
      <button @click="goBack">返回主页</button>
      <div v-if="isTeacher || isAdmin" class="class_select">
      <div class="choose">
        <h2>视图选择：</h2>
        <select v-model="selectedView">
          <option value="singleClass">单个班级</option>
          <option value="classComparison">班级对比</option>
          <option v-if="isAdmin" value="campusComparison">校区对比</option>
          <option v-if="isAdmin" value="overall">整体情况</option>
        </select>
      </div>
      <div v-if="selectedView === 'singleClass'" class="single">
          <h2>选择班级1：</h2>
          <select v-model="selectedClass1" @change="fetchFilteredData">
            <option v-for="option in classOptions" :key="option.value" :value="option.value">{{ option.text }}</option>
          </select>
      </div>
      <div v-if="selectedView === 'classComparison'" class="compare">
          <h2>选择班级1：</h2>
          <select v-model="selectedClass1" @change="fetchFilteredData">
            <option v-for="option in classOptions" :key="option.value" :value="option.value">{{ option.text }}</option>
          </select>

        
          <h2>选择班级2：</h2>
          <select v-model="selectedClass2" @change="fetchFilteredData">
            <option v-for="option in classOptions" :key="option.value" :value="option.value">{{ option.text }}</option>
<!--            <option value="">可不选</option>-->
          </select>
        
      </div>
      </div>
    </div>
</header>
<div class="test">
<h1>My favourite place</h1>
</div>
  <div v-if="isStudent">
  <div class="part-background">
    <div class="question-wrapper">
      <!--学生作答情况-->
      <div class="left-column">
       <h2>学生作答：</h2>
        <div class="stu_img">       
        <img v-if="studentData.image" :src="'data:image/jpeg;base64,' + studentData.image" alt="Student Answer" />
        </div>
        <br>
        <table border="1" cellspacing="0" width="400px" height="150px">
          <tr>
            <td style="text-align: center; color: black; font-size:17px">学生得分:{{ studentData.score }}</td>
            <td style="text-align: center; color: black; font-size:17px">同伴均分:{{ peerAverage }}</td>
          </tr>
          <tr>
            <td style="text-align: center; color: black; font-size:17px">单词数量:{{ studentData.word_counts }}</td>
            <td style="text-align: center; color: black; font-size:17px">句子数量:{{ studentData.sentence_counts }}</td>
          </tr>
        </table>
      </div>
      <!--修改建议-->
      <div class="right-column">
        <h2>修改建议：</h2>
        <p v-html="studentData.suggestion"></p>
      </div>
    </div>
  </div>
      <div>
        <h2>错误类型数量柱状图：</h2>
        <canvas id="studentErrorsChart"></canvas>
      </div>
    </div>

    <div v-if="isTeacher || isAdmin">
      

      <!-- 单个班级视图 -->
      <div v-if="selectedView === 'singleClass'">
      <br>
      <br>
       <div class="flex-container">
        <table border="1" cellspacing="0" width="800px" height="150px">
          <tbody>
            <tr>
            <td>&nbsp;</td>
            <td style="text-align: center; color: black; font-size:18px">学生得分均分</td>
            <td style="text-align: center; color: black; font-size:18px">单词数量平均值</td>
            <td style="text-align: center; color: black; font-size:18px">句子数量平均值</td>
            <td style="text-align: center; color: black; font-size:18px">低于均分的学生</td>
            </tr>
            <tr>
            <td style="text-align: center; color: black; font-size:18px">班级1</td>
            <td style="text-align: center; color: black; font-size:18px">{{ class1AverageScore }}</td>
            <td style="text-align: center; color: black; font-size:18px">{{ averageWordCounts1 }}</td>
            <td style="text-align: center; color: black; font-size:18px">{{ averageSentenceCounts1 }}</td>
            <td style="text-align: center; color: black; font-size:18px">
              <div v-for="student in belowAverageStudents1" :key="student.name">
            <span @click="showStudentImage(student.name)">{{ student.name }}</span>
            <div v-if="selectedStudent === student.name" class="modal">
              <span @click="closeStudentImage" class="close">&times;</span>
              <img v-if="selectedStudentImage" :src="'data:image/jpeg;base64,' + selectedStudentImage" alt="Student Image" />
            </div>
        </div>
        </td>
            </tr>
          </tbody>
        </table>
        </div>

        <div>
          <h2>错误类型数量柱状图：</h2>
          <canvas id="classComparisonErrorsChart"></canvas>
        </div>

      </div>


      <!-- 班级对比视图 -->
      <div v-if="selectedView === 'classComparison'">
      <br>
      <br>
       <div class="flex-container">
        <table border="1" cellspacing="0" width="800px" height="150px">
          <tbody>
            <tr>
            <td>&nbsp;</td>
            <td style="text-align: center; color: black; font-size:18px">学生得分均分</td>
            <td style="text-align: center; color: black; font-size:18px">单词数量平均值</td>
            <td style="text-align: center; color: black; font-size:18px">句子数量平均值</td>
            <td style="text-align: center; color: black; font-size:18px">低于均分的学生</td>
            </tr>
            <tr>
            <td style="text-align: center; color: black; font-size:18px">班级1</td>
            <td style="text-align: center; color: black; font-size:18px">{{ class1AverageScore }}</td>
            <td style="text-align: center; color: black; font-size:18px">{{ averageWordCounts1 }}</td>
            <td style="text-align: center; color: black; font-size:18px">{{ averageSentenceCounts1 }}</td>
            <td style="text-align: center; color: black; font-size:18px">
              <div v-for="student in belowAverageStudents1" :key="student.name">
            <span @click="showStudentImage(student.name)">{{ student.name }}</span>
            <div v-if="selectedStudent === student.name" class="modal">
              <span @click="closeStudentImage" class="close">&times;</span>
              <img v-if="selectedStudentImage" :src="'data:image/jpeg;base64,' + selectedStudentImage" alt="Student Image" />
            </div>
        </div>
        </td>
            </tr>
            <tr>
            <td style="text-align: center; color: black; font-size:18px">班级2</td>
            <td style="text-align: center; color: black; font-size:18px">{{ class2AverageScore }}</td>
            <td style="text-align: center; color: black; font-size:18px">{{ averageWordCounts2 }}</td>
            <td style="text-align: center; color: black; font-size:18px">{{ averageSentenceCounts2 }}</td>
            <td style="text-align: center; color: black; font-size:18px">
          <div v-for="student in belowAverageStudents2" :key="student.name">
            <span @click="showStudentImage(student.name)">{{ student.name }}</span>
            <div v-if="selectedStudent === student.name" class="modal">
              <span @click="closeStudentImage" class="close">&times;</span>
              <img v-if="selectedStudentImage" :src="'data:image/jpeg;base64,' + selectedStudentImage" alt="Student Image" />
            </div>
          </div>
        </td>
            </tr>
          </tbody>
        </table>
       </div>
        <div>
          <h2>错误类型数量柱状图：</h2>
          <canvas id="classComparisonErrorsChart"></canvas>
        </div>
      </div>

      <!-- 校区对比视图 -->
      <div v-if="selectedView === 'campusComparison'">
       <br>
      <br>
       <div class="flex-container">
        <table border="1" cellspacing="0" width="800px" height="150px">
          <tbody>
            <tr>
            <td>&nbsp;</td>
            <td style="text-align: center; color: black; font-size:18px">学生得分均分</td>
            <td style="text-align: center; color: black; font-size:18px">单词数量平均值</td>
            <td style="text-align: center; color: black; font-size:18px">句子数量平均值</td>
            </tr>
            <tr>
            <td style="text-align: center; color: black; font-size:18px">张江</td>
            <td style="text-align: center; color: black; font-size:18px">{{ formatNumber(zhangjiangData.averageScore) }}</td>
            <td style="text-align: center; color: black; font-size:18px">{{ formatNumber(zhangjiangData.averageWordCounts) }}</td>
            <td style="text-align: center; color: black; font-size:18px">{{ formatNumber(zhangjiangData.averageSentenceCounts) }}</td>
            </tr>
            <tr>
            <td style="text-align: center; color: black; font-size:18px">滨江</td>
            <td style="text-align: center; color: black; font-size:18px">{{ formatNumber(binjiangData.averageScore) }}</td>
            <td style="text-align: center; color: black; font-size:18px">{{ formatNumber(binjiangData.averageWordCounts) }}</td>
            <td style="text-align: center; color: black; font-size:18px">{{ formatNumber(binjiangData.averageSentenceCounts) }}</td>
            </tr>
          </tbody>
        </table>
       </div>

        <div>
          <h2>错误类型数量柱状图：</h2>
          <canvas id="combinedErrorsChart"></canvas>
        </div>
      </div>

      <!-- 整体情况视图 -->
      <div v-if="selectedView === 'overall'">
      <br>
      <br>
       <div class="flex-container">
        <table border="1" cellspacing="0" width="800px" height="150px">
          <tbody>
            <tr>
            <td style="text-align: center; color: black; font-size:18px">学生得分均分</td>
            <td style="text-align: center; color: black; font-size:18px">单词数量平均值</td>
            <td style="text-align: center; color: black; font-size:18px">句子数量平均值</td>
            </tr>
            <tr>
            <td style="text-align: center; color: black; font-size:18px">{{ formatNumber(overallData.averageScore) }}</td>
            <td style="text-align: center; color: black; font-size:18px">{{ formatNumber(overallData.averageWordCounts) }}</td>
            <td style="text-align: center; color: black; font-size:18px">{{ formatNumber(overallData.averageSentenceCounts) }}</td>
            </tr>
          </tbody>
        </table>
        </div>

        <div>
          <h2>错误类型数量柱状图：</h2>
          <canvas id="overallErrorsChart"></canvas>
        </div>
      </div>

    </div>
<h2>参考范文：</h2>
    <div class="good"> 
      
      <img src="/images/good_essay.png" alt="Good Essay" />
    </div>


  </div>
</template>



<script>
import axios from 'axios';
import {ref, onMounted, watch} from 'vue';
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
  methods: {
    goBack() {
      this.$router.go(-1); // 返回上一个页面
    },
    formatNumber(value) {
      return value ? value.toFixed(2) : '0.00';
    },
  },
  setup(props) {
    const selectedClass1 = ref('');
    const selectedClass2 = ref('可不选');
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

    const selectedView = ref('singleClass');


    onMounted(async () => {
      if (isStudent) {
        await fetchStudentData();
      } else if (isTeacher) {
        await fetchTeacherData();
      } else if (isAdmin) {
        await fetchAllClasses();
        await fetchOverallData();
      }
    });

    const processClassData = (data, classId) => {
      const averageScore = data.averageScore.toFixed(2);
      const allScores = data.scores;
      const wordCounts = data.wordCounts;
      const sentenceCounts = data.sentenceCounts;

      if (classId === '1') {
        belowAverageStudents1.value = allScores.filter(student => student.score < averageScore).map(student => ({ name: student.name }));
        averageWordCounts1.value = (wordCounts.reduce((sum, count) => sum + count, 0) / wordCounts.length) || 0;
        averageSentenceCounts1.value = (sentenceCounts.reduce((sum, count) => sum + count, 0) / sentenceCounts.length) || 0;
        studentAverageScore1.value = averageScore;
        class1AverageScore.value = averageScore;
        if (typeof class1AverageScore.value === 'number') {
          class1AverageScore.value = class1AverageScore.value.score.toFixed(2);
        }
        averageWordCounts1.value = averageWordCounts1.value.toFixed(2)
        averageSentenceCounts1.value =  averageSentenceCounts1.value.toFixed(2)
      } else {
        belowAverageStudents2.value = allScores.filter(student => student.score < averageScore).map(student => ({ name: student.name }));
        averageWordCounts2.value = (wordCounts.reduce((sum, count) => sum + count, 0) / wordCounts.length) || 0;
        averageSentenceCounts2.value = (sentenceCounts.reduce((sum, count) => sum + count, 0) / sentenceCounts.length) || 0;
        studentAverageScore2.value = averageScore;
        class2AverageScore.value = averageScore;
        if (typeof class2AverageScore.value === 'number') {
          class2AverageScore.value = class2AverageScore.value.score.toFixed(2);
        }
        averageWordCounts2.value = averageWordCounts2.value.toFixed(2)
        averageSentenceCounts2.value =  averageSentenceCounts2.value.toFixed(2)
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

    watch([selectedView], ([newViewOption]) => {
      handleViewOptionChange(newViewOption);
    });


    const handleViewOptionChange = async (selectedView) => {
      if (selectedView === 'singleClass') {
          selectedClass2.value = "";
          await fetchFilteredData();
          console.log('single');
      } else if (selectedView === 'classComparison') {
          console.log('classComparison');
          await fetchFilteredData();
      } else if (selectedView === 'overall') {
          await fetchOverallData();
          await renderOverallErrorsChart();
          console.log('overall');
      } else if(selectedView === 'campusComparison') {
        await fetchBinjiangData();
        await fetchZhangjiangData();
        await renderCombinedErrorsChart();
        console.log('campusComparison');
      }
      }


    const fetchPeerAverage = async (school_no, class_no) => {
      try {
        const { data: averageData } = await axios.get(`http://localhost:3000/part2_9/average/${school_no}/${class_no}`);
        peerAverage.value = averageData.average.toFixed(2);
      } catch (error) {
        console.error('获取同伴均分失败:', error);
      }
    };

    const fetchStudentData = async () => {
      try {
        const { data: studentResponse } = await axios.get(`http://localhost:3000/part2_9/${props.userName}`);
        studentData.value = studentResponse;
        // 确保 score 是一个有效的数字
        if (typeof studentData.value.score === 'number') {
          studentData.value.score = studentData.value.score.toFixed(2);
        }
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
          selectedClass2.value = "";
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
          selectedClass2.value = ""
        }

        fetchFilteredData();
      } catch (error) {
        console.error('获取班级数据失败:', error);
      }
    };


    const fetchFilteredData = async () => {
      try {
        const [school_no1, class_no1] = selectedClass1.value.split('&');

        const { data: class1Data } = await axios.get('http://localhost:3000/part2_9/filter', {
          params: { school_no: school_no1, class_no: class_no1 }
        });
        processClassData(class1Data, '1');

        if (selectedClass2.value) {
          const [school_no2, class_no2] = selectedClass2.value.split('&');

          const { data: class2Data } = await axios.get('http://localhost:3000/part2_9/filter', {
            params: { school_no: school_no2, class_no: class_no2 }
          });
          processClassData(class2Data, '2');

          await fetchClassErrors(school_no2, class_no2, '2');
        }
        else {
          belowAverageStudents2.value = [];
          averageWordCounts2.value = 0;
          averageSentenceCounts2.value = 0;
          studentAverageScore2.value = 0;
          class2Errors.value = {};
        }

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

      // 获取错误类型和数量
      const errorTypes = Object.keys(studentErrors.value);
      const errorCounts = Object.values(studentErrors.value);

      // 过滤掉数量为0的错误类型
      const filteredErrorTypes = errorTypes.filter((type, index) => errorCounts[index] !== 0);
      const filteredErrorCounts = errorCounts.filter(count => count !== 0);

      // 按数量递增排序
      const sortedErrorData = filteredErrorTypes
          .map((type, index) => ({ type, count: filteredErrorCounts[index] }))
          .sort((a, b) => b.count - a.count);

      // 提取排序后的错误类型和数量
      const sortedErrorTypes = sortedErrorData.map(data => data.type);
      const sortedErrorCounts = sortedErrorData.map(data => data.count);

      studentErrorsChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: sortedErrorTypes,
          datasets: [{
            label: '错误类型数量',
            data: sortedErrorCounts,
            backgroundColor: 'rgb(109, 228, 198,0.5)',
            
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
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
    };

  //整体情况图表
  const renderOverallErrorsChart = () => {
    const ctx = document.getElementById('overallErrorsChart').getContext('2d');

    if (overallErrorsChart) {
      overallErrorsChart.destroy();
    }

    // 获取错误类型和数量
    const errorTypes = Object.keys(overallData.value.errors);
    const errorCounts = Object.values(overallData.value.errors);

    // 过滤掉数量为0的错误类型
    const filteredErrorTypes = errorTypes.filter((type, index) => errorCounts[index] !== 0);
    const filteredErrorCounts = errorCounts.filter(count => count !== 0);

    // 按数量递增排序
    const sortedErrorData = filteredErrorTypes
    .map((type, index) => ({ type, count: filteredErrorCounts[index] }))
    .sort((a, b) => a.count - b.count);

    // 提取排序后的错误类型和数量
    const sortedErrorTypes = sortedErrorData.map(data => data.type);
    const sortedErrorCounts = sortedErrorData.map(data => data.count);

    // 映射英文标签到中文标签
    const labelMap = {
      'WordPhrase choice': '词语选择',
      'Pronouns & Determiners': '代词和限定词',
      'Verbs': '动词',
      'Conciseness': '用词繁冗',
      'Adverbs & Adjectives': '形容词与副词',
      'Tense': '时态',
      'Articles': '冠词',
      'Singular-Plural nouns': '单复数',
      'Prepositions': '介词',
      'Punctuation': '标点符号',
      'Spellings & Typos': '拼写错误',
      'Contractions': '词语缩写',
      'Conjunctions': '连词',
      'Capitalization & Spacing': '大小写',
      'Subject-verb agreement': '主谓一致',
      'Others': '其他'
    };

    // 替换英文标签为中文标签
    const translatedLabels = sortedErrorTypes.map(type => labelMap[type] || type);

    overallErrorsChart = new Chart(ctx, {
      type: 'bar',
      data: {
      labels: translatedLabels,
      datasets: [{
      label: '错误类型数量',
      data: sortedErrorCounts,
      backgroundColor: 'rgb(109, 228, 198,0.5)',
      borderWidth: 1
     }]
    },
    options: {
      responsive: true,
      indexAxis: 'y', // 使条形图成为水平条形图
      scales: {
      x: { // X轴作为数量轴
        beginAtZero: true,
        ticks: {
          stepSize: 5 // 设置最小单位为 5
        }
      },
      y: { // Y轴作为错误类型轴
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

      // 获取错误类型和数量
      const errorTypes = Object.keys(zhangjiangData.value.errors);
      const errorCounts = Object.values(zhangjiangData.value.errors);

      // 过滤掉数量为0的错误类型
      const filteredErrorTypes = errorTypes.filter((type, index) => errorCounts[index] !== 0);
      const filteredErrorCounts = errorCounts.filter(count => count !== 0);

      zhangjiangErrorsChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: filteredErrorTypes,
          datasets: [{
            label: '错误类型数量',
            data: filteredErrorCounts,
            backgroundColor: 'rgb(109, 228, 198,0.5)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 5
              }
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

      // 获取错误类型和数量
      const errorTypes = Object.keys(binjiangData.value.errors);
      const errorCounts = Object.values(binjiangData.value.errors);

      // 过滤掉数量为0的错误类型
      const filteredErrorTypes = errorTypes.filter((type, index) => errorCounts[index] !== 0);
      const filteredErrorCounts = errorCounts.filter(count => count !== 0);

      binjiangErrorsChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: filteredErrorTypes,
          datasets: [{
            label: '错误类型数量',
            data: filteredErrorCounts,
            backgroundColor: 'rgb(109, 228, 198,0.5)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 5
              }
            }
          }
        }
      });
    };

    //校区对比
    const renderCombinedErrorsChart = () => {
      const ctx = document.getElementById('combinedErrorsChart').getContext('2d');

      if (zhangjiangErrorsChart) {
        zhangjiangErrorsChart.destroy();
      }
      if (binjiangErrorsChart) {
        binjiangErrorsChart.destroy();
      }

      // 创建标签集合
      const combinedLabelsSet = new Set([
        ...Object.keys(zhangjiangData.value.errors),
        ...Object.keys(binjiangData.value.errors)
      ]);
      const combinedLabels = Array.from(combinedLabelsSet);

      // 获取滨江校区的错误数量
      const binjiangErrors = combinedLabels.map(label => binjiangData.value.errors[label] || 0);

      // 过滤掉数量为0的标签和数据
      const filteredLabels = combinedLabels.filter((label, index) => binjiangErrors[index] !== 0);
      // 根据滨江校区的错误数量进行排序
      const sortedLabels = filteredLabels.sort((a, b) => {
        return binjiangData.value.errors[a] - binjiangData.value.errors[b];
      });

      //映射英文标签到中文标签
      const labelMap = {
        'WordPhrase choice': '词语选择',
        'Pronouns & Determiners': '代词和限定词',
        'Verbs': '动词',
        'Conciseness': '用词繁冗',
        'Adverbs & Adjectives': '形容词与副词',
        'Tense': '时态',
        'Articles': '冠词',
        'Singular-Plural nouns': '单复数',
        'Prepositions': '介词',
        'Punctuation': '标点符号',
        'Spellings & Typos': '拼写错误',
        'Contractions': '词语缩写',
        'Conjunctions': '连词',
        'Capitalization & Spacing': '大小写',
        'Subject-verb agreement': '主谓一致',
        'Others': '其他'
      };

      // 替换英文标签为中文标签
      const translatedLabels = sortedLabels.map(type => labelMap[type] || type);

      const sortedZhangjiangErrors = sortedLabels.map(label => zhangjiangData.value.errors[label] || 0);
      const sortedBinjiangErrors = sortedLabels.map(label => binjiangData.value.errors[label] || 0);

      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: translatedLabels,
          datasets: [
            {
              label: '张江校区 错误类型数量',
              data: sortedZhangjiangErrors,
              backgroundColor: 'rgb(109, 228, 198,0.5)',
              borderWidth: 1
            },
            {
              label: '滨江校区 错误类型数量',
              data: sortedBinjiangErrors,
              backgroundColor: 'rgb(255, 127, 80,0.5)',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          indexAxis: 'y', // 将柱形图改为横向
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 5
              }
            }
          }
        }
      });
    };

    //单个班级&班级对比的图表
    const renderClassComparisonErrorsChart = () => {
      const ctx = document.getElementById('classComparisonErrorsChart').getContext('2d');

      if (classComparisonErrorsChart) {
        classComparisonErrorsChart.destroy();
      }

      // 创建标签集合
      const labelsSet = new Set([
        ...Object.keys(class1Errors.value),
        ...(selectedClass2.value ? Object.keys(class2Errors.value) : [])
      ]);
      const labels = Array.from(labelsSet);

      // 过滤掉数量为 0 的错误类型
      const filteredLabels = labels.filter(label => {
        return (class1Errors.value[label] || 0) > 0 || (selectedClass2.value && class2Errors.value[label] || 0) > 0;
      });

      // 根据班级一的错误数量进行排序
      const sortedLabels = filteredLabels.sort((a, b) => {
        return (class1Errors.value[a] || 0) - (class1Errors.value[b] || 0);
      });

      //映射英文标签到中文标签
      const labelMap = {
        'WordPhrase choice': '词语选择',
        'Pronouns & Determiners': '代词和限定词',
        'Verbs': '动词',
        'Conciseness': '用词繁冗',
        'Adverbs & Adjectives': '形容词与副词',
        'Tense': '时态',
        'Articles': '冠词',
        'Singular-Plural nouns': '单复数',
        'Prepositions': '介词',
        'Punctuation': '标点符号',
        'Spellings & Typos': '拼写错误',
        'Contractions': '词语缩写',
        'Conjunctions': '连词',
        'Capitalization & Spacing': '大小写',
        'Subject-verb agreement': '主谓一致',
        'Others': '其他'
      };

      // 替换英文标签为中文标签
      const translatedLabels = sortedLabels.map(type => labelMap[type] || type);

      const datasets = [
        {
          label: '班级1 错误类型数量',
          data: sortedLabels.map(label => class1Errors.value[label] || 0),
          backgroundColor: 'rgb(109, 228, 198,0.5)'
        }
      ];

      // 仅当 selectedClass2 存在时添加第二个数据集
      if (selectedClass2.value) {
        datasets.push({
          label: '班级2 错误类型数量',
          data: sortedLabels.map(label => class2Errors.value[label] || 0),
          backgroundColor: 'rgb(255, 127, 80,0.5)'
        });
      }

      // 创建 chart 实例
      classComparisonErrorsChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: translatedLabels,
          datasets: datasets
        },
        options: {
          responsive: true,
          indexAxis: 'y', // 横向条形图
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 5
              }
            }
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
      selectedView,
      handleViewOptionChange,
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
.good{
  display: flex;
      flex-direction: column; /* 使内容垂直排列 */
      align-items: center; /* 水平居中内容 */
}

/* 水平居中 */ 
.flex-container {  
    display: flex;  
    justify-content: center;   
} 

/*学生情况里整个的背景格式*/
.part-background {  
  background-color: white; /* 背景颜色 */  
  padding: 10px; /* 可以根据需要添加内边距 */  
  border-radius: 20px; /* 可以添加圆角边框，使其看起来更柔和 */  
  margin-bottom: 50px;
  margin-left: 50px;
  margin-right: 50px;
}

/*学生情况整体*/
.question-wrapper {  
  display: flex; /* 启用Flexbox布局 */  
  justify-content: space-between; /* 左右两边内容间隔 */  
}  

/*学生情况左部分、右部分*/ 
.left-column{  
  flex: 1; /* 使得左右两边都能根据内容自适应宽度，同时保持一定的空间 */  
  padding: 10px; /* 可选，为两边内容添加一些内边距 */  
  margin-left: 100px;
}

.right-column{
  flex: 1; /* 使得左右两边都能根据内容自适应宽度，同时保持一定的空间 */  
  padding: 10px; /* 可选，为两边内容添加一些内边距 */ 
  margin-right: 100px; 
}
</style>
