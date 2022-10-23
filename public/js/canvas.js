function startAnim(container,path){
  let start = lottie.loadAnimation({
    container: document.querySelector(`${container}`), // the dom element that will contain the animation
    path: `./anim/${path}.json`, // the path to the animation json
    renderer: 'canvas',
    loop: false,
    autoplay: true,
    name: "Hello World", // Name for future reference. Optional.
  });
  return start
}

let helpModal = document.querySelector('.helpModal')
let imgbox = document.querySelector('body > div.helpModal > div > div > div')
let lBtn = document.querySelector('body > div.helpModal > div > button.l_btn')
let rBtn = document.querySelector('body > div.helpModal > div > button.r_btn')
let xBtn = document.querySelector('body > div.helpModal > div > button.x_btn')
let hBtn = document.querySelector('#header > div > nav > ul > li:nth-child(2) > h2 > button')
let right = 0
lBtn.onclick = function(){
  rBtn.style.visibility = 'visible'
  if(right <= 0) return
  right -=100
  if(right === 0 ) lBtn.style.visibility = 'hidden'
  imgbox.style.right = `${right}%`
}
rBtn.onclick = function(){
  lBtn.style.visibility = 'visible' 
  if(right >= 400) return
  right +=100
  if(right === 400 ) rBtn.style.visibility = 'hidden'
  imgbox.style.right = `${right}%`
}
xBtn.onclick = function(){
  helpModal.style.display ='none'
}
hBtn.onclick = function(){
  lBtn.style.visibility = 'hidden'
  rBtn.style.visibility = 'visible'
  right = 0
  imgbox.style.right = `${right}%`
  helpModal.style.display ='block'
}
//클릭을하면 mouseMove 이벤트 실행

