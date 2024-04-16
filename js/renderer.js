function normalize5(x, xMin, xMax, newMin, newMax){
  return newMin + (x - xMin) * (newMax - newMin) / (xMax - xMin);
}
function normalize(x, xMax){
  return normalize5(x, 0, xMax, -1, 1);
}

class RendererSimple {
  constructor(rows, cols, animator){
    this.done = false;
    this.time_start = undefined;
    const canvas = document.querySelector("#canvas");
    canvas.width=800;
    canvas.height=800;
    this.gl = canvas.getContext("2d");
    this.gl.lineWidth = 5;
    this.gl.strokeStyle = "black";
    this.SIDE = 80;
    this.MARGIN = 5;
    this.OFFSET = 10;
    this.TIME_PER_SEGMENT = 500;
    this.ROWS = rows;
    this.COLS = cols;
    this.animator = animator;
  }
  render(time){
    for (var i = 0; i < this.ROWS; i++) {
      for (let j = 0; j < this.COLS; j++) {
        this.gl.strokeRect(j * this.SIDE + this.MARGIN, i * this.SIDE + this.MARGIN, this.SIDE, this.SIDE);
        this.gl.fillStyle = this.animator.colors[i][j];
        this.gl.fillRect(j * this.SIDE + this.MARGIN + this.OFFSET, i * this.SIDE + this.MARGIN + this.OFFSET, this.SIDE - 2 * this.OFFSET, this.SIDE - 2 * this.OFFSET);
      }
    }
    if (this.animator.path.length == 0) {
      return;
    }
    // draw path animation start
    if (this.time_start == undefined) {
      this.time_start = time;
    }
    let time_elapsed = time - this.time_start;
    for (i = 0; i < this.animator.path.length - 1; i++) {
      let progress = clamp(-1, this.TIME_PER_SEGMENT, time_elapsed - i * this.TIME_PER_SEGMENT) / this.TIME_PER_SEGMENT;
      if (progress <= 0) {
        break;
      }
      let p_i = this.animator.path[i];
      this.animator.colors[p_i.x][p_i.y] = p_i.color;
    }
    if (time_elapsed > this.TIME_PER_SEGMENT * (this.animator.path.length + 1)) {
      // animation time is more than max animation time
      this.time_start = undefined;
      document.querySelector("#start").removeAttribute("disabled", "");
      this.done = true;
    }
    // draw path animation end
  }  
}
class RendererShader {
  constructor(rows, cols, animator){
    this.animator = animator;
    this.done = false;
    //// grid ////
    this.SIDE = 80;
    this.ROWS = rows;
    this.COLS = cols;
    this.SPACING = 0;
    this.WIDTH = 800;
    let ASPECTRATIO = 1;
    this.HEIGHT = ASPECTRATIO * this.WIDTH;
    this.xOffset = (this.WIDTH - ((this.SIDE + this.SPACING) * this.COLS + this.SPACING)) / 2;
    this.yOffset = (this.HEIGHT - ((this.SIDE + this.SPACING) * this.ROWS + this.SPACING)) / 2;
    this.gridPositions = this.makeGrid();
    this.pointCount = this.gridPositions.length / 2;
    //// attributes ////
    this.aPositionsLoc = 0;
    this.aTimesLoc = 1;
    this.aColorsLoc = 2;
    this.aNewColorsLoc = 3;
    //// gl ////
    let o = this.setupWebGL();
    this.gl = o.gl;
    this.program = o.program;
  }
  /*
    80->160 center: 120 (side * 1.5)
    240->320 center: 280 (side * 3.5)
    400->480 center: 440 (side * 5.5)

    (1.5 + 2 * j) * side, (1.5 + 2 * i) * side

    
    xMax = 2 * side * COLS + side
    yMax = 2 * side * ROWS + side
    + .5 * (WIDTH - xMax)
    + .5 * (HEIGHT - yMax)

    0 => ((i + 0.5) * SIDE) + (i + 1) * SPACING => 40
    1 => ((i + 0.5) * SIDE) + (i + 1) * SPACING => 120
    2 => ((i + 0.5) * SIDE) + (i + 1) * SPACING => 200
    3 => ((i + 0.5) * SIDE) + (i + 1) * SPACING => 280
    4 => ((i + 0.5) * SIDE) + (i + 1) * SPACING => 360

    0 => (0 * SIDE) + 0.5 * SPACING => 10, 10 -> 10, yMax
    1 => (1 * SIDE) + 1.5 * SPACING => 110, 10 -> 10, yMax
    2 => (2 * SIDE) + 2.5 * SPACING => 210, 10 -> 10, yMax
    3 => (3 * SIDE) + 3.5 * SPACING => 310, 10
    4 => (4 * SIDE) + 4.5 * SPACING => 410, 10

    1280, 720 => -1, 1
    -1 => -0.10
    1 => -0.05
    
    -0.10 => 0
    -0.05 => 1
    normalization
  */
  
  makeGrid(){
    if(this.xOffset < 0){
      console.log("Critical Error. Row length exceeds canvas width.");
      return;
    }
    if(this.yOffset < 0) {
      console.log("Critical Error. Column length exceeds canvas height.");
      return;
    }
    let grid = [];
    for(let i=0; i<this.ROWS; i++){
      for(let j=0; j<this.COLS; j++){
        let x = ((j + 0.5) * this.SIDE) + (j + 1) * this.SPACING + this.xOffset; // (1.5 + 2 * j) * SIDE + xOffset;
        grid.push(normalize(x, this.WIDTH)); // push x
        let y = ((i + 0.5) * this.SIDE) + (i + 1) * this.SPACING + this.yOffset; // (1.5 + 2 * i) * SIDE + yOffset;
        grid.push(normalize(y, this.HEIGHT)); // push y
      }
    }      
    return grid;
  }
  getRenderingContext() {
    const canvas = document.querySelector("canvas");
    canvas.width = this.WIDTH;
    canvas.height = this.HEIGHT;
    let gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) {
      console.log("Failed to get WebGL context. Your browser or device may not support WebGL.");
      return null;
    }
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return gl;
  }
  setupWebGL() {
    let gl = this.getRenderingContext();
    if (!(gl)) return null;

    let sourcev = document.querySelector("#vertex-shader").innerHTML;
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, sourcev);
    gl.compileShader(vertexShader);

    let sourcef = document.querySelector("#fragment-shader").innerHTML;
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, sourcef);
    gl.compileShader(fragmentShader);
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.detachShader(program, vertexShader);
    gl.detachShader(program, fragmentShader);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const linkErrLog = gl.getProgramInfoLog(program);
      this.cleanup(gl);
      console.log(`Shader program did not link successfully. Error log: ${linkErrLog}`);
      return;
    }
    gl.useProgram(program);
    this.initializeAttributes(gl, program);
    this.initializeUniforms(gl, program);
    gl.drawArrays(gl.POINTS, 0, this.pointCount);
    // window.requestAnimationFrame(render);
    return {gl: gl, program: program};
  }
  parseColor(color){
    let tokens = color.replace(/[rgb()\s]+/g, "").split(",");
    return {r: Number.parseFloat(tokens[0])/255, g: Number.parseFloat(tokens[1])/255, b: Number.parseFloat(tokens[2])/255};
  }
  /*
  0 0 | 0 1 // 2 * i * cols + 2 * j + 1
  0 1 | 2 3
  0 2 | 4 5
  0 3 | 6 7
  1 0 | 8 9
  1 1 | 10 11
  1 2 | 12 13
  1 3 | 14 15
  */
  createBuffer(positions, times, colors, newColors){
    let buffer = [];
    for(let i=0; i<this.ROWS; i++){
      for(let j=0; j<this.COLS; j++){
        let positionsIndex = 2 * i * this.COLS + 2 * j;
        buffer.push(positions[positionsIndex]);
        buffer.push(positions[positionsIndex + 1]);
        buffer.push(times[i][j]);
        let color = this.parseColor(colors[i][j]);
        buffer.push(color.r);
        buffer.push(color.g);
        buffer.push(color.b);
        let newColor = this.parseColor(newColors[i][j]);
        buffer.push(newColor.r);
        buffer.push(newColor.g);
        buffer.push(newColor.b);
      }
    }
    return buffer;
  }
  initializeAttributes(gl, program) {
    //// aPositions
    //// aTimes
    //// aColor
    //// aNewColor
    let aData = this.createBuffer(
      this.gridPositions,
      this.animator.animation_times,
      this.animator.colors,
      this.animator.newColors
    );

    this.aPositionsLoc = gl.getAttribLocation(program, "aPosition");
    this.aTimesLoc = gl.getAttribLocation(program, "aTime");
    this.aColorsLoc = gl.getAttribLocation(program, "aColor");
    this.aNewColorsLoc = gl.getAttribLocation(program, "aNewColor");

    gl.vertexAttrib2f(this.aPositionsLoc, 0, 0);
    gl.vertexAttrib1f(this.aTimesLoc, 0);
    gl.vertexAttrib3f(this.aColorsLoc, 1, 0, 0);
    gl.vertexAttrib3f(this.aNewColorsLoc, 0, 1, 0);

    this.aBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.aBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(aData), gl.STATIC_DRAW);

    let STRIDE = 36;
    gl.vertexAttribPointer(this.aPositionsLoc, 2, gl.FLOAT, false, STRIDE, 0);
    gl.vertexAttribPointer(this.aTimesLoc, 1, gl.FLOAT, false, STRIDE, 2 * 4);
    gl.vertexAttribPointer(this.aColorsLoc, 3, gl.FLOAT, false, STRIDE, 3 * 4);
    gl.vertexAttribPointer(this.aNewColorsLoc, 3, gl.FLOAT, false, STRIDE, 6 * 4);

    gl.enableVertexAttribArray(this.aPositionsLoc);
    gl.enableVertexAttribArray(this.aTimesLoc);
    gl.enableVertexAttribArray(this.aColorsLoc);
    gl.enableVertexAttribArray(this.aNewColorsLoc);
  }
  initializeUniforms(gl, program){
    //// uPointSize // Square Size
    this.uPointSizeLoc = gl.getUniformLocation(program, 'uPointSize');
    gl.uniform1f(this.uPointSizeLoc, this.SIDE);
  }
  cleanup(gl) {
    gl.useProgram(null);
    if (this.aBuffer) {
      gl.deleteBuffer(this.aBuffer);
    }
    if (this.program) {
      gl.deleteProgram(this.program);
    }
  }
  render(time){
    // attribute positions
    // attribute times
    // attribute colors
    // attribute newColors
    let aData = this.createBuffer(
      this.gridPositions,
      this.animator.createAnimationTimes(time),
      this.animator.colors,
      this.animator.newColors
    );
    // buffer data
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(aData), this.gl.STATIC_DRAW);
    // draw
    this.gl.drawArrays(this.gl.POINTS, 0, this.pointCount);
  }
}
