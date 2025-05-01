import React, { useRef, useLayoutEffect, useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

/*────────────────────────────────────────
  node components
────────────────────────────────────────*/
const Node = memo(function Node({ node, highlightIds, setCoords }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const id = requestAnimationFrame(() => {
      const { x, y, width, height } = ref.current.getBoundingClientRect();
      setCoords((c) => ({ ...c, [node.id]: { x: x + width / 2, y: y + height / 2 } }));
    });
    return () => cancelAnimationFrame(id);
  }, [node, setCoords]);

  const background =
    node.color === 'R'
      ? '#ef5350'
      : node.color === 'B'
      ? '#1e88e5'
      : 'var(--cell-bg)';

  return (
    <motion.div ref={ref} className="tree-node" layout>
      <motion.div
        className="tree-value"
        style={{ background }}
        animate={
          highlightIds.includes(node.id)
            ? { scale: [1.25, 1], transition: { duration: 0.3 } }
            : {}
        }
      >
        {node.val}
      </motion.div>

      {(node.left || node.right) && (
        <div className="tree-children">
          {node.left && (
            <Node node={node.left} highlightIds={highlightIds} setCoords={setCoords} />
          )}
          {node.right && (
            <Node node={node.right} highlightIds={highlightIds} setCoords={setCoords} />
          )}
        </div>
      )}
    </motion.div>
  );
});

/*────────────────────────────────────────
  wrapper for visualizer
────────────────────────────────────────*/
export default function TreeVisualizer({ name, tree, highlightIds = [] }) {
  const [coords, setCoords] = useState({});
  const [lines, setLines] = useState([]);

  useEffect(() => {
    if (!tree || !Object.keys(coords).length) return;

    const collect = (n) =>
      !n || !coords[n.id]
        ? []
        : [
            ...['left', 'right'].flatMap((d) => {
              const c = n[d];
              return c && coords[c.id] ? [{ from: coords[n.id], to: coords[c.id] }] : [];
            }),
            ...collect(n.left),
            ...collect(n.right),
          ];

    const id = requestAnimationFrame(() => setLines(collect(tree)));
    return () => cancelAnimationFrame(id);
  }, [coords, tree]);

  return (
    <div className="tree-block" style={{ position: 'relative', overflow: 'visible' }}>
      <h4>Tree “{name}”</h4>

      {/* connectors */}
      <svg className="tree-lines-overlay">
        <AnimatePresence>
          {lines.map((ln, i) => (
            <motion.line
              key={i}
              x1={ln.from.x} y1={ln.from.y}
              x2={ln.to.x}   y2={ln.to.y}
              stroke="#90caf9" strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            />
          ))}
        </AnimatePresence>
      </svg>

      {tree && <Node node={tree} highlightIds={highlightIds} setCoords={setCoords} />}
    </div>
  );
}
