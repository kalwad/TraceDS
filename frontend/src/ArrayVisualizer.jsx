// ArrayVisualizer.jsx — pointers + swap animation
import React from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import './index.css';

export default function ArrayVisualizer({ snapshot, highlightIndex, pointers = [] }) {
  const [[name, arr]] = Object.entries(snapshot);

  // idx → array of var names
  const ptrMap = {};
  pointers.forEach(([v, idx]) => {
    ptrMap[idx] = ptrMap[idx] ? [...ptrMap[idx], v] : [v];
  });

  return (
    <div className="array-block">
      <h4>Array “{name}”</h4>

      <LayoutGroup>
        <div className="array-container">
          {arr.map((val, idx) => (
            <motion.div
              key={val}            /* value‑based key so swaps animate */
              layoutId={`${name}-${idx}`}
              layout
              className="array-cell-wrapper"
              transition={{ layout: { type:'spring', stiffness:450, damping:30 } }}
            >
              <div className="pointer-labels">
                {(ptrMap[idx] || []).map(lbl => (
                  <div key={lbl} className="array-pointer-label">{lbl}</div>
                ))}
              </div>

              <motion.div
                className="array-cell"
                initial={highlightIndex===idx ? { y:-20, opacity:0 } : {}}
                animate={{
                  y:0,
                  opacity:1,
                  backgroundColor: highlightIndex===idx ? '#ffe082' : '#e3f2fd'
                }}
              >
                {val}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </LayoutGroup>
    </div>
  );
}
