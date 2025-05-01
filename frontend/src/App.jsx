import React, {
  useState,
  useEffect,
  useCallback,
} from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

import CodeEditor from './CodeEditor';
import DataStructureVisualizer from './DataStructureVisualizer';
import './index.css';

// Sorting algorithm templates
const sortAlgorithms = {
  bubble: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]

arr = [64, 25, 12, 22, 11]
bubble_sort(arr)
print(arr)
`,
  selection: `def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]

arr = [64, 25, 12, 22, 11]
selection_sort(arr)
print(arr)
`,
  merge: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []; i = j = 0
    while i < len(left) and j < len(right):
        if left[i] < right[j]:
            result.append(left[i]); i += 1
        else:
            result.append(right[j]); j += 1
    result.extend(left[i:]); result.extend(right[j:])
    return result

arr = [64, 25, 12, 22, 11]
arr = merge_sort(arr)
print(arr)
`,
  quick: `def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[0]
    left  = [x for x in arr[1:] if x <  pivot]
    right = [x for x in arr[1:] if x >= pivot]
    return quicksort(left) + [pivot] + quicksort(right)

arr = [64, 25, 12, 22, 11]
arr = quicksort(arr)
print(arr)
`,
};

// Balanced tree templates
const treeTemplates = {
  bst: `class TreeNode:
    def __init__(self, v):
        self.val = v
        self.left = self.right = None

def insert(root, x):
    if not root:
        return TreeNode(x)
    if x < root.val:
        root.left  = insert(root.left,  x)
    else:
        root.right = insert(root.right, x)
    return root

root = None
for v in [50, 30, 70, 20, 40, 60, 80]:
    root = insert(root, v)
print("BST built")
`,
  avl: `class AVLNode:
    def __init__(self, v):
        self.val = v
        self.left = self.right = None
        self.height = 1

def h(n): return n.height if n else 0
def bf(n): return h(n.left) - h(n.right) if n else 0

def rot_right(y):
    x, T2 = y.left, y.left.right
    x.right, y.left = y, T2
    y.height = 1 + max(h(y.left), h(y.right))
    x.height = 1 + max(h(x.left), h(x.right))
    return x

def rot_left(x):
    y, T2 = x.right, x.right.left
    y.left, x.right = x, T2
    x.height = 1 + max(h(x.left), h(x.right))
    y.height = 1 + max(h(y.left), h(y.right))
    return y

def insert(node, key):
    if not node:
        return AVLNode(key)
    if key < node.val:
        node.left  = insert(node.left,  key)
    else:
        node.right = insert(node.right, key)

    node.height = 1 + max(h(node.left), h(node.right))
    balance = bf(node)

    if balance > 1 and key < node.left.val:
        return rot_right(node)
    if balance < -1 and key > node.right.val:
        return rot_left(node)
    if balance > 1 and key > node.left.val:
        node.left = rot_left(node.left); return rot_right(node)
    if balance < -1 and key < node.right.val:
        node.right = rot_right(node.right); return rot_left(node)
    return node

root = None
for v in [30, 20, 40, 10, 25, 50, 5]:
    root = insert(root, v)
print("AVL built")
`,
  rbt: `class RBNode:
    def __init__(self, v, color='R'):
        self.val = v
        self.color = color
        self.left = self.right = None

def red(n): return bool(n) and n.color == 'R'

def rot_left(h):
    x = h.right
    h.right = x.left
    x.left  = h
    x.color = h.color
    h.color = 'R'
    return x

def rot_right(h):
    x = h.left
    h.left  = x.right
    x.right = h
    x.color = h.color
    h.color = 'R'
    return x

def flip(h):
    h.color = 'R'
    h.left.color = h.right.color = 'B'

def insert(h, key):
    if not h:
        return RBNode(key)
    if key < h.val:
        h.left  = insert(h.left,  key)
    elif key > h.val:
        h.right = insert(h.right, key)

    if red(h.right) and not red(h.left):       h = rot_left(h)
    if red(h.left)  and red(h.left.left):      h = rot_right(h)
    if red(h.left)  and red(h.right):          flip(h)
    return h

root = None
for v in [10, 20, 30, 15, 25, 17]:
    root = insert(root, v)
root.color = 'B'
print("RB tree built")
`,
};

export default function App() {
  // ─── state ───
  const [code, setCode] = useState('');
  const [frames, setFrames] = useState([]);
  const [idx, setIdx] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [errorInfo, setError] = useState(null);
  const [complexity, setComplexity] = useState('');
  const [dark, setDark] = useState(false);

  const [structure, setStructure] = useState('');
  const [algorithm, setAlgorithm] = useState('');
  const [treeKind, setTreeKind] = useState('bst');

  const [lastRootTree, setLastRootTree] = useState(null);
  const [lastLinkedLists, setLastLinkedLists] = useState({});
  const [lastArrays, setLastArrays] = useState({});

  // ─── toggle theme ───
  useEffect(() => {
    document.body.classList.toggle('dark', dark);
  }, [dark]);

  // ─── load code from ?code= on first mount ───
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlCode = params.get('code');
    if (urlCode) {
      const decoded = decodeURIComponent(urlCode);
      setCode(decoded);
      // automatically run the trace once code is set
      runTrace(decoded);
    }
  }, []);

  // ─── template helpers ───
  const loadLinkedTemplate = useCallback(() => {
    setCode(`class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

head = Node(3)
head.next = Node(1)
head.next.next = Node(4)
head.next.next.next = Node(2)
`);
  }, []);

  const loadHashTemplate = useCallback(() => {
    setCode(`my_map = {}
my_map["Alice"] = 91
my_map["Bob"] = 85
my_map["Charlie"] = 78
my_map["Alice"] = 95
del my_map["Charlie"]
score = my_map.get("Bob")
print(score)
`);
  }, []);

  const insertTreeTemplate = useCallback(() => {
    setCode(treeTemplates[treeKind]);
  }, [treeKind]);

  // ─── dropdown handler ───
  const handleStructureChange = (val) => {
    setStructure(val);
    setAlgorithm('');
    if (val === 'linked_list') loadLinkedTemplate();
    else if (val === 'hashmap') loadHashTemplate();
    else if (val === 'tree') insertTreeTemplate();
    else setCode('');
  };

  // reload tree template on changes
  useEffect(() => {
    if (structure === 'tree') insertTreeTemplate();
  }, [treeKind, structure, insertTreeTemplate]);

  // sort template
  useEffect(() => {
    if (structure === 'array' && algorithm) {
      setCode(sortAlgorithms[algorithm]);
    }
  }, [structure, algorithm]);

  // ─── trace function accepts optional override ───
  const runTrace = useCallback(
    async (overrideCode) => {
      const src = overrideCode !== undefined ? overrideCode : code;
      setFrames([]); setIdx(0);
      setLastRootTree(null);
      setLastLinkedLists({}); setLastArrays({});
      setError(null); setComplexity(''); toast.dismiss();

      try {
        const { data } = await axios.post(
          'https://traceds-backend.onrender.com/trace',
          { code: src }
        );
        setFrames(data.frames || []);
        setComplexity(data.complexity || 'unknown');
      } catch (err) {
        const d = err.response?.data || {};
        setError({ line: d.line, msg: d.error || 'Execution error' });
        toast.error(
          `${d.error || 'Execution error'}${
            d.line ? ` (line ${d.line})` : ''
          }`
        );
      }
    },
    [code]
  );

  // ─── playback timer ───
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(
      () => setIdx((i) => Math.min(frames.length - 1, i + 1)),
      1000 / speed
    );
    return () => clearInterval(t);
  }, [playing, speed, frames.length]);

  // ─── snapshot bookkeeping ───
  useEffect(() => {
    if (!frames[idx]) return;
    if (frames[idx].lists) {
      setLastArrays((prev) => ({
        ...prev,
        ...JSON.parse(JSON.stringify(frames[idx].lists)),
      }));
    }
    if (frames[idx].linked) {
      setLastLinkedLists((prev) => ({
        ...prev,
        ...frames[idx].linked,
      }));
    }
    const root = frames[idx].trees?.root;
    if (root) setLastRootTree(root);
  }, [frames, idx]);

  // ─── render ───
  return (
    <div className="app-container">
      <Toaster position="top-right" gutter={8} />

      <header className="app-header">
        <h1>TraceDS</h1>
        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <button
            className="dark-toggle"
            onClick={() => setDark((d) => !d)}
          >
            {dark ? '☀︎ Light' : '🌙 Dark'}
          </button>
          <span style={{ fontSize: '13px', opacity: 0.6 }}>
            by Tanish Kalwad
          </span>
        </div>
      </header>

      {/* ─── editor column ─── */}
      <div className="editor-panel">
        <div className="template-selector">
          <label>Data structure:</label>
          <select
            value={structure}
            onChange={(e) => handleStructureChange(e.target.value)}
          >
            <option value="" disabled>
              Choose one
            </option>
            <option value="linked_list">Linked List</option>
            <option value="tree">Tree (BST / AVL / RB)</option>
            <option value="array">Array</option>
            <option value="hashmap">HashMap</option>
          </select>

          {structure === 'tree' && (
            <select
              style={{ marginLeft: 8 }}
              value={treeKind}
              onChange={(e) => setTreeKind(e.target.value)}
            >
              <option value="bst">BST</option>
              <option value="avl">AVL Tree</option>
              <option value="rbt">Red-Black Tree</option>
            </select>
          )}

          {structure === 'array' && (
            <select
              style={{ marginLeft: 8 }}
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
            >
              <option value="" disabled>
                Pick sorting algorithm
              </option>
              <option value="bubble">Bubble Sort</option>
              <option value="selection">Selection Sort</option>
              <option value="merge">Merge Sort</option>
              <option value="quick">Quick Sort</option>
            </select>
          )}
        </div>

        <CodeEditor
          code={code}
          onChange={setCode}
          onRun={() => runTrace()}
          highlightLine={frames[idx]?.line_no}
          errorInfo={errorInfo}
          dark={dark}
        />
      </div>

      {/* ─── visualiser column ─── */}
      <div className="visualizer-panel">
        <div className="controls">
          <button onClick={() => setIdx((i) => Math.max(0, i - 1))}>
            ◀︎
          </button>
          <button onClick={() => setIdx((i) => Math.min(frames.length - 1, i + 1))}>
            ▶︎
          </button>
          <label style={{ marginLeft: 12 }}>Speed {speed}×</label>
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.5"
            value={speed}
            onChange={(e) => setSpeed(+e.target.value)}
          />
          <button onClick={() => setPlaying((p) => !p)}>
            {playing ? 'Pause' : 'Play'}
          </button>
          {complexity && (
            <span style={{ marginLeft: 'auto', fontWeight: 600 }}>
              Complexity: {complexity}
            </span>
          )}
        </div>

        {errorInfo ? (
          <p style={{ color: 'crimson' }}>
            Error on line {errorInfo.line}: {errorInfo.msg}
          </p>
        ) : frames[idx] ? (
          <>
            <p>Line: {frames[idx].line_no}</p>
            <DataStructureVisualizer
              frame={frames[idx]}
              prevFrame={idx > 0 ? frames[idx - 1] : null}
              fallbackTree={lastRootTree}
              fallbackLinked={lastLinkedLists}
              fallbackArrays={lastArrays}
            />
          </>
        ) : (
          <p>No frames yet. Click “Run”.</p>
        )}
      </div>
    </div>
  );
}
