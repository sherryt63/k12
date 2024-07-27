const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '33916807Ct',
    database: 'K12'
});

db.connect(err => {
    if (err) {
        console.error('数据库连接失败:', err);
        return;
    }
    console.log('连接到MySQL数据库');
});

app.post('/api/login', (req, res) => {
    const { name, password, permission } = req.body;

    const query = 'SELECT * FROM user WHERE name = ? AND password = ? AND permission = ?';
    db.query(query, [name, password, permission], (err, results) => {
        if (err) {
            console.error('查询错误:', err);
            return res.status(500).send({ success: false, message: '服务器错误' });
        }

        if (results.length > 0) {
            res.send({ success: true });
        } else {
            res.send({ success: false });
        }
    });
});

app.use(express.json());

app.get('/api/teacher-classes', (req, res) => {
    const { name } = req.query;
    console.log(name);
    if (!name) {
        return res.status(400).json({ message: 'Name parameter is required' });
    }

    const teacherClassesQuery = `SELECT permission FROM teacher WHERE name = ?`;

    db.query(teacherClassesQuery, [name], (err, results) => {
        if (err) {
            console.error('Database query failed:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        const permissions = results[0].permission;
        const classes = permissions.split(',').map(cls => cls.trim());
        console.log(classes);
        res.json({ classes });
    });
});

/////老师的考情分析数据获取
app.get('/api/score-summary', (req, res) => {
    const { name, permission, analysisType } = req.query;

    if (permission !== '0') {
        return res.status(400).json({ message: 'Invalid permission' });
    }

    // 获取老师教的所有班级
    const teacherQuery = 'SELECT school_no, class_no FROM teacher_classes WHERE teacher_name = ?';
    db.query(teacherQuery, [name], (err, classResults) => {
        if (err) {
            console.error('Database query failed:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        let schoolNos = [];
        let classNos = [];
        classResults.forEach(row => {
            schoolNos.push(row.school_no);
            classNos.push(row.class_no);
        });
        console.log("schoolNos", schoolNos);
        console.log("classNos", classNos);

        if (schoolNos.length === 0 || classNos.length === 0) {
            return res.status(400).json({ message: 'No classes found for the teacher' });
        }

        let query = `
            SELECT
                MAX(score) AS max_score,
                MIN(score) AS min_score,
                AVG(score) AS avg_score
            FROM grade
            WHERE school_no IN (?)
        `;
        let params = [schoolNos];

        if (analysisType === '1') {
            query += ' AND class_no IN (?)';
            params.push(classNos);
        }

        db.query(query, params, (err, results) => {
            if (err) {
                console.error('Database query failed:', err);
                return res.status(500).json({ message: 'Server error' });
            }

            const summary = results[0];

            // 获取总数
            let countQuery = 'SELECT COUNT(*) AS total FROM grade WHERE school_no IN (?)';
            if (analysisType === '1') {
                countQuery += ' AND class_no IN (?)';
            }
            db.query(countQuery, params, (err, countResults) => {
                if (err) {
                    console.error('Count query failed:', err);
                    return res.status(500).json({ message: 'Server error' });
                }

                const total = countResults[0].total;
                const medianOffset = Math.floor(total / 2);
                const q1Offset = Math.floor(total / 4);
                const q3Offset = Math.floor(3 * total / 4);

                // 获取中位数
                let medianQuery = `
                    SELECT score FROM grade
                    WHERE school_no IN (?) ${analysisType === '1' ? 'AND class_no IN (?)' : ''}
                    ORDER BY score
                        LIMIT 1 OFFSET ?
                `;
                db.query(medianQuery, [...params, medianOffset], (err, medianResults) => {
                    if (err) {
                        console.error('Median query failed:', err);
                        return res.status(500).json({ message: 'Server error' });
                    }

                    summary.median_score = medianResults[0].score;

                    // 获取四分位数
                    let q1Query = `
                        SELECT score FROM grade
                        WHERE school_no IN (?) ${analysisType === '1' ? 'AND class_no IN (?)' : ''}
                        ORDER BY score
                            LIMIT 1 OFFSET ?
                    `;
                    db.query(q1Query, [...params, q1Offset], (err, q1Results) => {
                        if (err) {
                            console.error('Q1 query failed:', err);
                            return res.status(500).json({ message: 'Server error' });
                        }

                        summary.q1_score = q1Results[0].score;

                        let q3Query = `
                            SELECT score FROM grade
                            WHERE school_no IN (?) ${analysisType === '1' ? 'AND class_no IN (?)' : ''}
                            ORDER BY score
                                LIMIT 1 OFFSET ?
                        `;
                        db.query(q3Query, [...params, q3Offset], (err, q3Results) => {
                            if (err) {
                                console.error('Q3 query failed:', err);
                                return res.status(500).json({ message: 'Server error' });
                            }

                            summary.q3_score = q3Results[0].score;

                            res.json(summary);
                        });
                    });
                });
            });
        });
    });
});

////学生的考情情况数据获取
app.get('/api/student-score-summary', (req, res) => {
    const { name, permission } = req.query;

    if (permission !== '1') {
        return res.status(400).json({ message: 'Invalid permission' });
    }

    // 查询学生的 school_no 和 class_no
    const studentInfoQuery = `SELECT school_no, class_no FROM stu_class WHERE user = ?`;

    db.query(studentInfoQuery, [name], (err, studentInfoResults) => {
        if (err) {
            console.error('Database query failed:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        if (studentInfoResults.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const { school_no, class_no } = studentInfoResults[0];

        let query = `
            SELECT
                MAX(score) AS max_score,
                MIN(score) AS min_score,
                AVG(score) AS avg_score
            FROM gradeHave
            WHERE school_no = ? AND class_no = ?
        `;
        let params = [school_no, class_no];

        db.query(query, params, (err, results) => {
            if (err) {
                console.error('Database query failed:', err);
                return res.status(500).json({ message: 'Server error' });
            }

            const summary = results[0];

            let countQuery = 'SELECT COUNT(*) AS total FROM gradeHave WHERE school_no = ? AND class_no = ?';
            db.query(countQuery, params, (err, countResults) => {
                if (err) {
                    console.error('Count query failed:', err);
                    return res.status(500).json({ message: 'Server error' });
                }

                const total = countResults[0].total;
                if (total === 0) {
                    summary.median_score = null;
                    summary.q1_score = null;
                    summary.q3_score = null;
                    return res.json(summary);
                }

                const medianOffset = Math.floor(total / 2);
                const q1Offset = Math.floor(total / 4);
                const q3Offset = Math.floor(3 * total / 4);

                let medianQuery = `
                    SELECT score FROM gradeHave
                    WHERE school_no = ? AND class_no = ?
                    ORDER BY score
                        LIMIT 1 OFFSET ?
                `;
                db.query(medianQuery, [...params, medianOffset], (err, medianResults) => {
                    if (err) {
                        console.error('Median query failed:', err);
                        return res.status(500).json({ message: 'Server error' });
                    }

                    summary.median_score = medianResults[0] ? medianResults[0].score : null;

                    let q1Query = `
                        SELECT score FROM gradeHave
                        WHERE school_no = ? AND class_no = ?
                        ORDER BY score
                            LIMIT 1 OFFSET ?
                    `;
                    db.query(q1Query, [...params, q1Offset], (err, q1Results) => {
                        if (err) {
                            console.error('Q1 query failed:', err);
                            return res.status(500).json({ message: 'Server error' });
                        }

                        summary.q1_score = q1Results[0] ? q1Results[0].score : null;

                        let q3Query = `
                            SELECT score FROM gradeHave
                            WHERE school_no = ? AND class_no = ?
                            ORDER BY score
                                LIMIT 1 OFFSET ?
                        `;
                        db.query(q3Query, [...params, q3Offset], (err, q3Results) => {
                            if (err) {
                                console.error('Q3 query failed:', err);
                                return res.status(500).json({ message: 'Server error' });
                            }

                            summary.q3_score = q3Results[0] ? q3Results[0].score : null;

                            res.json(summary);
                        });
                    });
                });
            });
        });
    });
});

////管理员的考情情况数据获取
app.get('/api/admin-score-summary', (req, res) => {
    const { class: classSelection } = req.query;


    let school_no, class_no;
    if (classSelection) {
        [school_no, class_no] = classSelection.split('_');
    } else {
        return res.status(400).json({ message: 'Class selection is required' });
    }

    // Query for max, min, avg scores
    const summaryQuery = `
        SELECT
            MAX(score) AS max_score,
            MIN(score) AS min_score,
            AVG(score) AS avg_score
        FROM gradeHave
        WHERE school_no = ? AND class_no = ?
    `;

    // Query for count to calculate offsets
    const countQuery = `
        SELECT COUNT(*) AS total
        FROM gradeHave
        WHERE school_no = ? AND class_no = ?
    `;

    db.query(summaryQuery, [school_no, class_no], (err, summaryResults) => {
        if (err) {
            console.error('Summary query failed:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        db.query(countQuery, [school_no, class_no], (err, countResults) => {
            if (err) {
                console.error('Count query failed:', err);
                return res.status(500).json({ message: 'Server error' });
            }

            const total = countResults[0].total;
            const medianOffset = Math.floor(total / 2);
            const q1Offset = Math.floor(total / 4);
            const q3Offset = Math.floor(3 * total / 4);

            // Query for median
            const medianQuery = `
                SELECT score
                FROM gradeHave
                WHERE school_no = ? AND class_no = ?
                ORDER BY score
                    LIMIT 1
                OFFSET ?
            `;

            db.query(medianQuery, [school_no, class_no, medianOffset], (err, medianResults) => {
                if (err) {
                    console.error('Median query failed:', err);
                    return res.status(500).json({ message: 'Server error' });
                }

                const medianScore = medianResults[0]?.score;

                // Query for Q1
                const q1Query = `
                    SELECT score
                    FROM gradeHave
                    WHERE school_no = ? AND class_no = ?
                    ORDER BY score
                        LIMIT 1
                    OFFSET ?
                `;

                db.query(q1Query, [school_no, class_no, q1Offset], (err, q1Results) => {
                    if (err) {
                        console.error('Q1 query failed:', err);
                        return res.status(500).json({ message: 'Server error' });
                    }

                    const q1Score = q1Results[0]?.score;

                    // Query for Q3
                    const q3Query = `
                        SELECT score
                        FROM gradeHave
                        WHERE school_no = ? AND class_no = ?
                        ORDER BY score
                            LIMIT 1
                        OFFSET ?
                    `;

                    db.query(q3Query, [school_no, class_no, q3Offset], (err, q3Results) => {
                        if (err) {
                            console.error('Q3 query failed:', err);
                            return res.status(500).json({ message: 'Server error' });
                        }

                        const q3Score = q3Results[0]?.score;

                        res.json({
                            max_score: summaryResults[0].max_score,
                            min_score: summaryResults[0].min_score,
                            avg_score: summaryResults[0].avg_score,
                            median_score: medianScore,
                            q1_score: q1Score,
                            q3_score: q3Score
                        });
                    });
                });
            });
        });
    });
});

////管理员的两个校区考情情况数据获取
app.get('/api/admin-score-summary-campusCom', (req, res) => {
    const { school: schoolSelection } = req.query;

    // 确保提供了学校编号
    if (!schoolSelection) {
        return res.status(400).json({ message: 'School selection is required' });
    }

    // Query for max, min, avg scores
    const summaryQuery = `
        SELECT
            MAX(score) AS max_score,
            MIN(score) AS min_score,
            AVG(score) AS avg_score
        FROM gradeHave
        WHERE school_no = ?
    `;

    // Query for count to calculate offsets
    const countQuery = `
        SELECT COUNT(*) AS total
        FROM gradeHave
        WHERE school_no = ?
    `;

    db.query(summaryQuery, [schoolSelection], (err, summaryResults) => {
        if (err) {
            console.error('Summary query failed:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        db.query(countQuery, [schoolSelection], (err, countResults) => {
            if (err) {
                console.error('Count query failed:', err);
                return res.status(500).json({ message: 'Server error' });
            }

            const total = countResults[0].total;
            const medianOffset = Math.floor(total / 2);
            const q1Offset = Math.floor(total / 4);
            const q3Offset = Math.floor(3 * total / 4);

            // Query for median
            const medianQuery = `
                SELECT score
                FROM gradeHave
                WHERE school_no = ?
                ORDER BY score
                LIMIT 1
                OFFSET ?
            `;

            db.query(medianQuery, [schoolSelection, medianOffset], (err, medianResults) => {
                if (err) {
                    console.error('Median query failed:', err);
                    return res.status(500).json({ message: 'Server error' });
                }

                const medianScore = medianResults[0]?.score;

                // Query for Q1
                const q1Query = `
                    SELECT score
                    FROM gradeHave
                    WHERE school_no = ?
                    ORDER BY score
                    LIMIT 1
                    OFFSET ?
                `;

                db.query(q1Query, [schoolSelection, q1Offset], (err, q1Results) => {
                    if (err) {
                        console.error('Q1 query failed:', err);
                        return res.status(500).json({ message: 'Server error' });
                    }

                    const q1Score = q1Results[0]?.score;

                    // Query for Q3
                    const q3Query = `
                        SELECT score
                        FROM gradeHave
                        WHERE school_no = ?
                        ORDER BY score
                        LIMIT 1
                        OFFSET ?
                    `;

                    db.query(q3Query, [schoolSelection, q3Offset], (err, q3Results) => {
                        if (err) {
                            console.error('Q3 query failed:', err);
                            return res.status(500).json({ message: 'Server error' });
                        }

                        const q3Score = q3Results[0]?.score;

                        res.json({
                            max_score: summaryResults[0].max_score,
                            min_score: summaryResults[0].min_score,
                            avg_score: summaryResults[0].avg_score,
                            median_score: medianScore,
                            q1_score: q1Score,
                            q3_score: q3Score
                        });
                    });
                });
            });
        });
    });
});

///获取学生的各题分析
app.get('/api/student-scores', (req, res) => {
    const username = req.query.name;
    console.log("各题分析", username);
    if (!username) {
        return res.status(400).json({ error: 'Name is required' });
    }

    // 获取 school_no 和 class_no
    const getSchoolAndClassQuery = 'SELECT school_no, class_no FROM stu_class WHERE user = ?';
    db.query(getSchoolAndClassQuery, [username], (err, results) => {
        if (err) {
            console.error('Database query failed:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const { school_no, class_no } = results[0];

        // 查询班级所有学生的分数并计算平均值
        const getAverageScoresQuery = `
            SELECT
                AVG(PART1_I_1_score) AS PART1_I_1_score, AVG(PART1_I_2_score) AS PART1_I_2_score, AVG(PART1_I_3_score) AS PART1_I_3_score, AVG(PART1_I_4_score) AS PART1_I_4_score, AVG(PART1_I_5_score) AS PART1_I_5_score, AVG(PART1_I_6_score) AS PART1_I_6_score,
                AVG(PART1_II_1_score) AS PART1_II_1_score, AVG(PART1_II_2_score) AS PART1_II_2_score, AVG(PART1_II_3_score) AS PART1_II_3_score, AVG(PART1_II_4_score) AS PART1_II_4_score, AVG(PART1_II_5_score) AS PART1_II_5_score, AVG(PART1_II_6_score) AS PART1_II_6_score,
                AVG(PART1_III_1_score) AS PART1_III_1_score, AVG(PART1_III_2_score) AS PART1_III_2_score, AVG(PART1_III_3_score) AS PART1_III_3_score, AVG(PART1_III_4_score) AS PART1_III_4_score, AVG(PART1_III_5_score) AS PART1_III_5_score,
                AVG(PART1_IV_1_score) AS PART1_IV_1_score, AVG(PART1_IV_2_score) AS PART1_IV_2_score, AVG(PART1_IV_3_score) AS PART1_IV_3_score, AVG(PART1_IV_4_score) AS PART1_IV_4_score, AVG(PART1_IV_5_score) AS PART1_IV_5_score,
                AVG(PART1_V_1_score) AS PART1_V_1_score, AVG(PART1_V_2_score) AS PART1_V_2_score, AVG(PART1_V_3_score) AS PART1_V_3_score, AVG(PART1_V_4_score) AS PART1_V_4_score,
                AVG(PART1_VI_1_score) AS PART1_VI_1_score, AVG(PART1_VI_2_score) AS PART1_VI_2_score, AVG(PART1_VI_3_score) AS PART1_VI_3_score, AVG(PART1_VI_4_score) AS PART1_VI_4_score, AVG(PART1_VI_5_score) AS PART1_VI_5_score,
                AVG(PART1_VII_1_score) AS PART1_VII_1_score, AVG(PART1_VII_2_score) AS PART1_VII_2_score, AVG(PART1_VII_3_score) AS PART1_VII_3_score, AVG(PART1_VII_4_score) AS PART1_VII_4_score, AVG(PART1_VII_5_score) AS PART1_VII_5_score,
                AVG(PART1_VIII_1_score) AS PART1_VIII_1_score, AVG(PART1_VIII_2_score) AS PART1_VIII_2_score, AVG(PART1_VIII_3_score) AS PART1_VIII_3_score, AVG(PART1_VIII_4_score) AS PART1_VIII_4_score,
                AVG(PART2_I_score) AS PART2_I_score,
                AVG(PART2_II_1_score) AS PART2_II_1_score, AVG(PART2_II_2_score) AS PART2_II_2_score, AVG(PART2_II_3_score) AS PART2_II_3_score, AVG(PART2_II_4_score) AS PART2_II_4_score, AVG(PART2_II_5_score) AS PART2_II_5_score,
                AVG(PART2_III_1_score) AS PART2_III_1_score, AVG(PART2_III_2_score) AS PART2_III_2_score, AVG(PART2_III_3_score) AS PART2_III_3_score, AVG(PART2_III_4_score) AS PART2_III_4_score,
                AVG(PART2_IV_1_score) AS PART2_IV_1_score, AVG(PART2_IV_2_score) AS PART2_IV_2_score, AVG(PART2_IV_3_score) AS PART2_IV_3_score, AVG(PART2_IV_4_score) AS PART2_IV_4_score, AVG(PART2_IV_5_score) AS PART2_IV_5_score, AVG(PART2_IV_6_score) AS PART2_IV_6_score, AVG(PART2_IV_7_score) AS PART2_IV_7_score, AVG(PART2_IV_8_score) AS PART2_IV_8_score, AVG(PART2_IV_9_score) AS PART2_IV_9_score,
                AVG(PART2_V_1_1_score) AS PART2_V_1_1_score, AVG(PART2_V_1_2_score) AS PART2_V_1_2_score, AVG(PART2_V_2_1_score) AS PART2_V_2_1_score, AVG(PART2_V_2_2_score) AS PART2_V_2_2_score, AVG(PART2_V_3_1_score) AS PART2_V_3_1_score, AVG(PART2_V_3_2_score) AS PART2_V_3_2_score, AVG(PART2_V_4_1_score) AS PART2_V_4_1_score, AVG(PART2_V_4_2_score) AS PART2_V_4_2_score, AVG(PART2_V_5_1_score) AS PART2_V_5_1_score, AVG(PART2_V_5_2_score) AS PART2_V_5_2_score,
                AVG(PART2_VI_1_score) AS PART2_VI_1_score, AVG(PART2_VI_2_score) AS PART2_VI_2_score, AVG(PART2_VI_3_score) AS PART2_VI_3_score, AVG(PART2_VI_4_score) AS PART2_VI_4_score, AVG(PART2_VI_5_score) AS PART2_VI_5_score,
                AVG(PART2_VII_1_score) AS PART2_VII_1_score, AVG(PART2_VII_2_score) AS PART2_VII_2_score, AVG(PART2_VII_3_score) AS PART2_VII_3_score, AVG(PART2_VII_4_score) AS PART2_VII_4_score, AVG(PART2_VII_5_score) AS PART2_VII_5_score,
                AVG(PART2_VIII_1_score) AS PART2_VIII_1_score, AVG(PART2_VIII_2_score) AS PART2_VIII_2_score, AVG(PART2_VIII_3_score) AS PART2_VIII_3_score, AVG(PART2_VIII_4_score) AS PART2_VIII_4_score
            FROM gradeHave
            WHERE school_no = ? AND class_no = ?
        `;
        db.query(getAverageScoresQuery, [school_no, class_no], (err, results) => {
            if (err) {
                console.error('Database query failed:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'No data found' });
            }
            const averages = results[0];

            // 计算每个大题的得分率
            const totals_pre = {
                PART1_I_total: (averages.PART1_I_1_score || 0) + (averages.PART1_I_2_score || 0) + (averages.PART1_I_3_score || 0) + (averages.PART1_I_4_score || 0) + (averages.PART1_I_5_score || 0) + (averages.PART1_I_6_score || 0),
                PART1_II_total: (averages.PART1_II_1_score || 0) + (averages.PART1_II_2_score || 0) + (averages.PART1_II_3_score || 0) + (averages.PART1_II_4_score || 0) + (averages.PART1_II_5_score || 0) + (averages.PART1_II_6_score || 0),
                PART1_III_total: (averages.PART1_III_1_score || 0) + (averages.PART1_III_2_score || 0) + (averages.PART1_III_3_score || 0) + (averages.PART1_III_4_score || 0) + (averages.PART1_III_5_score || 0),
                PART1_IV_total: (averages.PART1_IV_1_score || 0) + (averages.PART1_IV_2_score || 0) + (averages.PART1_IV_3_score || 0) + (averages.PART1_IV_4_score || 0) + (averages.PART1_IV_5_score || 0),
                PART1_V_total: (averages.PART1_V_1_score || 0) + (averages.PART1_V_2_score || 0) + (averages.PART1_V_3_score || 0) + (averages.PART1_V_4_score || 0),
                PART1_VI_total: (averages.PART1_VI_1_score || 0) + (averages.PART1_VI_2_score || 0) + (averages.PART1_VI_3_score || 0) + (averages.PART1_VI_4_score || 0) + (averages.PART1_VI_5_score || 0),
                PART1_VII_total: (averages.PART1_VII_1_score || 0) + (averages.PART1_VII_2_score || 0) + (averages.PART1_VII_3_score || 0) + (averages.PART1_VII_4_score || 0) + (averages.PART1_VII_5_score || 0),
                PART1_VIII_total: (averages.PART1_VIII_1_score || 0) + (averages.PART1_VIII_2_score || 0) + (averages.PART1_VIII_3_score || 0) + (averages.PART1_VIII_4_score || 0),
                PART2_I_total: averages.PART2_I_score || 0,
                PART2_II_total: (averages.PART2_II_1_score || 0) + (averages.PART2_II_2_score || 0) + (averages.PART2_II_3_score || 0) + (averages.PART2_II_4_score || 0) + (averages.PART2_II_5_score || 0),
                PART2_III_total: (averages.PART2_III_1_score || 0) + (averages.PART2_III_2_score || 0) + (averages.PART2_III_3_score || 0) + (averages.PART2_III_4_score || 0),
                PART2_IV_total: (averages.PART2_IV_1_score || 0) + (averages.PART2_IV_2_score || 0) + (averages.PART2_IV_3_score || 0) + (averages.PART2_IV_4_score || 0) + (averages.PART2_IV_5_score || 0) + (averages.PART2_IV_6_score || 0) + (averages.PART2_IV_7_score || 0) + (averages.PART2_IV_8_score || 0) + (averages.PART2_IV_9_score || 0),
                PART2_V_total: (averages.PART2_V_1_1_score || 0) + (averages.PART2_V_1_2_score || 0) + (averages.PART2_V_2_1_score || 0) + (averages.PART2_V_2_2_score || 0) + (averages.PART2_V_3_1_score || 0) + (averages.PART2_V_3_2_score || 0) + (averages.PART2_V_4_1_score || 0) + (averages.PART2_V_4_2_score || 0) + (averages.PART2_V_5_1_score || 0) + (averages.PART2_V_5_2_score || 0),
                PART2_VI_total: (averages.PART2_VI_1_score || 0) + (averages.PART2_VI_2_score || 0) + (averages.PART2_VI_3_score || 0) + (averages.PART2_VI_4_score || 0) + (averages.PART2_VI_5_score || 0),
                PART2_VII_total: (averages.PART2_VII_1_score || 0) + (averages.PART2_VII_2_score || 0) + (averages.PART2_VII_3_score || 0) + (averages.PART2_VII_4_score || 0) + (averages.PART2_VII_5_score || 0),
                PART2_VIII_total: (averages.PART2_VIII_1_score || 0) + (averages.PART2_VIII_2_score || 0) + (averages.PART2_VIII_3_score || 0) + (averages.PART2_VIII_4_score || 0)
            };

            // 计算每个大题的题数
            const questionCounts = {
                PART1_I: 6,
                PART1_II: 6,
                PART1_III: 5,
                PART1_IV: 5,
                PART1_V: 4,
                PART1_VI: 5,
                PART1_VII: 5,
                PART1_VIII: 4,
                PART2_I: 1,
                PART2_II: 5,
                PART2_III: 4,
                PART2_IV: 9,
                PART2_V: 10,
                PART2_VI: 5,
                PART2_VII: 5,
                PART2_VIII: 4
            };

            // 计算得分率
            const totals = {
                PART1_I_rate: totals_pre.PART1_I_total / questionCounts.PART1_I,
                PART1_II_rate: totals_pre.PART1_II_total / questionCounts.PART1_II,
                PART1_III_rate: totals_pre.PART1_III_total / questionCounts.PART1_III,
                PART1_IV_rate: totals_pre.PART1_IV_total / questionCounts.PART1_IV,
                PART1_V_rate: totals_pre.PART1_V_total / questionCounts.PART1_V,
                PART1_VI_rate: totals_pre.PART1_VI_total / questionCounts.PART1_VI,
                PART1_VII_rate: totals_pre.PART1_VII_total / questionCounts.PART1_VII,
                PART1_VIII_rate: totals_pre.PART1_VIII_total / questionCounts.PART1_VIII,
                PART2_I_rate: totals_pre.PART2_I_total / questionCounts.PART2_I,
                PART2_II_rate: totals_pre.PART2_II_total / questionCounts.PART2_II,
                PART2_III_rate: totals_pre.PART2_III_total / questionCounts.PART2_III,
                PART2_IV_rate: totals_pre.PART2_IV_total / questionCounts.PART2_IV,
                PART2_V_rate: totals_pre.PART2_V_total / questionCounts.PART2_V,
                PART2_VI_rate: totals_pre.PART2_VI_total / questionCounts.PART2_VI,
                PART2_VII_rate: totals_pre.PART2_VII_total / questionCounts.PART2_VII,
                PART2_VIII_rate: totals_pre.PART2_VIII_total / questionCounts.PART2_VIII
            };

            // 返回平均分、总分和得分率
            res.json({ averages, totals });
        });
    });
});

///获取管理员/老师的各题分析
app.get('/api/admin-scores', (req, res) => {
    const username = req.query.name;
    const classSelection = req.query.class;

    console.log("各题分析", username);
    console.log("班级选择", classSelection);

    if (!username) {
        return res.status(400).json({ error: 'Name is required' });
    }

    let school_no, class_no;
    if (classSelection) {
        [school_no, class_no] = classSelection.split('_');
    } else {
        return res.status(400).json({ message: 'Class selection is required' });
    }

    // 查询班级所有学生的分数并计算平均值
    const getAverageScoresQuery = `
        SELECT
            AVG(PART1_I_1_score) AS PART1_I_1_score, AVG(PART1_I_2_score) AS PART1_I_2_score, AVG(PART1_I_3_score) AS PART1_I_3_score, AVG(PART1_I_4_score) AS PART1_I_4_score, AVG(PART1_I_5_score) AS PART1_I_5_score, AVG(PART1_I_6_score) AS PART1_I_6_score,
            AVG(PART1_II_1_score) AS PART1_II_1_score, AVG(PART1_II_2_score) AS PART1_II_2_score, AVG(PART1_II_3_score) AS PART1_II_3_score, AVG(PART1_II_4_score) AS PART1_II_4_score, AVG(PART1_II_5_score) AS PART1_II_5_score, AVG(PART1_II_6_score) AS PART1_II_6_score,
            AVG(PART1_III_1_score) AS PART1_III_1_score, AVG(PART1_III_2_score) AS PART1_III_2_score, AVG(PART1_III_3_score) AS PART1_III_3_score, AVG(PART1_III_4_score) AS PART1_III_4_score, AVG(PART1_III_5_score) AS PART1_III_5_score,
            AVG(PART1_IV_1_score) AS PART1_IV_1_score, AVG(PART1_IV_2_score) AS PART1_IV_2_score, AVG(PART1_IV_3_score) AS PART1_IV_3_score, AVG(PART1_IV_4_score) AS PART1_IV_4_score, AVG(PART1_IV_5_score) AS PART1_IV_5_score,
            AVG(PART1_V_1_score) AS PART1_V_1_score, AVG(PART1_V_2_score) AS PART1_V_2_score, AVG(PART1_V_3_score) AS PART1_V_3_score, AVG(PART1_V_4_score) AS PART1_V_4_score,
            AVG(PART1_VI_1_score) AS PART1_VI_1_score, AVG(PART1_VI_2_score) AS PART1_VI_2_score, AVG(PART1_VI_3_score) AS PART1_VI_3_score, AVG(PART1_VI_4_score) AS PART1_VI_4_score, AVG(PART1_VI_5_score) AS PART1_VI_5_score,
            AVG(PART1_VII_1_score) AS PART1_VII_1_score, AVG(PART1_VII_2_score) AS PART1_VII_2_score, AVG(PART1_VII_3_score) AS PART1_VII_3_score, AVG(PART1_VII_4_score) AS PART1_VII_4_score, AVG(PART1_VII_5_score) AS PART1_VII_5_score,
            AVG(PART1_VIII_1_score) AS PART1_VIII_1_score, AVG(PART1_VIII_2_score) AS PART1_VIII_2_score, AVG(PART1_VIII_3_score) AS PART1_VIII_3_score, AVG(PART1_VIII_4_score) AS PART1_VIII_4_score,
            AVG(PART2_I_score) AS PART2_I_score,
            AVG(PART2_II_1_score) AS PART2_II_1_score, AVG(PART2_II_2_score) AS PART2_II_2_score, AVG(PART2_II_3_score) AS PART2_II_3_score, AVG(PART2_II_4_score) AS PART2_II_4_score, AVG(PART2_II_5_score) AS PART2_II_5_score,
            AVG(PART2_III_1_score) AS PART2_III_1_score, AVG(PART2_III_2_score) AS PART2_III_2_score, AVG(PART2_III_3_score) AS PART2_III_3_score, AVG(PART2_III_4_score) AS PART2_III_4_score,
            AVG(PART2_IV_1_score) AS PART2_IV_1_score, AVG(PART2_IV_2_score) AS PART2_IV_2_score, AVG(PART2_IV_3_score) AS PART2_IV_3_score, AVG(PART2_IV_4_score) AS PART2_IV_4_score, AVG(PART2_IV_5_score) AS PART2_IV_5_score, AVG(PART2_IV_6_score) AS PART2_IV_6_score, AVG(PART2_IV_7_score) AS PART2_IV_7_score, AVG(PART2_IV_8_score) AS PART2_IV_8_score, AVG(PART2_IV_9_score) AS PART2_IV_9_score,
            AVG(PART2_V_1_1_score) AS PART2_V_1_1_score, AVG(PART2_V_1_2_score) AS PART2_V_1_2_score, AVG(PART2_V_2_1_score) AS PART2_V_2_1_score, AVG(PART2_V_2_2_score) AS PART2_V_2_2_score, AVG(PART2_V_3_1_score) AS PART2_V_3_1_score, AVG(PART2_V_3_2_score) AS PART2_V_3_2_score, AVG(PART2_V_4_1_score) AS PART2_V_4_1_score, AVG(PART2_V_4_2_score) AS PART2_V_4_2_score, AVG(PART2_V_5_1_score) AS PART2_V_5_1_score, AVG(PART2_V_5_2_score) AS PART2_V_5_2_score,
            AVG(PART2_VI_1_score) AS PART2_VI_1_score, AVG(PART2_VI_2_score) AS PART2_VI_2_score, AVG(PART2_VI_3_score) AS PART2_VI_3_score, AVG(PART2_VI_4_score) AS PART2_VI_4_score, AVG(PART2_VI_5_score) AS PART2_VI_5_score,
            AVG(PART2_VII_1_score) AS PART2_VII_1_score, AVG(PART2_VII_2_score) AS PART2_VII_2_score, AVG(PART2_VII_3_score) AS PART2_VII_3_score, AVG(PART2_VII_4_score) AS PART2_VII_4_score, AVG(PART2_VII_5_score) AS PART2_VII_5_score,
            AVG(PART2_VIII_1_score) AS PART2_VIII_1_score, AVG(PART2_VIII_2_score) AS PART2_VIII_2_score, AVG(PART2_VIII_3_score) AS PART2_VIII_3_score, AVG(PART2_VIII_4_score) AS PART2_VIII_4_score
        FROM gradeHave
        WHERE school_no = ? AND class_no = ?
    `;

    db.query(getAverageScoresQuery, [school_no, class_no], (err, results) => {
        if (err) {
            console.error('Database query failed:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'No data found' });
        }
        const averages = results[0];

        // 计算每个大题的得分率
        const totals_pre = {
            PART1_I_total: (averages.PART1_I_1_score || 0) + (averages.PART1_I_2_score || 0) + (averages.PART1_I_3_score || 0) + (averages.PART1_I_4_score || 0) + (averages.PART1_I_5_score || 0) + (averages.PART1_I_6_score || 0),
            PART1_II_total: (averages.PART1_II_1_score || 0) + (averages.PART1_II_2_score || 0) + (averages.PART1_II_3_score || 0) + (averages.PART1_II_4_score || 0) + (averages.PART1_II_5_score || 0) + (averages.PART1_II_6_score || 0),
            PART1_III_total: (averages.PART1_III_1_score || 0) + (averages.PART1_III_2_score || 0) + (averages.PART1_III_3_score || 0) + (averages.PART1_III_4_score || 0) + (averages.PART1_III_5_score || 0),
            PART1_IV_total: (averages.PART1_IV_1_score || 0) + (averages.PART1_IV_2_score || 0) + (averages.PART1_IV_3_score || 0) + (averages.PART1_IV_4_score || 0) + (averages.PART1_IV_5_score || 0),
            PART1_V_total: (averages.PART1_V_1_score || 0) + (averages.PART1_V_2_score || 0) + (averages.PART1_V_3_score || 0) + (averages.PART1_V_4_score || 0),
            PART1_VI_total: (averages.PART1_VI_1_score || 0) + (averages.PART1_VI_2_score || 0) + (averages.PART1_VI_3_score || 0) + (averages.PART1_VI_4_score || 0) + (averages.PART1_VI_5_score || 0),
            PART1_VII_total: (averages.PART1_VII_1_score || 0) + (averages.PART1_VII_2_score || 0) + (averages.PART1_VII_3_score || 0) + (averages.PART1_VII_4_score || 0) + (averages.PART1_VII_5_score || 0),
            PART1_VIII_total: (averages.PART1_VIII_1_score || 0) + (averages.PART1_VIII_2_score || 0) + (averages.PART1_VIII_3_score || 0) + (averages.PART1_VIII_4_score || 0),
            PART2_I_total: (averages.PART2_I_score || 0),
            PART2_II_total: (averages.PART2_II_1_score || 0) + (averages.PART2_II_2_score || 0) + (averages.PART2_II_3_score || 0) + (averages.PART2_II_4_score || 0) + (averages.PART2_II_5_score || 0),
            PART2_III_total: (averages.PART2_III_1_score || 0) + (averages.PART2_III_2_score || 0) + (averages.PART2_III_3_score || 0) + (averages.PART2_III_4_score || 0),
            PART2_IV_total: (averages.PART2_IV_1_score || 0) + (averages.PART2_IV_2_score || 0) + (averages.PART2_IV_3_score || 0) + (averages.PART2_IV_4_score || 0) + (averages.PART2_IV_5_score || 0) + (averages.PART2_IV_6_score || 0) + (averages.PART2_IV_7_score || 0) + (averages.PART2_IV_8_score || 0) + (averages.PART2_IV_9_score || 0),
            PART2_V_total: (averages.PART2_V_1_1_score || 0) + (averages.PART2_V_1_2_score || 0) + (averages.PART2_V_2_1_score || 0) + (averages.PART2_V_2_2_score || 0) + (averages.PART2_V_3_1_score || 0) + (averages.PART2_V_3_2_score || 0) + (averages.PART2_V_4_1_score || 0) + (averages.PART2_V_4_2_score || 0) + (averages.PART2_V_5_1_score || 0) + (averages.PART2_V_5_2_score || 0),
            PART2_VI_total: (averages.PART2_VI_1_score || 0) + (averages.PART2_VI_2_score || 0) + (averages.PART2_VI_3_score || 0) + (averages.PART2_VI_4_score || 0) + (averages.PART2_VI_5_score || 0),
            PART2_VII_total: (averages.PART2_VII_1_score || 0) + (averages.PART2_VII_2_score || 0) + (averages.PART2_VII_3_score || 0) + (averages.PART2_VII_4_score || 0) + (averages.PART2_VII_5_score || 0),
            PART2_VIII_total: (averages.PART2_VIII_1_score || 0) + (averages.PART2_VIII_2_score || 0) + (averages.PART2_VIII_3_score || 0) + (averages.PART2_VIII_4_score || 0)
        };

        const questionCounts = {
            PART1_I: 6,
            PART1_II: 6,
            PART1_III: 5,
            PART1_IV: 5,
            PART1_V: 4,
            PART1_VI: 5,
            PART1_VII: 5,
            PART1_VIII: 4,
            PART2_I: 1,
            PART2_II: 5,
            PART2_III: 4,
            PART2_IV: 9,
            PART2_V: 10,
            PART2_VI: 5,
            PART2_VII: 5,
            PART2_VIII: 4
        };

        // 计算得分率
        const totals = {
            PART1_I_rate: totals_pre.PART1_I_total / questionCounts.PART1_I,
            PART1_II_rate: totals_pre.PART1_II_total / questionCounts.PART1_II,
            PART1_III_rate: totals_pre.PART1_III_total / questionCounts.PART1_III,
            PART1_IV_rate: totals_pre.PART1_IV_total / questionCounts.PART1_IV,
            PART1_V_rate: totals_pre.PART1_V_total / questionCounts.PART1_V,
            PART1_VI_rate: totals_pre.PART1_VI_total / questionCounts.PART1_VI,
            PART1_VII_rate: totals_pre.PART1_VII_total / questionCounts.PART1_VII,
            PART1_VIII_rate: totals_pre.PART1_VIII_total / questionCounts.PART1_VIII,
            PART2_I_rate: totals_pre.PART2_I_total / questionCounts.PART2_I,
            PART2_II_rate: totals_pre.PART2_II_total / questionCounts.PART2_II,
            PART2_III_rate: totals_pre.PART2_III_total / questionCounts.PART2_III,
            PART2_IV_rate: totals_pre.PART2_IV_total / questionCounts.PART2_IV,
            PART2_V_rate: totals_pre.PART2_V_total / questionCounts.PART2_V,
            PART2_VI_rate: totals_pre.PART2_VI_total / questionCounts.PART2_VI,
            PART2_VII_rate: totals_pre.PART2_VII_total / questionCounts.PART2_VII,
            PART2_VIII_rate: totals_pre.PART2_VIII_total / questionCounts.PART2_VIII
        };

        // 返回计算结果
        res.json({
            status: 'success',
            averages,
            totals
        });
    });
});

///获取管理员校区的各题分析
app.get('/api/admin-scores-campusCom', (req, res) => {
    const username = req.query.name;
    const schoolSelection = req.query.school;

    console.log("各题分析", username);
    console.log("校区选择", schoolSelection);

    if (!username) {
        return res.status(400).json({ error: 'Name is required' });
    }

    let school_no;
    if (schoolSelection) {
        school_no = schoolSelection;
    } else {
        return res.status(400).json({ message: 'School selection is required' });
    }

    // 查询校区所有班级的分数并计算平均值
    const getAverageScoresQuery = `
        SELECT
            AVG(PART1_I_1_score) AS PART1_I_1_score, AVG(PART1_I_2_score) AS PART1_I_2_score, AVG(PART1_I_3_score) AS PART1_I_3_score, AVG(PART1_I_4_score) AS PART1_I_4_score, AVG(PART1_I_5_score) AS PART1_I_5_score, AVG(PART1_I_6_score) AS PART1_I_6_score,
            AVG(PART1_II_1_score) AS PART1_II_1_score, AVG(PART1_II_2_score) AS PART1_II_2_score, AVG(PART1_II_3_score) AS PART1_II_3_score, AVG(PART1_II_4_score) AS PART1_II_4_score, AVG(PART1_II_5_score) AS PART1_II_5_score, AVG(PART1_II_6_score) AS PART1_II_6_score,
            AVG(PART1_III_1_score) AS PART1_III_1_score, AVG(PART1_III_2_score) AS PART1_III_2_score, AVG(PART1_III_3_score) AS PART1_III_3_score, AVG(PART1_III_4_score) AS PART1_III_4_score, AVG(PART1_III_5_score) AS PART1_III_5_score,
            AVG(PART1_IV_1_score) AS PART1_IV_1_score, AVG(PART1_IV_2_score) AS PART1_IV_2_score, AVG(PART1_IV_3_score) AS PART1_IV_3_score, AVG(PART1_IV_4_score) AS PART1_IV_4_score, AVG(PART1_IV_5_score) AS PART1_IV_5_score,
            AVG(PART1_V_1_score) AS PART1_V_1_score, AVG(PART1_V_2_score) AS PART1_V_2_score, AVG(PART1_V_3_score) AS PART1_V_3_score, AVG(PART1_V_4_score) AS PART1_V_4_score,
            AVG(PART1_VI_1_score) AS PART1_VI_1_score, AVG(PART1_VI_2_score) AS PART1_VI_2_score, AVG(PART1_VI_3_score) AS PART1_VI_3_score, AVG(PART1_VI_4_score) AS PART1_VI_4_score, AVG(PART1_VI_5_score) AS PART1_VI_5_score,
            AVG(PART1_VII_1_score) AS PART1_VII_1_score, AVG(PART1_VII_2_score) AS PART1_VII_2_score, AVG(PART1_VII_3_score) AS PART1_VII_3_score, AVG(PART1_VII_4_score) AS PART1_VII_4_score, AVG(PART1_VII_5_score) AS PART1_VII_5_score,
            AVG(PART1_VIII_1_score) AS PART1_VIII_1_score, AVG(PART1_VIII_2_score) AS PART1_VIII_2_score, AVG(PART1_VIII_3_score) AS PART1_VIII_3_score, AVG(PART1_VIII_4_score) AS PART1_VIII_4_score,
            AVG(PART2_I_score) AS PART2_I_score,
            AVG(PART2_II_1_score) AS PART2_II_1_score, AVG(PART2_II_2_score) AS PART2_II_2_score, AVG(PART2_II_3_score) AS PART2_II_3_score, AVG(PART2_II_4_score) AS PART2_II_4_score, AVG(PART2_II_5_score) AS PART2_II_5_score,
            AVG(PART2_III_1_score) AS PART2_III_1_score, AVG(PART2_III_2_score) AS PART2_III_2_score, AVG(PART2_III_3_score) AS PART2_III_3_score, AVG(PART2_III_4_score) AS PART2_III_4_score,
            AVG(PART2_IV_1_score) AS PART2_IV_1_score, AVG(PART2_IV_2_score) AS PART2_IV_2_score, AVG(PART2_IV_3_score) AS PART2_IV_3_score, AVG(PART2_IV_4_score) AS PART2_IV_4_score, AVG(PART2_IV_5_score) AS PART2_IV_5_score, AVG(PART2_IV_6_score) AS PART2_IV_6_score, AVG(PART2_IV_7_score) AS PART2_IV_7_score, AVG(PART2_IV_8_score) AS PART2_IV_8_score, AVG(PART2_IV_9_score) AS PART2_IV_9_score,
            AVG(PART2_V_1_1_score) AS PART2_V_1_1_score, AVG(PART2_V_1_2_score) AS PART2_V_1_2_score, AVG(PART2_V_2_1_score) AS PART2_V_2_1_score, AVG(PART2_V_2_2_score) AS PART2_V_2_2_score, AVG(PART2_V_3_1_score) AS PART2_V_3_1_score, AVG(PART2_V_3_2_score) AS PART2_V_3_2_score, AVG(PART2_V_4_1_score) AS PART2_V_4_1_score, AVG(PART2_V_4_2_score) AS PART2_V_4_2_score, AVG(PART2_V_5_1_score) AS PART2_V_5_1_score, AVG(PART2_V_5_2_score) AS PART2_V_5_2_score,
            AVG(PART2_VI_1_score) AS PART2_VI_1_score, AVG(PART2_VI_2_score) AS PART2_VI_2_score, AVG(PART2_VI_3_score) AS PART2_VI_3_score, AVG(PART2_VI_4_score) AS PART2_VI_4_score, AVG(PART2_VI_5_score) AS PART2_VI_5_score,
            AVG(PART2_VII_1_score) AS PART2_VII_1_score, AVG(PART2_VII_2_score) AS PART2_VII_2_score, AVG(PART2_VII_3_score) AS PART2_VII_3_score, AVG(PART2_VII_4_score) AS PART2_VII_4_score, AVG(PART2_VII_5_score) AS PART2_VII_5_score,
            AVG(PART2_VIII_1_score) AS PART2_VIII_1_score, AVG(PART2_VIII_2_score) AS PART2_VIII_2_score, AVG(PART2_VIII_3_score) AS PART2_VIII_3_score, AVG(PART2_VIII_4_score) AS PART2_VIII_4_score
        FROM gradeHave
        WHERE school_no = ?
    `;

    db.query(getAverageScoresQuery, [school_no], (err, results) => {
        if (err) {
            console.error('Database query failed:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'No data found' });
        }
        const averages = results[0];

        // 计算每个大题的得分率
        const totals_pre = {
            PART1_I_total: (averages.PART1_I_1_score || 0) + (averages.PART1_I_2_score || 0) + (averages.PART1_I_3_score || 0) + (averages.PART1_I_4_score || 0) + (averages.PART1_I_5_score || 0) + (averages.PART1_I_6_score || 0),
            PART1_II_total: (averages.PART1_II_1_score || 0) + (averages.PART1_II_2_score || 0) + (averages.PART1_II_3_score || 0) + (averages.PART1_II_4_score || 0) + (averages.PART1_II_5_score || 0) + (averages.PART1_II_6_score || 0),
            PART1_III_total: (averages.PART1_III_1_score || 0) + (averages.PART1_III_2_score || 0) + (averages.PART1_III_3_score || 0) + (averages.PART1_III_4_score || 0) + (averages.PART1_III_5_score || 0),
            PART1_IV_total: (averages.PART1_IV_1_score || 0) + (averages.PART1_IV_2_score || 0) + (averages.PART1_IV_3_score || 0) + (averages.PART1_IV_4_score || 0) + (averages.PART1_IV_5_score || 0),
            PART1_V_total: (averages.PART1_V_1_score || 0) + (averages.PART1_V_2_score || 0) + (averages.PART1_V_3_score || 0) + (averages.PART1_V_4_score || 0),
            PART1_VI_total: (averages.PART1_VI_1_score || 0) + (averages.PART1_VI_2_score || 0) + (averages.PART1_VI_3_score || 0) + (averages.PART1_VI_4_score || 0) + (averages.PART1_VI_5_score || 0),
            PART1_VII_total: (averages.PART1_VII_1_score || 0) + (averages.PART1_VII_2_score || 0) + (averages.PART1_VII_3_score || 0) + (averages.PART1_VII_4_score || 0) + (averages.PART1_VII_5_score || 0),
            PART1_VIII_total: (averages.PART1_VIII_1_score || 0) + (averages.PART1_VIII_2_score || 0) + (averages.PART1_VIII_3_score || 0) + (averages.PART1_VIII_4_score || 0),
            PART2_I_total: (averages.PART2_I_score || 0),
            PART2_II_total: (averages.PART2_II_1_score || 0) + (averages.PART2_II_2_score || 0) + (averages.PART2_II_3_score || 0) + (averages.PART2_II_4_score || 0) + (averages.PART2_II_5_score || 0),
            PART2_III_total: (averages.PART2_III_1_score || 0) + (averages.PART2_III_2_score || 0) + (averages.PART2_III_3_score || 0) + (averages.PART2_III_4_score || 0),
            PART2_IV_total: (averages.PART2_IV_1_score || 0) + (averages.PART2_IV_2_score || 0) + (averages.PART2_IV_3_score || 0) + (averages.PART2_IV_4_score || 0) + (averages.PART2_IV_5_score || 0) + (averages.PART2_IV_6_score || 0) + (averages.PART2_IV_7_score || 0) + (averages.PART2_IV_8_score || 0) + (averages.PART2_IV_9_score || 0),
            PART2_V_total: (averages.PART2_V_1_1_score || 0) + (averages.PART2_V_1_2_score || 0) + (averages.PART2_V_2_1_score || 0) + (averages.PART2_V_2_2_score || 0) + (averages.PART2_V_3_1_score || 0) + (averages.PART2_V_3_2_score || 0) + (averages.PART2_V_4_1_score || 0) + (averages.PART2_V_4_2_score || 0) + (averages.PART2_V_5_1_score || 0) + (averages.PART2_V_5_2_score || 0),
            PART2_VI_total: (averages.PART2_VI_1_score || 0) + (averages.PART2_VI_2_score || 0) + (averages.PART2_VI_3_score || 0) + (averages.PART2_VI_4_score || 0) + (averages.PART2_VI_5_score || 0),
            PART2_VII_total: (averages.PART2_VII_1_score || 0) + (averages.PART2_VII_2_score || 0) + (averages.PART2_VII_3_score || 0) + (averages.PART2_VII_4_score || 0) + (averages.PART2_VII_5_score || 0),
            PART2_VIII_total: (averages.PART2_VIII_1_score || 0) + (averages.PART2_VIII_2_score || 0) + (averages.PART2_VIII_3_score || 0) + (averages.PART2_VIII_4_score || 0)
        };

        const scores = {
            PART1_I: (averages.PART1_I_1_score || 0) / totals_pre.PART1_I_total,
            PART1_II: (averages.PART1_II_1_score || 0) / totals_pre.PART1_II_total,
            PART1_III: (averages.PART1_III_1_score || 0) / totals_pre.PART1_III_total,
            PART1_IV: (averages.PART1_IV_1_score || 0) / totals_pre.PART1_IV_total,
            PART1_V: (averages.PART1_V_1_score || 0) / totals_pre.PART1_V_total,
            PART1_VI: (averages.PART1_VI_1_score || 0) / totals_pre.PART1_VI_total,
            PART1_VII: (averages.PART1_VII_1_score || 0) / totals_pre.PART1_VII_total,
            PART1_VIII: (averages.PART1_VIII_1_score || 0) / totals_pre.PART1_VIII_total,
            PART2_I: (averages.PART2_I_score || 0) / totals_pre.PART2_I_total,
            PART2_II: (averages.PART2_II_1_score || 0) / totals_pre.PART2_II_total,
            PART2_III: (averages.PART2_III_1_score || 0) / totals_pre.PART2_III_total,
            PART2_IV: (averages.PART2_IV_1_score || 0) / totals_pre.PART2_IV_total,
            PART2_V: (averages.PART2_V_1_1_score || 0) / totals_pre.PART2_V_total,
            PART2_VI: (averages.PART2_VI_1_score || 0) / totals_pre.PART2_VI_total,
            PART2_VII: (averages.PART2_VII_1_score || 0) / totals_pre.PART2_VII_total,
            PART2_VIII: (averages.PART2_VIII_1_score || 0) / totals_pre.PART2_VIII_total
        };

        res.json({
            averages: averages,
            scores: scores
        });
    });
});


app.get('/api/question', (req, res) => {
    const { question } = req.query;

    if (!question) {
        return res.status(400).json({ message: 'Question parameter is required' });
    }

    // 查询正确答案
    const correctAnswerQuery = 'SELECT answer FROM correct_answers WHERE question = ?';
    db.query(correctAnswerQuery, [question], (err, correctAnswerResults) => {
        if (err) {
            console.error('Database query failed:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        if (correctAnswerResults.length === 0) {
            return res.status(404).json({ message: 'Correct answer not found' });
        }

        const correctAnswer = correctAnswerResults[0].answer;
        console.log(correctAnswer);

        // 查询听力原文
        const listeningTextQuery = 'SELECT text FROM texts WHERE question = ?';
        db.query(listeningTextQuery, [question], (err, listeningTextResults) => {
            if (err) {
                console.error('Database query failed:', err);
                return res.status(500).json({ message: 'Server error' });
            }

            if (listeningTextResults.length === 0) {
                return res.status(404).json({ message: 'Listening text not found' });
            }

            const listeningText = listeningTextResults[0].text;
            console.log(listeningText);

            // 返回结果
            res.json({ correctAnswer, listeningText });
        });
    });
});

///获取特定选项的解析
app.get('/api/analysis', (req, res) => {
    console.log("获取特定解析");
    const question = req.query.question;
    const options = req.query.options;
    console.log(question);
    console.log(options);

    if (!question || !options) {
        return res.status(400).json({ message: 'Question and options parameters are required' });
    }

    const analysisQuery = 'SELECT analysis FROM questions_analysis WHERE question = ? AND options = ?';
    db.query(analysisQuery, [question, options], (err, analysisResults) => {
        if (err) {
            console.error('Database query failed:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        if (analysisResults.length === 0) {
            return res.status(404).json({ message: 'Analysis not found' });
        }

        const analysis = analysisResults[0].analysis;
        console.log(analysis);

        // 返回结果
        res.json({ analysis });
    });
});


app.get('/api/student-answer', (req, res) => {
    const { name, question } = req.query;
    //console.log(question);

    if (!name || !question) {
        return res.status(400).json({ message: 'Name and question parameters are required' });
    }

    // 查询学生的 school_no, class_no 和 stu_no
    const studentInfoQuery = `SELECT school_no, class_no, stu_no FROM stu_class WHERE user = ?`;

    db.query(studentInfoQuery, [name], (err, studentInfoResults) => {
        if (err) {
            console.error('Database query failed:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        if (studentInfoResults.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        let { school_no, class_no, stu_no } = studentInfoResults[0];
        school_no = school_no.trim();
        class_no = class_no.trim();
        stu_no = stu_no.trim();
        console.log(school_no, class_no, stu_no);

        // 查询学生答案
        const studentAnswerQuery = `SELECT ${question} AS answer
                                    FROM gradeHave
                                    WHERE school_no = ? AND class_no = ? AND stu_no = ?`;


        console.log('Executing query:', studentAnswerQuery, 'with params:', [school_no, class_no, stu_no]);
        db.query(studentAnswerQuery, [school_no, class_no, stu_no], (err, studentAnswerResults) => {
            if (err) {
                console.error('Database query failed:', err);
                return res.status(500).json({ message: 'Server error' });
            }

            if (studentAnswerResults.length === 0) {
                console.log('是不是你');
                return res.status(404).json({ message: 'Student answer not found' });
            }

            const studentAnswer = studentAnswerResults[0].answer;
            console.log(studentAnswer);
            res.json({ answer: studentAnswer });
        });
    });
});

app.get('/api/peer-accuracy', (req, res) => {
    const { name, question } = req.query;
    console.log("peer", question);

    if (!name || !question) {
        return res.status(400).json({ message: 'Name and question parameters are required' });
    }

    // 查询学生的 school_no 和 class_no
    const studentInfoQuery = `SELECT school_no, class_no FROM stu_class WHERE user = ?`;

    db.query(studentInfoQuery, [name], (err, studentInfoResults) => {
        if (err) {
            console.error('Database query failed:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        if (studentInfoResults.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }


        let { school_no, class_no } = studentInfoResults[0];
        school_no = school_no.trim();
        class_no = class_no.trim();


        // 拼接列名
        const questionColumn = `${question}_score`;

        // 查询同伴正确率
        const peerAccuracyQuery = `SELECT AVG(CASE WHEN ${questionColumn} = 1 THEN 1 ELSE 0 END) AS accuracy
                                   FROM gradeHave
                                   WHERE school_no = ? AND class_no = ?`;

        db.query(peerAccuracyQuery, [school_no, class_no], (err, results) => {
            if (err) {
                console.error('Database query failed:', err);
                return res.status(500).json({ message: 'Server error' });
            }

            const accuracy = results[0].accuracy;
            console.log(accuracy);
            res.json({ accuracy });
        });
    });
});

app.get('/api/option-percentages', async (req, res) => {
    const question = req.query.question;
    const selectedClass = req.query.class;
    const school_no = selectedClass.charAt(0);
    const class_no = selectedClass.charAt(1);

    console.log("人数比", school_no);
    console.log("人数比", class_no);

    const questionColumn = `${question}_score`;
    const peerAccuracyQuery = `
        SELECT
            SUM(CASE WHEN ${questionColumn} = 1 THEN 1 ELSE 0 END) AS correct_count,
            COUNT(*) AS total_count
        FROM gradeHave
        WHERE school_no = ? AND class_no = ?
    `;

    db.query(peerAccuracyQuery, [school_no, class_no], (err, results) => {
        if (err) {
            console.error('Database query failed:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        const { correct_count, total_count } = results[0];
        console.log("正确人数", correct_count);
        console.log("总人数", total_count);
        const optionPercentages = `${correct_count}/${total_count}`;
        console.log("正确人数比例", optionPercentages);
        res.json({ optionPercentages });
    });
});

app.get('/api/option-counts', async (req, res) => {
    const question = req.query.question; // 例如: 'PART_I_1'
    const selectedClass = req.query.class;
    const school_no = selectedClass.charAt(0);
    const class_no = selectedClass.charAt(1);

    console.log(question);
    console.log(school_no);
    console.log(class_no);

    // 查询每个选项的选择人数
    const optionCountsQuery = `
        SELECT
            ${question} AS option_value,
            COUNT(*) AS count
        FROM
            gradeHave
        WHERE
            school_no = ? AND class_no = ? AND ${question} IS NOT NULL
        GROUP BY
            ${question}
    `;

    db.query(optionCountsQuery, [school_no, class_no], (err, results) => {
        if (err) {
            console.error('Database query failed:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        // 格式化结果为对象形式
        const optionCounts = results.reduce((acc, row) => {
            acc[row.option_value] = row.count;
            return acc;
        }, {});

        console.log("选择人数", optionCounts);
        res.json({ optionCounts });
    });
});

//对于没有听力原文或者阅读原文的题目来说
app.get('/api/question_single', (req, res) => {
    const { question } = req.query;

    if (!question) {
        return res.status(400).json({ message: 'Question parameter is required' });
    }

    // 查询正确答案
    const correctAnswerQuery = 'SELECT answer FROM correct_answers WHERE question = ?';
    db.query(correctAnswerQuery, [question], (err, correctAnswerResults) => {
        if (err) {
            console.error('Database query failed:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        if (correctAnswerResults.length === 0) {
            return res.status(404).json({ message: 'Correct answer not found' });
        }

        const correctAnswer = correctAnswerResults[0].answer;
        console.log(correctAnswer);
        res.json({ correctAnswer });
    });
});

// 获取所有班级的学生得分均分及错误表格
app.get('/part2_1/summary', (req, res) => {
    const sql = `
        SELECT
            AVG(score) AS averageScore,
            SUM(capital_name) AS capital_name,
            SUM(capital_first_word) AS capital_first_word,
            SUM(copy) AS copy,
            SUM(punctuation) AS punctuation,
            SUM(others) AS others
        FROM part2_1
    `;

    db.query(sql, (err, result) => {
        if (err) {
            console.error('获取总结数据失败:', err);
            res.status(500).send('服务器错误');
            return;
        }

        if (result.length === 0) {
            res.status(404).send('没有找到数据');
            return;
        }

        const data = result[0];
        res.send({
            averageScore: data.averageScore,
            errorCounts: {
                capital_name: data.capital_name,
                capital_first_word: data.capital_first_word,
                copy: data.copy,
                punctuation: data.punctuation,
                others: data.others
            }
        });
    });
});

// 获取张江校区（school_no=1）的数据
app.get('/part2_1/school/1', (req, res) => {
    const sql = `
        SELECT
            AVG(score) AS averageScore,
            SUM(capital_name) AS totalCapitalName,
            SUM(capital_first_word) AS totalCapitalFirstWord,
            SUM(copy) AS totalCopy,
            SUM(punctuation) AS totalPunctuation,
            SUM(others) AS totalOthers
        FROM part2_1
        WHERE school_no = 1
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('获取张江校区数据失败:', err);
            res.status(500).send('服务器错误');
            return;
        }

        if (results.length === 0) {
            res.status(404).send('没有找到数据');
            return;
        }

        const data = results[0];
        res.send({
            averageScore: data.averageScore,
            errorCounts: {
                capital_name: data.totalCapitalName,
                capital_first_word: data.totalCapitalFirstWord,
                copy: data.totalCopy,
                punctuation: data.totalPunctuation,
                others: data.totalOthers
            }
        });
    });
});

// 获取滨江校区（school_no=2）的数据
app.get('/part2_1/school/2', (req, res) => {
    const sql = `
        SELECT
            AVG(score) AS averageScore,
            SUM(capital_name) AS totalCapitalName,
            SUM(capital_first_word) AS totalCapitalFirstWord,
            SUM(copy) AS totalCopy,
            SUM(punctuation) AS totalPunctuation,
            SUM(others) AS totalOthers
        FROM part2_1
        WHERE school_no = 2
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('获取滨江校区数据失败:', err);
            res.status(500).send('服务器错误');
            return;
        }

        if (results.length === 0) {
            res.status(404).send('没有找到数据');
            return;
        }

        const data = results[0];
        res.send({
            averageScore: data.averageScore,
            errorCounts: {
                capital_name: data.totalCapitalName,
                capital_first_word: data.totalCapitalFirstWord,
                copy: data.totalCopy,
                punctuation: data.totalPunctuation,
                others: data.totalOthers
            }
        });
    });
});


// 筛选数据并计算错误类型总和和平均分
app.get('/part2_1/filter', (req, res) => {
    const { school_no, class_no } = req.query;

    if (!school_no || !class_no) {
        res.status(400).send('缺少筛选条件');
        return;
    }

    const sql = `
        SELECT
            capital_name,
            capital_first_word,
            copy,
            punctuation,
            others,
            score
        FROM part2_1
        WHERE school_no = ? AND class_no = ?
    `;

    db.query(sql, [school_no, class_no], (err, results) => {
        if (err) {
            console.error('筛选数据失败:', err);
            res.status(500).send('服务器错误');
            return;
        }

        if (results.length === 0) {
            res.status(404).send('没有找到数据');
            return;
        }

        const averageScore = results.reduce((sum, entry) => sum + parseFloat(entry.score), 0) / results.length;

        const errorCounts = {
            capital_name: results.reduce((sum, entry) => sum + (parseFloat(entry.capital_name) || 0), 0),
            capital_first_word: results.reduce((sum, entry) => sum + (parseFloat(entry.capital_first_word) || 0), 0),
            copy: results.reduce((sum, entry) => sum + (parseFloat(entry.copy) || 0), 0),
            punctuation: results.reduce((sum, entry) => sum + (parseFloat(entry.punctuation) || 0), 0),
            others: results.reduce((sum, entry) => sum + (parseFloat(entry.others) || 0), 0)
        };

        res.send({
            averageScore,
            errorCounts,
            results
        });
    });
});

// 获取所有的 school_no 和 class_no 组合
app.get('/part2_1/classes', (req, res) => {
    const sql = 'SELECT DISTINCT school_no, class_no FROM part2_1';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('获取班级数据失败:', err);
            res.status(500).send('服务器错误');
            return;
        }
        const classOptions = results.map(row => ({
            value: `${row.school_no}&${row.class_no}`,
            text: `school_no: ${row.school_no}, class_no: ${row.class_no}`
        }));
        res.send(classOptions);
    });
});


// 获取所有数据，供管理员使用
app.get('/part2_1/all', (req, res) => {
    const sql = `
        SELECT
            capital_name,
            capital_first_word,
            copy,
            punctuation,
            others,
            score
        FROM part2_1
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('获取所有数据失败:', err);
            res.status(500).send('服务器错误');
            return;
        }

        if (results.length === 0) {
            res.status(404).send('没有找到数据');
            return;
        }

        const averageScore = results.reduce((sum, entry) => sum + parseFloat(entry.score), 0) / results.length;

        const errorCounts = {
            capital_name: results.reduce((sum, entry) => sum + (parseFloat(entry.capital_name) || 0), 0),
            capital_first_word: results.reduce((sum, entry) => sum + (parseFloat(entry.capital_first_word) || 0), 0),
            copy: results.reduce((sum, entry) => sum + (parseFloat(entry.copy) || 0), 0),
            punctuation: results.reduce((sum, entry) => sum + (parseFloat(entry.punctuation) || 0), 0),
            others: results.reduce((sum, entry) => sum + (parseFloat(entry.others) || 0), 0)
        };

        res.send({
            averageScore,
            errorCounts,
            results
        });
    });
});

// 获取学生数据
app.get('/part2_1/:username', (req, res) => {
    const username = req.params.username;
    const sql = 'SELECT * FROM part2_1 WHERE user = ?';
    db.query(sql, [username], (err, result) => {
        if (err) {
            console.error('获取学生数据失败:', err);
            res.status(500).send('服务器错误');
            return;
        }
        if (result.length > 0) {
            const data = result[0];
            const base64Image = Buffer.from(data.image).toString('base64');
            data.image = base64Image;
            res.send(data);
        } else {
            res.status(404).send('哈哈哈');
        }
    });
});

// 获取班级的平均分
app.get('/part2_1/average/:school_no/:class_no', (req, res) => {
    const { school_no, class_no } = req.params;
    const sql = 'SELECT AVG(score) AS average FROM part2_1 WHERE school_no = ? AND class_no = ?';
    db.query(sql, [school_no, class_no], (err, result) => {
        if (err) {
            console.error('获取平均分失败:', err);
            res.status(500).send('服务器错误');
            return;
        }
        res.send(result[0]);
    });
});

// 获取老师权限
app.get('/teacher/:username', (req, res) => {
    const username = req.params.username;
    const sql = 'SELECT permission FROM teacher WHERE name = ?';
    db.query(sql, [username], (err, result) => {
        if (err) {
            console.error('获取教师数据失败:', err);
            res.status(500).send('服务器错误');
            return;
        }
        if (result.length > 0) {
            res.send(result[0]);
        } else {
            res.status(404).send('not found');
        }
    });
});


app.get('/part2_9/errors/:username', (req, res) => {
    const username = req.params.username;
    const sql = `
        SELECT 
            \`WordPhrase choice\`, \`Pronouns & Determiners\`, Verbs, 
            Conciseness, Style, \`Adverbs & Adjectives\`, Tense, Articles, \`Singular-Plural nouns\`, 
            Prepositions, Punctuation, \`Spellings & Typos\`, \`Vague Words\`, Contractions, 
            \`English Style-US\`, Conjunctions, Others, \`Capitalization & Spacing\`, \`Subject-verb agreement\`
        FROM part2_9 
        WHERE name = ?
    `;

    db.query(sql, [username], (err, result) => {
        if (err) {
            console.error('获取学生错误类型数量失败:', err);
            res.status(500).send('服务器错误');
            return;
        }

        if (result.length > 0) {
            res.send(result[0]);
        } else {
            res.status(404).send('没有找到数据');
        }
    });
});

app.get('/part2_9/errors/class/:school_no/:class_no', (req, res) => {
    const { school_no, class_no } = req.params;
    const sql = `
        SELECT 
            SUM(\`WordPhrase choice\`) AS \`WordPhrase choice\`, 
            SUM(\`Pronouns & Determiners\`) AS \`Pronouns & Determiners\`, 
            SUM(Verbs) AS Verbs,
            SUM(Conciseness) AS Conciseness, 
            SUM(Style) AS Style, 
            SUM(\`Adverbs & Adjectives\`) AS \`Adverbs & Adjectives\`, 
            SUM(Tense) AS Tense, 
            SUM(Articles) AS Articles, 
            SUM(\`Singular-Plural nouns\`) AS \`Singular-Plural nouns\`,
            SUM(Prepositions) AS Prepositions, 
            SUM(Punctuation) AS Punctuation, 
            SUM(\`Spellings & Typos\`) AS \`Spellings & Typos\`, 
            SUM(\`Vague Words\`) AS \`Vague Words\`, 
            SUM(Contractions) AS Contractions, 
            SUM(\`English Style-US\`) AS \`English Style-US\`, 
            SUM(Conjunctions) AS Conjunctions, 
            SUM(Others) AS Others, 
            SUM(\`Capitalization & Spacing\`) AS \`Capitalization & Spacing\`, 
            SUM(\`Subject-verb agreement\`) AS \`Subject-verb agreement\`
        FROM part2_9 
        WHERE school_no = ? AND class_no = ?
    `;

    db.query(sql, [school_no, class_no], (err, result) => {
        if (err) {
            console.error('获取班级错误类型数量失败:', err);
            res.status(500).send('服务器错误');
            return;
        }

        if (result.length > 0) {
            res.send(result[0]);
        } else {
            res.status(404).send('没有找到数据');
        }
    });
});

// 获取指定学生的图像数据
app.get('/part2_9/image/:name', (req, res) => {
    const name = req.params.name;
    const sql = 'SELECT image FROM part2_9 WHERE name = ?';
    db.query(sql, [name], (err, result) => {
        if (err) {
            console.error('获取图像数据失败:', err);
            res.status(500).send('服务器错误');
            return;
        }
        if (result.length > 0) {
            const image = result[0].image;
            if (image) {
                const base64Image = Buffer.from(image).toString('base64');
                res.send({ image: base64Image });
            } else {
                res.status(404).send('没有图像数据');
            }
        } else {
            res.status(404).send('没有找到数据');
        }
    });
});

// 获取班级的平均分和学生信息
app.get('/part2_9/filter', (req, res) => {
    const { school_no, class_no } = req.query;

    if (!school_no || !class_no) {
        res.status(400).send('缺少筛选条件');
        return;
    }

    const sql = `
        SELECT
            name,
            score,
            word_counts,
            sentence_counts
        FROM part2_9
        WHERE school_no = ? AND class_no = ?
    `;

    db.query(sql, [school_no, class_no], (err, results) => {
        if (err) {
            console.error('筛选数据失败:', err);
            res.status(500).send('服务器错误');
            return;
        }

        if (results.length === 0) {
            res.status(404).send('没有找到数据');
            return;
        }

        const scores = results.map(entry => ({ name: entry.name, score: entry.score }));
        const averageScore = scores.reduce((sum, entry) => sum + parseFloat(entry.score), 0) / scores.length;

        const wordCounts = results.map(entry => entry.word_counts);
        const sentenceCounts = results.map(entry => entry.sentence_counts);

        res.send({
            averageScore,
            scores,
            wordCounts,
            sentenceCounts
        });
    });
});

// 获取所有数据，供管理员使用
app.get('/part2_9/all', (req, res) => {
    const sql = `
        SELECT
            name,
            score,
            word_counts,
            sentence_counts
        FROM part2_9
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('获取所有数据失败:', err);
            res.status(500).json({ error: '获取所有数据失败' });
        } else {
            const scores = results.map(result => ({ name: result.name, score: result.score }));
            const wordCounts = results.map(result => result.word_counts);
            const sentenceCounts = results.map(result => result.sentence_counts);
            const averageScore = scores.reduce((sum, item) => sum + item.score, 0) / scores.length;

            res.json({ scores, wordCounts, sentenceCounts, averageScore });
        }
    });
});

// 获取所有数据的统计信息
app.get('/part2_9/overall', (req, res) => {
    const sql = `
        SELECT 
            AVG(score) AS averageScore,
            AVG(word_counts) AS averageWordCounts,
            AVG(sentence_counts) AS averageSentenceCounts
        FROM part2_9
    `;

    db.query(sql, (err, result) => {
        if (err) {
            console.error('获取所有数据统计失败:', err);
            res.status(500).send('服务器错误');
            return;
        }

        const averages = result[0];

        // 获取错误类型数量
        const errorTypesSql = `
            SELECT 
                SUM(\`WordPhrase choice\`) AS \`WordPhrase choice\`, 
                SUM(\`Pronouns & Determiners\`) AS \`Pronouns & Determiners\`, 
                SUM(Verbs) AS Verbs,
                SUM(Conciseness) AS Conciseness, 
                SUM(Style) AS Style, 
                SUM(\`Adverbs & Adjectives\`) AS \`Adverbs & Adjectives\`, 
                SUM(Tense) AS Tense, 
                SUM(Articles) AS Articles, 
                SUM(\`Singular-Plural nouns\`) AS \`Singular-Plural nouns\`,
                SUM(Prepositions) AS Prepositions, 
                SUM(Punctuation) AS Punctuation, 
                SUM(\`Spellings & Typos\`) AS \`Spellings & Typos\`, 
                SUM(\`Vague Words\`) AS \`Vague Words\`, 
                SUM(Contractions) AS Contractions, 
                SUM(\`English Style-US\`) AS \`English Style-US\`, 
                SUM(Conjunctions) AS Conjunctions, 
                SUM(Others) AS Others, 
                SUM(\`Capitalization & Spacing\`) AS \`Capitalization & Spacing\`, 
                SUM(\`Subject-verb agreement\`) AS \`Subject-verb agreement\`
            FROM part2_9
        `;

        db.query(errorTypesSql, (err, errorResult) => {
            if (err) {
                console.error('获取所有数据错误类型数量失败:', err);
                res.status(500).send('服务器错误');
                return;
            }

            res.json({
                averageScore: averages.averageScore,
                averageWordCounts: averages.averageWordCounts,
                averageSentenceCounts: averages.averageSentenceCounts,
                errors: errorResult[0]
            });
        });
    });
});

app.get('/part2_9/campus/:school_no', (req, res) => {
    const { school_no } = req.params;

    // 获取校区的平均数据
    const avgSql = `
        SELECT 
            AVG(score) AS averageScore, 
            AVG(word_counts) AS averageWordCounts, 
            AVG(sentence_counts) AS averageSentenceCounts
        FROM part2_9
        WHERE school_no = ?
    `;

    db.query(avgSql, [school_no], (err, avgResult) => {
        if (err) {
            console.error('获取校区数据失败:', err);
            res.status(500).send('服务器错误');
            return;
        }

        if (avgResult.length === 0) {
            res.status(404).send('没有找到数据');
            return;
        }

        const averages = avgResult[0];

        // 获取校区的错误类型数据
        const errorTypesSql = `
            SELECT 
                SUM(\`WordPhrase choice\`) AS \`WordPhrase choice\`, 
                SUM(\`Pronouns & Determiners\`) AS \`Pronouns & Determiners\`, 
                SUM(Verbs) AS Verbs,
                SUM(Conciseness) AS Conciseness, 
                SUM(Style) AS Style, 
                SUM(\`Adverbs & Adjectives\`) AS \`Adverbs & Adjectives\`, 
                SUM(Tense) AS Tense, 
                SUM(Articles) AS Articles, 
                SUM(\`Singular-Plural nouns\`) AS \`Singular-Plural nouns\`,
                SUM(Prepositions) AS Prepositions, 
                SUM(Punctuation) AS Punctuation, 
                SUM(\`Spellings & Typos\`) AS \`Spellings & Typos\`, 
                SUM(\`Vague Words\`) AS \`Vague Words\`, 
                SUM(Contractions) AS Contractions, 
                SUM(\`English Style-US\`) AS \`English Style-US\`, 
                SUM(Conjunctions) AS Conjunctions, 
                SUM(Others) AS Others, 
                SUM(\`Capitalization & Spacing\`) AS \`Capitalization & Spacing\`, 
                SUM(\`Subject-verb agreement\`) AS \`Subject-verb agreement\`
            FROM part2_9
            WHERE school_no = ?
        `;

        db.query(errorTypesSql, [school_no], (err, errorResult) => {
            if (err) {
                console.error('获取校区错误类型数据失败:', err);
                res.status(500).send('服务器错误');
                return;
            }

            res.json({
                averageScore: averages.averageScore,
                averageWordCounts: averages.averageWordCounts,
                averageSentenceCounts: averages.averageSentenceCounts,
                errors: errorResult[0]
            });
        });
    });
});

// 获取教师权限
app.get('/teacher/:username', (req, res) => {
    const username = req.params.username;
    const sql = 'SELECT permission FROM teacher WHERE name = ?';
    db.query(sql, [username], (err, result) => {
        if (err) {
            console.error('获取教师数据失败:', err);
            res.status(500).send('服务器错误');
            return;
        }
        if (result.length > 0) {
            res.send(result[0]);
        } else {
            res.status(404).send('not found');
        }
    });
});

// 获取所有的 school_no 和 class_no 组合
app.get('/part2_9/classes', (req, res) => {
    const sql = 'SELECT DISTINCT school_no, class_no FROM part2_9';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('获取班级数据失败:', err);
            res.status(500).send('服务器错误');
            return;
        }
        res.send(results);
    });
});

// 获取学生数据
app.get('/part2_9/:username', (req, res) => {
    const username = req.params.username;
    const sql = 'SELECT * FROM part2_9 WHERE name = ?';
    db.query(sql, [username], (err, result) => {
        if (err) {
            console.error('获取学生数据失败:', err);
            res.status(500).send('服务器错误');
            return;
        }
        if (result.length > 0) {
            const data = result[0];
            if (data.image) {
                const base64Image = Buffer.from(data.image).toString('base64');
                data.image = base64Image;
            } else {
                console.warn('学生数据中没有图像数据:', username);
            }
            res.send(data);
        } else {
            res.status(404).send('没有找到数据');
        }
    });
});


// 作文获取同伴均分
app.get('/part2_9/average/:school_no/:class_no', (req, res) => {
    const { school_no, class_no } = req.params;
    const sql = 'SELECT AVG(score) AS average FROM part2_9 WHERE school_no = ? AND class_no = ?';
    db.query(sql, [school_no, class_no], (err, result) => {
        if (err) {
            console.error('获取平均分失败:', err);
            res.status(500).send('服务器错误');
            return;
        }
        res.send(result[0]);
    });
});

app.listen(3000, () => {
    console.log('服务器运行在 http://localhost:3000');
});


