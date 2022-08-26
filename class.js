module.exports = class Room {
  constructor(readyUser,room,category,password,moderator){
    this.readyUser = readyUser
    this.room = room;
    this.category = category;
    this.password = password;
    this.moderator = moderator;
  }
}