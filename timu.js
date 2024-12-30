// 从JSON文件中加载题目数据
fetch('daolun.json')
    .then(response => response.json())
    .then(data => {
        const questions = data.questions;
        let currentQuestionIndex = 0;
        let totalQuestions = questions.length;
        let answeredCount = 0;  // 用户完成的题目数量
        let totalScore = 0;     // 用户总得分

        const quizContainer = document.getElementById('quiz-container');
        const submitButton = document.getElementById('submit-button');
        const answeredCountElement = document.getElementById('answered-count');
        const scoreElement = document.getElementById('score');
        const accuracyElement = document.getElementById('accuracy');

        // 加载当前题目
        function loadQuestion() {
            if (currentQuestionIndex >= totalQuestions) {
                // 如果所有题目已完成，显示最终结果
                quizContainer.innerHTML = `
                    <p>恭喜你完成了所有题目！</p>
                    <p>你的总分是：${totalScore} 分</p>
                    <p>正确率：${Math.round((totalScore / totalQuestions) * 100)}%</p>
                `;
                submitButton.style.display = 'none';
                return;
            }

            const question = questions[currentQuestionIndex];

            // 清空之前的题目内容
            quizContainer.innerHTML = '';

            // 创建题目标题，显示题号
            const questionTitle = document.createElement('h3');
            questionTitle.textContent = `第 ${currentQuestionIndex + 1} 题: ${question.title}`;
            quizContainer.appendChild(questionTitle);

            // 创建选项列表
            const optionsList = document.createElement('ul');
            question.options.forEach((option, index) => {
                const optionItem = document.createElement('li');
                let inputType = 'radio';  // 默认为单选题
                if (question.type === 'multiple') {
                    inputType = 'checkbox';  // 如果是多选题，使用复选框
                }
                const radioInput = document.createElement('input');
                radioInput.type = inputType;
                radioInput.name = 'answer';
                radioInput.value = option;
                radioInput.id = `option-${index}`;
                optionItem.appendChild(radioInput);

                const label = document.createElement('label');
                label.htmlFor = `option-${index}`;
                label.textContent = option;
                optionItem.appendChild(label);

                optionsList.appendChild(optionItem);
            });
            quizContainer.appendChild(optionsList);

            // 创建反馈区域
            const feedback = document.createElement('div');
            feedback.classList.add('feedback');
            quizContainer.appendChild(feedback);

            // 绑定提交事件监听器
            submitButton.addEventListener('click', handleSubmission);
        }

        // 处理提交逻辑
        function handleSubmission() {
            const selectedOptions = document.querySelectorAll('input[name="answer"]:checked');
            if (selectedOptions.length === 0) {
                alert('请选择一个答案！');
                return;
            }

            const question = questions[currentQuestionIndex];
            let isCorrect = true;

            // 检查用户选择的答案是否正确
            if (question.type === 'single') {
                // 单选题：只需检查选中的选项是否与正确答案匹配
                const userAnswer = selectedOptions[0].value;
                isCorrect = userAnswer === question.options[question.correctAnswer];
            } else if (question.type === 'multiple') {
                // 多选题：检查所有选中的选项是否与正确答案完全匹配
                const correctAnswers = question.correctAnswer.map(index => question.options[index]);
                const userAnswers = Array.from(selectedOptions).map(option => option.value);
                isCorrect = JSON.stringify(correctAnswers.sort()) === JSON.stringify(userAnswers.sort());
            }

            // 更新答题进度和得分
            answeredCount++;
            answeredCountElement.textContent = answeredCount;

            if (isCorrect) {
                totalScore++;
                scoreElement.textContent = totalScore;
            }

            // 计算正确率
            const accuracy = Math.round((totalScore / answeredCount) * 100);
            accuracyElement.textContent = `${accuracy}%`;

            // 显示反馈
            const feedback = quizContainer.querySelector('.feedback');
            feedback.classList.remove('show');  // 移除之前的反馈
            feedback.classList.add(isCorrect ? 'correct' : 'incorrect');
            feedback.textContent = isCorrect ? '回答正确！' : `回答错误，正确答案是：${question.explanation}`;
            feedback.classList.add('show');

            // 根据回答是否正确，设置不同的跳转时间
            const delayTime = isCorrect ? 2000 : 7000;  // 正确2秒，错误7秒

            // 自动加载下一题
            setTimeout(() => {
                currentQuestionIndex++;
                loadQuestion();
            }, delayTime);  // 根据回答情况设置延迟时间
        }

        // 初始化加载第一题
        loadQuestion();
    })
    .catch(error => {
        console.error('加载题目数据失败:', error);
        alert('加载题目数据失败，请稍后再试。');
    });