//// Requires gridSpace.js to be already loaded. ////

let aStar ={
  sorted_push(array, item){
    array.push(item);
    array.sort(gridSpace.compare);
  },
  includes(array, state){
    return array.filter(x => gridSpace.equals(x, state)).length > 0;
  },
  hasBetter(array, state){
    return array
      .filter(x => gridSpace.equals(x, state))
      .filter(x => gridSpace.compare(x, state) >= 0)
      .length > 0;
  },

  init(){ // public
    let data = gridSpace.init();
    let closed_set = [];
    let search_frontier = [];
    aStar.sorted_push(search_frontier, initial);
    let done = false;
    let convertedPath = [];
    return {
      initial: data.initial,
      goal: data.goal,
      colors: data.colors,
      maxRows: data.maxRows,
      maxCols: data.maxCols,
      closed_set: closed_set,
      search_frontier: search_frontier,
      done: done,
      convertedPath: convertedPath,
    }
  },

  step(data){
    if(data.done || data.search_frontier.length <= 0){
      clearInterval(data.intervalId);
      data.done = true;
      return data.done;
    }
    // if(search_frontier.length > 0) { // if there are states in the search frontier
    //static int k = 0; // These 3 lines print how many iterations the algorithm does.
    //k++;
    //cout << "Loops Began :" << k <<endl;

    state = data.search_frontier.pop(); // Acquire the best state from the search frontier
    if(aStar.includes(data.closed_set, state)){
      return data.done; // If state has already been visited continue the next iteration
    }
    
    if(gridSpace.equals(state, data.goal)){ //If state is final, print the path and exit
      gridSpace.print_path(state);
      data.convertedPath = gridSpace.convert_path(state.path, data.initial.x, data.initial.y); // TODO fix
      data.done = true;
      return data.done;
    }
    
    children = gridSpace.expand(state);
    for(i=0; i<children.length; i++){ // Evaluate all children and add them to the search frontier
      gridSpace.evaluate(children[i], data.goal);
      if(aStar.hasBetter(data.search_frontier, children[i])){
        continue; // if child already in search_frontier with a better heuristic then skip
      }
      if(aStar.hasBetter(data.closed_set, children[i])){
        continue; // if child already in closed_set with a better heuristic then skip
      }
      aStar.sorted_push(data.search_frontier, children[i]);
      if(data.colors[children[i].x][children[i].y] == "white"){
        data.colors[children[i].x][children[i].y] = "blue";
      }
    }
    data.closed_set.push(state); // Add parent state to the closed set
    if(data.colors[state.x][state.y] == "blue"){
      data.colors[state.x][state.y] = "grey";
    }
    return data.done;
  }
}
