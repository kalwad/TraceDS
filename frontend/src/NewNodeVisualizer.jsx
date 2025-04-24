import React from 'react';
import { motion } from 'framer-motion';
import TreeVisualizer from './TreeVisualizer';

export default function NewNodeVisualizer({ name, tree }) {
  return (
    <motion.div
      className="new-node-container"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h4>New Node “{name}”</h4>
      <TreeVisualizer name={name} tree={tree} />
    </motion.div>
  );
}
