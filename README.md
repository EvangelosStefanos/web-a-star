# web-a-star
  A Javascript implementation of the A* search algorithm.
  
  See it in action [**_here_**](https://evangelosstefanos.github.io/web-a-star/).

## State Space
  The state space is composed of a completely static 2-dimensional grid.

## Actions
  Transitions between states are made by a total of 4 actions.
  - goUp: Transition from current state to the one above it.
  - goDown: Transition from current state to the one below it.
  - goLeft: Transition from current state to the one to its left.
  - goRight: Transition from current state to the one to its right.

## Heuristic
  The Manhattan distance function $D = abs(x_1 - x_2) + abs(y_1 - y_2)$ is used as the heuristic function for the algorithm.

## Search Frontier
  Good A* algorithm implementations will use a Heap data structure for the Search Frontier. However, there is no such data structure in Javascript so I used a Javascript `Map` instead. That means there is $O(n)$ cost to find (by linear search) and extract the best state at each step instead of the Heap's $O(logn)$ but state lookup in the Search Frontier costs [sublinear](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#description) time (maybe even $O(1)$).

## Visual
  The implementation also features a graphical user interface made with Bootstrap 5 and a 2d graphical visualization of the way the algorithm works made with WebGL. There is also an additional even better version that utilizes shaders for the graphical visualization.

## See Also
  [https://qiao.github.io/PathFinding.js/visual/](https://qiao.github.io/PathFinding.js/visual/) Excellent visualization of various search algorithms.