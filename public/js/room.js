const socket = io()
socket.on('disconnect',(e)=>{
  location.reload()
})
  // 유저가 접속하면 모달창 띄워줄거임
  let joinedRoom = ''
  const loggedPlayer = {}
  const loginModal = document.querySelector('.loginModal')
  const loginModalInput = document.querySelector('.loginModal input')
  loginModalInput.focus()
  let nickname = ''
  //데이터 방 목록 받아오고 테이블 쏴주기
  loginModalInput.addEventListener('input',(e)=>{
    nickname = e.target.value
  })
  loginModalInput.addEventListener('keydown',(e)=>{
    if(e.key==='Enter'){
      console.log(nickname)
      if(nickname.includes(' ')) return alert('공백 안됨')
      if(nickname === '') return alert('암것도 안적엇다잉')
      if(nickname.length > 7) return alert('8자이상 안되는데?')
      if(loggedPlayer[nickname]) return alert('이미 사용되고 있는 닉네임')
      socket.emit('nickname',nickname)
      loginModal.remove()  
    }
  })
  const userTable = document.querySelector('.player_list table')

  socket.on('userList',(data)=>{
      for(player in data){
        let {nickname,id} = data[player]
        if(!loggedPlayer[nickname]){
          loggedPlayer[nickname] = player
          let tr = document.createElement('tr')
          let td = document.createElement('td')
          tr.classList.add(nickname)
          tr.append(td)
          td.innerHTML='<tr>'+'<td  >'+ nickname + '</td>'+ '</tr>'
          userTable.append(tr)  
        }   
        }
  })

  function addRoom(player,roomName,roomNumber,password,participants){
    let tr = document.createElement('tr')
    let td_left = document.createElement('td')
    let td_center = document.createElement('td')
    let td_right = document.createElement('td')
    let state = password === '' ? '공개방 /' : '비공개방 /'
    tr.classList.add(roomNumber)
    tr.appendChild(td_right)  
    tr.appendChild(td_center)
    tr.appendChild(td_left)
    td_left.innerHTML='<tr>'+'<td>'+ roomNumber + '</td>'+ '</tr>'
    td_center.innerHTML='<tr>'+'<td>'+ roomName + '</td>'+ '</tr>'
    td_right.innerHTML='<tr>'+'<td>'+ state + ' ' + participants + '</td>'+ '</tr>'
    RoomTable.append(tr)
  }

  const RoomTable = document.querySelector('.room_list table tbody')
  socket.on('roomsData',(data)=>{
    //방이없으면 리턴
    if(Object.keys(data).length === 0 ) return
    for(room in data){
      const {player,roomName,roomNumber,password,participants} = data[room] 
      addRoom(player,roomName,roomNumber,password,participants)
    }
    
  })
  //방생성 버튼을 누르면 서버에게 방 생성 버튼을 눌럿다고 보내줌
  const CreateRoomBtn = document.querySelector('.create_room')
  let createRoom = document.querySelector('.createRoomModal')  
  let roomNameInput = document.querySelector('.roomName')
  let roomPasswordInput = document.querySelector('.roomPassword')  
  let 방정보 = {
    방제목 : '',
    방비밀번호 : ''
  }
  //방제목을 클릭하면 방 입력창 띄워주기
  CreateRoomBtn.addEventListener('click',(e)=>{
    //크롬에서만 이상한 포커스오류
    setTimeout( function(){ roomNameInput.focus(); }, 50 );
    e.preventDefault()
    createRoom.style.display = 'block'
  })
  //input값에 값을 입력하면 방제목에 저장
  roomNameInput.addEventListener('input',e=>{
    if(e.target.value.length > 10){
      e.target.value = ''
      alert('7자 이상 못넘겨')
    }
    방정보.방제목 = e.target.value
  })
  //패스워드 입력창 글자 숫자 제한과 방 비밀번호 설정
  roomPasswordInput.addEventListener('input',e=>{
    if(e.target.value.length > 10){
      e.target.value = ''
      alert('8자 이상 못넘겨')
    }
    방정보.방비밀번호 = e.target.value
  })
  //enter 키를 입력하면 방생성 하고 방이름 데이터와 유저 방만든 유저 넘겨주고 모달창 제거
  createRoom.addEventListener('keydown',e=>{
    if(e.key === 'Enter'){
      socket.emit('createRoom',방정보)
      createRoom.style.display = 'none'
      addGameRoom()   
    }
  })
  // 생성한 사람에게만 넘기는 정보
  socket.on('oneCreateRoom',(roomData)=>{
    let {roomNumber} = roomData
    joinedRoom = roomNumber
  })

//그리고 방 생성 버튼을 누른 인간의 socketid와 방번호를 받아와서 테이블 삽입해줄거임
  socket.on('createRoom',(room)=>{
    let {player,roomName,roomNumber,password,participants} = room
    addRoom(player,roomName,roomNumber,password,participants)
  })

  //방 참가
  RoomTable.addEventListener('click',e=>{
    if(e.target.tagName === 'TD'){
      let tr = e.target.parentElement
      let roomNumber = tr.className
      socket.emit('joinRoom',roomNumber)
    }
  })
  //방추가
  function addGameRoom(){
    let gameModal = document.createElement('div')
    let readyBtn = document.createElement('button')
    let buttonBox = document.createElement('div')
    let suggestion = document.createElement('div')
    let subject = document.createElement('div')
    let time = document.createElement('div')
    let button = document.createElement('button')
    let gameModalBox = document.createElement('div')
    let topBox = document.createElement('div')
    let middleBox = document.createElement('div')
    let leftPlayers = document.createElement('div')
    let player1 = document.createElement('div')
    let player2 = document.createElement('div')
    let chatBoard = document.createElement('div')
    let chatInput = document.createElement('input')
    let rightPlayers = document.createElement('div')
    let player8 = document.createElement('div')
    let player7 = document.createElement('div')
    let bottomBox = document.createElement('div')
    let player3 = document.createElement('div')
    let player4 = document.createElement('div')
    let player5 = document.createElement('div')
    let player6 = document.createElement('div')
    gameModal.classList.add('gameModal')
    gameModalBox.classList.add('gameModalBox')
    topBox.classList.add('topBox')
    middleBox.classList.add('middleBox')
    leftPlayers.classList.add('leftPlayers')
    player1.classList.add('player1')
    player2.classList.add('player2')
    chatBoard.classList.add('chatBoard')
    chatInput.classList.add('chatInput')
    rightPlayers.classList.add('rightPlayers')
    player8.classList.add('player8')
    player7.classList.add('player7')
    bottomBox.classList.add('bottomBox')
    player3.classList.add('player3')
    player4.classList.add('player4')
    player5.classList.add('player5')
    player6.classList.add('player6')
    buttonBox.classList.add('buttonBox')
    gameModal.appendChild(buttonBox)
    //레디버튼
    readyBtn.classList.add('readyBtn')
    readyBtn.innerText = '준비'
    //주제
    subject.innerText='주제 : 미정'
    subject.classList.add('subject')
    //타이머
    time.innerText='00 : 00'
    time.classList.add('time')
    //제시어
    suggestion.innerText='제시어 : 미정'
    suggestion.classList.add('suggestion')
    //나가기버튼
    button.classList.add('exitBtn')
    button.innerText = '나가기'
    //순서대로 넣기
    buttonBox.appendChild(subject)
    buttonBox.appendChild(suggestion)
    buttonBox.appendChild(time)
    buttonBox.appendChild(button)
    buttonBox.appendChild(readyBtn)
    //플레이어 ui
    gameModal.appendChild(gameModalBox)
    gameModalBox.appendChild(topBox)
    gameModalBox.appendChild(middleBox)
    gameModalBox.appendChild(bottomBox)
    topBox.appendChild(leftPlayers)
    topBox.appendChild(chatBoard)
    topBox.appendChild(rightPlayers)
    middleBox.appendChild(chatInput)
    leftPlayers.appendChild(player1)
    leftPlayers.appendChild(player2)
    rightPlayers.appendChild(player8)
    rightPlayers.appendChild(player7)
    bottomBox.appendChild(player3)
    bottomBox.appendChild(player4)
    bottomBox.appendChild(player5)
    bottomBox.appendChild(player6)
    document.querySelector('body').append(gameModal)
    let leaveRoomBtn = document.querySelector('body div.gameModal div.buttonBox .exitBtn')
    let _readyBtn = document.querySelector('body div.gameModal div.buttonBox .readyBtn')
    let _chatInput = document.querySelector('body > div.gameModal > div.gameModalBox > div.middleBox > input')
    leaveRoomBtn?.addEventListener('click',(e)=>{
    socket.emit('leaveRoom',joinedRoom)
    joinedRoom = ''
    gameModal.remove()
  })
  _readyBtn?.addEventListener('click',(e)=>{
    socket.emit('ready',joinedRoom)
  })
  //채팅보드 인풋
  _chatInput.focus()
  let chat 
  _chatInput?.addEventListener('input',(e)=>{
    chat = e.target.value
  })
  _chatInput?.addEventListener('keydown',(e)=>{
    if(e.key === 'Enter'){
      socket.emit('chat',{
        chatData : chat,
        room : joinedRoom,
        nick : nickname
      })
      _chatInput.value = ''
      chat = ''
    }
  })
  }

  socket.on('ready',(player)=>{
    let {ready,playNumber} = player
    // 준비를 했으면 준비한 유저의 색깔 넣어주자 
    let playerBox = document.querySelector(`body div.gameModal div.gameModalBox div.player${playNumber}`)
    if(ready){  
      console.log(playNumber)
      playerBox.style.background='red'
    }else{
      playerBox.style.background='#4A569D'
    }

  })
  //패스워드 없으면 그냥참가
  socket.on('noPassword',(data)=>{
    let players = Object.values(data.players)
    addGameRoom() 
    joinedRoom = data.room
    players.forEach(player=>{
      let playerBox = document.querySelector(`body div.gameModal div.gameModalBox div.player${player.playNumber}`)
      playerBox.innerHTML = `<p>${player.nickname}</p>`
      if(player.ready){  
        playerBox.style.background='red'
      }else{
        playerBox.style.background='#4A569D'
      }
    })
  })
  //방에 패스워드가 있다면 패스워드창 띄워주기
  socket.on('roomPassword',(data)=>{
    let modal = document.createElement('div')
    let modalBox = document.createElement('div')
    let label = document.createElement('label')
    let input = document.createElement('input')
    let button = document.createElement('button')
    modal.classList.add('passwordModal')
    modal.appendChild(modalBox)
    modalBox.appendChild(button)
    modalBox.appendChild(label)
    modalBox.appendChild(input)
    button.innerText = 'X'
    label.innerText ='방비밀번호는..?'
    document.querySelector('body').append(modal)  
    let value = ''
    input.addEventListener('input',(e)=>{
      value = e.target.value  
    })
    input.addEventListener('keydown',(e)=>{
      if(e.key === 'Enter' && value === data[0]){
        socket.emit('passwordMatch',data[1])
        joinedRoom = data[1]
        modal.remove()
        addGameRoom() 
      }else if(e.key === 'Enter') return alert('패스 워드가 일치하지 않습니다.')
    })
    //버튼끄기
    button.addEventListener('click',(e)=>{
      modal.remove()
    })
  })
  //유저가 나가면 할 일 
  socket.on('disconnectUser',(disconnectUser)=>{
    userTable.childNodes.forEach(table=>{
      if(table.className === disconnectUser){
        table.remove()
        delete loggedPlayer[disconnectUser]
      }
    })
  })
  socket.on('deleteRoom',(data)=>{
    let deleteRoom = document.querySelector('.' + data)
    deleteRoom?.remove()
  })
  function createModal(element,arr,type) {
    let emit = type
    for (let i = 0; i < arr.length; i++) {
        let btn = document.createElement('button')
        btn.innerHTML = arr[i]
        btn.value = arr[i]
        element.appendChild(btn)
        btn.addEventListener('click',(e)=>{
          socket.emit(emit,{'value' : btn.value, 'room' : joinedRoom})
          element.remove()
        })
    }
  }
  socket.on('selectCategory',(data)=>{
    //버튼 비활성화
    let readyBtn = document.querySelector('button.readyBtn')
    readyBtn.disabled = false
    //주제 고르기 
    function category(){
      let arr = ['음식','영화','가수','나라']
      let modal = document.querySelector('div.gameModal')
      let div = document.createElement('div')
      div.classList.add('CategoryModal')
      let h2 = document.createElement('h2')
      h2.innerText='카테고리 고르기'
      modal.appendChild(div)
      div.appendChild(h2)
      createModal(div,arr,'category')
    }
    category()
  })
  socket.on('chat',(data)=>{
    let chatBoard = document.querySelector('body > div.gameModal > div.gameModalBox > div.topBox > div.chatBoard')
    let div = document.createElement('div')
    div.classList.add(data.nick)
    div.innerText = `${data.nick} : ${data.chatData}`
    chatBoard.appendChild(div)
    chatBoard.scrollTop = chatBoard.scrollHeight
  })

  //카테고리대로 변경
  socket.on('category',(data)=>{
    let 주제 = document.querySelector('div.subject')
    let 제시어 = document.querySelector('div.suggestion')
    주제.innerHTML = `주제 : ${data.selected}`
    제시어.innerHTML = `제시어 : ${data.word}`
  })

  //드디어 게임시작

  socket.on('gameStart',data=>{
    //타이머 프로미스
    let 시간 = document.querySelector('div.time')
    let players = Object.values(data)
    function wait(t,h,n,p){
      let time = t
      let chatInput = document.querySelector('div.middleBox > input')
      return new Promise((resolve)=>{
        let timer = setInterval(() => {
          let min = parseInt(time/60),
              sec = time % 60
          time --
          시간.innerHTML=`${h} 0${min} : ${sec}`
          if(time < 0){
            resolve()
            clearInterval(timer)
          }
        }, 1000);
        let value = null
        chatInput.addEventListener('input',(e)=>{
          value = e.target.value
        })
        chatInput.addEventListener('keydown',function sendData(e){
          console.log(e.key,n,nickname)
          if(e.key === 'Enter' && n === nickname){
            console.log('으히')
            clearInterval(timer)
            resolve()
            chatInput.removeEventListener('keydown',sendData)
            socket.emit('explanation',{value,joinedRoom,n,p})
          }
        })
      })

    }
    //유저수 만큼 타이머
    async function loopWait(){
      for(let i = 0; i < players.length; i++){
        let playerBox = document.querySelector(`div.player${players[i].playNumber}`)
        playerBox.style.background = 'blue'
        await wait(30,players[i].nickname.concat('차례'),players[i].nickname,players[i].playNumber)
        playerBox.style.background = 'red'
      }
    } 
    //유저수 만큼 루프 돌았으면 투표 해야겠죵?
    async function vote(){
      await loopWait()
      //시간을 다 드렸고 이제 투표 어케할까..?
      let modal = document.querySelector('div.gameModal')
      let div = document.createElement('div')
      div.classList.add('CategoryModal')
      let h2 = document.createElement('h2')
      h2.innerText='투표 하자'
      modal.appendChild(div)
      div.appendChild(h2)
      let playerNames = players.map((e)=>{
        return e.nickname
      })
      createModal(div,playerNames,'vote')
    }
    vote()
  })
  socket.on('explanation',(data)=>{
    let playerBox = document.querySelector(`div.player${data.p}`)
    playerBox.innerHTML = `<p>${data.value}</p>`
  })
  socket.on('result',(data)=>{
    alert(`${data.votedUser}는(은) ${data.result ? '라이어가 맞습니다': '라이어가 아닙니다'}`)
  })
  socket.on('alert',(data)=>{
    alert(data)
  })