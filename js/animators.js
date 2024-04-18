function create2dArray(rows, cols, value){
  let colors = [];
  for (let i = 0; i < rows; i++) {
    colors.push([]);
    for (let j = 0; j < cols; j++) {
      colors[i][j] = value;
    }
  }
  return colors;
}
function clamp(min, max, value) {
  return Math.min(Math.max(value, min), max);
}
function lerp3(startColor, endColor, percentFade){
  let diffRed = endColor.red - startColor.red;
  let diffGreen = endColor.green - startColor.green;
  let diffBlue = endColor.blue - startColor.blue;
  return {
    red: (diffRed * percentFade) + startColor.red,
    green: (diffGreen * percentFade) + startColor.green,
    blue: (diffBlue * percentFade) + startColor.blue,
  }
}
function lerp1(percentFade){
  let point = this.lerp3({ red: 0, green: 255, blue: 0 }, { red: 255, green: 0, blue: 0 }, percentFade);
  return "rgb( "+point.red+", "+point.green+", "+point.blue+" )";
}

class AnimatorInstant {
  constructor(initial, goal, blocked, rows, cols){
    this.colors = create2dArray(rows, cols, "white");
    this.colors[initial.x][initial.y] = "green";
    this.colors[goal.x][goal.y] = "red";
    blocked.forEach(b => this.colors[b.x][b.y] = "black");
    this.path = [];
    this.endTime = Number.POSITIVE_INFINITY;
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
      let x = array[i].x;
      let y = array[i].y;
      if(this.colors[x][y] == "white"){
        this.colors[x][y] = "blue";
      }
    }
  }
  closedSetTransitions(array){ // closed set addition transition is blue to grey
    for(let i=0; i<array.length; i++){
      let x = array[i].x;
      let y = array[i].y;
      if(this.colors[x][y] == "blue"){
        this.colors[x][y] = "grey";
      }
    }
  }
  pathTransitions(path){
    let time = performance.now();
    let TIME_PER_SEGMENT = 500;
    this.endTime = time + TIME_PER_SEGMENT * path.length;
    this.path = path.map(p, i=>{
        return {x: p.x, y: p.y, color: lerp1(i / (path.length-1))}; //this.pathColors.push(lerp1(p.distance / (path.length-1)));
    })
  }
}

/*
if animation_time_i == 0 >> dont update animation_time_i >> pass animation_time_i
animation_time_i = 0.001
elif animation_time_i > 0 >> update animation_time_i >> pass animation_time_i
elif animation_time_i > 1 >> oldColor_i = newColor_i >> animation_time_i = 0 >> pass animation_time_i

if converted_path.length > 0
after animation_time_i calculations add stagger
total animation time is max + offset
milis_elapsed / 500
for each point on the animation path add stagger time
if on animation path >> animation_time_i - 50 * path_distance >> clamp 0 1
0   >> 0    -0.05 -0.1  -0.15
0.1 >> 0.05  0    -0.05 -0.1
clamp to 0-1
| x y | t | r g b | r g b |
*/
class AnimatorShader {
  constructor(initial, goal, blocked, rows, cols){
    this.WHITE = "rgb( 255, 255, 255 )";
    this.GREY = "rgb( 127.5, 127.5, 127.5 )";
    this.BLACK = "rgb( 0, 0, 0 )";
    this.RED = "rgb( 255, 0, 0 )";
    this.GREEN = "rgb( 0, 255, 0 )";
    this.BLUE = "rgb( 0, 0, 255 )";
    this.colors = create2dArray(rows, cols, this.WHITE);
    this.colors[initial.x][initial.y] = this.GREEN;
    this.colors[goal.x][goal.y] = this.RED;
    blocked.forEach(b => this.colors[b.x][b.y] = this.BLACK);
    this.animation_times = create2dArray(rows, cols, 0);
    this.animation_durations = create2dArray(rows, cols, 0);
    this.TRANSITION_DURATION = 400; // ms
    this.PATH_TRANSITION_DURATION = 400; // ms
    this.newColors = this.colors.map(x=>x.map(y=>y));
    this.endTime = Number.POSITIVE_INFINITY;
    this.stack = [];
    this.animating = 0;
  }
  searchFrontierTransitions(array){ // search frontier addition transition is white to blue
    let time = performance.now();
    for(let i=0; i<array.length; i++){
      let x = array[i].x;
      let y = array[i].y;
      if(this.colors[x][y] == this.WHITE && this.animation_durations[x][y] == 0){
        this.animation_times[x][y] = time;
        this.animation_durations[x][y] = this.TRANSITION_DURATION;
        this.newColors[x][y] = this.BLUE;
        this.animating += 1;
      }
    }
  }
  closedSetTransitions(array){ // closed set addition transition is blue to grey
    let time = performance.now();
    for(let i=0; i<array.length; i++){
      let x = array[i].x;
      let y = array[i].y;
      let blueOrWhite = this.colors[x][y] == this.BLUE || this.colors[x][y] == this.WHITE;
      if(blueOrWhite && this.animation_durations[x][y] == 0){
        this.animation_times[x][y] = time;
        this.animation_durations[x][y] = this.TRANSITION_DURATION;
        this.newColors[x][y] = this.GREY;
        this.animating += 1;
      }
    }
  }
  /*
  0 duration
  stagger+duration
  2*stagger+duration
  3*
  
  100 300
  0+300
  100+300
  200+300
  300+300
  400+300
  */
  pathTransitions(path){
    let STAGGER = 200; // ms
    let time = performance.now();
    this.endTime = time + this.PATH_TRANSITION_DURATION + STAGGER * path.length;
    for(let i=0; i<path.length; i++){
      this.animation_times[path[i].x][path[i].y] = time + STAGGER * i;
      this.animation_durations[path[i].x][path[i].y] = this.PATH_TRANSITION_DURATION;
      this.newColors[path[i].x][path[i].y] = lerp1( i / (path.length - 1) );
      this.animating += 1;
    }
  }
  createAnimationTimes(time){ // time is total running time in ms
    if(this.animating == 0 && this.stack.length > 0){
      this.pathTransitions(this.stack[this.stack.length-1]);
      this.stack.pop();
    }
    let times = [];
    for(let i=0; i<this.animation_times.length; i++){
      times.push([]);
      for(let j=0; j<this.animation_times[i].length; j++){
        if(this.animation_durations[i][j] == 0){
          times[i][j] = 0;
          continue; // animation inactive
        }
        times[i][j] = time - this.animation_times[i][j]; // time elapsed
        times[i][j] = times[i][j] / this.animation_durations[i][j]; // normalized time elapsed
        times[i][j] = clamp(0, 1, times[i][j]); // clamp to 0 1
        if(times[i][j] >= 1){
          this.colors[i][j] = this.newColors[i][j]; // animation active and completed => reset animation status
          this.animation_durations[i][j] = 0;
          times[i][j] = 0;
          this.animating -= 1;
        }
      }
    }
    return times; // returned times must be normalized to 0-1
  }
}
