<template>
  <div>
    <h1>IX.·Think·and·write(写一写自己最喜欢的场所，描述它的特征，不少于五句话):【语篇-句与句】</h1>
    <img src="/images/title.png" alt="Title" />

    <div v-if="isStudent">
      <div>
        <h2>学生答案：</h2>
        <img v-if="studentData.image" :src="`data:image/jpeg;base64,${studentData.image}`" alt="Student Answer" />
      </div>
      <div>
        <h2>学生得分：{{ studentData.score }}</h2>
      </div>
      <div>
        <h2>同伴均分：{{ peerAverage }}</h2>
      </div>
      <div>
        <h2>修改建议：</h2>
        <p v-html="formattedSuggestion"></p>
      </div>
      <div>
        <h2>参考范文：</h2>
        <img src="/images/good_essay.png" alt="Good Essay" />
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
    </div>

    <div v-if="isTeacher || isAdmin">
      <div v-if="isTeacher || isAdmin">
        <h2>选择班级：</h2>
        <select v-model="selectedClass" @change="fetchFilteredData">
          <option v-for="option in classOptions" :key="option.value" :value="option.value">{{ option.text }}</option>
        </select>
      </div>

      <h2>学生得分均分：{{ studentAverageScore }}</h2>
      <ul>
        <li v-for="student in belowAverageStudents" :key="student.name">
          <span @click="showStudentImage(student.name)">{{ student.name }}</span>
          <!-- 显示用户图像的模态框 -->
          <div v-if="selectedStudent === student.name" class="modal">
            <span @click="closeStudentImage" class="close">&times;</span>
            <img v-if="selectedStudentImage" :src="`data:image/jpeg;base64,${selectedStudentImage}`" alt="Student Image" />
          </div>
        </li>
      </ul>
      <div>
        <h2>参考范文：</h2>
        <img src="/images/good_essay.png" alt="Good Essay" />
      </div>

      <div>
        <h2>统计表格：</h2>
        <table>
          <tr>
            <th>单词数量平均值</th>
            <th>句子数量平均值</th>
          </tr>
          <tr>
            <td>{{ averageWordCounts }}</td>
            <td>{{ averageSentenceCounts }}</td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ref, onMounted, computed } from 'vue';

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
    const isStudent = props.permission === 1;
    const isTeacher = props.permission === 0;
    const isAdmin = props.permission === 2;
    const studentData = ref({});
    const peerAverage = ref(0);
    const classOptions = ref([]);
    const selectedClass = ref('');
    const belowAverageStudents = ref([]);
    const averageWordCounts = ref(0);
    const averageSentenceCounts = ref(0);
    const studentAverageScore = ref(0);
    const selectedStudent = ref(null); // 当前选择的学生，用于显示图片
    const selectedStudentImage = ref(null); // 当前选择学生的图片数据

    onMounted(async () => {
      if (isStudent) {
        fetchStudentData();
      } else if (isTeacher) {
        fetchTeacherData();
      } else if (isAdmin) {
        fetchAllClasses();
      }
    });

    const fetchStudentData = async () => {
      try {
        const { data: studentResponse } = await axios.get(`http://localhost:3000/part2_9/${props.userName}`);
        studentData.value = studentResponse;
        fetchPeerAverage(studentResponse.school_no, studentResponse.class_no);
      } catch (error) {
        console.error('获取学生数据失败:', error);
      }
    };

    const fetchTeacherData = async () => {
      try {
        const { data: teacherData } = await axios.get(`http://localhost:3000/teacher/${props.userName}`);
        const permissions = teacherData.permission.split(',');

        const options = permissions.map(permission => {
          const [school_no, class_no] = permission.split('');
          return {
            value: `${school_no}&${class_no}`,
            text: `school_no: ${school_no}, class_no: ${class_no}`
          };
        });

        classOptions.value = options;
        selectedClass.value = options[0].value;
        fetchFilteredData(); // Fetch data for the default selected class
      } catch (error) {
        console.error('Failed to fetch teacher data:', error);
      }
    };

    const fetchAllClasses = async () => {
      try {
        const { data: classes } = await axios.get('http://localhost:3000/part2_9/classes');
        classOptions.value = classes.map(cls => ({
          value: `${cls.school_no}&${cls.class_no}`,
          text: `school_no: ${cls.school_no}, class_no: ${cls.class_no}`
        }));
        selectedClass.value = classOptions.value[0].value;
        fetchFilteredData(); // Fetch data for the default selected class
      } catch (error) {
        console.error('Failed to fetch classes:', error);
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

    const fetchFilteredData = async () => {
      try {
        const [school_no, class_no] = selectedClass.value.split('&');
        const { data: filteredData } = await axios.get('http://localhost:3000/part2_9/filter', {
          params: { school_no, class_no }
        });

        processFetchedData(filteredData);
      } catch (error) {
        console.error('Failed to fetch filtered data:', error);
      }
    };

    const processFetchedData = (data) => {
      const averageScore = data.averageScore;
      const allScores = data.scores;
      const wordCounts = data.wordCounts;
      const sentenceCounts = data.sentenceCounts;

      belowAverageStudents.value = allScores.filter(student => student.score < averageScore).map(student => ({ name: student.name }));

      const totalWordCounts = wordCounts.reduce((sum, count) => sum + count, 0);
      const totalSentenceCounts = sentenceCounts.reduce((sum, count) => sum + count, 0);
      averageWordCounts.value = (totalWordCounts / wordCounts.length) || 0;
      averageSentenceCounts.value = (totalSentenceCounts / sentenceCounts.length) || 0;
      studentAverageScore.value = averageScore;
    };

    const formattedSuggestion = computed(() => {
      if (studentData.value.suggestion) {
        return studentData.value.suggestion.replace(/;/g, '<br/>');
      }
      return '';
    });

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
      selectedClass,
      belowAverageStudents,
      averageWordCounts,
      averageSentenceCounts,
      studentAverageScore,
      selectedStudent,
      selectedStudentImage,
      formattedSuggestion,
      fetchFilteredData,
      showStudentImage,
      closeStudentImage
    };
  }
};
</script>

<style scoped>
/* 添加一些基本样式 */
h1, h2 {
  font-size: 1.5em;
}

select {
  margin-bottom: 20px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal img {
  max-width: 100%;
  max-height: 100%;
}

.close {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 2em;
  color: #fff;
  cursor: pointer;
}
</style>

