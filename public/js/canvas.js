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


