<template>
    <div>
        <h2>Ⅵ. Read and choose（读一读，选择合适的应答句，将字母代号写在前面的括号内）：【语法-句法】</h2>

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

        <div v-for="(question, index) in questions" :key="index">


            <div class="question-container">
                <p
                    :class="{ highlighted: permission === '1' && questionData[question]?.studentAnswer !== questionData[question]?.correctAnswer }">
                    【题目】： {{ index + 1 }}
                </p>
            </div>

            <div v-if="questionDescriptions[question]">
                <p>【题目描述】：{{ questionDescriptions[question] }}</p>
            </div>

            <!-- 显示图片和难度 -->
            <div>
                <!-- 显示选项 -->
                <div v-for="(option, optIndex) in options" :key="optIndex">
                    <p v-html="highlightText(option.text, questionData[question]?.correctAnswer)"></p>
                    <!-- 显示选项人数，只有 permission === '0' 或 permission === '2' 时显示 -->
                    <p v-if="permission === '0' || permission === '2'">选择人数：{{
                        questionData[question]?.optionCounts[option.value] || 0 }}</p>
                </div>
                <p>【难度】：{{ staticData[question]?.difficulty }}</p>
            </div>



            <!-- 根据 permission 显示不同内容 -->
            <div v-if="permission === '1'" class="peer-accuracy-container">
                <p> 【同伴正确率】：{{ questionData[question]?.peerAccuracy }}%</p>
                <p> 【学生答案】：{{ questionData[question]?.studentAnswer }}</p>
            </div>


            <div v-if="permission === '0' || permission === '2'" class="option-percentages-container">
                <p>【正确人数比】</p>
                <div>
                    <!-- 直接显示 optionPercentages 的值 -->
                    <p>{{ questionData[question]?.optionPercentages || '0' }}</p>
                </div>
            </div>

            <!-- 正确答案 -->
            <div class="corrent_answer">
                <p>【正确答案】</p>
                <p v-html="highlightText(questionData[question]?.correctAnswer, questionData[question]?.correctAnswer)"></p>
            </div>

            <!-- 参考解析 -->
            <div>
                <h3>参考解析</h3>
                <p>{{ questionData[question]?.referenceAnalysis }}</p>
            </div>

            <hr>
        </div>
    </div>
</template>



<script>
import axios from 'axios';

export default {
    data() {
        return {
            questions: ['PART2_VI_1', 'PART2_VI_2', 'PART2_VI_3', 'PART2_VI_4', 'PART2_VI_5'],
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
                { text: 'D', value: 'D' },
                { text: 'E', value: 'E' },
            ],
            questionData: {},
            selectedClass: '1_1',
            optionCounts: {},
            optionPercentages: {},
            staticData: {
                'PART2_VI_1': { difficulty: '两颗星' },
                'PART2_VI_2': { difficulty: '两颗星' },
                'PART2_VI_3': { difficulty: '两颗星' },
                'PART2_VI_4': { difficulty: '两颗星' },
                'PART2_VI_5': { difficulty: '两颗星' }
            },
            questionDescriptions: {
                'PART2_VI_1': '(   ) 1. Can you fly a kite?         			A. We fly a kite.',
                'PART2_VI_2': '(   ) 2. What season is it?     				B. It is autumn.',
                'PART2_VI_3': '(   ) 3. What do you do on Children’s Day?		C. No, I can’t.',
                'PART2_VI_4': '(   ) 4. What can you do in winter?  			D. I can ski.',
                'PART2_VI_5': '(   ) 5. Do you like winter?        			E. No. I like autumn.',
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
                    const response = await axios.get('http://localhost:3000/api/question_single', {
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
                            referenceAnalysis
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
                            referenceAnalysis
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