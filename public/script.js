document.addEventListener('DOMContentLoaded', function () {
    const leaderboardBody = document.getElementById('leaderboard-body');
    
});

document.addEventListener('DOMContentLoaded', function () {
    let navbarItems = document.querySelectorAll('.navbar a');
    navbarItems.forEach(item => {
        item.addEventListener('click', function () {
            navbarItems.forEach(navItem => navItem.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // 设置默认活动状态
    let currentPage = window.location.pathname.split('/').pop();
    navbarItems.forEach(item => {
        if (item.getAttribute('href') === currentPage) {
            item.classList.add('active');
        }
    });

    // Initialize Typed.js animation
    if (document.querySelector('.multiple-text')) {
        new Typed('.multiple-text', {
            strings: ["Student", 'Sports Enthusiast', "TikTok User"],
            typeSpeed: 100,
            backSpeed: 100,//deleted
            backDelay: 1000,
            loop: true//repeat typing
        });
    }

    // Quiz functionality
    const startBtn = document.getElementById('start-btn');
    const quizBox = document.querySelector('.quiz-box');
    const questionBox = document.querySelector('.question-box');
    const questionTitle = document.getElementById('question-title');
    const questionText = document.getElementById('question-text');
    const options = document.querySelectorAll('.option');
    const timer = document.getElementById('time-left');
    const submitBtn = document.getElementById('submit-btn');
    const resultModal = document.getElementById('result-modal');
    const resultText = document.getElementById('result-text');
    const nextBtn = document.getElementById('next-btn');
    const leaderboardBody = document.getElementById('leaderboard-body');
    const socket = io("http://localhost:3000")

    const questions = [
        {
            text: "What is the chemical symbol for gold?",
            options: { a: "Au", b: "Ag", c: "Fe", d: "Cu" },
            answer: "a"
        },
        {
            text: "Who painted the Mona Lisa?",
            options: { a: "Vincent van Gogh", b: " Pablo Picasso", c: " Leonardo da Vinci", d: "Michelangelo" },
            answer: "c"

        },
        {
            text: "Which planet is known as the Red Planet?",
            options: { a: "Earth", b: "Mars", c: "Jupiter", d: "Venus" },
            answer: "b"
        },
        {
            text: "Which of the following special telephone numbers is for the fire alarm?",
            options: { a: "119", b: "120", c: "110", d: "114" },
            answer: "a"
        },
        {
            text: "Where is the birthplace of the Olympic Games?",
            options: { a: "Ancient Rome", b: "Ancient Greece", c: "Ancient China", d: "Babylon" },
            answer: "b"
        },
        {
            text: "Where did the sport basketball first originate?",
            options: { a: "America", b: "China", c: "Rome", d: "Greece" },
            answer: "a"
        },
        {
            text: "In which of the following countries is it very taboo to use portraits as trademarks?",
            options: { a: "America", b: "UK", c: "China", d: "Greece" },
            answer: "b"
        },
        {
            text: "Which is the smallest of the world's four oceans?",
            options: { a: "Pacific", b: "Atlantic", c: "Indian Ocean", d: "Arctic Ocean" },
            answer: "d"
        
        },
        {
            text: "Tulips are the symbol of which country?",
            options: { a: "America", b: "Norway", c: "Denmark", d: "Netherlands" },
            answer: "d"
        },
        {
            text: "How many continents are there on Earth?",
            options: { a: "5", b: "6", c: "7", d: "8" },
            answer: "c"
        },
        
    ];

    let currentQuestion = 0;
    let score = 0;
    let timerInterval;
    let timeLeft = 15;
    let totalTime = 0;
    let totalTimerInterval;
    let username;
    
    //client
    //add eventlistener to startBtn,username->timer->question
    startBtn.addEventListener('click', () => {
        username = document.getElementById('username').value;//retrieves value,assign it
        totalTimerInterval = setInterval(() => {
            totalTime += 0.01; 
        }, 10);//timer
        
        if (username.trim() === "") {
            alert("Please enter your name");
            return;
        }//validate username
        quizBox.style.display = 'none';//hide wellcome quiz
        questionBox.style.display = 'block';//show container
        loadQuestion();
    });

    function loadQuestion() {
        if (currentQuestion < questions.length) {//检查，加载问题
            const question = questions[currentQuestion];
            questionTitle.textContent = `Question ${currentQuestion + 1}:`;
            questionText.textContent = question.text;
            options.forEach((option, index) => {//Traverse and set each option
                const optionKey = Object.keys(question.options)[index];
                option.textContent = `${optionKey.toUpperCase()}: ${question.options[optionKey]}`;
                option.dataset.value = optionKey;
                option.classList.remove('selected');
            });
            timeLeft = 15;
            timer.textContent = timeLeft;//update timer
            clearInterval(timerInterval);
            timerInterval = setInterval(() => {
                timeLeft--;
                timer.textContent = timeLeft;//减少秒并且更新
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    submitAnswer();//超时就调用提交函数
                }
            }, 1000);
        } else {//问题全部显示完，结束测验
            endQuiz();
        }
    }

    function submitAnswer() {
        const selectedOption = document.querySelector('.option.selected');
        let answer = selectedOption ? selectedOption.dataset.value : null;
        let correct = false;
        if (answer === questions[currentQuestion].answer) {
            correct = true;
            score++;
        }
        resultText.textContent = correct ? 'Congratulations, you answered correctly!' : 'Unfortunately, your answer is incorrect';
        resultModal.style.display = 'flex';
    }

    options.forEach(option => {
        option.addEventListener('click', () => {
            options.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
        });
    });

    submitBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        submitAnswer();
    });

    nextBtn.addEventListener('click', () => {
        currentQuestion++;
        resultModal.style.display = 'none';
        loadQuestion();
    });

    //server，
    function endQuiz() {
        clearInterval(totalTimerInterval);
        questionBox.innerHTML = `<h2>Quiz Completed!</h2><p>Your score is ${score} out of ${questions.length}.</p><p>Total time taken: ${totalTime.toFixed(2)} seconds</p>`;
        
        const userResult = { username: username, score: score, time: totalTime.toFixed(2) };
        socket.emit('submit-result', userResult); //发送用户结果到服务器
        console.log(4234234324)
        socket.emit('request-leaderboard');//请求排行榜信息
        displayLeaderboard();
        console.log(234242342)
    }
    /*522新添加*/
    //监听从服务器发送的update-leaderboard事件
    socket.on('update-leaderboard', (leaderboard) => {
        leaderboardBody.innerHTML = `
            <h2>Leaderboard</h2>
            <table id="leaderboard-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Username</th>
                        <th>Score</th>
                        <th>Time (seconds)</th>
                    </tr>
                </thead>
                <tbody id="leaderboard-body-table">
                </tbody>
            </table>
        `;
        //获取表体部分引用
        const leaderboardBodyTable = document.getElementById('leaderboard-body-table');
//遍历排行榜数据并动态添加行
        leaderboard.forEach((user, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${user.username}</td>
                <td>${user.score}</td>
                <td>${user.time}</td>
            `;
            leaderboardBodyTable.appendChild(row);
        });
    });
});

   /* function displayLeaderboard() {  
        socket.on('update-leaderboard', (leaderboard) => {
            console.log('000088888')
            console.log('leaderboadrd:', leaderboard)
            leaderboard.sort((a, b) => {
                if (a.score === b.score) {
                    return parseFloat(a.time) - parseFloat(b.time);
                }
                return b.score - a.score;
            });
    
            leaderboardBody.innerHTML = '';
            console.log(111)
            let currentRank = 0;
            let prevScore = -1;
            let prevTime = Number.MAX_VALUE;
            leaderboard.forEach((user, index) => {
                // console.log(user)
                if (user.score !== prevScore || parseFloat(user.time) !== prevTime) {
                    currentRank = index + 1;
                    prevScore = user.score;
                    prevTime = parseFloat(user.totaltime);
                }
                const row = `
                    <tr>
                        <td>${currentRank}</td>
                        <td>${user.username}</td>
                        <td>${user.score}</td>
                        <td>${user.time} seconds</td>
                    </tr>
                `;
                console.log(user.username);
                console.log(user.score)
                if (user.name === username) {
                    leaderboardBody.innerHTML += `<tr style="background-color: #f0f0f0">${row}</tr>`;
                } else {
                    leaderboardBody.innerHTML += row;
                }
            });
            console.log(leaderboardBody)
        });
    }
});*/
