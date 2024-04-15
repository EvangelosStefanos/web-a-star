class GridSpaceState { // A single state of the grid space
  constructor(x, y, rows, cols){
    let free = [];
    for(let i=0; i<rows; i++){
      free.push([]);
      for(let j=0; j<cols; j++){
        free[i][j] = true;
      }
    }
    this.x = x;
    this.y = y;
    this.ROWS = rows;
    this.COLS = cols;
    this.free = free;
    this.path = [];
    this.heuristic = Number.POSITIVE_INFINITY;
  }
  setBlocked(blocked){
    blocked.forEach(b=>{this.free[b.x][b.y] = false;});
  }
  clone(){
    let clone = new GridSpaceState(0, 0, this.ROWS, this.COLS);
    clone.x = this.x;
    clone.y = this.y;
    clone.free = Array.from(this.free);
    clone.path = Array.from(this.path);
    clone.heuristic = this.heuristic;
    return clone;
  }
  equals(other){
    return this.x == other.x && this.y == other.y;
  }
  //// Paths ////
  print_path(){
    console.log(this.path.join("->"));
  }
  convert_path(xInitial, yInitial) {
    let array = [];
    let x = xInitial;
    let y = yInitial;
    array.push({x: x, y: y, distance: 0});
    for (let i = 0; i < this.path.length; i++) {
      if (this.path[i] == "Up") {
        x -= 1;
      }
      else if (this.path[i] == "Down") {
        x += 1;
      }
      else if (this.path[i] == "Left") {
        y -= 1;
      }
      else if (this.path[i] == "Right") {
        y += 1;
      }
      else{
        console.log("Error. Should never happen. Invalid value in path.");
      }
      array.push({x: x, y: y, distance: i+1});
    }
    return array;
  }
  //// Actions ////
  goUp(){
    let child = this.clone();
    let isValid = false;
    if(this.x > 0 && this.free[this.x-1][this.y] ){
      child.x -= 1;
      child.path.push("Up");
      isValid = true;
    }
    return {
      isValid: isValid,
      child: child,
    }
  }
  goDown(){
    let child = this.clone();
    let isValid = false;
    if(this.x < this.ROWS-1 && this.free[this.x+1][this.y] ){
      child.x += 1;
      child.path.push("Down");
      isValid = true;
    }
    return {
      isValid: isValid,
      child: child,
    }
  }
  goLeft(){
    let child = this.clone();
    let isValid = false;
    if(this.y > 0 && this.free[this.x][this.y-1] ){
      child.y -= 1;
      child.path.push("Left");
      isValid = true;
    }
    return {
      isValid: isValid,
      child: child,
    }
  }
  goRight(){
    let child = this.clone();
    let isValid = false;
    if(this.y < this.COLS-1 && this.free[this.x][this.y+1] ){
      child.y += 1;
      child.path.push("Right");
      isValid = true;
    }
    return {
      isValid: isValid,
      child: child,
    }
  }
  //// Expand and Heuristic ////
  expand(){
    let actions = [
      this.goUp(),
      this.goDown(),
      this.goLeft(),
      this.goRight()
    ];
    return actions.filter(x => x.isValid).map(x => x.child);
  }
  evaluate(goal) {
    this.heuristic = Math.abs(this.x - goal.x) + Math.abs(this.y - goal.y);
  }
  /* 
  if < 0 then this > other
  if > 0 then this < other
  */
  compare(state, other){ // public
    return other.heuristic - state.heuristic; // descending order so i can use pop() to extract minimum
  }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
class GridSpace { // Properties of a grid space
  constructor(rows, cols){
    this.ROWS = rows;
    this.COLS = cols;
    this.BLOCKED = [
      {x:6, y:2},
      {x:5, y:3},
      {x:6, y:3},
      {x:7, y:4},
      {x:5, y:5},
      {x:6, y:5},
      {x:5, y:6},
      {x:2, y:7},
      {x:3, y:7},
      {x:4, y:7},
      {x:5, y:7},
    ];
    this.INITIAL = this.createRandomState();
    this.INITIAL.setBlocked(this.BLOCKED);
    this.GOAL = this.createRandomState();
  }
  createRandomState(){
    for (let i=0; i<100; i++){
      let x = getRandomInt(this.ROWS);
      let y = getRandomInt(this.COLS);
      if(this.BLOCKED.filter(b => b.x == x && b.y == y) == 0){
        return new GridSpaceState(x, y, this.ROWS, this.COLS, this.BLOCKED);
      }
    }
    console.log("Critical Error. Cannot create valid random state.");
    return new GridSpaceState(0, 0, this.ROWS, this.COLS, this.BLOCKED);
  }
}
