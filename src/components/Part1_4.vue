<template>
    <div>
      <header class="header">
        <h2>Ⅳ. Listen and number（听一听，用“1 ~5”给下列图片编号）：【词汇-词义】</h2>

        <div v-if="permission === '2'" class="class-select">
            <label for="class-select">选择班级：</label>
            <select id="class-select" v-model="selectedClass" @change="fetchData">
                <option value="11">张江一班</option>
                <option value="12">张江二班</option>
                <option value="13">张江三班</option>
                <option value="21">滨江一班</option>
                <option value="22">滨江二班</option>
                <option value="23">滨江三班</option>
            </select>
        </div>

        <div v-if="permission === '0'" class="class-select">
            <label for="class-select">选择班级：</label>
            <select id="class-select" v-model="selectedClass" @change="fetchData">
                <option v-for="cls in classOptions" :key="cls" :value="cls">{{ getClassDisplayName(cls) }}</option>
            </select>
        </div>
      </header>
      <div v-for="(question, index) in questions" :key="index">
     <div class="part-background">
      
      <!-- 显示图片和难度 -->
      <div class="question-wrapper">  
        <div class="left-column"> 
          <!--题号+难度-->
          <div class="title">
            <p :class="{highlighted: permission === '1' && questionData[question]?.studentAnswer !== questionData[question]?.correctAnswer }">
              {{ index + 1 }}、 {{ staticData[question]?.difficulty }}</p>
          </div>
      
          <!--听力原文-->
          <p style="font-size:18px">听力原文：{{ questionData[question]?.listeningText }}</p>
          <!--题目描述-->
          <div v-if="questionDescriptions[question]">
                <p>题目描述：<span v-html="questionDescriptions[question]"></span></p>
          </div>
          <!-- 正确答案 -->
          <div class="corrent_answer">
            <p style="font-size:18px">正确答案：<span v-html="highlightText(questionData[question]?.correctAnswer, questionData[question]?.correctAnswer)"></span></p>
          </div>

          <!-- 参考解析 -->
          <div>
            <p style="font-size:18px">参考解析：{{ questionData[question]?.referenceAnalysis }}</p>
          </div>
        </div>
        <div class="right-column table-container"> 

          <!--教师端、管理员端-->
          <div v-if="permission === '0' || permission === '2'">
          <table class="custom-border" border="1" cellspacing="0" width=500px height=160px bgcolor=white>
            <tbody>
            <tr>
              <td style="width: 25%; text-align: center; color: black; font-size:16px">选项</td>
              <td style="width: 25%; text-align: center; color: black; font-size:16px" v-for="(option, optIndex) in options" :key="optIndex">
                <span v-html="highlightTextNew(option.text, questionData[question]?.correctAnswer, staticConOption[question]?.confuse)"></span>
              </td>
            </tr>
            <tr>
              <td style="height: 33.333%; text-align: center; color: black; font-size:16px">选择人数</td>
              <td style="height: 33.333%; text-align: center; color: black; font-size:16px" v-for="(option, optIndex) in options" :key="optIndex">
                {{ questionData[question]?.optionCounts[option.value] || 0 }}
              </td>
            </tr>
            <tr>
              <td colspan=4 style="color: black; font-size:16px"><span class="option-percentages-container">&nbsp;&nbsp;&nbsp;&nbsp;正确率：{{ questionData[question]?.accuracyPercentages || '0' }}%</span></td>
            </tr>
            </tbody>
          </table>
          </div>

          <!--学生端-->
          <div v-if="permission === '1'">
            <table class="custom-border" border="1" cellspacing="0" width=500px height=160px bgcolor=white>
            <tbody>
            <tr>
              <td style="height: 50%; width: 25%; text-align: center; color: black; font-size:16px">选项</td>
              <td style="width: 25%; text-align: center; color: black; font-size:16px" v-for="(option, optIndex) in options" :key="optIndex">
                <span v-html="highlightTextNew(option.text, questionData[question]?.correctAnswer, staticConOption[question]?.confuse)"></span>
              </td>
            </tr>
            <tr>
              <td colspan=4 style="color: black; font-size:16px"><p class="option-percentages-container">&nbsp;&nbsp;&nbsp;&nbsp;学生答案：{{ questionData[question]?.studentAnswer }}</p>
              <p class="option-percentages-container">&nbsp;&nbsp;&nbsp;&nbsp;同伴正确率：{{ questionData[question]?.peerAccuracy }}%</p></td>
            </tr>
            </tbody>
          </table>
          </div>
        </div>
      </div>
     </div>
     </div>
      
    </div>
</template>



<script>
import axios from 'axios';
import "./Part.css";

export default {
    data() {
        return {
            questions: ['PART1_IV_1', 'PART1_IV_2', 'PART1_IV_3', 'PART1_IV_4', 'PART1_IV_5'],
            listeningText: '',
            correctAnswer: '',
            studentAnswer: '',
            peerAccuracy: 0,
            permission: this.$route.query.permission,
            name: this.$route.query.name,
            referenceAnalysis: 'Example reference analysis text', // Example reference analysis
            isAnswerCorrect: (question) => this[`studentAnswer_${question}`] === this[`correctAnswer_${question}`],
            options: [
                { text: '1', value: '1' },
                { text: '2', value: '2' },
                { text: '3', value: '3' },
                { text: '4', value: '4' },
                { text: '5', value: '5' },
            ],
            questionData: {},
            selectedClass: '11',
            optionCounts: {},
            optionPercentages: {},
            staticData: {
                'PART1_IV_1': { image: '/images/PART1_IV_1.png', difficulty: '★★' },
                'PART1_IV_2': { image: '/images/PART1_IV_2.png', difficulty: '★★' },
                'PART1_IV_3': { image: '/images/PART1_IV_3.png', difficulty: '★★' },
                'PART1_IV_4': { image: '/images/PART1_IV_4.png', difficulty: '★★' },
                'PART1_IV_5': { image: '/images/PART1_IV_5.png', difficulty: '★★' },
                'PART1_IV_6': { image: '/images/PART1_IV_6.png', difficulty: '★★' }
            },
            classOptions: []
        };
    },
    methods: {
        async fetchClassOptions() {
            if (this.permission === '0') {
                console.log("permission===0能进来吗");
                try {
                    console.log(this.name);
                    const response = await axios.get('http://localhost:3000/api/teacher-classes', {
                        params: { name: this.name }
                    });
                    this.classOptions = response.data.classes;
                    this.selectedClass = this.classOptions[0];
                    console.log(this.selectedClass);
                    this.fetchData();
                } catch (error) {
                    console.error('Error fetching class options:', error);
                }
            } else {
                this.fetchData();
            }
        },

        async fetchData() {
            try {
                const questions = this.questions;
                const questionData = {};

                for (const question of questions) {
                    console.log(question);
                    const response = await axios.get('http://localhost:3000/api/question', {
                        params: { question }
                    });

                    const { correctAnswer, listeningText } = response.data;
                    console.log(listeningText);
                    console.log(question);
                    console.log(correctAnswer);
                    console.log("per", this.permission);
                    if (this.permission === '1') {
                        // 获取学生答案和同伴正确率
                        console.log("hi");
                        const studentResponse = await axios.get('http://localhost:3000/api/student-answer', {
                            params: { name: this.name, question }
                        });
                        const studentAnswer = studentResponse.data.answer;
                        console.log("stu_ans:", studentAnswer);

                        const peerResponse = await axios.get('http://localhost:3000/api/peer-accuracy', {
                            params: { name: this.name, question }
                        });
                        const peerAccuracy = peerResponse.data.accuracy * 100;

                        const referenceAnalysisResponse = await axios.get('http://localhost:3000/api/analysis', {
                            params: { question, options: studentAnswer }
                        });
                        const referenceAnalysis = referenceAnalysisResponse.data.analysis;
                        questionData[question] = {
                            correctAnswer,
                            listeningText,
                            studentAnswer,
                            peerAccuracy,
                            referenceAnalysis
                        };
                    } else if (this.permission === '2') {
                        // 获取选项人数比
                        const optionResponse = await axios.get('http://localhost:3000/api/option-percentages', {
                            params: { question, class: this.selectedClass }
                        });
                        console.log(optionResponse);
                        const optionPercentages = optionResponse.data.optionPercentages;
                        console.log(optionPercentages);

                        // 获取正确率
                        const accuracyResponse = await axios.get('http://localhost:3000/api/option-accuracy', {
                            params: { question, class: this.selectedClass }
                        });
                        console.log(accuracyResponse);
                        const accuracyPercentages = accuracyResponse.data.accuracyRate;
                        console.log(accuracyPercentages);

                        const optionCountsResponse = await axios.get('http://localhost:3000/api/option-counts', {
                            params: { question, class: this.selectedClass }
                        });
                        const optionCounts = optionCountsResponse.data.optionCounts;

                        const referenceAnalysisResponse = await axios.get('http://localhost:3000/api/analysis', {
                            params: { question, options: correctAnswer }
                        });
                        const referenceAnalysis = referenceAnalysisResponse.data.analysis;

                        questionData[question] = {
                            correctAnswer,
                            listeningText,
                            optionPercentages,
                            optionCounts,
                            referenceAnalysis,
                            accuracyPercentages
                        };

                        this.optionCounts = optionCounts;
                        console.log.optionCounts;
                    } else if (this.permission === '0') {
                        // 获取选项人数比
                        const optionResponse = await axios.get('http://localhost:3000/api/option-percentages', {
                            params: { question, class: this.selectedClass }
                        });
                        console.log(optionResponse);
                        const optionPercentages = optionResponse.data.optionPercentages;
                        console.log(optionPercentages);

                        // 获取正确率
                        const accuracyResponse = await axios.get('http://localhost:3000/api/option-accuracy', {
                            params: { question, class: this.selectedClass }
                        });
                        console.log(accuracyResponse);
                        const accuracyPercentages = accuracyResponse.data.accuracyRate;
                        console.log(accuracyPercentages);

                        const optionCountsResponse = await axios.get('http://localhost:3000/api/option-counts', {
                            params: { question, class: this.selectedClass }
                        });
                        const optionCounts = optionCountsResponse.data.optionCounts;

                        const referenceAnalysisResponse = await axios.get('http://localhost:3000/api/analysis', {
                            params: { question, options: correctAnswer }
                        });
                        const referenceAnalysis = referenceAnalysisResponse.data.analysis;

                        questionData[question] = {
                            correctAnswer,
                            listeningText,
                            optionPercentages,
                            optionCounts,
                            referenceAnalysis,
                            accuracyPercentages
                        };

                        this.optionCounts = optionCounts;
                        console.log.optionCounts;
                    }
                }
                this.questionData = questionData;
                console.log(questionData);

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        },

        highlightText(text, highlightText) {
            if (!text || !highlightText) return text;

            return Array.from(text).map(char => {
                if (highlightText.includes(char)) {
                    return `<span class="highlighted">${char}</span>`;
                }
                return char;
            }).join('');
        },

        getClassDisplayName(classCode) {
            const classMap = {
                '11': '张江一班',
                '12': '张江二班',
                '13': '张江三班',
                '21': '滨江一班',
                '22': '滨江二班',
                '23': '滨江三班'
            };
            return classMap[classCode] || classCode;
        }
    },

    created() {
        this.fetchClassOptions();
    }
};
</script>

<style>
.highlight-correct {
    background-color: yellow;   /*高亮正确答案*/
}

.highlight-confusing {
    background-color: rgb(148, 211, 92);   /*高亮混淆项答案*/
}

.highlightedCon {
    background-color: rgb(148, 211, 92);
}

.highlighted {
    background-color: yellow;
}

.highlight {
    color: red;
}

.class-select {
    margin-bottom: 20px;
}

/* 题目页的页面背景颜色 */
body {  
  background-color: #f5f7fa;   
} 

/*题目整体*/
.question-wrapper {  
  display: flex; /* 启用Flexbox布局 */  
  justify-content: space-between; /* 左右两边内容间隔 */  
}  

/*题目左部分、右部分*/ 
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

/*表格整体*/
.table-container {  
  display: flex;  
  justify-content: center; /* 水平居中 */  
  align-items: center; /* 垂直居中（如果父容器高度足够的话） */  
}  

/*表格边框*/
.custom-border {  
  border-collapse: collapse; /* 确保相邻单元格的边框合并为一个单一的边框 */  
}  
  
.custom-border,  
.custom-border td,  
.custom-border th {  
  border: 1.2px solid black; /* 设置边框宽度、样式和颜色 */  
} 

.highlighted {
  background-color: yellow;
}

.highlight {
  color: red;
}

.class-select {
  margin-bottom: 20px;
}

.question-group {  
  display: flex;  
  justify-content: space-between; /* 根据需要调整间距 */  
  flex-wrap: wrap; /* 如果需要换行显示 */  
}  
  
.question-item {  
  /* 每个问题的样式 */  
  flex: 1; /* 使得每个问题尽可能等宽，但也可以根据需要调整 */  
  margin-right: 20px; /* 右边距，根据需要调整 */  
  /* 其他样式... */  
}  
  
/* 移除最后一个问题项的右边距（如果每行恰好三个问题） */  
.question-group .question-item:nth-child(3n) {  
  margin-right: 0;  
}

/*题目页里题目标题的格式*/
.title{
  font-weight: bold; /*字体加粗*/
  font-size: 24px;   /*字体大小*/
  color: #6DE4C6;    /*字体颜色*/
}

/*题目页里题目图片的格式*/
.image{
  width: 400px;
  height: 200px;
}

/*题目页里整个题目的背景格式*/
.part-background {  
  background-color: white; /* 背景颜色 */  
  padding: 10px; /* 可以根据需要添加内边距 */  
  border-radius: 20px; /* 可以添加圆角边框，使其看起来更柔和 */  
  margin-bottom: 50px;
  margin-left: 50px;
  margin-right: 50px;
}
</style>
