
class Astar {
  constructor(initial, goal, comparator){
    this.initial = initial;
    this.goal = goal;
    this.closed_set = new Map();
    this.search_frontier = new Map();
    this.search_frontier.set(initial.key, initial)
    //this.searchFrontierAdd(initial);
    this.done = false;
    this.comparator = comparator;
    this.search_frontier_additions = [];
    this.closed_set_additions = [];
    this.convertedPath = [];
  }
  searchFrontierAdd(item){
    this.search_frontier.push(item);
    this.search_frontier.sort(this.comparator);
  }
  mapExtractBest(map){
    let bestState = undefined;
    let bestKey = undefined;
    for(const [k, v] of map){
      if(bestState == undefined){
        bestState = v;
        bestKey = k;
      }
      if(this.comparator(v, bestState) > 0){
        bestState = v;
        bestKey = k;
      }
    }
    map.delete(bestKey);
    return bestState;
  }
  mapHasBetterOrEqual(map, state){
    if(map.has(state.key)){
      let existing = map.get(state.key);
      return this.comparator(existing, state) >= 0;
    }
    return false;
  }
  arrayHasBetterOrEqual(array, state){
    return array
      .filter(x => x.equals(state))
      .filter(x => this.comparator(x, state) >= 0)
      .length > 0;
  }

  step(){
    if(this.done || this.search_frontier.length <= 0){
      this.done = true;
      return this.done;
    }

    let state = this.mapExtractBest(this.search_frontier); // Acquire the best state from the search frontier
    if(this.closed_set.has(state.key)){
      throw new Error("Accessing state that is already in the Closed Set.");
      // return this.done; // If state has already been visited continue the next iteration
    }
    
    if(state.equals(this.goal)){ //If state is final, print the path and exit
      state.print_path();
      this.convertedPath = state.convert_path(this.initial.x, this.initial.y);
      this.done = true;
      return this.done;
    }
    
    this.search_frontier_additions = [];
    let children = state.expand();
    for(let i=0; i<children.length; i++){ // Evaluate all children and add them to the search frontier
      children[i].evaluate(this.goal);
      if(this.mapHasBetterOrEqual(this.search_frontier, children[i])){
        continue; // if child already in search_frontier with a better (lower) cost then skip
      }
      if(this.mapHasBetterOrEqual(this.closed_set, children[i])){
        continue; // if child already in closed_set with a better (lower) cost then skip
      }
      // this.searchFrontierAdd(children[i]);
      this.search_frontier.set(children[i].key, children[i]);
      this.search_frontier_additions.push(children[i]);
    }
    // this.closed_set.push(state); // Add parent state to the closed set
    this.closed_set.set(state.key, state); // Add parent state to the closed set
    this.closed_set_additions = [state];
    return this.done;
  }
}
