
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
    this.convertedPath = [];
  }
  //// Render
  clamp(min, max, value) {
    return Math.min(Math.max(value, min), max);
  }
  lerp3(startColor, endColor, percentFade){
    let diffRed = endColor.red - startColor.red;
    let diffGreen = endColor.green - startColor.green;
    let diffBlue = endColor.blue - startColor.blue;
    return {
      red: (diffRed * percentFade) + startColor.red,
      green: (diffGreen * percentFade) + startColor.green,
      blue: (diffBlue * percentFade) + startColor.blue,
    }
  }
  lerp1(percentFade){
    let point = this.lerp3({ red: 0, green: 255, blue: 0 }, { red: 255, green: 0, blue: 0 }, percentFade);
    return "rgb("+point.red+", "+point.green+", "+point.blue+")";
  }
}
