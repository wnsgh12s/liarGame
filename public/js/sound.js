  let soundState = true
  function playSound(arr){
    if(!soundState) return 
    let bgm = new Audio()
    bgm.src = '../sound/[No Copyright Music] Beach Party - Kevin MacLeod.mp3'
    bgm.volume = 0.1  
    bgm.currentTime = 0
    bgm.play()
    bgm.loop = true
    return bgm
  }
  function playGameSound(element){
    let btnSound = new Audio()
    btnSound.src = '../sound/[No Copyright Music] Barbarian - Pierlo.mp3'
    btnSound.currentTime = 0
    btnSound.volume = 0.2
    btnSound.play() 
    btnSound.loop = true
    return btnSound
  }
  function playBtnSound(element){
    let btnSound = new Audio()
    btnSound.src = '../sound/085_마우스클릭.mp3'
    btnSound.volume = 0.2
    btnSound.play()
  }
  function playEnterSound(element){
    let enterSound = new Audio()
    enterSound.src = '../sound/038_뿅.mp3'
    enterSound.volume = 0.2
    enterSound.play()
  }
  function playLose(element){
    let sound = new Audio()
    sound.src = '../sound/091_카툰 웃음.mp3'
    sound.volume = 0.1
    sound.play()
  }
  function playWin(element){
    let sound = new Audio()
    sound.src = '../sound/082_띵.mp3'
    sound.volume = 0.1
    sound.play()
  }
  function playStart(element){
    let sound = new Audio()
    sound.src = '../sound/countDown.mp3'
    sound.volume = 0.1
    sound.play()
    return sound
  }
  
  let soundBtn = document.createElement('i')
  soundBtn.classList.add(['fa-solid'],['fa-volume-low'])