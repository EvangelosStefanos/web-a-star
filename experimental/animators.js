class AnimatorInstant {
  constructor(initial, goal, blocked, rows, cols){
    this.colors = this.createColors2(rows, cols);
    this.colors[initial.x][initial.y] = "green";
    this.colors[goal.x][goal.y] = "red";
    blocked.forEach(b => this.colors[b.x][b.y] = "black");
  }
  //// COLORS
  createColors2(rows, cols){
    let colors = [];
    for (let i = 0; i < rows; i++) {
      colors.push([]);
      for (let j = 0; j < cols; j++) {
        colors[i][j] = "white";
      }
    }
    return colors;
  }
  //// Color Transitions
  transition(colors, x, y, fromColor, toColor){
    if(colors[x][y] == fromColor){
      colors[x][y] = toColor;
    }
  }
  whiteToBlue(colors, x, y){
    this.animator.transition(colors, x, y, "white", "blue");
  }
  blueToGrey(colors, x, y){
    this.animator.transition(colors, x, y, "blue", "grey");
  }
  searchFrontierTransitions(array){ // search frontier addition transition is white to blue
    for(let i=0; i<array.length; i++){
      if(this.colors[array[i].x][array[i].y] == "white"){
        this.colors[array[i].x][array[i].y] = "blue";
      }
    }
  }
  closedSetTransitions(array){ // closed set addition transition is blue to grey
    for(let i=0; i<array.length; i++){
      if(this.colors[array[i].x][array[i].y] == "blue"){
        this.colors[array[i].x][array[i].y] = "grey";
      }
    }
  }
}

/*
TODO animation_time_i, newColor_i
if animation_time_i == 0 >> dont update animation_time_i >> pass animation_time_i
animation_time_i = 0.001
elif animation_time_i > 0 >> update animation_time_i >> pass animation_time_i
elif animation_time_i > 1 >> oldColor_i = newColor_i >> animation_time_i = 0 >> pass animation_time_i
*/
