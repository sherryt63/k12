<template>
<div class="main">
  <div class="container">
    <div class="header1">
      <h1>欢迎, {{ name }}!</h1>
      <p>你的身份是: <span class="id">{{ permissionLabel }}</span></p>
    </div>
    <div class="images">
      <img
        src="/images/paper_title.png"
        alt="Image 0"
      />
    </div>

    <div
      v-if="permission === 0"
      class="teacherchoose"
    >
      <button @click="fetchTeacherClasses" class="fetch-button">获取班级</button>
    <select v-if="classes.length" v-model="selectedClass" @change="fetchData">
      <option v-for="cls in classes" :key="cls" :value="cls">
        {{ mapClassCodeToName(cls) }}
      </option>
    </select>
      
    </div>

    <div v-if="permission === 2" class="admin">
      <!-- 分析类型选择 -->
      <div class="label1">
        <label for="analysis-type">选择分析类型：</label>
        <select
          v-model="selectedAnalysisType"
          id="analysis-type"
        >
          <option value="single">单个班级</option>
          <option value="comparison">两个班级对比</option>
          <option value="campus-comparison">两个校区对比</option>
        </select>
      </div>

      <!-- 单个班级选择 -->
      <div v-if="selectedAnalysisType === 'single'">
        <div class="label2">
          <label for="single-class">选择班级：</label>
          <select
            v-model="selectedClass"
            id="single-class"
            @change="fetchData"
          >
            <option value="1_1">张江一班</option>
            <option value="1_2">张江二班</option>
            <option value="1_3">张江三班</option>
            <option value="2_1">滨江一班</option>
            <option value="2_2">滨江二班</option>
            <option value="2_3">滨江三班</option>
          </select>
        </div>

        <!-- 显示单个班级的考情分析箱型图 -->
        <h2>考情分析</h2>
        <div
          id="score-summary"
          class="chart-container"
        ></div>

        <!-- 显示各题得分表格 -->
        <div>
          <h2>各题得分情况</h2>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>题号</th>
                  <th>班级得分率</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in scoreDistributionData"
                  :key="item.question"
                  :class="{ 'highlight': lowestTenScores.has(item.question) }"
                >
                  <td>{{ getQuestionLabel(item.question)  }}</td>
                  <td>{{ formatNumber(item.avg_score) }}</td>
                </tr>
              </tbody>
            </table>



          </div>
        </div>
      </div>

      <!-- 班级对比选择 -->
      <div v-else-if="selectedAnalysisType === 'comparison'">
        <div class="label3">
          <label for="compare-classes">选择对比班级：</label>
          <select
            v-model="selectedComparison"
            id="compare-classes"
          >
            <option value="1_1&1_2">张江一班&张江二班</option>
            <option value="1_1&1_3">张江一班&张江三班</option>
            <option value="1_2&1_3">张江二班&张江三班</option>
            <option value="2_1&2_2">滨江一班&滨江二班</option>
            <option value="2_1&2_3">滨江一班&滨江三班</option>
            <option value="2_2&2_3">滨江二班&滨江三班</option>
          </select>
        </div>

        <!-- 显示两个班级的考情分析箱型图 -->
        <h2>考情分析对比</h2>
        <div
          id="score-summary-com"
          class="chart-container"
        ></div>

        <!-- 显示各题得分表格 -->
        <div>
          <h2>各题得分情况</h2>
          <div class="table-container">
           <table>
              <thead>
                <tr>
                  <th>题号</th>
                  <th>{{ getClassName(selectedComparison.split('&')[0]) }}班级得分率</th>
                  <th>{{ getClassName(selectedComparison.split('&')[1]) }}班级得分率</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(score, index) in comparisonScores"
                  :key="index"
                   :class="{ 'highlight': highlightedClassRows.has(score.question) }"
                >
                  <td>{{  getQuestionLabel(score.question)}}</td>
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
        <div class="label4">
          <label for="compare-campuses">选择对比校区：</label>
          <select
            v-model="selectedCampusComparison"
            id="compare-campuses"
          >
            <option value="1&2">张江校区&滨江校区</option>
          </select>
        </div>

        <!-- 显示两个校区的考情分析箱型图 -->
        <h2>考情分析对比</h2>
        <div
          id="score-summary-campuscom"
          class="chart-container"
        ></div>

        <!-- 显示各题得分表格 -->
        <div>
          <h2>各题得分情况</h2>
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
                <tr
                  v-for="(score, index) in campusComparisonScores"
                  :key="index"
                  :class="{ 'highlight': highlightedCampusRows.has(score.question) }"
                >
                  <td>{{ getQuestionLabel(score.question) }}</td>
                  <td>{{ formatNumber(score.campus1) }}</td>
                  <td>{{ formatNumber(score.campus2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="permission === 1" class="stuscore">

      <div v-if="this.studentScore">
        <h2>{{ name }} 的总分为{{ this.studentScore }}分</h2>
      </div>
    </div>
    <div v-if="permission ===1 ">
      <h2>考情分析</h2>
      <div id="score-summary" class="chart-container"></div>
      <div>
        <h2>各题得分情况</h2>
        <div class="table-container">
          <table>
  <thead>
    <tr>
      <th>题目</th>
      <th>个人得分率</th>
      <th>班级得分率</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="item in scoreDistributionData" :key="item.question" :class="{ 'highlight': highlightedRows.has(item.question) }">
        <td>{{ getQuestionLabel(item.question) }}</td>
        <td>{{ formatNumber(item.studentEveryScore) }}</td>
      <td>{{ formatNumber(item.avg_score) }}</td>
      
    </tr>
  </tbody>
</table>

        </div>
      </div>
    </div>

    <div v-if="permission ===0 ">
      <h2>考情分析</h2>
      <div id="score-summary" class="chart-container"></div>
      <div>
        <h2>各题得分情况</h2>
        <div class="table-container">
          <table>
              <thead>
                <tr>
                  <th>题号</th>
                  <th>班级得分率</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in scoreDistributionData"
                  :key="item.question"
                  :class="{ 'highlight': lowestTenScores.has(item.question) }"
                >
                  <td>{{getQuestionLabel(item.question) }}</td>
                  <td>{{ formatNumber(item.avg_score) }}</td>
                </tr>
              </tbody>
            </table>

        </div>
      </div>
    </div>
    <div class="images">
      <img
        src="@/assets/PART1_1.png"
        alt="Image 1"
        @click="goToPage('Part1_1')"
      />
      <img
        src="/images/PART1_2.png"
        alt="Image 2"
        @click="goToPage('Part1_2')"
      />
      <img
        src="/images/PART1_3.png"
        alt="Image 3"
        @click="goToPage('Part1_3')"
      />
      <img
        src="/images/PART1_4.png"
        alt="Image 4"
        @click="goToPage('Part1_4')"
      />
      <img
        src="/images/PART1_5.png"
        alt="Image 5"
        @click="goToPage('Part1_5')"
      />
      <img
        src="/images/PART1_6.png"
        alt="Image 6"
        @click="goToPage('Part1_6')"
      />
      <img
        src="/images/PART1_7.png"
        alt="Image 7"
        @click="goToPage('Part1_7')"
      />
      <img
        src="/images/PART1_8.png"
        alt="Image 8"
        @click="goToPage('Part1_8')"
      />
      <img
        src="/images/PART2_1.png"
        alt="Image 9"
        @click="goToPage('Part2_1')"
      />
      <img
        src="/images/PART2_1_1.png"
        alt="Image 10"
        @click="goToPage('Part2_2')"
      />
      <img
        src="/images/PART2_1_2.png"
        alt="Image 11"
        @click="goToPage('Part2_2')"
      />
      <img
        src="/images/PART2_3.png"
        alt="Image 12"
        @click="goToPage('Part2_3')"
      />
      <img
        src="/images/PART2_4.png"
        alt="Image 13"
        @click="goToPage('Part2_4')"
      />
      <img
        src="/images/PART2_5.png"
        alt="Image 14"
        @click="goToPage('Part2_5')"
      />
      <img
        src="/images/PART2_6.png"
        alt="Image 15"
        @click="goToPage('Part2_6')"
      />
      <img
        src="/images/PART2_7.png"
        alt="Image 16"
        @click="goToPage('Part2_7')"
      />
      <img
        src="/images/PART2_8.png"
        alt="Image 17"
        @click="goToPage('Part2_8')"
      />
      <img
        src="/images/PART2_9.png"
        alt="Image 18"
        @click="goToPage('Part2_9')"
      />
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
</div>
</template>

<script>
import * as echarts from "echarts";
import axios from "axios";
import "./Part.css";

export default {
  name: "HomePage",
  props: {
    name: {
      type: String,
      required: true,
    },
    permission: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      analysisType: "0", // Default to "全校分析"
      selectedClass: "1_1", //单个班级
      scoreDistributionData: [],
      scoreDistributionTotal: [],
      classes: [],
      selectedAnalysisType: "single", //分析类型：单个还是爽哥
      selectedComparison: "", //双个班级
      selectedCampusComparison: "",
      boxplotOptionSingle: {}, //单个箱型图
      boxplotOptionComparison: {}, //双箱型图
      boxplotOptionCampusComparison: {}, //两个校区的箱型图
      comparisonScores: [],
      singleClassScores: [],
      campusComparisonScores: [],
      studentScore: null,
      studentEveryScoreData:[],
     
    };
  },
  computed: {
    groupedData() {
    const numberOfColumns = 3; // 列数
    const result = Array.from({ length: numberOfColumns }, () => []); // 初始化空数组用于存放列数据
    
    this.scoreDistributionData.forEach((item, index) => {
        const columnIndex = index % numberOfColumns; // 确定当前数据应该放在哪一列
        result[columnIndex].push(item); // 将数据添加到对应的列中
    });
    
    return result;
},



    permissionLabel() {
      switch (this.permission) {
        case 0:
          return "老师";
        case 1:
          return "学生";
        case 2:
          return "管理员";
        default:
          return "未知";
      }
    },
    lowestTenScores() {
    // 获取所有分数并排序
    const sortedScores = [...this.scoreDistributionData]
      .sort((a, b) => a.avg_score - b.avg_score)
      .slice(0, 15); // 获取最低的十个分数

    // 提取最低分数的 question
    return new Set(sortedScores.map(item => item.question));
  },
  
  highlightedRows() {
    const highlighted = new Set();

    this.scoreDistributionData.forEach(item => {
      let studentScore;

      if (typeof item.studentEveryScore === 'string') {
        studentScore = parseFloat(item.studentEveryScore.replace('%', ''));
      } else {
        studentScore = parseFloat(item.studentEveryScore);
      }

      if (!isNaN(studentScore) && studentScore === 0) {
        highlighted.add(item.question);
      }
    });

    return highlighted;
  },

  highlightedCampusRows() {
   const highlighted = new Set();

    this.campusComparisonScores.forEach(score => {
      const campus1Score = this.parsePercentage(score.campus1);
      const campus2Score = this.parsePercentage(score.campus2);

      // 打印处理后的分数
      console.log(`Question: ${score.question}, Campus1 Score: ${campus1Score}, Campus2 Score: ${campus2Score}`);

      // 判断条件：两者相差百分之十以上，或一方低于百分之80
      const significantDifference = Math.abs(campus1Score - campus2Score) >= 0.1;
      const lowAccuracy = campus1Score < 0.8 || campus2Score < 0.8;

      if (significantDifference || lowAccuracy) {
        highlighted.add(score.question);
      }
    });

    // 打印高亮的题目
    console.log('Highlighted Rows:', [...highlighted]);

    return highlighted;
  },
  highlightedClassRows() {
   const highlighted = new Set();

    this.comparisonScores.forEach(score => {
      const class1Score = this.parsePercentage(score.class1);
      const class2Score = this.parsePercentage(score.class2);

      // 打印处理后的分数
      console.log(`Question: ${score.question}, Class1 Score: ${class1Score}, Class2 Score: ${class2Score}`);

      // 判断条件：两个分数相差百分之十以上，或一方低于百分之80
      const significantDifference = Math.abs(class1Score - class2Score) >= 0.1;
      const lowAccuracy = class1Score < 0.8 || class2Score < 0.8;

      if (significantDifference || lowAccuracy) {
        highlighted.add(score.question);
      }
    });

    // 打印高亮的题目
    console.log('Highlighted Rows:', [...highlighted]);

    return highlighted;
  },
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
     parsePercentage(value) {
    // 确保 value 是字符串类型
    const stringValue = String(value);

    // 检查是否包含百分号，然后进行转换
    if (stringValue.includes('%')) {
      return parseFloat(stringValue.replace('%', ''));
    } else {
      return parseFloat(stringValue); // 如果没有百分号，直接转换为数字
    }
  },
    getClassName(classCode) {
      const classNames = {
        "1_1": "张江一班",
        "1_2": "张江二班",
        "1_3": "张江三班",
        "2_1": "滨江一班",
        "2_2": "滨江二班",
        "2_3": "滨江三班",
        1: "张江校区",
        2: "滨江校区",
      };
      return classNames[classCode] || "未知班级";
    },

    getRows(scores) {
    // 每组三项数据
    const rows = [];
    for (let i = 0; i < scores.length; i += 2) {
      rows.push(scores.slice(i, i + 2));
    }
    return rows;
  },
   shouldHighlight(score) {
    if (!score) return false;
    const score1 = parseFloat(score.class1);
    const score2 = parseFloat(score.class2);
    return score1 < 0.8 || score2 < 0.8 || Math.abs(score1 - score2) > 0.2;
  },
   shouldHighlightcampus(score) {
    if (!score) return false;
    const campus1 = parseFloat(score.campus1);
    const campus2 = parseFloat(score.campus2);
    return campus1 < 0.8 || campus2 < 0.8 || Math.abs(campus1 - campus2) > 0.2;
  },
  shouldHighlightperson(item) {
    if (!item) return false;
    const avgScore = parseFloat(item.avg_score);
    const studentScore = parseFloat(item.studentEveryScore);
    return avgScore < 0.8 || studentScore < 0.8 || Math.abs(avgScore - studentScore) > 0.2;
  },

    async fetchTeacherClasses() {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/teacher-classes",
          {
            params: { name: this.name },
          }
        );

        this.classes = response.data.classes;
        console.log("班级", this.classes);
      } catch (error) {
        console.error("Error fetching teacher classes:", error);
      }
    },
    async fetchStuScore() {
  if (this.permission === 1) {
     try {
          const StuScoreResponse = await axios.get(
            "http://localhost:3000/api/student-total-score",
            {
              params: { name: this.name },
            }
          );
          const scoreDistribution0neStudentResponse = await axios.get(
            "http://localhost:3000/api/one-student-scores",
            {
              params:{ name:this.name },
            }
          );
          console.log("response",scoreDistribution0neStudentResponse);
          const StuScore = StuScoreResponse.data.scores.score; // 修改这里提取分数
          this.studentScore = StuScore;
          console.log(this.studentScore);
        
        } catch (error) {
          console.error("获取学生成绩失败:", error);
        }
  }
},

getQuestionLabel(question) {
      const labels = {
  "PART1_I_1_score": "听力部分第一题第一问",
  "PART1_I_2_score": "第二问",
  "PART1_I_3_score": "第三问",
  "PART1_I_4_score": "第四问",
  "PART1_I_5_score": "第五问",
  "PART1_I_6_score": "第六问",
  "PART1_II_1_score": "第二题第一问",
  "PART1_II_2_score": "第二问",
  "PART1_II_3_score": "第三问",
  "PART1_II_4_score": "第四问",
  "PART1_II_5_score": "第五问",
  "PART1_II_6_score": "第六问",
  "PART1_III_1_score": "第三题第一问",
  "PART1_III_2_score": "第二问",
  "PART1_III_3_score": "第三问",
  "PART1_III_4_score": "第四问",
  "PART1_III_5_score": "第五问",
  "PART1_IV_1_score": "第四题第一问",
  "PART1_IV_2_score": "第二问",
  "PART1_IV_3_score": "第三问",
  "PART1_IV_4_score": "第四问",
  "PART1_IV_5_score": "第五问",
  "PART1_V_1_score": "第五题第一问",
  "PART1_V_2_score": "第二问",
  "PART1_V_3_score": "第三问",
  "PART1_V_4_score": "第四问",
  "PART1_VI_1_score": "第六题第一问",
  "PART1_VI_2_score": "第二问",
  "PART1_VI_3_score": "第三问",
  "PART1_VI_4_score": "第四问",
  "PART1_VI_5_score": "第五问",
  "PART1_VII_1_score": "第七题第一问",
  "PART1_VII_2_score": "第二问",
  "PART1_VII_3_score": "第三问",
  "PART1_VII_4_score": "第四问",
  "PART1_VII_5_score": "第五问",
  "PART1_VIII_1_score": "第八题第一问",
  "PART1_VIII_2_score": "第二问",
  "PART1_VIII_3_score": "第三问",
  "PART1_VIII_4_score": "第四问",
  "PART2_I_score": "读写部分第一题",
  "PART2_II_1_score": "第二题第一问",
  "PART2_II_2_score": "第二问",
  "PART2_II_3_score": "第三问",
  "PART2_II_4_score": "第四问",
  "PART2_II_5_score": "第五问",
  "PART2_III_1_score": "第三题第一问",
  "PART2_III_2_score": "第二问",
  "PART2_III_3_score": "第三问",
  "PART2_III_4_score": "第四问",
  "PART2_IV_1_score": "第四题第一问",
  "PART2_IV_2_score": "第二问",
  "PART2_IV_3_score": "第三问",
  "PART2_IV_4_score": "第四问",
  "PART2_IV_5_score": "第五问",
  "PART2_IV_6_score": "第六问",
  "PART2_IV_7_score": "第七问",
  "PART2_IV_8_score": "第八问",
  "PART2_IV_9_score": "第九问",
  "PART2_V_1_1_score": "第五题第一问(1)",
  "PART2_V_1_2_score": "第一问(2)",
  "PART2_V_2_1_score": "第二问(1)",
  "PART2_V_2_2_score": "第二问(2)",
  "PART2_V_3_1_score": "第三问(1)",
  "PART2_V_3_2_score": "第三问(2)",
  "PART2_V_4_1_score": "第四问(1)",
  "PART2_V_4_2_score": "第四问(2)",
  "PART2_V_5_1_score": "第五问(1)",
  "PART2_V_5_2_score": "第五问(2)",
  "PART2_V_1_score": "第五题第一问",
  "PART2_V_2_score": "第二问",
  "PART2_V_3_score": "第三问",
  "PART2_V_4_score": "第四问",
  "PART2_V_5_score": "第五问",
  "PART2_VI_1_score": "第六题第一问",
  "PART2_VI_2_score": "第二问",
  "PART2_VI_3_score": "第三问",
  "PART2_VI_4_score": "第四问",
  "PART2_VI_5_score": "第五问",
  "PART2_VII_1_score": "第七题第一问",
  "PART2_VII_2_score": "第二问",
  "PART2_VII_3_score": "第三问",
  "PART2_VII_4_score": "第四问",
  "PART2_VII_5_score": "第五问",
  "PART2_VIII_1_score": "第八题第一问",
  "PART2_VIII_2_score": "第二问",
  "PART2_VIII_3_score": "第三问",
  "PART2_VIII_4_score": "第四问",

      };
      return labels[question] || question;
    },

    goToPage(page) {
      this.$router.push({
        name: page,
        query: {
          name: this.name,
          permission: this.permission,
        },
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
      return (value * 100).toFixed(2) + '%';
    },
mapClassCodeToName(classCode) {
      const campusMap = {
        '1': '张江校区',
        '2': '滨江校区'
      };
      const classMap = {
        '1': '一班',
        '2': '二班',
        '3': '三班'
      };

      const campusCode = classCode.charAt(0);
      const classNumber = classCode.charAt(1);

      const campusName = campusMap[campusCode] || '未知校区';
      const className = classMap[classNumber] || '未知班级';

      return `${campusName}${className}`;
    },
    //用于对于学生端、管理员端、教师端使用，返回单一班级的数据
    async fetchData() {
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

  console.log("Fetching data from URL:", url);

  if(this.permission === 0 || this.permission === 2) {
    try {
          const response = await fetch(url);
          const data = await response.json();

          console.log("Score Summary Data:", data);
          this.renderScoreSummary(data);
        } catch (error) {
          console.error("Fetching score summary failed:", error);
        }
  }else if (this.permission === 1) {
    try {
          const response = await fetch(url);
          const data = await response.json();

          console.log("Score Summary Data:", data);
          this.renderScoreSummaryforStu(data);
        } catch (error) {
          console.error("Fetching score summary failed:", error);
        }
  }

  

  try {
    const response = await fetch(url_score);
    const data = await response.json();
    console.log("Total Score Data:", data);

    if (data && data.averages) {
      this.scoreDistributionData = Object.keys(data.averages).map((key) => ({
        question: key,
        avg_score: data.averages[key],
      }));
    } else {
      this.scoreDistributionData = [];
    }

    console.log("赋值之后", this.scoreDistributionData);

    if (data && data.totals) {
      this.scoreDistributionTotal = Object.keys(data.totals).map((key) => ({
        question: key,
        total: data.totals[key],
      }));
    } else {
      this.scoreDistributionTotal = [];
    }

    console.log("赋值之后大题情况", this.scoreDistributionTotal);
  } catch (error) {
    console.error("Fetching total score data failed:", error);
  }
  if (this.permission === 1) {
    try {
      // 获取个人得分率数据
      const scoreDistributionOneStudentResponse = await axios.get(
        "http://localhost:3000/api/one-student-scores",
        {
          params: { name: this.name },
        }
      );
      console.log("个人得分率响应", scoreDistributionOneStudentResponse);

      // 获取个人得分率数据
      const studentEveryScoreData = scoreDistributionOneStudentResponse.data;
      console.log("个人得分率数据", studentEveryScoreData);

      console.log("班级得分率数据", this.scoreDistributionData);

      // 合并班级得分率与个人得分率
      this.scoreDistributionData = this.scoreDistributionData.map((item) => {
        // 调试信息：检查 item.question 和对应的个人得分
        console.log(`Processing question: ${item.question}`);
        return {
          ...item,
          studentEveryScore: studentEveryScoreData[item.question] || '0', // 若无数据则为 'N/A'
        };
      });

      console.log("合并后的数据", this.scoreDistributionData);
    } catch (error) {
      console.error("获取学生成绩失败:", error);
    }
  }

},


    ///返回两个班级对比的考情情况以及成绩
    fetchComparisonData(comparison) {
      const [class1, class2] = comparison.split("&");
      let url = "";
      let url_score = "";
      if (this.permission === 2) {
        url = `http://localhost:3000/api/admin-score-summary?name=${this.name}&class=${class1}`;
        url_score = `http://localhost:3000/api/admin-scores?name=${this.name}&class=${class1}`;
      }

      axios
        .get(url)
        .then((response) => {
          const data1 = response.data;
          return axios
            .get(
              `http://localhost:3000/api/admin-score-summary?name=${this.name}&class=${class2}`
            )
            .then((response) => {
              const data2 = response.data;
              this.boxplotOptionComparison = this.renderScoreSummaryCom(
                data1,
                data2
              );
              //this.comparisonScores = this.fetchComparisonScores(class1, class2);
            });
        })
        .catch((error) => {
          console.error("Fetching comparison data failed:", error);
        });

      axios
        .get(url_score)
        .then((response) => {
          const data1 = response.data;
          return axios
            .get(
              `http://localhost:3000/api/admin-scores?name=${this.name}&class=${class2}`
            )
            .then((response) => {
              const data2 = response.data;
              //this.boxplotOptionComparison = this.renderScoreSummaryCom(data1, data2);
              const scores1 = data1.averages || {};
              const scores2 = data2.averages || {};

              // 组合数据以便比较
              const combinedScores = Object.keys(scores1).map((key) => ({
                question: key,
                class1: scores1[key] || 0,
                class2: scores2[key] || 0,
              }));

              // 更新组件的状态
              this.comparisonScores = combinedScores;
            });
        })
        .catch((error) => {
          console.error("Fetching comparison data failed:", error);
        });
    },

    ////返回两个校区的考情成绩数据
    fetchCampusComparisonData(comparison) {
      const [school1, school2] = comparison.split("&");
      let url = "";
      let url_score = "";
      if (this.permission === 2) {
        url = `http://localhost:3000/api/admin-score-summary-campusCom?name=${this.name}&school=${school1}`;
        url_score = `http://localhost:3000/api/admin-scores-campusCom?name=${this.name}&school=${school1}`;
      }

      axios
        .get(url)
        .then((response) => {
          const data1 = response.data;
          return axios
            .get(
              `http://localhost:3000/api/admin-score-summary-campusCom?name=${this.name}&school=${school2}`
            )
            .then((response) => {
              const data2 = response.data;
              this.boxplotOptionComparison = this.renderScoreSummaryCampusCom(
                data1,
                data2
              );
              //this.comparisonScores = this.fetchComparisonScores(class1, class2);
            });
        })
        .catch((error) => {
          console.error("Fetching comparison data failed:", error);
        });

      axios
        .get(url_score)
        .then((response) => {
          const data1 = response.data;
          return axios
            .get(
              `http://localhost:3000/api/admin-scores-campusCom?name=${this.name}&school=${school2}`
            )
            .then((response) => {
              const data2 = response.data;
              const scores1 = data1.averages || {};
              const scores2 = data2.averages || {};

              // 组合数据以便比较
              const combinedScores = Object.keys(scores1).map((key) => ({
                question: key,
                campus1: scores1[key] || 0,
                campus2: scores2[key] || 0,
              }));

              // 更新组件的状态
              this.campusComparisonScores = combinedScores;
            });
        })
        .catch((error) => {
          console.error("Fetching comparison data failed:", error);
        });

      //if (this.permission === 2) {
      //url_score = `http://localhost:3000/api/admin-score-summary?name=${this.name}`;
      //}
    },

    //单个班级的考情分析--箱线图
    renderScoreSummary(data) {
      const mainContainer = document.getElementById("score-summary");

      const resizeMainContainer = function () {
        mainContainer.style.width = window.innerWidth * 0.9 + "px"; // 容器宽度为窗口宽度的 90%
        mainContainer.style.height = window.innerHeight * 0.6 + "px"; // 容器高度为窗口高度的 60%
      };

      // 初始调整容器尺寸
      resizeMainContainer();

      // 初始化图表
      const myChart = echarts.init(mainContainer);

      // 窗口调整事件监听
      window.addEventListener("resize", function () {
        resizeMainContainer();
        myChart.resize();
      });

      // 整理数据为箱线图格式
      const boxplotData = [
        [
          data.min_score,    // 最小值
          data.q1_score,     // 第一四分位数
          data.median_score, // 中位数
          data.q3_score,     // 第三四分位数
          data.max_score,    // 最大值
        ],
      ];

      // 计算数据范围
      const minScore = data.min_score - 10; // 减去10以留出一点空间


      // 配置图表
      const option = {

        tooltip: {
          trigger: "item",
          formatter: function (params) {
            return [
              "最大值: " + params.data[5],
              "上四分位数: " + params.data[4],
              "中位数: " + params.data[3],
              "下四分位数: " + params.data[2],
              "最小值: " + params.data[1],
            ].join("<br/>");
          },
        },
        yAxis: {
          type: "category",
          data: ["考情数据"],
          axisLabel: {
            interval: 0,
          },
          show: false,
        },
        xAxis: {
          type: "value",
          min: minScore, // 动态设置最小值
          max: 100, // 动态设置最大值
        },
        series: [
          {
            name: "分数分布",
            type: "boxplot",
            data: boxplotData,
            itemStyle: {
              borderColor: '#6de4c6',
              color: 'transparent',
              borderWidth: 3
            },
            markLine: {
              data: [
                {
                  name: '平均分',
                  xAxis: data.avg_score,
                  label: {
                    formatter: '平均分: {c}',
                    color: "#6de4c6"
                  }
                }
              ],
              lineStyle: {
                color: '#6de4c6',
                type: 'dashed',
                borderWidth: 3
              },
              tooltip: {
                show: false
              }
            },
            tooltip: {
              formatter: function (param) {
                return [
                  "最高分: " + param.data[5],
                  "上四分位数: " + param.data[4],
                  "中位数: " + param.data[3],
                  "下四分位数: " + param.data[2],
                  "最低分: " + param.data[1],
                ].join("<br/>");
              },
            },
          },
        ],
      };

      myChart.setOption(option);
    },

    //单个班级的考情分析--箱线图
    async renderScoreSummaryforStu(data) {
      const mainContainer = document.getElementById("score-summary");

      try {
        // 在这里请求 studentScore
        const StuScoreResponse = await axios.get(
          "http://localhost:3000/api/student-total-score",
          {
            params: { name: this.name },
          }
        );
        const studentScore = StuScoreResponse.data.scores.score; // 获取分数
        data.studentScore = studentScore; // 将分数赋值给 data

        console.log("该学生成绩为", studentScore);

        const resizeMainContainer = function () {
          mainContainer.style.width = window.innerWidth * 0.9 + "px"; // 容器宽度为窗口宽度的 90%
          mainContainer.style.height = window.innerHeight * 0.6 + "px"; // 容器高度为窗口高度的 60%
        };

        // 初始调整容器尺寸
        resizeMainContainer();

        // 初始化图表
        const myChart = echarts.init(mainContainer);

        // 窗口调整事件监听
        window.addEventListener("resize", function () {
          resizeMainContainer();
          myChart.resize();
        });

        // 整理数据为箱线图格式
        const boxplotData = [
          [
            data.min_score,    // 最小值
            data.q1_score,     // 第一四分位数
            data.median_score, // 中位数
            data.q3_score,     // 第三四分位数
            data.max_score,    // 最大值
          ],
        ];

        // 计算数据范围
        const minScore = data.min_score - 10; // 减去10以留出一点空间

        // 配置图表
        const option = {
          tooltip: {
            trigger: "item",
            formatter: function (params) {
              return [
                "最大值: " + params.data[5],
                "上四分位数: " + params.data[4],
                "中位数: " + params.data[3],
                "下四分位数: " + params.data[2],
                "最小值: " + params.data[1],
              ].join("<br/>");
            },
          },
          yAxis: {
            type: "category",
            data: ["考情数据"],
            axisLabel: {
              interval: 0,
            },
            show: false,
          },
          xAxis: {
            type: "value",
            min: minScore, // 动态设置最小值
            max: 100, // 动态设置最大值
          },
          series: [
            {
              name: "分数分布",
              type: "boxplot",
              data: boxplotData,
              itemStyle: {
                borderColor: '#6de4c6',
                color: 'transparent',
                borderWidth: 3
              },
              markLine: {
                data: [
                  {
                    name: '平均分',
                    xAxis: data.avg_score,
                    label: {
                      formatter: '平均分: {c}',
                      color: "#6de4c6"
                    },
                    lineStyle: {
                      color: '#6de4c6',
                      type: 'dashed',
                      borderWidth: 3
                    },
                  },
                  {
                    name: '你的成绩',
                    xAxis: studentScore,
                    label: {
                      formatter: '你的成绩: {c}',
                      position: 'start',
                      color: '#ff7f50',
                      offset: [0, -25]
                    },
                    lineStyle: {
                      color: '#ff7f50',
                      type: 'dashed',
                      borderWidth: 3
                    },
                  }
                ],
                tooltip: {
                  show: false
                }
              },
              tooltip: {
                formatter: function (param) {
                  return [
                    "最高分: " + param.data[5],
                    "上四分位数: " + param.data[4],
                    "中位数: " + param.data[3],
                    "下四分位数: " + param.data[2],
                    "最低分: " + param.data[1],
                  ].join("<br/>");
                },
              },
            },
          ],
        };

        myChart.setOption(option);

      } catch (error) {
        console.error("获取学生成绩失败:", error);
      }
    },


    //两个班级对比的考情分析
    renderScoreSummaryCom(data, data2) {
  const mainContainer = document.getElementById("score-summary-com");

  const resizeMainContainer = function () {
    mainContainer.style.width = window.innerWidth * 0.9 + "px"; // 容器宽度为窗口宽度的 90%
    mainContainer.style.height = window.innerHeight * 0.7 + "px"; // 容器高度为窗口高度的 70%
  };

  // 初始调整容器尺寸
  resizeMainContainer();

  // 初始化图表
  const myChart = echarts.init(mainContainer);

  // 窗口调整事件监听
  window.addEventListener("resize", function () {
    resizeMainContainer();
    myChart.resize();
  });

  const classNames = this.selectedComparison
    .split("&")
    .map((classKey) => this.getClassName(classKey));
  console.log("所要查询的班级", classNames);

  // 整理数据为箱线图格式
  const boxplotData = [
    [
      data.min_score,    // 最小值
      data.q1_score,     // 第一四分位数
      data.median_score, // 中位数
      data.q3_score,     // 第三四分位数
      data.max_score,    // 最大值
    ],
    [
      data2.min_score,    // 最小值
      data2.q1_score,     // 第一四分位数
      data2.median_score, // 中位数
      data2.q3_score,     // 第三四分位数
      data2.max_score,    // 最大值
    ],
  ];

  const minScore = Math.min(data.min_score, data2.min_score) - 10; // 设置最小值
  
  // 配置图表
  const option = {
    
    tooltip: {
      trigger: "item",
      formatter: function (params) {
        const classIndex = classNames.indexOf(params.seriesName);
        return [
          "班级 " + classNames[classIndex],
          "最高分: " + params.data[4],
          "上四分位数: " + params.data[3],
          "中位数: " + params.data[2],
          "下四分位数: " + params.data[1],
          "最低分: " + params.data[0],
        ].join("<br/>");
      },
    },
    yAxis: {
      type: "category",
      data: ["班级对比"], // 使用对比标签作为y轴数据
      boundaryGap: true,
      nameGap: 30,
      splitArea: {
        show: false,
      },
      axisTick: {
        alignWithLabel: true,
      },
      show: false,
    },
    xAxis: {
      type: "value",
      min: minScore, // 动态设置最小值
      max: 100, // 动态设置最大值
    },
    series: [
      {
        name: classNames[0],
        type: "boxplot",
        data: [boxplotData[0]],
        itemStyle: {
          borderColor: '#6de4c6', // 第一个班级的箱线图颜色
          color: 'transparent',
          borderWidth: 3
        },
        markLine: {
          data: [
            {
              name: '平均分',
              xAxis: data.avg_score,
              label: {
                formatter: '平均分: {c}',
                color: '#6de4c6'
              }
            }
          ],
          lineStyle: {
            color: '#6de4c6',
            type: 'dashed',
            borderWidth: 3
          },
          tooltip: {
            show: false
          }
        },
        tooltip: {
          formatter: function (param) {
            return [
              "班级：" + classNames[0],
              "最高分: " + param.data[5],
              "上四分位数: " + param.data[4],
              "中位数: " + param.data[3],
              "下四分位数: " + param.data[2],
              "最低分: " + param.data[1],
            ].join("<br/>");
          },
        },
      },
      {
        name: classNames[1],
        type: "boxplot",
        data: [boxplotData[1]],
        itemStyle: {
          borderColor: '#ff7f50', // 第二个班级的箱线图颜色
          color: 'transparent',
          borderWidth: 3
        },
        markLine: {
          data: [
            {
              name: '平均分',
              xAxis: data2.avg_score,
              label: {
                formatter: '平均分: {c}',
                position: 'start',
                color: '#ff7f50',
                offset:[0,-20]
              }
            }
          ],
          lineStyle: {
            color: '#ff7f50',
            type: 'dashed',
            borderWidth: 3
          },
          tooltip: {
            show: false
          }
        },
        tooltip: {
          formatter: function (param) {
            return [
              "班级：" + classNames[1],
              "最高分: " + param.data[5],
              "上四分位数: " + param.data[4],
              "中位数: " + param.data[3],
              "下四分位数: " + param.data[2],
              "最低分: " + param.data[1],
            ].join("<br/>");
          },
        },
      },
    ],
  };

  myChart.setOption(option);
},


    renderScoreSummaryCampusCom(data, data2) {
  const mainContainer = document.getElementById("score-summary-campuscom");

  const resizeMainContainer = function () {
    mainContainer.style.width = window.innerWidth * 0.9 + "px"; // 容器宽度为窗口宽度的 90%
    mainContainer.style.height = window.innerHeight * 0.7 + "px"; // 容器高度为窗口高度的 70%
  };

  // 初始调整容器尺寸
  resizeMainContainer();

  // 初始化图表
  const myChart = echarts.init(mainContainer);

  // 窗口调整事件监听
  window.addEventListener("resize", function () {
    resizeMainContainer();
    myChart.resize();
  });

  console.log("两个校区的数据能否收到", data, data2);

  // 整理数据为箱线图格式
  const boxplotData = [
    [
      data.min_score,    // 最小值
      data.q1_score,     // 第一四分位数
      data.median_score, // 中位数
      data.q3_score,     // 第三四分位数
      data.max_score,    // 最大值
    ],
    [
      data2.min_score,    // 最小值
      data2.q1_score,     // 第一四分位数
      data2.median_score, // 中位数
      data2.q3_score,     // 第三四分位数
      data2.max_score,    // 最大值
    ],
  ];

  // 计算数据范围
  const minScore = Math.min(data.min_score, data2.min_score) - 10; // 设置最小值
  

  // 配置图表
  const option = {
   
    tooltip: {
      trigger: "item",
      formatter: function (params) {
        const className = params.seriesName;
        return [
          "校区：" + className,
          "最高分: " + params.data[5],
          "上四分位数: " + params.data[4],
          "中位数: " + params.data[3],
          "下四分位数: " + params.data[2],
          "最低分: " + params.data[1],
        ].join("<br/>");
      },
    },
    yAxis: {
      type: "category",
      data: ["张江", "滨江"], // 根据实际需要设置
      boundaryGap: true,
      nameGap: 30,
      splitArea: {
        show: false,
      },
      axisTick: {
        alignWithLabel: true,
      },
      show:false,
    },
    xAxis: {
      type: "value",
      min: minScore, // 动态设置最小值
      max: 100, // 动态设置最大值
    },
    series: [
      {
        name: "张江",
        type: "boxplot",
        data: [boxplotData[0]],
        itemStyle: {
          borderColor: '#6de4c6', // 张江校区的箱线图颜色
          color: 'transparent',
          borderWidth: 3
        },
        markLine: {
          data: [
            {
              name: '平均分',
              xAxis: data.avg_score,
              label: {
                formatter: '平均分: {c}',
                color: '#6de4c6'
              }
            }
          ],
          lineStyle: {
            color: '#6de4c6',
            type: 'dashed',
            borderWidth: 3
          },
          tooltip: {
            show: false
          }
        },
        tooltip: {
          formatter: function (param) {
            return [
              "校区：" + "张江",
              "最高分: " + param.data[5],
              "上四分位数: " + param.data[4],
              "中位数: " + param.data[3],
              "下四分位数: " + param.data[2],
              "最低分: " + param.data[1],
            ].join("<br/>");
          },
        },
      },
      {
        name: "滨江",
        type: "boxplot",
        data: [boxplotData[1]],
        itemStyle: {
          borderColor: '#ff7f50', // 滨江校区的箱线图颜色
          color: 'transparent',
          borderWidth: 3
        },
        markLine: {
          data: [
            {
              name: '平均分',
              xAxis: data2.avg_score,
              label: {
                formatter: '平均分: {c}',
                position: 'start',
                color: '#ff7f50',
                offset:[0, -20]
              }
            }
          ],
          lineStyle: {
            color: '#ff7f50',
            type: 'dashed',
            borderWidth: 3
          },
          tooltip: {
            show: false
          }
        },
        tooltip: {
          formatter: function (param) {
            return [
              "校区：" + "滨江",
              "最高分: " + param.data[5],
              "上四分位数: " + param.data[4],
              "中位数: " + param.data[3],
              "下四分位数: " + param.data[2],
              "最低分: " + param.data[1],
            ].join("<br/>");
          },
        },
      },
    ],
  };

  myChart.setOption(option);
},

  },
  mounted() {
    this.fetchData();
    this.fetchStuScore();
  },
};
</script>

<style scoped>
.container {
  /* display: flex; */
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  background-color: white;
  height: 90%; /* 高度设置为视口高度 */
  width: 97%; /*页面居中变小*/
  margin: 0 auto; 
  padding: 20px;
  box-sizing: border-box;
}
.highlight {
  color: #64c9af; /* 更改为你想要的颜色 */
  font-weight: bold;
}
.header1 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 20px;
  background-color: #6de4c6;
  padding: 10px;
  border-radius: 8px;
}

.header1 h1 {
  margin: 0;
  font-weight: bold;
  color: #cdfde7;
  font-size: 24px;
}
.header1 p {
  margin: 0;
  font-weight: bold;
  color: #cdfde7;
  font-size: 24px;
}
.header1 .id {
  color: white;
}

.teacherchoose {
  display: flex;
  align-items: center; /* 垂直居中对齐子元素 */
  gap: 10px; /* 子元素之间的间距 */
  width: 20%;
  margin-bottom: 20px;
  background-color: #6de4c6;
  
  border-radius: 8px;
  color: #cdfde7;
  font-weight: bold;
}

.teacherchoose .fetch-button {
  margin-left:10px;
  border: none;
  border-radius: 8px;
  background-color: #6de4c6; /* 按钮背景色 */
  color: #cdfde7; /* 按钮文字颜色 */
  font-weight: bold;
  padding: 5px 10px;
  height: 40px;
  cursor: pointer; /* 鼠标悬停时的光标样式 */
  margin-bottom: 0; /* 按钮与下方元素的间距 */
  transition: background-color 0.3s ease; /* 背景色过渡效果 */
  display: flex; /* 使按钮的内容水平垂直居中 */
  align-items: center;
  justify-content: center;
}

.teacherchoose .fetch-button:hover {
  background-color: #64c9af; /* 悬停时的背景色 */
}

.teacherchoose select {
  padding: 8px;
  font-weight: bold;
  font-size: 12px;
  border-radius: 4px; /* 圆角边框 */
  background-color: #6de4c6; /* 背景色 */
  color: white; /* 字体颜色 */
  border: 1px solid #aaa;
  width: 50%; /* 填满容器的宽度 */
  
  height: 40px; /* 设置与按钮相同的高度 */
  display: flex; /* 使 select 的内容水平垂直居中 */
  align-items: center;
 
  justify-content: center;
}

.label1 {
  display: flex;
  align-items: center;
  width: 25%;
  margin-bottom: 20px;
  background-color: #6de4c6;
  padding: 10px;
  border-radius: 8px;
  color: #cdfde7;
  font-weight: bold;
}
.label2 {
  display: flex;

  align-items: center;
  width: 25%;
  margin-bottom: 20px;
  background-color: #6de4c6;
  padding: 10px;
  border-radius: 8px;
  color: #cdfde7;
  font-weight: bold;
}
.label3 {
  display: flex;

  align-items: center;
  width: 25%;
  margin-bottom: 20px;
  background-color: #6de4c6;
  padding: 10px;
  border-radius: 8px;
  color: #cdfde7;
  font-weight: bold;
}
.label4 {
  display: flex;
  align-items: center;
  width: 25%;
  margin-bottom: 20px;
  background-color: #6de4c6;
  padding: 10px;
  border-radius: 8px;
  color: #cdfde7;
  font-weight: bold;
}
.images {
  display: flex;
  flex-wrap: wrap;
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
.admin select {
  color: #ffffff; /* 字体颜色，黑色 */
  background-color: #6de4c6; /* 背景颜色，白色 */
  border: 1px solid #aaa; /* 边框颜色，灰色 */
  border-radius: 4px; /* 圆角边框 */
  font-weight: bold; /* 加粗字体 */
}
h2 {
  margin: 0%;
  text-align: center;
  margin-bottom: 20px;
}
.chart-container {
  width: 80%;
  height: 300px;
  margin: 20px 0;
}

.table-container {
  height: auto; /* 设置最大高度 */
  overflow-y: auto; /* 竖向滚动 */
  
  display: flex;
  background-color: white;
  justify-content: center; /* 水平居中 */
}

table {
  border-collapse: collapse;
  width: 80%;
  /* 可选：为表格添加边框和背景色以增强视觉效果 */
  border: 1px solid #ddd;
  background-color: #f9f9f9;
  height: 100%;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px;
  background-color: white;
  text-align: left;
}

th {
  background-color: white;
}

.analysis-type {
  margin-left: 20px;
  white-space: nowrap;
}
.stuscore {
  align-items: center;
  width: 25%;
  height: 30px;
  margin-bottom: 20px;
  background-color: #6de4c6;
  padding: 10px;
  font-size: 12px;
  text-align: justify;
  border-radius: 8px;
  color: #cdfde7;
  font-weight: bold;
}
.main{
   margin: 0;
  padding: 0;
  width: 100%;
  overflow-x: hidden; /* 禁止水平滚动 */
  background-color: white;
}
</style>