  function playSound(arr){
    let bgm = new Audio()
    bgm.src = '../sound/[No Copyright Music] Beach Party - Kevin MacLeod.mp3'
    bgm.volume = 0.1  
    bgm.play()
    bgm.loop = true
    arr.forEach(e=>{
      e?.addEventListener('click',()=>{
        bgm.paused ? bgm.play() : bgm.pause()
        if(e.className ==='fa-solid fa-volume-low'){
          e.className='fa-solid fa-volume-xmark'
        }else{
          e.className='fa-solid fa-volume-low'
        }
      })
    })
    return bgm
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
  }
  
  let soundBtn = document.createElement('i')
  soundBtn.classList.add(['fa-solid'],['fa-volume-low'])