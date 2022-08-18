const e = require('express');
const express = require('express');
const app = express()
app.set('view engine', 'ejs');
const http = require('http').createServer(app);
const {Server} = require('socket.io');
const io = new Server(http)

app.use(express.static(__dirname + "/public"));

http.listen(8080,()=>{
})

app.get('/',function(요청,응답){  
  응답.sendFile(__dirname + ('/views/index.html'))
})


let roomDataArr = []
let user = []
let CountArr = []
let RoomCount = 1
io.on('connection',function(socket){
   socket.on('nickname',(data)=>{
    user.push(
      {
        'nickname' : data,
        'id' : socket.id,
        'joinedRoom' : ''  
      }
    )
    //애들이 들어올때마다 유저 닉네임 쏴주면
    //다업뎃 되는데?
    io.emit('userList',user)
  })
  //방생성 버튼이 눌리면 방 번호와 유저 정보 보내주기
  socket.on('createRoom',function(data){
    let {방제목,방비밀번호} = data
    if(CountArr.includes(RoomCount)){
      RoomCount +=1
      CountArr.push(RoomCount)
    }else{
      CountArr.push(RoomCount)
    }
    socket.join(`room${RoomCount}`)
    //유저 닉네임과 방 생성 id가 일치하는 이름만 빼기(방 생성자를 저장하기 위한..)    
    let userName  = user.filter(e=>{
      if(e.id === socket.id) return e.nickname  
    })
    //방 정보 사용자에게 내보내기
    let roomData ={
      'roomNumber' : `room${RoomCount}`,
      'player' : userName[0] ? userName[0].nickname : '이름 안정했자나',
      'roomName' : 방제목,
      'password' : 방비밀번호,
      'id' : socket.id
    }
    user.forEach(e=>{
      if(socket.id === e.id) {
        e.joinedRoom = `room${RoomCount}`
      }
    })
    roomDataArr.push(roomData)
    io.emit('createRoom',roomData)
    io.to(socket.id).emit('oneCreateRoom',roomData)
  })

  
  //소켓을 나가면 유저 데이터를 없애줌
  socket.on("disconnect", (data) => {
    //유저가 나가면 나간 유저 배열 뒤져서 삭제하기
     user.forEach((e,i)=>{
      if(e.id === socket.id && io.sockets.adapter.rooms.get(e.joinedRoom) === undefined){
        user.splice(i,1)
        io.emit('deleteRoom',e.joinedRoom)
        roomDataArr.forEach((room,i)=>{
        if(room.roomNumber === e.joinedRoom){
          roomDataArr.splice(i,1)        
        }
        io.emit('disconnectUser',e.nickname)
        console.log('닉네임',e.nickname)
      })}else if(e.id === socket.id){
        user.splice(i,1)
        io.emit('disconnectUser',e.nickname)
        console.log('닉네임',e.nickname)
      }
     })
  });

  socket.on('joinRoom',(data)=>{
    roomDataArr.forEach(room=>{
      let {roomNumber,password} = room
      if(data === roomNumber && password === '' ){
        socket.join(data)
        io.to(socket.id).emit('noPassword',data)
        user.forEach(e=>{
          if(socket.id === e.id) {
            e.joinedRoom = roomNumber
          }
        })
      }else if(data === roomNumber && password !== ''){
        io.to(socket.id).emit('roomPassword', [password,data])
      }
    })
  })

  socket.on('passwordMatch',(room)=>{
    user.forEach(e=>{
      if(socket.id === e.id) {
        e.joinedRoom = room
      }
    })
    socket.join(room)
  })

  socket.on('leaveRoom',(data)=>{
    socket.leave(data)
    if(io.sockets.adapter.rooms.get(data) === undefined){
      io.emit('deleteRoom',data)
      roomDataArr.forEach((e,i)=>{
        if(e.roomNumber === data){
          roomDataArr.splice(i,1)
        }
      })  
    }
  })
    roomDataArr[0] && io.to(socket.id).emit('roomsData',roomDataArr)
})
  