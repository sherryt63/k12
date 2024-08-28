<template>
    <div class="main">
      <header class="header">
        <h2>Ⅴ. Listen and write（听一听，写出听到的单词完成短文，每线一词）：</h2>
        <h2>【词汇-词音，词汇-词形】{{ staticData[question]?.difficulty }}</h2>
        <div class="menu">
            <button @click="goBack">返回主页</button>
        <div v-if="permission === '2'" class="class-select">
            <label for="compare-type-select">选择对比类型：</label>
            <select id="compare-type-select" v-model="compareType" @change="fetchData">
              <option value="single">单个班级</option>
              <option value="double-class">两个班级</option>
              <option value="double-campus">两个校区</option>
            </select>

            <div v-if="compareType === 'single'">
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

            <div v-if="compareType === 'double-class'">
              <label for="class-select-1">选择班级 1：</label>
              <select id="class-select-1" v-model="selectedClass1" @change="fetchData">
                <option value="11">张江一班</option>
                <option value="12">张江二班</option>
                <option value="13">张江三班</option>
                <option value="21">滨江一班</option>
                <option value="22">滨江二班</option>
                <option value="23">滨江三班</option>
              </select>
              <label for="class-select-2">选择班级 2：</label>
              <select id="class-select-2" v-model="selectedClass2" @change="fetchData">
                <option value="11">张江一班</option>
                <option value="12">张江二班</option>
                <option value="13">张江三班</option>
                <option value="21">滨江一班</option>
                <option value="22">滨江二班</option>
                <option value="23">滨江三班</option>
              </select>
            </div>

            <div v-if="compareType === 'double-campus'">
              <label for="campus-select-1">选择校区1：</label>
              <select id="campus-select-1" v-model="selectedCampus1" @change="fetchData">
                <option value="1">张江校区</option>
                <option value="2">滨江校区</option>
              </select>

              <label for="campus-select-2">选择校区2：</label>
              <select id="campus-select-2" v-model="selectedCampus2" @change="fetchData">
                <option value="1">张江校区</option>
                <option value="2">滨江校区</option>
              </select>
            </div>
          </div>

        <div v-if="permission === '0'" class="class-select">
            <label for="class-select">选择班级：</label>
            <select id="class-select" v-model="selectedClass" @change="fetchData">
                <option v-for="cls in classOptions" :key="cls" :value="cls">{{ getClassDisplayName(cls) }}</option>
            </select>
        </div>
       </div>
      </header>

    <!--听力原文-->
    <div class="question_text">
    <p style="font-size:23px">Today is the ________ of June. It is Children's Day in China.
     Kitty and Alice have a class party in the morning. They sing and ________. 
     They draw themselves on the blackboard. They are happy. 
     In the afternoon, they go to the park. They have ________.
      They eat sweet cakes, salty biscuits.They drink some juice and water. 
      They like ________ bicycles too. It is so fun. </p>
    </div>

    <div v-for="(question, index) in questions" :key="index">
     <div class="part-background">
      
      <!-- 显示图片和难度 -->
      <div class="question-wrapper">  
        <div class="left-column"> 
          <!--题号+难度-->
          <div class="title">
            <p :class="{wrong: permission === '1' && questionData[question]?.studentAnswer !== questionData[question]?.correctAnswer }">
              {{ index + 1 }}、 {{ staticData[question]?.difficulty }}</p>
          </div>
          
          <div v-if="questionDescriptions[question]">
                <p style="font-size:18px">题目描述：{{ questionDescriptions[question] }}</p>
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

          <!--教师端-->
          <div v-if="permission === '0'">
            <table class="custom-border" border="1" cellspacing="0" width=500px height=160px bgcolor=white>
            <tbody>
            <tr>
                <td colspan="2" style="text-align: center; color: black; font-size:16px">选项</td>
                <td style="text-align: center; color: black; font-size:16px">作答率</td>
            </tr>
            <tr>
                <td style="text-align: center; color: black; font-size:16px">正确答案</td>
                <td style="text-align: center; color: black; font-size:16px">{{questionData[question]?.correctAnswer}}</td>
                <td style="text-align: center; color: black; font-size:16px">{{questionData[question]?.optionCounts[questionData[question]?.correctAnswer]}}%</td>
            </tr>
            <tr>
                <td v-if="option !== questionData[question]?.correctAnswer" :rowspan="incorrectOptionsRowspan" style="text-align: center; color: black; font-size:16px">错误作答</td>
            </tr>
            <tr v-for="(count, option) in questionData[question]?.optionCounts" :key="option">
                <td v-if="option !== questionData[question]?.correctAnswer" style="text-align: center; color: black; font-size:16px">{{ option }}</td>
                <td v-if="option !== questionData[question]?.correctAnswer" style="text-align: center; color: black; font-size:16px">{{count}}%</td>
            </tr>
            </tbody>
            </table>
            </div>

          <!--学生端-->
          <div v-if="permission === '1'">
            <table class="custom-border" border="1" cellspacing="0" width=500px height=130px bgcolor=white>
            <tbody>
            <tr>
              <td colspan=5 style="color: black; font-size:17px"><p class="option-percentages-container">&nbsp;&nbsp;&nbsp;&nbsp;学生答案：{{ questionData[question]?.studentAnswer }}</p>
              <p class="option-percentages-container">&nbsp;&nbsp;&nbsp;&nbsp;同伴正确率：{{ questionData[question]?.peerAccuracy }}%</p></td>
            </tr>
            </tbody>
          </table>
          </div>

          <!--管理员单独班级-->
            <div v-if="permission === '2' && compareType === 'single'">
            <table class="custom-border" border="1" cellspacing="0" width=500px height=160px bgcolor=white>
            <tbody>
            <tr>
                <td colspan="2" style="text-align: center; color: black; font-size:16px">回答</td>
                <td style="text-align: center; color: black; font-size:16px">作答率</td>
            </tr>
            <tr>
                <td style="text-align: center; color: black; font-size:16px">正确答案</td>
                <td style="text-align: center; color: black; font-size:16px">{{questionData[question]?.correctAnswer}}</td>
                <td style="text-align: center; color: black; font-size:16px">{{questionData[question]?.optionCounts[questionData[question]?.correctAnswer]}}%</td>
            </tr>
            
            <tr>
                <td v-if="option !== questionData[question]?.correctAnswer" :rowspan="incorrectOptionsRowspan" style="text-align: center; color: black; font-size:16px">错误作答</td>
            </tr>
            <tr v-for="(count, option) in questionData[question]?.optionCounts" :key="option">
                <td v-if="option !== questionData[question]?.correctAnswer" style="text-align: center; color: black; font-size:16px">{{ option }}</td>
                <td v-if="option !== questionData[question]?.correctAnswer" style="text-align: center; color: black; font-size:16px">{{count}}%</td>
            </tr>
            </tbody>
            </table>
            </div>

          <!--管理员端比较表格-->
                <!--两个班级对比表格-->
                  <table v-if="compareType === 'double-class'" class="custom-border" border="1" cellspacing="0" width="600px" height="250px" bgcolor="white">
                  <tbody>
                  <tr>
                    <td rowspan=2 colspan=2 style="width: 33.33%; text-align: center; color: black; font-size:17px">回答</td>
                    <td colspan=2 style="height: 25%; text-align: center; color: black; font-size:17px">作答率</td>
                  </tr>
                  <tr>
                    <td style="width: 33.33%; text-align: center; color: black; font-size:17px">班级1</td>
                    <td style="width: 33.33%; text-align: center; color: black; font-size:17px">班级2</td>
                  </tr>
                  <tr>
                    <td style="text-align: center; color: black; font-size:16px">正确答案</td>
                    <td style="text-align: center; color: black; font-size:16px">{{questionData[question]?.correctAnswer}}</td>
                    <td style="text-align: center; color: black; font-size:16px">{{questionData[question]?.optionCounts1[questionData[question]?.correctAnswer]}}%</td>
                    <td style="text-align: center; color: black; font-size:16px">{{questionData[question]?.optionCounts2[questionData[question]?.correctAnswer]}}%</td>
                  </tr>
                  <tr>
                    <td v-if="option !== questionData[question]?.correctAnswer" :rowspan="incorrectOptionsRowspan" style="text-align: center; color: black; font-size:16px">错误作答</td>
                 </tr>
                  <!-- 班级1的答案 -->  
                 <tr v-for="(count, option) in questionData[question]?.optionCounts1" :key="option">  
                    <td v-if="option !== questionData[question]?.correctAnswer" style="text-align: center; color: black; font-size:16px">  
                    {{ option }} </td>
                    <td v-if="option !== questionData[question]?.correctAnswer" style="text-align: center; color: black; font-size:16px">  
                    {{ count }} %</td>
                    <td v-if="option !== questionData[question]?.correctAnswer" style="text-align: center; color: black; font-size:16px">0%</td>  
                 </tr>  
  
                  <!-- 班级2的答案，假设选项与班级1相同 -->  
                  <tr v-for="(count, option) in questionData[question]?.optionCounts2" :key="option">  
                    <td v-if="option !== questionData[question]?.correctAnswer" style="text-align: center; color: black; font-size:16px">  
                    {{ option }}
                    </td>
                    <td v-if="option !== questionData[question]?.correctAnswer" style="text-align: center; color: black; font-size:16px">0%</td>
                    <td v-if="option !== questionData[question]?.correctAnswer" style="text-align: center; color: black; font-size:16px">  
                    {{ count }} %
                    </td>  
                  </tr>           
                </tbody>
              </table>
              <!--两个校区对比表格-->
                  <table v-if="compareType === 'double-campus'" class="custom-border" border="1" cellspacing="0" width="600px" height="250px" bgcolor="white">
                  <tbody>
                  <tr>
                    <td rowspan=2 colspan=2 style="width: 33.33%; text-align: center; color: black; font-size:17px">选项</td>
                    <td colspan=2 style="height: 25%; text-align: center; color: black; font-size:17px">作答率</td>
                  </tr>
                  <tr>
                    <td style="width: 33.33%; text-align: center; color: black; font-size:17px">校区1</td>
                    <td style="width: 33.33%; text-align: center; color: black; font-size:17px">校区2</td>
                  </tr>
                  <tr>
                    <td style="text-align: center; color: black; font-size:16px">正确答案</td>
                    <td style="text-align: center; color: black; font-size:16px">{{questionData[question]?.correctAnswer}}</td>
                    <td style="text-align: center; color: black; font-size:16px">{{questionData[question]?.optionCounts1[questionData[question]?.correctAnswer]}}%</td>
                    <td style="text-align: center; color: black; font-size:16px">{{questionData[question]?.optionCounts2[questionData[question]?.correctAnswer]}}%</td>
                  </tr>
                  <tr>
                    <td v-if="option !== questionData[question]?.correctAnswer" :rowspan="incorrectOptionsRowspan" style="text-align: center; color: black; font-size:16px">错误作答</td>
                 </tr>
                  <!-- 班级1的答案 -->  
                 <tr v-for="(count, option) in questionData[question]?.optionCounts1" :key="option">  
                    <td v-if="option !== questionData[question]?.correctAnswer" style="text-align: center; color: black; font-size:16px">  
                    {{ option }} </td>
                    <td v-if="option !== questionData[question]?.correctAnswer" style="text-align: center; color: black; font-size:16px">  
                    {{ count }}% </td>
                    <td v-if="option !== questionData[question]?.correctAnswer" style="text-align: center; color: black; font-size:16px">0%</td>  
                 </tr>  
  
                  <!-- 班级2的答案，假设选项与班级1相同 -->  
                  <tr v-for="(count, option) in questionData[question]?.optionCounts2" :key="option">  
                    <td v-if="option !== questionData[question]?.correctAnswer" style="text-align: center; color: black; font-size:16px">  
                    {{ option }}
                    </td>
                    <td v-if="option !== questionData[question]?.correctAnswer" style="text-align: center; color: black; font-size:16px">0%</td>
                    <td v-if="option !== questionData[question]?.correctAnswer" style="text-align: center; color: black; font-size:16px">  
                    {{ count }}%
                    </td>  
                  </tr>           
                </tbody>
              </table>

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
            questions: ['PART1_V_1', 'PART1_V_2', 'PART1_V_3', 'PART1_V_4'],
            listeningText: '',
            correctAnswer: '',
            studentAnswer: '',
            peerAccuracy: 0,
            permission: this.$route.query.permission,
            name: this.$route.query.name,
            referenceAnalysis: 'Example reference analysis text', // Example reference analysis
            isAnswerCorrect: (question) => this[`studentAnswer_${question}`] === this[`correctAnswer_${question}`],
            options: [
                { text: 'A', value: 'A' },
                { text: 'B', value: 'B' },
                { text: 'C', value: 'C' },
            ],
            questionData: {},
            questionData2: {},
            selectedClass: '11',
            selectedClass1: '',
            selectedClass2: '',
            selectedCampus1: '',
            selectedCampus2: '',
            compareType: 'single',
            optionCounts: {},
            optionPercentages: {},
            staticData: {
                'PART1_V_1': { difficulty: '★★' },
                'PART1_V_2': { difficulty: '★★' },
                'PART1_V_3': { difficulty: '★★' },
                'PART1_V_4': { difficulty: '★★' }
            },
            questionDescriptions: {
                'PART1_V_1': 'Today is the ________ of June. ',
                'PART1_V_2': 'They sing and ________. ',
                'PART1_V_3': 'They have ________.',
                'PART1_V_4': 'They like ________ bicycles too.'
            },
            classOptions: []
        };
    },
    methods: {
       goBack() {
            this.$router.go(-1); // 返回上一个页面
        },

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
                    console.log("正确答案为："+correctAnswer);
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
                        console.log(peerResponse);
                        
                        //同伴正确率保留两位小数
                        const rawAccuracy = peerResponse.data.accuracy * 100;
                        const accuracyString = rawAccuracy.toFixed(2);    
                        const accuracyNumber = parseFloat(accuracyString); 
                        const peerAccuracy = accuracyNumber;

                        const referenceAnalysis = this.referenceAnalysis;
                        console.log("解析为", referenceAnalysis);

                        
                        questionData[question] = {
                            correctAnswer,
                            listeningText,
                            studentAnswer,
                            peerAccuracy,
                            referenceAnalysis
                        };
                        console.log(questionData);
                    } else if (this.permission === '2') {
                        // 获取选项人数比
                        if (this.compareType === 'single') {
                            const optionResponse = await axios.get('http://localhost:3000/api/option-percentages', {
                                params: { question, class: this.selectedClass }
                            });
                            console.log(optionResponse);

                            const optionPercentages = optionResponse.data.accuracyRate;
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
                        console.log("选项人数请求", optionCountsResponse);

                        /*0730为替换nan新增*/
                        const optionCountsA = optionCountsResponse.data.optionCounts;
                        const optionCounts = {};
                        for (const key in optionCountsA){
                            console.log("替换过程", key);
                            if(key === ''){
                                optionCounts['未填写'] = optionCountsA[key];
                            }else{
                                optionCounts[key] = optionCountsA[key];
                            }
                        }
                        console.log("替换后", optionCounts);
                         
                        console.log("能请求到解析吗");
                        const referenceAnalysisResponse = await axios.get('http://localhost:3000/api/analysis', {
                            params: { question, options: correctAnswer }
                        });
                        const referenceAnalysis = referenceAnalysisResponse.data.analysis;

                        questionData[question] = {
                            correctAnswer,
                            listeningText,
                            optionCounts,
                            optionCounts1: optionCounts, 
                            optionCounts2: '0',
                            optionPercentages1: optionPercentages,
                            optionPercentages2: '0',
                            referenceAnalysis,
                            accuracyPercentages
                        };

                        this.optionCounts = optionCounts;
                        console.log.optionCounts;
                    } else if (this.compareType === 'double-class') {
                            console.log("可以进来这里吗");
                            console.log("第一个班级", this.selectedClass1);
                            console.log("第二个班级", this.selectedClass2);

                            const optionCounts1Response = await axios.get('http://localhost:3000/api/option-counts', {
                                params: { question, class: this.selectedClass1 }
                            });
                            /*0730为替换nan新增*/
                            const optionCounts1A = optionCounts1Response.data.optionCounts;
                            const optionCounts1 = {};
                            for (const key in optionCounts1A){
                                console.log("替换过程", key);
                                if(key === ''){
                                    optionCounts1['未填写'] = optionCounts1A[key];
                                }else{
                                    optionCounts1[key] = optionCounts1A[key];
                                }
                            }
                            console.log("替换后", optionCounts1);

                            const optionCounts2Response = await axios.get('http://localhost:3000/api/option-counts', {
                                params: { question, class: this.selectedClass2 }
                            });
                            /*0730为替换nan新增*/
                            const optionCounts2A = optionCounts2Response.data.optionCounts;
                            const optionCounts2 = {};
                            for (const key in optionCounts2A){
                                console.log("替换过程", key);
                                if(key === ''){
                                    optionCounts2['未填写'] = optionCounts2A[key];
                                }else{
                                    optionCounts2[key] = optionCounts2A[key];
                                }
                            }
                            console.log("替换后", optionCounts2);

                            const optionPercentages1Response = await axios.get('http://localhost:3000/api/option-accuracy', {
                                params: { question, class: this.selectedClass1 }
                            });
                            const optionPercentages2Response = await axios.get('http://localhost:3000/api/option-accuracy', {
                                params: { question, class: this.selectedClass2 }
                            });

                            const referenceAnalysisResponse = await axios.get('http://localhost:3000/api/analysis', {
                                params: { question, options: correctAnswer }
                            });
                            const referenceAnalysis = referenceAnalysisResponse.data.analysis;

                            questionData[question] = {
                                correctAnswer,
                                listeningText,
                                optionCounts1,
                                optionCounts2,
                                optionPercentages1: optionPercentages1Response.data.accuracyRate,
                                optionPercentages2: optionPercentages2Response.data.accuracyRate,
                                referenceAnalysis
                            };
                            console.log("所需要展示的所有数据", questionData);
                        } else if (this.compareType === 'double-campus') {
                            console.log("可以进来这里吗");
                            console.log("第一个校区", this.selectedCampus1);
                            console.log("第二个校区", this.selectedCampus2);
                            const optionCounts1Response = await axios.get('http://localhost:3000/api/option-counts-campusCom', {
                                params: { question, school: this.selectedCampus1 }
                            });
                            /*0730为替换nan新增*/
                            const optionCounts1A = optionCounts1Response.data.optionCounts;
                            const optionCounts1 = {};
                            for (const key in optionCounts1A){
                                console.log("替换过程", key);
                                if(key === ''){
                                    optionCounts1['未填写'] = optionCounts1A[key];
                                }else{
                                    optionCounts1[key] = optionCounts1A[key];
                                }
                            }
                            console.log("替换后", optionCounts1);
                            const optionCounts2Response = await axios.get('http://localhost:3000/api/option-counts-campusCom', {
                                params: { question, school: this.selectedCampus2 }
                            });
                            /*0730为替换nan新增*/
                            const optionCounts2A = optionCounts2Response.data.optionCounts;
                            const optionCounts2 = {};
                            for (const key in optionCounts2A){
                                console.log("替换过程", key);
                                if(key === ''){
                                    optionCounts2['未填写'] = optionCounts2A[key];
                                }else{
                                    optionCounts2[key] = optionCounts2A[key];
                                }
                            }
                            console.log("替换后", optionCounts2);

                            const optionPercentages1Response = await axios.get('http://localhost:3000/api/option-accuracy-campusCom', {
                                params: { question, school: this.selectedCampus1 }
                            });
                            const optionPercentages2Response = await axios.get('http://localhost:3000/api/option-accuracy-campusCom', {
                                params: { question, school: this.selectedCampus2 }
                            });

                            const referenceAnalysisResponse = await axios.get('http://localhost:3000/api/analysis', {
                                params: { question, options: correctAnswer }
                            });
                            const referenceAnalysis = referenceAnalysisResponse.data.analysis;

                            questionData[question] = {
                                correctAnswer,
                                listeningText,
                                optionCounts1,
                                optionCounts2,
                                optionPercentages1: optionPercentages1Response.data.accuracyRate,
                                optionPercentages2: optionPercentages2Response.data.accuracyRate,
                                referenceAnalysis
                            };
                            console.log("所需要展示的所有数据", questionData);
                        }
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
                        
                        /*0730为替换nan新增*/
                            const optionCountsA = optionCountsResponse.data.optionCounts;
                            const optionCounts = {};
                            console.log("原始数据", optionCountsA); // 打印整个对象  
                            for (const key in optionCountsA){
                                console.log("替换过程", key);
                                if(key === ''){
                                    optionCounts['未填写'] = optionCountsA[key];
                                }else{
                                    optionCounts[key] = optionCountsA[key];
                                }
                            }
                            console.log("替换后", optionCounts);

                        const referenceAnalysis = this.referenceAnalysis;


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
    },

    computed: {  
    //对optioncounts排序
    sortedOptionCounts() {  
      // 将对象转换为数组进行排序  
      const entries = Object.entries(this.optionCounts1).sort((a, b) => {  
        // 确保'未填写'始终在最后  
        if (a[0] === '未填写') return 1;  
        if (b[0] === '未填写') return -1;  
        // 按count降序排序  
        return b[1] - a[1];  
      });  
  
      // 将排序后的数组转换回对象（如果确实需要）  
      // 注意：由于对象键的顺序在ES6+中是不保证的，但大多数现代浏览器（包括Node.js环境）都遵循插入顺序  
      const sortedObject = {};  
      entries.forEach(([key, value]) => {  
        sortedObject[key] = value;  
      });  
  
      return sortedObject;  
    },

    mergedOptionCounts() {  
      const merged = {};  
      const optionCounts1 = this.questionData[this.question]?.optionCounts1 || {};  
      const optionCounts2 = this.questionData[this.question]?.optionCounts2 || {};  
  
      Object.keys(optionCounts1).forEach(option => {  
        merged[option] = {  
          count1: optionCounts1[option],  
          count2: optionCounts2[option] || 0  
        };  
      });  
  
      return merged;  
    },

    incorrectOptionsRowspan() {  
      const options = this.questionData[this.question]?.optionCounts;  
      const correctAnswer = this.questionData[this.question]?.correctAnswer;  
      if (!options || !correctAnswer) return 0;  
      return Math.max((Object.keys(options).filter(option => option !== correctAnswer).length), 0);  
    },

    firstOptionCount() {  
      const optionCounts = this.questionData[this.question]?.optionCounts;  
      return optionCounts ? [optionCounts[0]] : []; // 如果存在，则只返回第一个元素组成的数组  
    },

    secondOptionCount() {  
      const optionCounts = this.questionData[this.question]?.optionCounts;  
      return optionCounts ? [optionCounts[1]] : []; // 如果存在，则只返回第二个元素组成的数组  
    },

    thirdOptionCount() {  
      const optionCounts = this.questionData[this.question]?.optionCounts;  
      return optionCounts ? [optionCounts[2]] : []; // 如果存在，则只返回第三个元素组成的数组  
    },

    filteredOptionCounts() {  
    // 假设question是组件的data或props中的一个属性  
    if (!this.questionData || !this.questionData[this.question] || !this.questionData[this.question].optionCounts) {  
      return []; // 如果没有数据，返回一个空数组  
    }  
  
    // 使用filter方法过滤掉option为correctAnswer的项  
    // 注意：这里我假设correctAnswer是questionData[this.question]的一个属性  
    const filteredEntries = Object.entries(this.questionData[this.question].optionCounts)  
      .filter(([option/* eslint-disable-line no-unused-vars */, count/* eslint-disable-line no-unused-vars */]) => option !== 'first');  
  
    // 过滤后的entries已经是[key, value]的数组形式，可以直接返回  
    return filteredEntries;  
  }

  }  
};
</script>

<style>
/*学生端错误题号标注*/
.wrong{
  color:red;
}

/*题目文字*/
.question_text{
    padding-left: 200px;  /* 与页面的左边距 */  
    padding-right: 200px; /* 与页面的右边距 */  
    margin-bottom: 30px;
    margin-bottom: 50px;
    line-height: 1.75;
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
</style>