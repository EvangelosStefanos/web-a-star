
class Renderer {
  constructor(rows, cols, animator){
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
      window.requestAnimationFrame(render);
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
    }
    else {
      window.requestAnimationFrame(render);
    }
    // draw path animation end
  }  
}
