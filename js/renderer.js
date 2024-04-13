
let renderer = {
  data: {},
  //// Render
  clamp(min, max, value) {
    return Math.min(Math.max(value, min), max);
  },
  lerp3(startColor, endColor, percentFade){
    var diffRed = endColor.red - startColor.red;
    var diffGreen = endColor.green - startColor.green;
    var diffBlue = endColor.blue - startColor.blue;
    return {
      red: (diffRed * percentFade) + startColor.red,
      green: (diffGreen * percentFade) + startColor.green,
      blue: (diffBlue * percentFade) + startColor.blue,
    }
  },
  lerp1(percentFade){
    point = renderer.lerp3({ red: 0, green: 255, blue: 0 }, { red: 255, green: 0, blue: 0 }, percentFade);
    return "rgb("+point.red+", "+point.green+", "+point.blue+")";
  },
  time_start: undefined,
}

function render(time) { // public
  const canvas = document.querySelector("#canvas");
  canvas.width=730;
  canvas.height=730;
  const gl = canvas.getContext("2d");
  gl.lineWidth = 5;
  gl.strokeStyle = "black";
  SIDE = 80;
  MARGIN = 5;
  OFFSET = 10;
  for(i=0; i<renderer.data.maxRows; i++){
    for(j=0; j<renderer.data.maxCols; j++){
      gl.strokeRect(j*SIDE+MARGIN, i*SIDE+MARGIN, SIDE, SIDE);
      gl.fillStyle = colors[i][j];
      gl.fillRect(j*SIDE+MARGIN+OFFSET, i*SIDE+MARGIN+OFFSET, SIDE-2*OFFSET, SIDE-2*OFFSET);  
    }
  }
  if(!renderer.data.done){
    window.requestAnimationFrame(render);
    return;
  }
  // draw path animation start
  TIME_PER_SEGMENT = 500;
  if(renderer.time_start == undefined){
    renderer.time_start = time;
  }
  renderer.time_elapsed = time - renderer.time_start;
  // gl.strokeStyle = "green";
  // gl.moveTo(globals.data.centers[0].x, globals.data.centers[0].y);
  for(i=0; i<renderer.data.convertedPath.length-1; i++){
    progress = renderer.clamp(-1, TIME_PER_SEGMENT, renderer.time_elapsed - i * TIME_PER_SEGMENT) / TIME_PER_SEGMENT;
    if (progress <= 0) {
      break;
    }
    // heuristic or path length => clamp >> normalize >> lerp => color
    c_i = renderer.data.convertedPath[i];
    renderer.data.colors[c_i.row][c_i.col] = renderer.lerp1(c_i.distance / renderer.data.convertedPath.length);
    // dx = globals.data.centers[i+1].x - globals.data.centers[i].x;
    // dy = globals.data.centers[i+1].y - globals.data.centers[i].y;
    // draw line segment
    // gl.strokeStyle = lerp1(i/globals.data.centers.length-1);
    // gl.lineTo(globals.data.centers[i].x + progress * dx, globals.data.centers[i].y + progress * dy);
  }
  // gl.stroke();
  if (renderer.time_elapsed > TIME_PER_SEGMENT * (renderer.data.convertedPath.length + 1)) {
    // animation time is more than max animation time
    renderer.time_start = undefined;
    document.querySelector("#start").removeAttribute("disabled", "");
  }
  else{
    window.requestAnimationFrame(render);
  }
  // draw path animation end
}
