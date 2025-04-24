import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

export default function LinkedListVisualizer({ name, values, highlightIndex }) {
  return (
    <div className="list-block">
      <h4>Linked List “{name}”</h4>
      <div className="linked-container">
        <AnimatePresence>
          {values.map((val, i) => {
            const isHighlight = i === highlightIndex;
            return (
              <React.Fragment key={`${name}-${i}-${val}`}>
                <motion.div
                  className="linked-cell"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    backgroundColor: isHighlight ? '#ffe082' : '#e3f2fd'
                  }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                >
                  {val}
                </motion.div>
                {i < values.length - 1 && (
                  <motion.span
                    className="linked-arrow"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    ➔
                  </motion.span>
                )}
              </React.Fragment>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
