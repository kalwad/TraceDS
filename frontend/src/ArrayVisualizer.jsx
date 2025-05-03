import React from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import './index.css';

export default function ArrayVisualizer({ snapshot, highlightIndex, pointers = [] }) {
  const [[name, arr]] = Object.entries(snapshot);

  // idx → array of labels
  const ptrMap = {};
  pointers.forEach(([label, idx]) => {
    ptrMap[idx] = ptrMap[idx] ? [...ptrMap[idx], label] : [label];
  });

  return (
    <div className="array-block">
      <h4>Array “{name}”</h4>
      <LayoutGroup>
        <div className="array-container">
          {arr.map((val, idx) => (
            <motion.div
              key={val}                /* value‑based key = swap animation */
              layout                  /* let Framer animate position */
              className="array-cell-wrapper"
              transition={{ layout: { type: 'spring', stiffness: 450, damping: 30 } }}
            >
              {/* pointer labels */}
              <div className="pointer-labels">
                {(ptrMap[idx] || []).map(l => (
                  <div key={l} className="array-pointer-label">{l}</div>
                ))}
              </div>

              {/* array value */}
              <motion.div
                className="array-cell"
                initial={highlightIndex === idx ? { y: -20, opacity: 0 } : {}}
                animate={{
                  y: 0,
                  opacity: 1,
                  backgroundColor: highlightIndex === idx ? '#ffe082' : '#e3f2fd'
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
