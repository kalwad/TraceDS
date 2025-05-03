// DataStructureVisualizer.jsx — passes pointer list
import React from 'react';
import ArrayVisualizer      from './ArrayVisualizer';
import HashMapVisualizer    from './HashMapVisualizer';
import LinkedListVisualizer from './LinkedListVisualizer';
import TreeVisualizer       from './TreeVisualizer';
import NewNodeVisualizer    from './NewNodeVisualizer';

/* helper funcs unchanged */
function getAllIds(t,o=[]){ if(!t) return o; o.push(t.id); getAllIds(t.left,o); getAllIds(t.right,o); return o;}
function containsId(t,id){ return getAllIds(t).includes(id); }

export default function DataStructureVisualizer({
  frame, prevFrame, fallbackTree, fallbackLinked, fallbackArrays
}) {
  const prims = frame.prims || {};
  const arrays = frame.lists && Object.keys(frame.lists).length
    ? frame.lists : fallbackArrays || {};

  /* detect highlights (unchanged) */
  const arrayHL = {};
  for (const [n,curr] of Object.entries(frame.lists||{})) {
    const prev = prevFrame?.lists?.[n] || [];
    if (curr.length > prev.length) arrayHL[n] = curr.length-1;
  }

  const allLinked = new Set([...Object.keys(fallbackLinked||{}), ...Object.keys(frame.linked||{})]);
  const linkedHL = {};
  for (const n of allLinked) {
    const curr = frame.linked?.[n] || fallbackLinked?.[n] || [];
    const prev = prevFrame?.linked?.[n] || [];
    if (curr.length > prev.length) linkedHL[n] = curr.length-1;
  }

  /* tree highlights unchanged … */
  let treeHighlightIds=[];
  if (prevFrame && frame.trees.root){
    const prevIds=getAllIds(prevFrame.trees.root);
    treeHighlightIds=getAllIds(frame.trees.root).filter(id=>!prevIds.includes(id));
  }

  const newTrees=[];
  const mainTree = frame.trees.root || fallbackTree;
  if (prevFrame && mainTree){
    for (const [n,t] of Object.entries(frame.trees)){
      if (n==='root'||n==='self') continue;
      if (!prevFrame.trees[n] && !containsId(mainTree,t.id)) newTrees.push([n,t]);
    }
  }

  return (
    <div className="multi-structure-container">
      {/* primitives */}
      {Object.entries(prims).map(([k,v])=>(
        <div key={k} className="primitive-block"><strong>{k}</strong>: {String(v)}</div>
      ))}

      {/* arrays with pointers */}
      {Object.entries(arrays).map(([n,vals])=>(
        <ArrayVisualizer
          key={n}
          snapshot={{[n]:vals}}
          highlightIndex={arrayHL[n]}
          pointers={frame.array_indices?.[n] || []}
        />
      ))}

      {/* hash maps */}
      {Object.entries(frame.dicts).map(([n,d])=>(
        <HashMapVisualizer key={n} snapshot={{[n]:d}} />
      ))}

      {/* linked lists */}
      {[...allLinked].map(n=>(
        <LinkedListVisualizer
          key={n}
          name={n}
          values={frame.linked?.[n] || fallbackLinked?.[n] || []}
          highlightIndex={linkedHL[n]}
        />
      ))}

      {/* trees */}
      <div style={{display:'flex',gap:24,flexWrap:'wrap'}}>
        {mainTree && <TreeVisualizer name="root" tree={mainTree} highlightIds={treeHighlightIds} />}
        {newTrees.map(([n,t])=>(
          <NewNodeVisualizer key={n} name={n} tree={t}/>
        ))}
      </div>
    </div>
  );
}
