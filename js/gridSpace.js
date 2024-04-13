
let gridSpace = {
  ROWS: 9,
  COLS: 9,
  colors: [],
  //// COLORS
  createColors2(rows, cols){
    let colors = [];    
    for (i = 0; i < rows; i++) {
      colors.push([]);
      for (j = 0; j < cols; j++) {
        colors[i][j] = "white";
      }
    }
    return colors;
  },
  createColors(){
    return gridSpace.createColors2(gridSpace.ROWS, gridSpace.COLS);
  },
  //// State
  newState4(x, y, rows, cols){
    free = [];
    for(i=0; i<rows; i++){
      free.push([]);
      for(j=0; j<cols; j++){
        free[i][j] = true;
      }
    }
    return {
      x: x,
      y: y,
      free: free,
      path: [],
      heuristic: Number.POSITIVE_INFINITY,
    }
  },
  newState(x, y){
    return gridSpace.newState4(x, y, gridSpace.ROWS, gridSpace.COLS);
  },
  cloneState(state){
    clone = gridSpace.newState(0, 0);
    clone.x = state.x;
    clone.y = state.y;
    clone.free = Array.from(state.free);
    clone.path = Array.from(state.path);
    clone.heuristic = state.heuristic;
    return clone;
  },
  equals(state, other){ // public
    return state.x == other.x && state.y == other.y;
  },
  print_path(state){ // public
    console.log(state.path.join("->"));
  },
  convert_path(path, rowInitial, colInitial) { // public
    let array = [];
    var row = rowInitial;
    var col = colInitial;
    array.push({row: row, col: col, distance: 0});
    for (i = 0; i < path.length; i++) {
      if (path[i] == "Up") {
        row -= 1;
      }
      else if (path[i] == "Down") {
        row += 1;
      }
      else if (path[i] == "Left") {
        col -= 1;
      }
      else if (path[i] == "Right") {
        col += 1;
      }
      else{
        console.log("Error. Should never happen. Invalid value in path.");
      }
      array.push({row: row, col: col, distance: i+1});
    }
    return array;
  },
  //// Actions
  goUp(parent){
    child = gridSpace.cloneState(parent);
    isValid = false;
    if(parent.x > 0 && parent.free[parent.x-1][parent.y] ){
      child.x -= 1;
      child.path.push("Up");
      isValid = true;
    }
    return {
      isValid: isValid,
      child: child,
    }
  },
  goDown(parent){
    child = gridSpace.cloneState(parent);
    isValid = false;
    if(parent.x < gridSpace.ROWS-1 && parent.free[parent.x+1][parent.y] ){
      child.x += 1;
      child.path.push("Down");
      isValid = true;
    }
    return {
      isValid: isValid,
      child: child,
    }
  },
  goLeft(parent){
    child = gridSpace.cloneState(parent);
    isValid = false;
    if(parent.y > 0 && parent.free[parent.x][parent.y-1] ){
      child.y -= 1;
      child.path.push("Left");
      isValid = true;
    }
    return {
      isValid: isValid,
      child: child,
    }
  },
  goRight(parent){
    child = gridSpace.cloneState(parent);
    isValid = false;
    if(parent.y < gridSpace.COLS-1 && parent.free[parent.x][parent.y+1] ){
      child.y += 1;
      child.path.push("Right");
      isValid = true;
    }
    return {
      isValid: isValid,
      child: child,
    }
  },
  //// Expand and Heuristic
  expand(parent){
    actions = [
      gridSpace.goUp(parent),
      gridSpace.goDown(parent),
      gridSpace.goLeft(parent),
      gridSpace.goRight(parent)
    ];
    return actions.filter(x => x.isValid).map(x => x.child);
  },
  evaluate(state, goal) {
    state.heuristic = Math.abs(state.x - goal.x) + Math.abs(state.y - goal.y);
  },
  /* if < 0 then state > other
    * if > 0 then state < other
  */
  compare(state, other){ // public
    return other.heuristic - state.heuristic; // descending order so i can use pop() to extract minimum
  },
  init(){ // public
    initial = gridSpace.newState(2, 2);
    initial.free[6][2] = false;
    initial.free[5][3] = false;
    initial.free[6][3] = false;
    initial.free[7][4] = false;
    initial.free[5][5] = false;
    initial.free[6][5] = false;
    initial.free[5][6] = false;
    initial.free[2][7] = false;
    initial.free[3][7] = false;
    initial.free[4][7] = false;
    initial.free[5][7] = false;
    goal = gridSpace.newState(7, 8);

    colors = gridSpace.createColors();
    colors[2][2] = "green";
    colors[6][2] = "black";
    colors[5][3] = "black";
    colors[6][3] = "black";
    colors[7][4] = "black";
    colors[5][5] = "black";
    colors[6][5] = "black";
    colors[5][6] = "black";
    colors[2][7] = "black";
    colors[3][7] = "black";
    colors[4][7] = "black";
    colors[5][7] = "black";
    colors[7][8] = "red";
    return {initial: initial, goal: goal, colors: colors, maxRows: gridSpace.ROWS, maxCols: gridSpace.COLS};
  },
}

