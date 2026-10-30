/** Random walls; deliberately does not promise the goal remains reachable. */
export function generateRandomMaze(grid, start, goal, density = 0.24, random = Math.random) {
  const probability = Math.max(0, Math.min(1, density));
  return {
    ...grid,
    cells: grid.cells.map((_, index) => ({
      isWall: index !== start && index !== goal && random() < probability,
      weight: 1,
    })),
  };
}
