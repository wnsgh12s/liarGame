const express = require('express');
const app = express()
const http = require('http').createServer(app);
const {Server} = require('socket.io');
const io = new Server(http)
const word = require('./word')
app.use(express.static(__dirname + "/public"));
let port = process.env.PORT || 8080

http.listen(port,(요청,응답)=>{
  console.log('시작되엇네')
})

app.get('/',function(요청,응답){  
  응답.sendFile(__dirname + ('/index.html'))
})

let roomDataObj = {}
let user = {}
let CountObj = {}
function createCount(obj,num){
  if(!obj[num]){
    obj[num] = num
    return num 
  }else{
    num = num + 1
    return createCount(obj,num)
  }
}
//플레이어 넘버 부여
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
        'nickname' : data.nickname,
        'id' : socket.id,
        'joinedRoom' : '',
        'character' : data.currentNum   
      }
    //애들이 들어올때마다 유저 닉네임 쏴주기
    io.emit('userList',user)
  })
  //방생성 버튼이 눌리면 방 번호와 유저 정보 보내주기
  socket.on('createRoom',function(data){
    let {방제목,방비밀번호} = data
    let count = createCount(CountObj,1)
    socket.join(`room${count}`)
    let roomData ={
      'roomNumber' : `room${count}`,
      'player' : {},
      'roomName' : 방제목,
      'password' : 방비밀번호,
      'participants' : 1,
      'readyUser' : 0,
      'voteArr' : [],
      'category' : null,
      'start' : false,
      'answer': null,
      'liar' : null,
      count
    }
    roomData.player[socket.id] = {
      'nickname' : user[socket.id].nickname,
      'ready': false,
      'liar' : false,
      'id' : socket.id,
      'playNumber' : numberAssignment(roomData.player),
      'character' : user[socket.id].character
    }
    user[socket.id].joinedRoom = `room${count}` 
    roomDataObj[`room${count}`] = roomData
    io.emit('createRoom',roomData)
    io.to(socket.id).emit('oneCreateRoom',roomData)
  })

  
  //소켓을 나가면 유저 데이터를 없애줌
  socket.on("disconnect", (data) => {
    //접속한 유저가 아니면 리턴
    if(user[socket.id] === undefined) return
    //유저가 나가면 나간 유저 배열 뒤져서 삭제하기
    let room = user[socket.id]?.joinedRoom
    if(room === ''){
      //방없을때
      io.emit('disconnectUser',user[socket.id].nickname)
      delete user[socket.id]
    }else if(io.sockets.adapter.rooms.get(room) === undefined){
      //방 마지막 유저일때
      roomDataObj[room].count && delete CountObj[roomDataObj[room]?.count]
      delete roomDataObj[room]
      io.emit('deleteRoom',room)
      io.emit('disconnectUser',user[socket.id]?.nickname)
      delete user[socket.id]
    }else if(room !== ''){
      //방이 있으나 마지막 유저는 아님
      io.emit('disconnectUser',user[socket.id].nickname)
      if(roomDataObj[room].player[socket.id].ready){
        roomDataObj[room].readyUser -= 1
      }
      io.to(room).emit('disconnectRoom',roomDataObj[room].player[socket.id])
      delete roomDataObj[room].player[socket.id]
      roomDataObj[room].participants -=1
      delete user[socket.id]
    }
  });
//방에 접속하려는 유저 패스워드가 맞는지 틀린지 확인하기
  socket.on('joinRoom',(data)=>{
    if(roomDataObj[data].start) return io.to(socket.id).emit('alert',{
      'alert':'게임중입니다','state': true
    })
    if(roomDataObj[data].participants  === 8) return io.to(socket.id).emit('alert',{
      'alert':'방이꽉찼습니다','state': true
    })
    //패스워드가 없으면 
    if(roomDataObj[data].roomNumber === data && roomDataObj[data].password === ''){
      roomDataObj[data].participants ++
      roomDataObj[data].player[socket.id] = {
        nickname: user[socket.id].nickname,
        id: socket.id,
        ready: false,
        liar: false,
        playNumber : numberAssignment(roomDataObj[data].player),
        character : user[socket.id].character
      }
      user[socket.id].joinedRoom = roomDataObj[data].roomNumber
      io.to(socket.id).emit('noPassword',{room:data,player :roomDataObj[data].player[socket.id] , players: roomDataObj[data].player})
      io.to(data).emit('joinedRoomData',roomDataObj[data].player[socket.id])
      socket.join(data)
    }else if(roomDataObj[data].roomNumber === data && roomDataObj[data].password !== '' ){
      io.to(socket.id).emit('roomPassword', [roomDataObj[data].password,data])
    }
  })
//패스워드가 일치하면 접속시키기
  socket.on('passwordMatch', async (data)=>{
    if(roomDataObj[data].roomNumber === data){
      roomDataObj[data].player[socket.id] = {
        nickname: user[socket.id].nickname,
        id: socket.id,
        ready: false,
        liar: false,
        playNumber : numberAssignment(roomDataObj[data].player),
        character : user[socket.id].character
      }
    }
    user[socket.id].joinedRoom = data
    io.to(data).emit('joinedRoomData',roomDataObj[data].player[socket.id])
    socket.join(data)
  })
//방 나가기 버튼을 클릭하면 유저 목록과 방데이터에서 제거
  socket.on('leaveRoom',(data)=>{
    socket.leave(data)
    if(io.sockets.adapter.rooms.get(data) === undefined){
      io.emit('deleteRoom',data)
      delete CountObj[roomDataObj[data]?.count]
      delete roomDataObj[data]
      user[socket.id].joinedRoom = ''  
    }else{
      roomDataObj[data].player[socket.id].ready = false
      io.to(data).emit('ready',(roomDataObj[data].player[socket.id]))
      io.to(data).emit('disconnectRoom',roomDataObj[data].player[socket.id])
      delete roomDataObj[data].player[socket.id]
      roomDataObj[data].participants -= 1
      user[socket.id].joinedRoom = ''
    }
  })

  socket.on('ready',(data)=>{
    let playerLength = io.sockets.adapter.rooms.get(data).size
    let ready = roomDataObj[data].player[socket.id].ready
    if(ready){
      roomDataObj[data].player[socket.id].ready = false
      roomDataObj[data].readyUser -= 1
    }else{
      roomDataObj[data].player[socket.id].ready = true
      roomDataObj[data].readyUser += 1
    }
    io.to(data).emit('ready',roomDataObj[data].player[socket.id])
    //참가한 유저만큼 준비가 완료 되었을때
    if(roomDataObj[data].readyUser >= playerLength){
      let players = Object.keys(roomDataObj[data].player)
      let random = Math.floor(Math.random() * players.length)
      let liar = players[random]
      roomDataObj[data].player[liar].liar = true
      roomDataObj[data].start = true
      roomDataObj[data].liar = roomDataObj[data].player[liar].nickname
      io.to(data).emit('selectCategory',roomDataObj[data].player)
      for(let property in roomDataObj[data].player){ 
        roomDataObj[data].player[property].ready = false
        io.to(data).emit('ready',(roomDataObj[data].player[property]))
      }
      roomDataObj[data].readyUser = 0
    }
  })
  
  socket.on('chat',(chatData)=>{
    let {room} = chatData
    io.to(room).emit('chat',chatData)
  })
  socket.on('explanation',(chatData)=>{
    io.to(chatData.joinedRoom).emit('explanation',chatData)
  })
  socket.on('category',(category)=>{
    if(!category) return
    //투표된 카테고리
    let value = category.value
    if(category.value === null){
      let arr = Object.keys(word)
      let random = Math.floor(Math.random()*arr.length)
      value = arr[random]
    }
    console.log('이게 왜실행되는데',category)
    let playerLength = io.sockets.adapter.rooms.get(category?.room).size
    let voteArr = roomDataObj[category.room].voteArr
    roomDataObj[category.room].voteArr.push(value)
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
      roomDataObj[category.room].category = selected
      let random = Math.floor(Math.random()*word[selected].length)
      
      roomDataObj[category.room].answer = word[selected][random]
      io.to(category.room).emit('category',{'selected':selected,'word' : word[selected][random],'liar':roomDataObj[category.room].liar})
      roomDataObj[category.room].voteArr = []
      io.to(category.room).emit('gameStart',roomDataObj[category.room].player)
    }
  })  
  socket.on('vote',(data)=>{
    if(data.room === undefined) return
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
      let maxObj = Object.values(obj)
      let max = Math.max(...maxObj)
      let filter = maxObj.filter(e=>{
        if(e === max && e !== 'null'){
          return e
        }
      })
      //투표수가 같을때
      if(filter.length > 1){
        console.log(filter)
        socket.emit('alert',{'alert' :'동표입니다', 'state': false})
        return io.to(data.room).emit('gameStart',roomDataObj[data.room].player);
      }
      let selectedPlayer = Object.entries(obj).reduce((a,b)=>{
        return a[1] > b[1] ? a : b
      })
      roomDataObj[data.room].voteArr = []
      //투표자가 없을때
      if(selectedPlayer[0] === 'null'){
        socket.emit('alert',{'alert' :'투표자가 없습니다 추가 설명 시간', 'state': false})
        return io.to(data.room).emit('gameStart',roomDataObj[data.room].player);
      }
      if(roomDataObj[data.room].liar === selectedPlayer[0]){
        let arr = word[roomDataObj[data.room].category]
        arr.sort(()=> 0.5 - Math.random())
        let arr2 = []
        arr2.push(roomDataObj[data.room].answer)
        for(let i= 0 ; i < 5 ; i++){
          if(roomDataObj[data.room].answer === arr[i]) continue
          arr2.push(arr[i])
        } 
        arr2.sort(()=> 0.5 - Math.random())
        io.to(data.room).emit('result',{'votedUser':selectedPlayer[0], 'result' : true, 'category' : arr2})
        roomDataObj[data.room].start = false
      }else if(roomDataObj[data.room].liar !== selectedPlayer[0]){
        io.to(data.room).emit('result',{'votedUser':selectedPlayer[0], 'result' : false})
        roomDataObj[data.room].start = false
      }  
    }
  })

  socket.on('liarVote',(data)=>{
    if(data.value === roomDataObj[data.room].answer){
      io.to(data.room).emit('answer',{'answer':true ,'value' : data.value})
    }else{
      io.to(data.room).emit('answer',{'answer':false ,'value' : data.value})
    }
  })
})    
