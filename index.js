const express = require('express');
const app = express()
app.set('view engine', 'ejs');
const http = require('http').createServer(app);
const {Server} = require('socket.io');
const io = new Server(http)
const word = require('./word')
app.use(express.static(__dirname + "/public"));

http.listen(8080,()=>{
})

app.get('/',function(요청,응답){  
  응답.sendFile(__dirname + ('/views/index.html'))
})

let roomDataObj = {}
let user = {}
let CountArr = []
let RoomCount = 1
function numberAssignment(rooms){
  let returnNumber 
  let player = Object.values(rooms)
  //정렬해주고
  player.sort((a,b)=>{
    return a.playNumber - b.playNumber 
  })
  for(let i = 0 ;  i < 8; i++){
    //번호가 없으면 그대로 푸쉬
    if(player[i]?.playNumber === undefined){
      returnNumber = i+1
      break
    //번호가 있긴한데 일치하지 않으면 푸쉬
    }else if(player[i]?.playNumber !== i + 1){
      returnNumber = i+1  
      break
    }
  }
  return returnNumber
}
io.on('connection',function(socket){
  //유저가 들어오면 유저목록과 생성된 방정보 쏴주기
  
  Object.keys(user).length !== 0 && io.emit('userList',user)
  Object.keys(user).length !== 0 && io.to(socket.id).emit('roomsData',roomDataObj)
  //유적 닉네임 입력하면 유저arr에 넣어주기
   socket.on('nickname',(data)=>{
    user[socket.id] = {
        'nickname' : data,
        'id' : socket.id,
        'joinedRoom' : ''  
      }
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
    let roomData ={
      'roomNumber' : `room${RoomCount}`,
      'player' : {},
      'roomName' : 방제목,
      'password' : 방비밀번호,
      'participants' : 1,
      'readyUser' : 0,
      'voteArr' : [],
      'category' : null,
      'start' : false
    }
    roomData.player[socket.id] = {
      'nickname' : user[socket.id].nickname,
      'ready': false,
      'liar' : false,
      'id' : socket.id,
      'playNumber' : numberAssignment(roomData.player)
    }
    user[socket.id].joinedRoom = `room${RoomCount}` 
    roomDataObj[`room${RoomCount}`] = roomData
    io.emit('createRoom',roomData)
    io.to(socket.id).emit('oneCreateRoom',roomData)
  })

  
  //소켓을 나가면 유저 데이터를 없애줌
  socket.on("disconnect", (data) => {
    //유저가 나가면 나간 유저 배열 뒤져서 삭제하기
    if(user[socket.id]?.joinedRoom === ''){
      //방없을때
      io.emit('disconnectUser',user[socket.id].nickname)
      delete user[socket.id]
    }else if(io.sockets.adapter.rooms.get(user[socket.id]?.joinedRoom) === undefined){
      //방 마지막 유저일때
      delete roomDataObj[user[socket.id]?.joinedRoom]
      io.emit('deleteRoom',user[socket.id]?.joinedRoom)
      io.emit('disconnectUser',user[socket.id]?.nickname)
      delete user[socket.id]
    }else if(user[socket.id]?.joinedRoom !== ''){
      //방이 있으나 마지막 유저는 아님
      io.emit('disconnectUser',user[socket.id].nickname)
      delete roomDataObj[user[socket.id]?.joinedRoom].player[socket.id]
      roomDataObj[user[socket.id]?.joinedRoom].participants -=1
      delete user[socket.id]
    }
  });
//방에 접속하려는 유저 패스워드가 맞는지 틀린지 확인하기
  socket.on('joinRoom',(data)=>{
    //패스워드가없으면
    if(roomDataObj[data].start) return io.to(socket.id).emit('alert','겜중이야')
    if(roomDataObj[data].participants  === 8) return io.to(socket.id).emit('alert','방이 꽉찼습니다.')
    if(roomDataObj[data].roomNumber === data && roomDataObj[data].password === ''){
      socket.join(data)
      roomDataObj[data].participants ++
      roomDataObj[data].player[socket.id] = {
        nickname: user[socket.id] === undefined ? user[socket.id].nickname : user[socket.id].nickname = '오류',
        id: socket.id,
        ready: false,
        liar: false,
        playNumber : numberAssignment(roomDataObj[data].player)
      }
      user[socket.id].joinedRoom = roomDataObj[data].roomNumber
      io.to(socket.id).emit('noPassword',{room:data,player :roomDataObj[data].player[socket.id] , players: roomDataObj[data].player})
    }else if(roomDataObj[data].roomNumber === data && roomDataObj[data].password !== '' ){
      io.to(socket.id).emit('roomPassword', [roomDataObj[data].password,data])
    }
  })
//패스워드가 일치하면 접속시키기
  socket.on('passwordMatch',(data)=>{
    if(roomDataObj[data].roomNumber === data){
      roomDataObj[data].player[socket.id] = {
        nickname: user[socket.id].nickname,
        id: socket.id,
        ready: false,
        liar: false,
        playNumber : numberAssignment(roomDataObj[data].player)
      }
    }
    user[socket.id].joinedRoom = data
    socket.join(data)
  })
//방 나가기 버튼을 클릭하면 유저 목록과 방데이터에서 제거
  socket.on('leaveRoom',(data)=>{
    socket.leave(data)
    if(io.sockets.adapter.rooms.get(data) === undefined){
      io.emit('deleteRoom',data)
      delete roomDataObj[data]
      user[socket.id].joinedRoom = ''  
    }else{
      roomDataObj[data].player[socket.id].ready = false
      io.to(data).emit('ready',(roomDataObj[data].player[socket.id]))
      delete roomDataObj[data].player[socket.id]
      roomDataObj[data].participants -= 1
      user[socket.id].joinedRoom = ''
    }
  })

  socket.on('ready',(data)=>{
    let playerLength = io.sockets.adapter.rooms.get(data).size
    if(roomDataObj[data].player[socket.id].ready){
      roomDataObj[data].player[socket.id].ready = false
      roomDataObj[data].readyUser -= 1
    }else{
      roomDataObj[data].player[socket.id].ready = true
      roomDataObj[data].readyUser += 1
    }
    io.to(data).emit('ready',roomDataObj[data].player[socket.id])
    if(roomDataObj[data].readyUser >= playerLength){
      let players = Object.keys(roomDataObj[data].player)
      let random = Math.floor(Math.random() * players.length)
      let liar = players[random]
      roomDataObj[data].player[liar].liar = true
      roomDataObj[data].start = true
      io.to(data).emit('selectCategory',roomDataObj[data].player)
    }
  })
  socket.on('chat',(chat)=>{
    let {room} = chat
    io.to(room).emit('chat',chat)
  })
  socket.on('explanation',(chat)=>{
    io.to(chat.joinedRoom).emit('explanation',chat)
  })
  socket.on('category',(category)=>{
    //투표된 카테고리
    let playerLength = io.sockets.adapter.rooms.get(category.room).size
    let voteArr = roomDataObj[category.room].voteArr
    let roomCategory = roomDataObj[category.room].category
    roomDataObj[category.room].voteArr.push(category.value)
    if(voteArr.length >= playerLength){
      let obj = {}
      voteArr.forEach(cate=>{
        if(obj[cate]){
          obj[cate] +=1
        }else{
          obj[cate] =1
        }
      })
      let selected = Object.entries(obj).reduce((a,b)=>{
        return a[1] > b[1] ? a : b
      })
      selected = selected[0]
      roomCategory = selected
      let random = Math.floor(Math.random()*word[selected].length)
      io.to(category.room).emit('category',{'selected':selected,'word' : word[selected][random]})
      roomDataObj[category.room].voteArr = []
      io.to(category.room).emit('gameStart',roomDataObj[category.room].player)
    }
  })  
  socket.on('vote',(data)=>{
    console.log(user)
    let playerLength = io.sockets.adapter.rooms.get(data.room).size
    let voteArr = roomDataObj[data.room].voteArr
    roomDataObj[data.room].voteArr.push(data.value) 
    if(voteArr.length >= playerLength){
      let obj = {}
      voteArr.forEach(player=>{
        if(obj[player]){
          obj[player] +=1
        }else{
          obj[player] = 1
        }
      })
      let selectedPlayer = Object.entries(obj).reduce((a,b)=>{
        return a[1] > b[1] ? a : b
      })
      roomDataObj[data.room].voteArr = []
      let playerArr = Object.values(roomDataObj[data.room].player)
      playerArr.forEach(player=>{
        if(player.nickname === selectedPlayer[0] && player.liar){
          io.to(data.room).emit('result',{'votedUser':selectedPlayer[0], 'result' : true})
          roomDataObj[data.room].start = false
        }else if(player.nickname === selectedPlayer[0] && !player.liar){
          io.to(data.room).emit('result',{'votedUser':selectedPlayer[0], 'result' : false})
          roomDataObj[data.room].start = false
        }
      })  
      //레디 전부 초기화
      for(let property in roomDataObj[data.room].player){ 
        roomDataObj[data.room].player[property].ready = false
        io.to(data.room).emit('ready',(roomDataObj[data.room].player[property]))
      }
    }
  })
})    
