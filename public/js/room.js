const socket = io()
  const allcanvas = document.querySelectorAll('canvas')
  allcanvas.forEach(e=>{
    let ctxs = e.getContext('2d')
    e.width = innerWidth
    e.width = innerHeight
  })
  const CreateRoomBtn = document.querySelector('.create_room')
  // 유저가 접속하면 모달창 띄워줄거임
  const loginModal = document.querySelector('.loginModal')
  const loginModalInput = document.querySelector('.loginModal input')
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
      socket.emit('nickname',nickname)
      loginModal.remove()  
    }
  })
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
  let createRoom = document.querySelector('.createRoomModal')  
  let roomNameInput = document.querySelector('.roomName')
  let roomPasswordInput = document.querySelector('.roomPassword')  
  let 방정보 = {
    방제목 : '',
    방비밀번호 : ''
  }
  //방제목을 클릭하면 방 입력창 띄워주기
  CreateRoomBtn.addEventListener('click',()=>{
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
      createRoom.remove()   
    }
  })
//그리고 방 생성 버튼을 누른 인간의 socketid와 방번호를 받아와서 테이블 삽입해줄거임
  socket.on('createRoom',(room)=>{
    let {player,roomName,roomNumber,password} = room
    let RoomTable = document.querySelector('.room_list table tbody')
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
      let roomName = tr.className
      socket.emit('joinRoom',roomName)
    }
  })
  //방에 패스워드가 있다면 패스워드창 띄워주기
let gameModal = document.querySelector('.gameModal')
  socket.on('roomPassword',(password)=>{
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
      if(e.key === 'Enter' && value === password){
        socket.emit('passwordMatch','참가')
        gameModal.style.display = 'block'
        modal.remove()
      }else if(e.key === 'Enter') return alert('패스워드가 일치하지 않습니다.')
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
  })