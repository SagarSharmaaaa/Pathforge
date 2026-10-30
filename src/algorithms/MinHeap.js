/** Binary min-heap. Priority ties use insertion order for deterministic animations. */
export default class MinHeap {
  constructor() { this.heap = []; this.sequence = 0; }
  get size() { return this.heap.length; }
  push(node, priority, cost = priority) {
    const item = { node, priority, cost, order: this.sequence++ };
    const a = this.heap;
    a.push(item);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.compare(a[p], a[i]) <= 0) break;
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  }
  pop() {
    const a = this.heap;
    if (!a.length) return null;
    const top = a[0];
    const end = a.pop();
    if (a.length) {
      a[0] = end;
      let i = 0;
      while (true) {
        let smallest = i;
        const l = 2 * i + 1;
        const r = l + 1;
        if (l < a.length && this.compare(a[l], a[smallest]) < 0) smallest = l;
        if (r < a.length && this.compare(a[r], a[smallest]) < 0) smallest = r;
        if (smallest === i) break;
        [a[i], a[smallest]] = [a[smallest], a[i]];
        i = smallest;
      }
    }
    return top;
  }
  compare(a, b) { return a.priority - b.priority || a.order - b.order; }
}
