import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

import CodeEditor from './CodeEditor';
import DataStructureVisualizer from './DataStructureVisualizer';
import './index.css';

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
    result = []
    i = j = 0
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
`
};

export default function App() {
  const [code, setCode]               = useState('');
  const [frames, setFrames]           = useState([]);
  const [idx, setIdx]                 = useState(0);
  const [speed, setSpeed]             = useState(1);
  const [playing, setPlaying]         = useState(false);
  const [errorInfo, setError]         = useState(null);
  const [complexity, setComplexity]   = useState('');
  const [dark, setDark]               = useState(false);
  const [lastRootTree, setLastRootTree]     = useState(null);
  const [lastLinkedLists, setLastLinkedLists] = useState({});
  const [lastArrays, setLastArrays]   = useState({});
  const [structure, setStructure]     = useState('');
  const [algorithm, setAlgorithm]     = useState('');

  /* theme ------------------------------------------------------------------ */
  useEffect(() => {
    document.body.classList.toggle('dark', dark);
  }, [dark]);

  /* template helpers ------------------------------------------------------- */
  const handleStructureChange = (val) => {
    setStructure(val);
    setAlgorithm('');
    if (val !== 'array') insertTemplate(val);
  };

  const insertTemplate = (key) => {
    const templates = {
      linked_list: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

head = Node(3)
head.next = Node(1)
head.next.next = Node(4)
head.next.next.next = Node(2)`,
      tree: `class TreeNode:
    def __init__(self, v):
        self.val = v
        self.left = None
        self.right = None

root = TreeNode(50)
n1 = TreeNode(30); n2 = TreeNode(70)
root.left, root.right = n1, n2
n1.left, n1.right = TreeNode(20), TreeNode(40)
n2.left, n2.right = TreeNode(60), TreeNode(80)`,
      hashmap: `my_map = {}
my_map["Alice"] = 91
my_map["Bob"] = 85
my_map["Charlie"] = 78
my_map["Alice"] = 95
del my_map["Charlie"]
score = my_map.get("Bob")
print(score)`
    };
    if (templates[key]) setCode(templates[key]);
  };

  useEffect(() => {
    if (structure === 'array' && algorithm) {
      setCode(sortAlgorithms[algorithm]);
    }
  }, [structure, algorithm]);

  /* back-end trace --------------------------------------------------------- */
  const runTrace = async () => {
    setFrames([]); setIdx(0);
    setLastRootTree(null);
    setLastLinkedLists({});
    setLastArrays({});
    setError(null);
    setComplexity('');
    toast.dismiss();

    try {
      const { data } = await axios.post('http://127.0.0.1:5000/trace', { code });
      setFrames(data.frames || []);
      setComplexity(data.complexity || 'unknown');
    } catch (err) {
      const d   = err.response?.data;
      const msg = d?.error || 'Execution error';
      const ln  = d?.line ? ` (line ${d.line})` : '';
      setError({ line: d?.line, msg });
      toast.error(`${msg}${ln}`);
    }
  };

  /* playback ---------------------------------------------------------------- */
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(
      () => setIdx(i => Math.min(frames.length - 1, i + 1)),
      1000 / speed
    );
    return () => clearInterval(t);
  }, [playing, speed, frames.length]);

  /* snapshot bookkeeping --------------------------------------------------- */
  useEffect(() => {
    if (!frames[idx]) return;

    /* arrays ------------- */
    if (frames[idx].lists) {
      // clone to break reference with earlier snapshots
      const fresh = JSON.parse(JSON.stringify(frames[idx].lists));
      setLastArrays(prev => ({ ...prev, ...fresh }));
    }

    /* linked lists -------- */
    if (frames[idx].linked) {
      setLastLinkedLists(prev => ({ ...prev, ...frames[idx].linked }));
    }

    /* trees --------------- */
    const root = frames[idx].trees?.root;
    if (root) setLastRootTree(root);
  }, [frames, idx]);

  /* UI --------------------------------------------------------------------- */
  return (
    <div className="app-container">
      <Toaster position="top-right" gutter={8} />

      <header className="app-header">
        <h1>TraceDS</h1>
        <button className="dark-toggle" onClick={() => setDark(d => !d)}>
          {dark ? '☀︎ Light' : '🌙 Dark'}
        </button>
      </header>

      <div className="editor-panel">
        <div className="template-selector">
          <label>Choose a data structure + algorithm:</label>
          <select value={structure} onChange={e => handleStructureChange(e.target.value)}>
            <option value="" disabled>Choose one</option>
            <option value="linked_list">Linked List</option>
            <option value="tree">Tree</option>
            <option value="array">Array</option>
            <option value="hashmap">HashMap</option>
          </select>

          {structure === 'array' && (
            <select value={algorithm} onChange={e => setAlgorithm(e.target.value)}>
              <option value="" disabled>Pick sorting algorithm</option>
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
          onRun={runTrace}
          highlightLine={frames[idx]?.line_no}
          errorInfo={errorInfo}
          dark={dark}
        />
      </div>

      <div className="visualizer-panel">
        <div className="controls">
          <button onClick={() => setIdx(i => Math.max(0, i - 1))}>◀︎</button>
          <button onClick={() => setIdx(i => Math.min(frames.length - 1, i + 1))}>▶︎</button>
          <label style={{ marginLeft: 12 }}>Speed {speed}×</label>
          <input
            type="range"
            min="0.5" max="5" step="0.5"
            value={speed}
            onChange={e => setSpeed(+e.target.value)}
          />
          <button onClick={() => setPlaying(p => !p)}>
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
