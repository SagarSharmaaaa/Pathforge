# PathForge — Interactive Pathfinding Visualizer

A professional, fully client-side ADSA mini-project that visualizes **Breadth-First Search**, **Depth-First Search**, **Dijkstra's Algorithm**, and **A* Search** on an interactive four-direction grid.

## Requirements

- **Node.js 20.19+ or 22+**, with npm
- VS Code (recommended), or any terminal / editor
- Internet connection for the initial `npm install` and optional Google Fonts

## Run locally in VS Code

1. **Extract the ZIP**. Open the extracted `PathForge` folder with **File → Open Folder** in VS Code.
2. Open **Terminal → New Terminal**.
3. Run:

   ```bash
   npm install
   npm run dev
   ```

4. Open the local URL displayed by Vite, typically **http://localhost:5173**.

No backend, authentication, environment variables, API keys or database is required.

## Production build

```bash
npm run build
npm run preview
```

The static site appears in `dist/`. All navigation and processing runs in the browser.

## Unit tests

```bash
npm test
```

The tests cover empty grids, adjacent nodes, blocked goals, unreachable nodes, start==goal, weighted optimality, BFS/Dijkstra agreement, a randomized independent Bellman-Ford oracle, binary heap order, maze preservation, and grid resizing.

## How to use

1. Choose an algorithm using the left dropdown.
2. Draw **walls**, paint **weighted nodes** (cost 2, 3, 5, 7 or 9), or erase cells.
3. **Drag** the green **S** start and pink **E** destination to move them (touch dragging works on phones).
4. Adjust the animation speed or maze density, and optionally generate a random maze.
5. Click **Start visualization**. Pause/resume or restart while running.
6. Observe **visited**, **frontier**, and **final path** cells, plus real algorithm statistics.
7. Click **Algorithm guide** for algorithm explanations, complexities, applications and the comparison table.

**Keyboard shortcuts:** `Space` starts/pauses/resumes; `R` resets the grid; `1` BFS, `2` DFS, `3` Dijkstra, `4` A*. Shortcuts are disabled when a form control or guide modal has focus.

## Color legend

| Symbol | Meaning |
|---|---|
| Green S | Starting node |
| Rose E | Destination node |
| Slate | Wall (cannot cross) |
| Violet | Discovered frontier |
| Cyan | Visited / processed |
| Gold | Final reconstructed path |
| Mauve + digit | Weighted cell; digit is the cost to enter |

## Algorithm correctness and conventions

Every move goes **up, right, down or left** only (no diagonal movement). A standard cell costs **1**, and entering a weighted cell costs its displayed positive value. The starting node contributes 0 to cost.

- **BFS:** a FIFO queue; O(V + E); guarantees minimum *edge count* on an unweighted grid. Ignores weighted costs.
- **DFS:** a LIFO stack; O(V + E); explores a branch deeply, but **does not promise** the shortest route. Ignores weighted costs.
- **Dijkstra:** a custom binary min-heap with lazy stale-entry skipping; O((V + E) log V) for this implementation, returns a minimum-cost route with non-negative costs.
- **A*:** the same custom binary min-heap, ordered by f(n)=g(n)+h(n). The Manhattan heuristic multiplied by minimum cost (1) is **admissible and consistent** for this four-neighbor grid; the algorithm returns an optimal-cost route.

All algorithms store parents and return visited-node order, frontier/visited events, the path, its length in steps, its total cost, and whether the destination was reachable. Random mazes may block every route; in that case the app correctly reports an unreachable destination.

**Computation time:** measured using `performance.now()` strictly around the algorithm search call, **excluding visualization time**. For BFS and DFS the displayed path cost is the number of moves, since they intentionally ignore weights. Path length always means number of edges (not number of cells).

## Folder structure

```text
PathForge/
├── index.html
├── package.json
├── vite.config.js
├── postcss.config.js
├── tailwind.config.js
├── .env.example
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Grid.jsx
│   │   ├── GridNode.jsx
│   │   ├── Statistics.jsx
│   │   ├── Legend.jsx
│   │   └── AlgorithmInfo.jsx
│   ├── algorithms/
│   │   ├── index.js
│   │   ├── pathUtils.js
│   │   ├── bfs.js
│   │   ├── dfs.js
│   │   ├── dijkstra.js
│   │   ├── astar.js
│   │   └── MinHeap.js
│   ├── hooks/
│   │   └── useVisualization.js
│   └── utils/
│       ├── gridUtils.js
│       └── mazeGenerator.js
└── tests/
    └── pathfinding.test.js
```

## Deploy free on Vercel

1. Upload this folder to a new GitHub repository (don't commit `node_modules` or `dist`).
2. In [Vercel](https://vercel.com), select **Add New Project** and import the repository.
3. Framework preset: **Vite** (normally detected automatically).
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Click **Deploy**.

Netlify supports the same `npm run build` / `dist` settings.

### Optional GitHub button

Create a `.env` file in the project root with:

```dotenv
VITE_GITHUB_URL=https://github.com/YOUR_USERNAME/pathforge
```

Restart the development server. The GitHub link only appears if a properly formatted repository URL is configured; the project works without it. In Vercel, set the same variable through Project Settings → Environment Variables.

## Technical notes

- No third-party pathfinding libraries, servers, databases, or paid APIs.
- Uses `ResizeObserver` to adapt graph dimensions to the viewport, preserving edits whenever possible.
- CSS-based node transitions with batched `requestAnimationFrame` scheduling.
- Each new run / algorithm change / grid edit / reset invalidates old animation frames, and unmount cleanup cancels remaining work.
- `prefers-reduced-motion` disables nonessential transition/entrance animation (the visualization's progression remains controllable).
- The optional Inter font is loaded from Google Fonts; the app falls back to system fonts offline.

Made as an educational university ADSA project.
