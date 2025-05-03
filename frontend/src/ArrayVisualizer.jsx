import React from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import './index.css';

export default function ArrayVisualizer({ snapshot, highlightIndex, pointers = {} }) {
  const [name, arr] = Object.entries(snapshot)[0] || ['arr', []];

  return (
    <div className="array-block">
      <h4>Array “{name}”</h4>
      <LayoutGroup>
        <div className="array-container">
          {arr.map((v, i) => (
            <div key={i} className="array-cell-wrapper">
              {/* Pointer labels ABOVE the cell */}
              <div className="pointer-labels">
                {Object.entries(pointers)
                  .filter(([, index]) => index === i)
                  .map(([label]) => (
                    <div key={label} className="array-pointer-label">{label}</div>
                  ))}
              </div>

              {/* The actual animated cell */}
              <motion.div
                className="array-cell"
                layout
                transition={{
                  type: 'spring',
                  stiffness: 450,
                  damping: 30,
                }}
                initial={highlightIndex === i ? { y: -20, opacity: 0 } : {}}
                animate={{
                  y: 0,
                  opacity: 1,
                  backgroundColor: highlightIndex === i ? '#ffe082' : '#e3f2fd'
                }}
                exit={highlightIndex === i ? { y: -20, opacity: 0 } : undefined}
              >
                {v}
              </motion.div>
            </div>
          ))}
        </div>
      </LayoutGroup>
    </div>
  );
}
