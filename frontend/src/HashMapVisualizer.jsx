import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

export default function HashMapVisualizer({ snapshot }) {
  const [name, dict] = Object.entries(snapshot)[0] || ['dict', {}];

  return (
    <div className="hashmap-block">
      <h4>Dict “{name}”</h4>
      <div className="hashmap-grid">
        <AnimatePresence>
          {Object.entries(dict).map(([k, v]) => (
            <motion.div
              key={k}
              className="hashmap-cell"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.05, boxShadow: '0px 4px 12px rgba(0,0,0,0.2)' }}
            >
              <div className="hashmap-key">{k}</div>
              <div className="hashmap-val">{JSON.stringify(v)}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
