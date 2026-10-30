import { bfs } from './bfs.js';
import { dfs } from './dfs.js';
import { dijkstra } from './dijkstra.js';
import { astar } from './astar.js';

export const algorithms = { bfs, dfs, dijkstra, astar };

export const algorithmDetails = {
  bfs: {
    name: 'Breadth-First Search', short: 'BFS', structure: 'FIFO queue',
    time: 'O(V + E)', space: 'O(V)', shortest: 'Yes, for unweighted graphs',
    weighted: 'No — ignores weights',
    description: 'Explores nodes in expanding layers, visiting all nodes one step away before moving outward.',
    applications: 'Shortest moves in puzzles, unweighted routes, peer-to-peer networks.',
    note: 'The shortest path is measured in number of edges, not total weighted cost.',
  },
  dfs: {
    name: 'Depth-First Search', short: 'DFS', structure: 'LIFO stack',
    time: 'O(V + E)', space: 'O(V)', shortest: 'No',
    weighted: 'No — ignores weights',
    description: 'Follows one branch as far as possible before backtracking to explore other branches.',
    applications: 'Maze exploration, cycle detection, topological sorting, connectivity.',
    note: 'It can find a valid route but does not guarantee that it is the shortest.',
  },
  dijkstra: {
    name: "Dijkstra's Algorithm", short: 'Dijkstra', structure: 'Binary min-heap',
    time: 'O((V + E) log V)', space: 'O(V + E)', shortest: 'Yes, minimum cost',
    weighted: 'Yes — positive costs',
    description: 'Repeatedly settles the node with the lowest known travel cost, relaxing outgoing edges.',
    applications: 'Road routing, network latency optimization, weighted navigation.',
    note: 'All traversal costs must be non-negative; here every cell costs at least 1.',
  },
  astar: {
    name: 'A* Search', short: 'A*', structure: 'Binary min-heap',
    time: 'O((V + E) log V) worst-case with this heap implementation', space: 'O(V + E)',
    shortest: 'Yes, with admissible heuristic', weighted: 'Yes — positive costs',
    description: 'Prioritizes f(n) = g(n) + h(n), combining known travel cost with distance to the goal.',
    applications: 'Game AI, robotics, grid navigation, route planning.',
    note: 'Manhattan distance × 1 is consistent for four-way movement and cell costs ≥ 1.',
  },
};
