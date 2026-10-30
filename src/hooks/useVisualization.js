import { useCallback, useEffect, useRef, useState } from 'react';
import { algorithms } from '../algorithms/index.js';

const EMPTY_VISUAL = () => ({ visited: new Set(), frontier: new Set(), path: new Set() });
const EMPTY_METRICS = () => ({
  status: 'idle', visitedCount: 0, pathLength: null, totalCost: null,
  computeMs: null, found: null,
});
const DELAYS = { slow: 85, normal: 26, fast: 5, instant: 0 };

export default function useVisualization(speed, onComplete) {
  const [visual, setVisual] = useState(EMPTY_VISUAL);
  const [metrics, setMetrics] = useState(EMPTY_METRICS);
  const jobRef = useRef(null);
  const frameRef = useRef(null);
  const tokenRef = useRef(0);
  const speedRef = useRef(speed);
  speedRef.current = speed;

  const stopFrame = useCallback(() => {
    tokenRef.current++;
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    jobRef.current = null;
  }, []);

  const reset = useCallback(() => {
    stopFrame();
    setVisual(EMPTY_VISUAL());
    setMetrics(EMPTY_METRICS());
  }, [stopFrame]);

  const advance = useCallback(function frame(time) {
    const job = jobRef.current;
    if (!job || job.token !== tokenRef.current || job.paused) return;
    if (job.last === null) job.last = time;
    const delta = Math.min(Math.max(time - job.last, 0), 100);
    job.last = time;
    job.credit += delta;
    const delay = DELAYS[speedRef.current] ?? DELAYS.normal;
    // Bound work per frame to keep interactions responsive on large grids.
    let budget = delay === 0 ? Infinity : Math.min(180, Math.floor(job.credit / delay));
    if (budget !== Infinity) job.credit -= budget * delay;
    let changed = false;

    while (budget > 0 && job.phase === 'exploring') {
      if (job.eventIndex >= job.result.events.length) {
        job.phase = job.result.found ? 'path' : 'done';
        job.credit = 0;
        break;
      }
      const event = job.result.events[job.eventIndex++];
      if (event.type === 'frontier' && !job.visited.has(event.node)) {
        job.frontier.add(event.node);
      } else if (event.type === 'visited') {
        job.frontier.delete(event.node);
        job.visited.add(event.node);
        job.visibleVisited++;
      }
      changed = true;
      budget--;
    }

    if (job.phase === 'path') {
      // Run a separate, distinct tracing phase from start to destination.
      const pathDelay = delay === 0 ? 0 : Math.max(14, delay * 1.4);
      if (pathDelay === 0) budget = Infinity;
      else {
        budget = Math.min(180, Math.floor(job.credit / pathDelay));
        if (budget > 0) job.credit -= budget * pathDelay;
      }
      while (budget > 0 && job.pathIndex < job.result.path.length) {
        job.path.add(job.result.path[job.pathIndex++]);
        changed = true;
        budget--;
      }
      if (job.pathIndex >= job.result.path.length) job.phase = 'done';
    }

    if (changed) {
      setVisual({
        visited: new Set(job.visited),
        frontier: new Set(job.frontier),
        path: new Set(job.path),
      });
    }

    if (job.phase === 'done') {
      const { result } = job;
      jobRef.current = null;
      frameRef.current = null;
      setMetrics({
        status: result.found ? 'completed' : 'unreachable',
        visitedCount: job.visibleVisited,
        pathLength: result.pathLength,
        totalCost: result.totalCost,
        computeMs: job.computeMs,
        found: result.found,
      });
      onComplete?.(result.found);
      return;
    }
    setMetrics({
      status: job.phase === 'exploring' ? 'exploring' : 'tracing',
      visitedCount: job.visibleVisited,
      pathLength: job.result.pathLength,
      totalCost: job.result.totalCost,
      computeMs: job.computeMs,
      found: null,
    });
    frameRef.current = requestAnimationFrame(frame);
  }, [onComplete]);

  const start = useCallback((grid, startNode, goalNode, algorithm) => {
    stopFrame();
    const before = performance.now();
    const result = algorithms[algorithm](grid, startNode, goalNode);
    const computeMs = performance.now() - before;
    setVisual(EMPTY_VISUAL());

    if (speedRef.current === 'instant') {
      setVisual({
        visited: new Set(result.visitedOrder),
        frontier: new Set(),
        path: new Set(result.path),
      });
      setMetrics({
        status: result.found ? 'completed' : 'unreachable',
        visitedCount: result.visitedOrder.length,
        pathLength: result.pathLength,
        totalCost: result.totalCost,
        computeMs,
        found: result.found,
      });
      onComplete?.(result.found);
      return;
    }

    const token = tokenRef.current;
    jobRef.current = {
      token, result, computeMs, paused: false, phase: 'exploring',
      eventIndex: 0, pathIndex: 0, last: null, credit: 0,
      visited: new Set(), frontier: new Set(), path: new Set(), visibleVisited: 0,
    };
    setMetrics({
      status: 'exploring', visitedCount: 0, pathLength: result.pathLength,
      totalCost: result.totalCost, computeMs, found: null,
    });
    frameRef.current = requestAnimationFrame(advance);
  }, [advance, onComplete, stopFrame]);

  const pause = useCallback(() => {
    const job = jobRef.current;
    if (!job || job.paused) return;
    job.paused = true;
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    setMetrics(prev => ({ ...prev, status: 'paused' }));
  }, []);

  const resume = useCallback(() => {
    const job = jobRef.current;
    if (!job || !job.paused) return;
    job.paused = false;
    job.last = null; // Exclude paused time from animation progress.
    setMetrics(prev => ({ ...prev, status: job.phase === 'path' ? 'tracing' : 'exploring' }));
    frameRef.current = requestAnimationFrame(advance);
  }, [advance]);

  useEffect(() => () => stopFrame(), [stopFrame]);
  return { visual, metrics, start, pause, resume, reset };
}
