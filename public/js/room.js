const socket = io()

socket.on('disconnect',(e)=>{
  alert('서버와의 연결이 끊겼습니다.')
  
})

  // 유저가 접속하면 모달창 띄워줄거임
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
      nickname = nickname.replace(' ','')
      if(nickname === '') return alert('암것도 안적엇다잉')
      if(nickname.length > 7) return alert('8자이상 안되는데?')
      if(loggedPlayer.includes(nickname)) return alert('이미 사용되고 있는 닉네임')
      socket.emit('nickname',nickname)
      loginModal.remove()  
    }
  })
  let joinedRoom = ''
  const loggedPlayer = []
  const loggedPlayerId = []
  const userTable = document.querySelector('.player_list table')
  socket.on('userList',(data)=>{
    let {nickname , id} = data
    data.forEach((userData,userIndex) => {
      let {nickname,id} = userData
      //유저목록 받아 와버리기~
      // 이미 닉네임이 table에 올라가 있다면 리턴~ 안올릴거야
      if(loggedPlayer.includes(nickname)) return
      loggedPlayer.push(nickname)
      let tr = document.createElement('tr')
      let td = document.createElement('td')
      tr.classList.add(nickname)
      tr.append(td)
      td.innerHTML='<tr>'+'<td  >'+ nickname + '</td>'+ '</tr>'
      userTable.append(tr)
    });
  })
  const RoomTable = document.querySelector('.room_list table tbody')
  socket.on('roomsData',(data)=>{
      //방 목록 받아오기
      data.forEach((room)=>{
        const {player,roomName,roomNumber,password} = room
        const tr = document.createElement('tr')
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
        td_right.innerHTML='<tr>'+'<td>'+ state + ' ' + player + '</td>'+ '</tr>'
        RoomTable.append(tr)
      })
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
    let {player,roomName,roomNumber,password} = room
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
    td_right.innerHTML='<tr>'+'<td>'+ state + ' ' + player + '</td>'+ '</tr>'
    RoomTable.append(tr)
  })

  //방 참가
  RoomTable.addEventListener('click',e=>{
    if(e.target.tagName === 'TD'){
      let tr = e.target.parentElement
      let roomNumber = tr.className
      socket.emit('joinRoom',roomNumber)
    }
  })
  
  function addGameRoom(){
    let gameModal = document.createElement('div')
    let button = document.createElement('button')
    let gameModalBox = document.createElement('div')
    let topBox = document.createElement('div')
    let leftPlayers = document.createElement('div')
    let player1 = document.createElement('div')
    let player2 = document.createElement('div')
    let chatBoard = document.createElement('div')
    let rightPlayers = document.createElement('div')
    let player8 = document.createElement('div')
    let player7 = document.createElement('div')
    let bottomBox = document.createElement('div')
    let player3 = document.createElement('div')
    let player4= document.createElement('div')
    let player5 = document.createElement('div')
    let player6 = document.createElement('div')
    gameModal.classList.add('gameModal')
    gameModalBox.classList.add('gameModalBox')
    topBox.classList.add('topBox')
    leftPlayers.classList.add('leftPlayers')
    player1.classList.add('player1')
    player2.classList.add('player2')
    chatBoard.classList.add('chatBoard')
    rightPlayers.classList.add('rightPlayers')
    player8.classList.add('player8')
    player7.classList.add('player7')
    bottomBox.classList.add('bottomBox')
    player3.classList.add('player3')
    player4.classList.add('player4')
    player5.classList.add('player5')
    player6.classList.add('player6')
    button.innerText = '나가기'
    gameModal.appendChild(button)
    gameModal.appendChild(gameModalBox)
    gameModalBox.appendChild(topBox)
    gameModalBox.appendChild(bottomBox)
    topBox.appendChild(leftPlayers)
    topBox.appendChild(chatBoard)
    topBox.appendChild(rightPlayers)
    leftPlayers.appendChild(player1)
    leftPlayers.appendChild(player2)
    rightPlayers.appendChild(player8)
    rightPlayers.appendChild(player7)
    bottomBox.appendChild(player3)
    bottomBox.appendChild(player4)
    bottomBox.appendChild(player5)
    bottomBox.appendChild(player6)
    document.querySelector('body').append(gameModal)
    let leaveRoomBtn = document.querySelector('div.gameModal > button')
    leaveRoomBtn?.addEventListener('click',(e)=>{
    socket.emit('leaveRoom',joinedRoom)
    gameModal.remove()
  })
  }
  //패스워드 없으면 그냥참가
  socket.on('noPassword',(data)=>{
    addGameRoom()
    joinedRoom = data
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
      }else if(e.key === 'Enter') return alert('패스 워드))가 일치하지 않습니다.')
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
      }
    })
    loggedPlayer.forEach((user,index,arr)=>{
      if(user === disconnectUser){
        arr.splice(index,1)
      }
    })
  })
  socket.on('deleteRoom',(data)=>{
    console.log(data)
    let deleteRoom = document.querySelector('.' + data)
    deleteRoom.remove()
  })


//유저가 방을 나가면
  