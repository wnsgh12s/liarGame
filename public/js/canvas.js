let ctx = canvas.getContext('2d')

canvas.width = innerWidth;
canvas.height = innerHeight;
class Player{
  constructor(id){
    this.id = id
  }
  hi(){
    console.log(this.id)
  }
}
