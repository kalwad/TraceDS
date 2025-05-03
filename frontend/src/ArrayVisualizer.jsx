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
            <motion.div
              key={`${name}-${v}`} // animate swaps by using value-based key
              layout
              className="array-cell-wrapper"
              transition={{
                layout: {
                  type: 'spring',
                  stiffness: 450,
                  damping: 30
                }
              }}
            >
              <div className="pointer-labels">
                {Object.entries(pointers)
                  .filter(([, index]) => index === i)
                  .map(([label]) => (
                    <div key={label} className="array-pointer-label">{label}</div>
                  ))}
              </div>
              <motion.div
                className="array-cell"
                initial={highlightIndex === i ? { y: -20, opacity: 0 } : {}}
                animate={{
                  y: 0,
                  opacity: 1,
                  backgroundColor: highlightIndex === i ? '#ffe082' : '#e3f2fd'
                }}
                exit={highlightIndex === i ? { y: -20, opacity: 0 } : undefined}
                whileHover={highlightIndex === i ? { scale: 1.05 } : {}}
              >
                {v}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </LayoutGroup>
    </div>
  );
}
