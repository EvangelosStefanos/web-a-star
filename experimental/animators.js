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
  return "rgb("+point.red+", "+point.green+", "+point.blue+")";
}

class AnimatorInstant {
  constructor(initial, goal, blocked, rows, cols){
    this.colors = create2dArray(rows, cols, "white");
    this.colors[initial.x][initial.y] = "green";
    this.colors[goal.x][goal.y] = "red";
    blocked.forEach(b => this.colors[b.x][b.y] = "black");
    this.path = [];
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
    this.path = path.map(p=>{
        return {x: p.x, y: p.y, color: lerp1(p.distance / (path.length-1))}; //this.pathColors.push(lerp1(p.distance / (path.length-1)));
    })
  }
}

/*
TODO animation_time_i, newColor_i
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
*/
class AnimatorShader {
  constructor(initial, goal, blocked, rows, cols){
    this.colors = create2dArray(rows, cols, "white");
    this.colors[initial.x][initial.y] = "green";
    this.colors[goal.x][goal.y] = "red";
    blocked.forEach(b => this.colors[b.x][b.y] = "black");
    this.animation_times = create2dArray(rows, cols, 0);
    this.animation_durations = create2dArray(rows, cols, 0);
    this.TRANSITION_DURATION = 300; // ms
    this.PATH_TRANSITION_DURATION = 500; // ms
    this.newColors = Array.from(this.colors);
  }
  searchFrontierTransitions(array){ // search frontier addition transition is white to blue
    let time = AnimationTimeline.currentTime;
    for(let i=0; i<array.length; i++){
      let x = array[i].x;
      let y = array[i].y;
      if(this.colors[x][y] == "white" && this.animation_durations[x][y] == 0){
        this.animation_times[x][y] = time;
        this.animation_durations[x][y] = this.TRANSITION_DURATION;
        this.newColors[x][y] = "blue";
      }
    }
  }
  closedSetTransitions(array){ // closed set addition transition is blue to grey
    let time = AnimationTimeline.currentTime;
    for(let i=0; i<array.length; i++){
      let x = array[i].x;
      let y = array[i].y;
      if(this.colors[x][y] == "blue" && this.animation_durations[x][y] == 0){
        this.animation_times[x][y] = time;
        this.animation_durations[x][y] = this.TRANSITION_DURATION;
        this.newColors[x][y] = "grey";
      }
    }
  }
  pathTransitions(path){
    let time = AnimationTimeline.currentTime;
    let STAGGER = 50; // ms
    path.forEach(p=>{
        this.animation_times[p.x][p.y] = time - STAGGER * path.distance;
        this.animation_durations[x][y] = this.PATH_TRANSITION_DURATION;
        this.newColors[p.x][p.y] = this.lerp1(p.distance / (path.length-1));
    })
  }
  createAnimationTimes(time){ // time is total running time in ms
    let times = [];
    for(let i=0; i<this.animation_times.length; i++){
      times[i] = [];
      for(let j=0; this.animation_times[i].length; j++){
        if(this.animation_durations[i][j] == 0){
          continue; // animation inactive
        }
        times[i][j] = time - this.animation_times[i][j]; // time elapsed
        times[i][j] = times[i][j] / this.animation_durations[i][j]; // normalized time elapsed
        times[i][j] = this.clamp(0, 1, times[i][j]); // clamp to 0 1
        if(times[i][j] == 1){
          this.colors[i][j] = this.newColors[i][j]; // animation active and completed => reset animation status
          this.animation_durations[i][j] = 0;
          times[i][j] = 0;
        }
      }
    }
    return times; // returned times must be normalized to 0-1
  }
}
