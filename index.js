const Room = require('./class')
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
  //유저가 들어오면 유저목록과 생성된 방정보 쏴주기
  user[0] && io.emit('userList',user)
  roomDataArr[0] && io.to(socket.id).emit('roomsData',roomDataArr)
  //유적 닉네임 입력하면 유저arr에 넣어주기
   socket.on('nickname',(data)=>{
    user.push(
      {
        'nickname' : data,
        'id' : socket.id,
        'joinedRoom' : ''  
      }
    )
    //애들이 들어올때마다 유저 닉네임 쏴주기
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
    //유저 닉네임과 방   생성 id가 일치하는 이름만 빼기(방 생성자를 저장하기 위한..)    
    let userName  = user.reduce((acc,cur)=>{
      if(cur.id === socket.id){
        acc = cur
      }
      return acc
    })
    //방 정보 사용자에게 내보내기
    let roomData ={
      'roomNumber' : `room${RoomCount}`,
      'player' : {},
      'roomName' : 방제목,
      'password' : 방비밀번호,
      'participants' : 1,
      'id' : socket.id
    }
    //플레이어 정보
    roomData.player[socket.id] = {
      'nickname' : userName.nickname,
      'ready': false,
      'liar' : false,
      'id' : socket.id,
      'playNumber' : 1
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
      //소켓아이디가 일치하고 참가한 방이 없을때
      if(e.id === socket.id && e.joinedRoom === ''){
        console.log('방이없음')
        io.emit('disconnectUser',e.nickname)
        user.splice(i,1)
        //소켓 아이디가 일치하고 참가한 방이 있는데 방의 마지막 유저일때
      }else if(e.id === socket.id && io.sockets.adapter.rooms.get(e.joinedRoom) === undefined){
        console.log('방이있고 방이없어짐')
        io.emit('deleteRoom',e.joinedRoom)
        io.emit('disconnectUser',e.nickname)
        roomDataArr.forEach((room,i)=>{
          let {participants,roomNumber} = room
          if(roomNumber === e.joinedRoom){
            roomDataArr.splice(i,1)
            room.participants -= 1
            user.splice(i,1)
          }
        })
        //소켓 아이디 일치하고 참가한 방이 있을때
      }else if(e.id === socket.id && e.joinedRoom !== ''){
        console.log('방이있기만함')
        roomDataArr.forEach((room,i)=>{
          let {roomNumber} = room
          if(roomNumber === e.joinedRoom){
            room.participants -= 1
            user.splice(i,1)       
          }
        })
      }
    })
  });
//방에 접속하려는 유저 패스워드가 맞는지 틀린지 확인하기
  socket.on('joinRoom',(data)=>{
    roomDataArr.forEach((room)=>{
      let {roomNumber,password} = room
      //패스워드가 없으면 접속시키기
      if(data === roomNumber && password === ''){
        socket.join(data)
        io.to(socket.id).emit('noPassword',data)
        user.forEach(user=>{
          let {nickname,id} = user
          if(socket.id === id) {
            room.participants ++
            room.player[socket.id] = {
              nickname: nickname,
              id: socket.id,
              ready: false,
              liar: false,
              playNumber : room.participants
            }
            user.joinedRoom = roomNumber
          }
        })
      }else if(data === roomNumber && password !== ''){
        io.to(socket.id).emit('roomPassword', [password,data])
      }
      console.log(roomDataArr[0].participants)
    })
  })
//패스워드가 일치하면 접속시키기
  socket.on('passwordMatch',(room)=>{
    user.forEach(e=>{
      if(socket.id === e.id) {
        e.joinedRoom = room
      }
    })
    socket.join(room)
  })
//방 나가기 버튼을 클릭하면 유저 목록과 방데이터에서 제거
  socket.on('leaveRoom',(data)=>{
    socket.leave(data)
    if(io.sockets.adapter.rooms.get(data) === undefined){
      io.emit('deleteRoom',data)
      roomDataArr.forEach((room,i)=>{
        let {roomNumber,joinedRoom,participants} = room
        if(roomNumber === data){
          joinedRoom = ''
          roomDataArr.splice(i,1)
        }
      })  
    }else{
      roomDataArr.forEach((room,i)=>{
        let {roomNumber,joinedRoom,participants} = room
        if(roomNumber === data){
          joinedRoom = ''
          room.participants -= 1
        }
      })
    }
  })

  socket.on('ready',(data)=>{
    roomDataArr.forEach(room=>{
      let {player} = room
      if(socket.id === player[socket.id]?.id){
        player[socket.id].ready = player[socket.id].ready ? false : true
        io.to(data).emit('ready',player[socket.id])  
      }
    })
  })
})
  