const e = require('express');
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
let roomDataArr = []
let user = []
let CountArr = []
let RoomCount = 1
io.on('connection',function(socket){
  //유저 데이터 받고 유저 목록 보내기
  socket.on('nickname',(data)=>{
    user.push(
      {
        'nickname' : data,
        'id' : socket.id
      }
    )
    //애들이 들어올때마다 유저 닉네임 쏴주면
    //다업뎃 되는데?
    io.emit('userList',user)
  })
  //방생성 버튼이 눌리면 방 번호와 유저 정보 보내주기
  
  socket.on('createRoom',function(data){
    if(CountArr.includes(RoomCount)){
      RoomCount +=1
      CountArr.push(RoomCount)
    }else{
      CountArr.push(RoomCount)
    }
    socket.join(`room ${RoomCount} `)
    //유저 닉네임과 방 생성 id가 일치하는 이름만 빼기(방 생성자를 저장하기 위한..)    
    let userName  = user.filter(e=>{
      if(e.id === socket.id) return e.nickname  
    })
    //방 정보 사용자에게 내보내기
    let roomData ={
      'title' : `room ${RoomCount}`,
      'player' : userName[0] ? userName[0].nickname : '너이름안정해써'
    }
    roomDataArr.push(roomData)
    io.emit('createRoom',roomData)
  })
    roomDataArr[0] && io.to(socket.id).emit('roomData',[roomDataArr,user])
})
