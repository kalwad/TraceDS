// ArrayVisualizer.jsx — now shows pointer names under each cell
import React from 'react'
import { motion, LayoutGroup } from 'framer-motion'
import './index.css'

export default function ArrayVisualizer({
  snapshot,
  highlightIndex,
  pointers = []    // array of [varName, idx]
}) {
  const [[name, arr]] = Object.entries(snapshot)

  // build map: idx → [varNames…]
  const ptrMap = pointers.reduce((m, [v, i]) => {
    m[i] = m[i] ? [...m[i], v] : [v]
    return m
  }, {})

  return (
    <div className="array-block">
      <h4>Array “{name}”</h4>
      <LayoutGroup>
        <div className="array-container">
          {arr.map((v, i) => {
            const labels = ptrMap[i]?.join(', ')
            return (
              <motion.div
                key={`${name}-${i}`}
                className="array-cell"
                layout
                initial={highlightIndex === i ? { y: -20, opacity: 0 } : {}}
                animate={{
                  y: 0,
                  opacity: 1,
                  backgroundColor:
                    highlightIndex === i ? '#ffe082' : '#e3f2fd'
                }}
                exit={highlightIndex === i ? { y: -20, opacity: 0 } : undefined}
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              >
                <div>{v}</div>
                {labels && <div className="array-pointer">{labels}</div>}
              </motion.div>
            )
          })}
        </div>
      </LayoutGroup>
    </div>
  )
}
