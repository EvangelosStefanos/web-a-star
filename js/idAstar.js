class IDAstar {
  constructor(initial, goal){
    this.INITIAL = initial;
    this.GOAL = goal;
    this.INITIAL.evaluate(this.GOAL);
    this.limit = this.INITIAL.totalCost;
    this.path = [this.INITIAL];
    this.visited = new Map();
    this.searchFrontierAdditions = [];
    this.closedSetAdditions = [];
  }
  f(state){
    return Math.abs(state.x - this.GOAL.x) + Math.abs(state.y - this.GOAL.y);
  }
  search(path, g, limit, visited){
    let state = path[path.length-1];
    let f = g + this.f(state);
    if(f > limit){
      return f;
    }
    if(state.equals(this.GOAL)){
      return "FOUND";
    }
    let min = Number.POSITIVE_INFINITY;
    let children = state.expand(state);
    for(let i=0; i<children.length; i++){
      if(visited.has(children[i].key)){
        continue;
      }
      this.searchFrontierAdditions.push(children[i]);
      visited.set(children[i].key, true);
      path.push(children[i]);
      let t = this.search(path, g + 1, limit, visited);
      if(t == "FOUND"){
        return "FOUND";
      }
      if(t < min){
        min = t;
      }
      path.pop();
      visited.delete(children[i].key);
    }
    return min;
  }
  step() {
    this.searchFrontierAdditions = [this.INITIAL];
    let t = this.search(this.path, 0, this.limit, this.visited);
    if(t == "FOUND"){
      return true;
    }
    if(t == Number.POSITIVE_INFINITY){
      return true;
    }
    this.limit = t;
    return false;
  }
}
