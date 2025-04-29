import React from 'react';
import ArrayVisualizer      from './ArrayVisualizer';
import HashMapVisualizer    from './HashMapVisualizer';
import LinkedListVisualizer from './LinkedListVisualizer';
import TreeVisualizer       from './TreeVisualizer';
import NewNodeVisualizer    from './NewNodeVisualizer';

/* helpers ------------------------------------------------------------------ */
function getAllIds(tree, out = []) {
  if (!tree) return out;
  out.push(tree.id);
  getAllIds(tree.left,  out);
  getAllIds(tree.right, out);
  return out;
}
function containsId(tree, id) {
  return getAllIds(tree).includes(id);
}

/* component ---------------------------------------------------------------- */
export default function DataStructureVisualizer({
  frame,
  prevFrame,
  fallbackTree,
  fallbackLinked,
  fallbackArrays
}) {
  const prims    = frame.prims || {};
  const mainTree = frame.trees.root || fallbackTree;

  /* ---------- arrays ---------------------------------------------------- */
  const arrays =
    frame.lists && Object.keys(frame.lists).length
      ? frame.lists
      : fallbackArrays || {};

  const arrayHighlights = {};
  for (const [name, curr] of Object.entries(frame.lists || {})) {
    const prev = prevFrame?.lists?.[name] || [];
    if (curr.length > prev.length) arrayHighlights[name] = curr.length - 1;
  }

  /* ---------- linked lists --------------------------------------------- */
  const allLinked = new Set([
    ...Object.keys(fallbackLinked || {}),
    ...Object.keys(frame.linked || {})
  ]);
  const linkedHighlights = {};
  for (const name of allLinked) {
    const curr = frame.linked?.[name] || fallbackLinked?.[name] || [];
    const prev = prevFrame?.linked?.[name] || [];
    if (curr.length > prev.length) linkedHighlights[name] = curr.length - 1;
  }

  /* ---------- trees ----------------------------------------------------- */
  let treeHighlightIds = [];
  if (prevFrame && frame.trees.root) {
    const prevIds = getAllIds(prevFrame.trees.root);
    const currIds = getAllIds(frame.trees.root);
    treeHighlightIds = currIds.filter(id => !prevIds.includes(id));
  }

  const newTrees = [];
  if (prevFrame && mainTree) {
    for (const [name, tree] of Object.entries(frame.trees)) {
      if (name === 'root' || name === 'self') continue;
      const existed = !!prevFrame.trees[name];
      const inRoot  = containsId(mainTree, tree.id);
      if (!existed && !inRoot) newTrees.push([name, tree]);
    }
  }

  /* ---------- render ---------------------------------------------------- */
  return (
    <div className="multi-structure-container">
      {/* primitives */}
      {Object.entries(prims).map(([k, v]) => (
        <div key={k} className="primitive-block">
          <strong>{k}</strong>: {String(v)}
        </div>
      ))}

      {/* arrays */}
      {Object.entries(arrays).map(([name, values]) => (
        <ArrayVisualizer
          key={name}
          frameId={frame.line_no}
          snapshot={{ [name]: values }}
          highlightIndex={arrayHighlights[name]}
        />
      ))}

      {/* hash maps */}
      {Object.entries(frame.dicts).map(([name, dict]) => (
        <HashMapVisualizer key={name} snapshot={{ [name]: dict }} />
      ))}

      {/* linked lists */}
      {[...allLinked].map(name => (
        <LinkedListVisualizer
          key={name}
          name={name}
          values={frame.linked?.[name] || fallbackLinked?.[name] || []}
          highlightIndex={linkedHighlights[name]}
        />
      ))}

      {/* trees */}
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {mainTree && (
          <TreeVisualizer
            name="root"
            tree={mainTree}
            highlightIds={treeHighlightIds}
          />
        )}
        {newTrees.map(([name, tree]) => (
          <NewNodeVisualizer key={name} name={name} tree={tree} />
        ))}
      </div>
    </div>
  );
}
