function playSound(element){
  let bgm = new Audio()
  bgm.src = '../sound/[No Copyright Music] Barbarian - Pierlo.mp3'
  bgm.volume = 0.1  
  bgm.play()
  element?.addEventListener('click',()=>{
    bgm.paused ? bgm.play() : bgm.pause()
  })
}
function playBtnSound(element){
  let btnSound = new Audio()
  btnSound.src = '../sound/085_마우스클릭.mp3'
  btnSound.volume = 0.2
  btnSound.play()
  element?.addEventListener('click',()=>{
    btnSound ? btnSound.play() : btnSound.pause()
  })
}
