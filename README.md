# web-a-star
  A Javascript implementation of the A* search algorithm.

## State Space
  The state space is composed of a completely static 2-dimensional grid.

## Actions
  Transitions between states are made by a total of 4 actions.
  - GoUp: Transition from current state to the one above it.
  - GoDown: Transition from current state to the one below it.
  - GoLeft: Transition from current state to the one to its left.
  - GoRight: Transition from current state to the one to its right.

## Heuristic
  The Manhattan distance function $D = abs(x_1 - x_2) + abs(y_1 - y_2)$ is used as the heuristic function for the algorithm.

## Search Frontier
  Good A* algorithm implementations will use a Heap data structure for the Search Frontier. However, there is no such data structure in Javascript so I simulated one using Javascript `Array`. The array is sorted after every `push()` in descending order. That allows me to use `pop()` to extract the minimum element in the array. Clearly an inferior solution performance-wise to a Heap but the code required was minimal.

  |              |Insert|Delete Min|
  |--------------|-------------|------|
  |**Sorted Array**|$O(n^2)$|$O(1)$|
  |**Heap**        |$O(logn)$         |$O(logn)$|

## Visual
  The implementation also features a visualization of the way the algorithm works made with WebGL.

## See Also
  [https://qiao.github.io/PathFinding.js/visual/]() Excellent visualization of various search algorithms.