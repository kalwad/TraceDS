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
          {arr.map((v, i) => {
            const pointerLabels = Object.entries(pointers)
              .filter(([, index]) => index === i)
              .map(([label]) => (
                <div key={label} className="array-pointer-label">{label}</div>
              ));

            return (
              <motion.div
                key={`${name}-${v}-${i}`}         // key helps on full rerender
                layoutId={`${name}-${i}`}         // enables Framer layout swap animation
                className="array-cell-wrapper"
              >
                <div className="pointer-labels">
                  {pointerLabels}
                </div>
                <motion.div
                  className="array-cell"
                  layout
                  initial={highlightIndex === i ? { y: -20, opacity: 0 } : {}}
                  animate={{
                    y: 0,
                    opacity: 1,
                    backgroundColor: highlightIndex === i ? '#ffe082' : '#e3f2fd'
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30
                  }}
                >
                  {v}
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </LayoutGroup>
    </div>
  );
}
