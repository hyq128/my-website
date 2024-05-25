const express = require('express');
const path = require('path');
const http = require('http');
const fs = require('fs');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const leaderboardFile = 'leaderboard.json';
// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'public')));

// 主页路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 确保服务器返回答案是否正确
const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.post('/submit-answer', (req, res) => {
  const { question, answer } = req.body;
  const correctAnswer = question.answer;
  let correct = false;

  if (answer === correctAnswer) {
      correct = true;
  }

  res.json({ correct: correct });
});

let leaderboard = [];
io.on('connection', (socket) => {
  console.log(322)
  socket.on('submit-result', (data) => {
      leaderboard.push(data);
      leaderboard.sort((a, b) => {
        if (a.score === b.score) {
          return a.time - b.time;
        }
        return b.score - a.score;
      });
      fs.writeFileSync(leaderboardFile, JSON.stringify(leaderboard, null, 2));
      io.emit('leaderboard', leaderboard);
  });
  socket.on('request-leaderboard', () => {
    console.log('Leaderboard requested');
    /*522新添加*/
    socket.emit('update-leaderboard', leaderboard);
    /*522删减 io.emit('update-leaderboard', leaderboard);*/
    console.log('000000')
});
});

// 启动服务器
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
