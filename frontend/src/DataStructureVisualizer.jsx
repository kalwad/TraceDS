import React from 'react';
import ArrayVisualizer from './ArrayVisualizer';
import HashMapVisualizer from './HashMapVisualizer';
import LinkedListVisualizer from './LinkedListVisualizer';
import TreeVisualizer from './TreeVisualizer';
import NewNodeVisualizer from './NewNodeVisualizer';

function getAllIds(tree, out = []) {
  if (!tree) return out;
  out.push(tree.id);
  getAllIds(tree.left, out);
  getAllIds(tree.right, out);
  return out;
}

function containsId(tree, targetId) {
  return getAllIds(tree).includes(targetId);
}

export default function DataStructureVisualizer({
  frame,
  prevFrame,
  fallbackTree,
  fallbackLinked
}) {
  const mainTree = frame.trees.root || fallbackTree;

  // primitives
  const prims = frame.prims || {};

  // arrays
  const arrayHighlights = {};
  for (const [name, curr] of Object.entries(frame.lists)) {
    const prev = prevFrame?.lists?.[name] || [];
    if (curr.length > prev.length) arrayHighlights[name] = curr.length - 1;
  }

  // dicts
  // (no highlights by default)

  // linked lists
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

  // trees
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
      const inRoot = containsId(mainTree, tree.id);
      if (!existed && !inRoot) newTrees.push([name, tree]);
    }
  }

  return (
    <div className="multi-structure-container">
      {/* Primitive vars */}
      {Object.entries(prims).map(([name, val]) => (
        <div key={name} className="primitive-block">
          <strong>{name}</strong>: {String(val)}
        </div>
      ))}

      {/* Arrays */}
      {Object.entries(frame.lists).map(([name, values]) => (
        <ArrayVisualizer
          key={name}
          snapshot={{ [name]: values }}
          highlightIndex={arrayHighlights[name]}
        />
      ))}

      {/* Dicts */}
      {Object.entries(frame.dicts).map(([name, dict]) => (
        <HashMapVisualizer key={name} snapshot={{ [name]: dict }} />
      ))}

      {/* Linked Lists */}
      {[...allLinked]
        .filter(name => {
          if (name !== 'self') return true;
          const selfList = frame.linked?.self || fallbackLinked?.self;
          const selfId = selfList?.[0] ?? null;
          for (const other of allLinked) {
            if (other === 'self') continue;
            const otherList = frame.linked?.[other] || fallbackLinked?.[other];
            if (otherList?.[0] === selfId) return false;
          }
          return true;
        })
        .map(name => (
          <LinkedListVisualizer
            key={name}
            name={name}
            values={frame.linked?.[name] || fallbackLinked?.[name] || []}
            highlightIndex={linkedHighlights[name]}
          />
        ))}

      {/* Trees + New Nodes */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {mainTree && (
          <TreeVisualizer name="root" tree={mainTree} highlightIds={treeHighlightIds} />
        )}
        {newTrees.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'row', gap: '12px', flexWrap: 'wrap' }}>
            {newTrees.map(([name, tree]) => (
              <NewNodeVisualizer key={name} name={name} tree={tree} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
