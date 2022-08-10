const express = require('express');
const app = express()
app.set('view engine', 'ejs');
const http = require('http').createServer(app);
const {Server} = require('socket.io');
const io = new Server(http)

app.use(express.static(__dirname + "/public"));

http.listen(8080,()=>{
  console.log('8080포트로 접속완료')
})

app.get('/',function(요청,응답){
  응답.render('index.ejs')
})

io.on('connection',function(socket){
  console.log(socket.id,'접속완료')
  socket.on('user_send',function(data){
    console.log(data)
    io.emit('방송','안녕..?')
  })
})
