import React, { useRef, useLayoutEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './index.css';

function Node({ node, highlightIds, coords, setCoords }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const { x, y, width, height } = ref.current.getBoundingClientRect();
    setCoords(c => ({
      ...c,
      [node.id]: { x: x + width / 2, y: y + height / 2 }
    }));
  }, [node, setCoords]);

  return (
    <motion.div ref={ref} className="tree-node" layout>
      <motion.div
        className="tree-value"
        animate={
          highlightIds.includes(node.id)
            ? { scale: [1.2, 1], transition: { duration: 0.3 } }
            : {}
        }
      >
        {node.val}
      </motion.div>
      {(node.left || node.right) && (
        <div className="tree-children">
          {node.left && (
            <Node
              node={node.left}
              highlightIds={highlightIds}
              coords={coords}
              setCoords={setCoords}
            />
          )}
          {node.right && (
            <Node
              node={node.right}
              highlightIds={highlightIds}
              coords={coords}
              setCoords={setCoords}
            />
          )}
        </div>
      )}
    </motion.div>
  );
}

export default function TreeVisualizer({ name, tree, highlightIds = [] }) {
  const [coords, setCoords] = useState({});

  // Collect parent→child lines
  const collectLines = node => {
    if (!node || !coords[node.id]) return [];
    const out = [];
    ['left', 'right'].forEach(dir => {
      const child = node[dir];
      if (child && coords[child.id]) {
        out.push({
          from: coords[node.id],
          to: coords[child.id]
        });
      }
    });
    out.push(...collectLines(node.left), ...collectLines(node.right));
    return out;
  };

  const svgLines = collectLines(tree);

  return (
    <div className="tree-block" style={{ position: 'relative', overflow: 'visible' }}>
      <h4>Tree “{name}”</h4>

      <svg
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      >
        {svgLines.map((ln, i) => (
          <line
            key={i}
            x1={ln.from.x}
            y1={ln.from.y}
            x2={ln.to.x}
            y2={ln.to.y}
            stroke="#90caf9"
            strokeWidth="2"
          />
        ))}
      </svg>

      <Node node={tree} highlightIds={highlightIds} coords={coords} setCoords={setCoords} />
    </div>
  );
}
