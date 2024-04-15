
class Astar {
  constructor(initial, goal, comparator){
    this.initial = initial;
    this.goal = goal;
    this.closed_set = [];
    this.search_frontier = [];
    this.searchFrontierAdd(initial);
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
  closedSetIncludes(state){
    return this.closed_set.filter(x => x.equals(state)).length > 0;
  }
  hasBetter(array, state){
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
    // if(search_frontier.length > 0) { // if there are states in the search frontier
    //static int k = 0; // These 3 lines print how many iterations the algorithm does.
    //k++;
    //cout << "Loops Began :" << k <<endl;

    let state = this.search_frontier.pop(); // Acquire the best state from the search frontier
    if(this.closedSetIncludes(state)){
      return this.done; // If state has already been visited continue the next iteration
    }
    
    if(state.equals(this.goal)){ //If state is final, print the path and exit
      state.print_path();
      this.convertedPath = state.convert_path(this.initial.x, this.initial.y); // TODO fix IMPORTANT
      this.done = true;
      return this.done;
    }
    
    this.search_frontier_additions = [];
    let children = state.expand();
    for(let i=0; i<children.length; i++){ // Evaluate all children and add them to the search frontier
      children[i].evaluate(this.goal);
      if(this.hasBetter(this.search_frontier, children[i])){
        continue; // if child already in search_frontier with a better heuristic then skip
      }
      if(this.hasBetter(this.closed_set, children[i])){
        continue; // if child already in closed_set with a better heuristic then skip
      }
      this.searchFrontierAdd(children[i]);
      /*
      if(data.colors[children[i].x][children[i].y] == "white"){ // TODO detect color change and update animation tracking
        data.colors[children[i].x][children[i].y] = "blue";
      }
      */
      // animator.whiteToBlue(data.graphics.colors, children[i].x, children[i].y); //TODO test
      this.search_frontier_additions.push(children[i]);
    }
    this.closed_set.push(state); // Add parent state to the closed set
    this.closed_set_additions = [state];
    /*
    if(data.colors[state.x][state.y] == "blue"){ // TODO detect color change and update animation tracking
      data.colors[state.x][state.y] = "grey";
    }
    */
    // animator.blueToGrey(data.graphics.colors, state.x, state.y); //TODO test
    return this.done;
  }
}
