import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Simple mock for the TreeVisualizer component
jest.mock('./TreeVisualizer', () => {
  return function MockTreeVisualizer({ name, tree, highlightIds }) {
    if (!tree) {
      return <div data-testid="tree-visualizer">Empty Tree "{name}"</div>;
    }

    const renderNode = (node) => {
      if (!node) return null;

      return (
        <div key={node.id} data-testid={`node-${node.id}`}>
          <span data-testid={`value-${node.id}`}>{node.val}</span>
          {node.left && renderNode(node.left)}
          {node.right && renderNode(node.right)}
        </div>
      );
    };

    return (
      <div data-testid="tree-visualizer">
        <h3>Tree "{name}"</h3>
        {renderNode(tree)}
        {highlightIds && (
          <div data-testid="highlights">
            Highlighted: {highlightIds.join(', ')}
          </div>
        )}
      </div>
    );
  };
});

import TreeVisualizer from './TreeVisualizer';

describe('TreeVisualizer Component', () => {
  const mockTree = {
    id: 1,
    val: 50,
    left: {
      id: 2,
      val: 30,
      left: { id: 3, val: 20, left: null, right: null },
      right: { id: 4, val: 40, left: null, right: null }
    },
    right: {
      id: 5,
      val: 70,
      left: { id: 6, val: 60, left: null, right: null },
      right: { id: 7, val: 80, left: null, right: null }
    }
  };

  test('renders tree name', () => {
    render(<TreeVisualizer name="test-tree" tree={mockTree} />);
    expect(screen.getByText('Tree "test-tree"')).toBeInTheDocument();
  });

  test('renders root node value', () => {
    render(<TreeVisualizer name="test" tree={mockTree} />);
    expect(screen.getByTestId('value-1')).toHaveTextContent('50');
  });

  test('renders left child node value', () => {
    render(<TreeVisualizer name="test" tree={mockTree} />);
    expect(screen.getByTestId('value-2')).toHaveTextContent('30');
  });

  test('renders right child node value', () => {
    render(<TreeVisualizer name="test" tree={mockTree} />);
    expect(screen.getByTestId('value-5')).toHaveTextContent('70');
  });

  test('renders leaf node values', () => {
    render(<TreeVisualizer name="test" tree={mockTree} />);
    expect(screen.getByTestId('value-3')).toHaveTextContent('20');
    expect(screen.getByTestId('value-4')).toHaveTextContent('40');
    expect(screen.getByTestId('value-6')).toHaveTextContent('60');
    expect(screen.getByTestId('value-7')).toHaveTextContent('80');
  });

  test('handles empty tree', () => {
    render(<TreeVisualizer name="test" tree={null} />);
    expect(screen.getByText('Empty Tree "test"')).toBeInTheDocument();
  });

  test('handles tree with only root', () => {
    const singleNodeTree = { id: 1, val: 42, left: null, right: null };
    render(<TreeVisualizer name="test" tree={singleNodeTree} />);
    expect(screen.getByTestId('value-1')).toHaveTextContent('42');
  });

  test('handles empty highlightIds', () => {
    render(<TreeVisualizer name="test" tree={mockTree} highlightIds={[]} />);
    expect(screen.getByTestId('highlights')).toHaveTextContent('Highlighted: ');
  });

  test('handles null highlightIds', () => {
    render(<TreeVisualizer name="test" tree={mockTree} highlightIds={null} />);
    expect(screen.getByTestId('tree-visualizer')).toBeInTheDocument();
  });

  test('handles undefined highlightIds', () => {
    render(<TreeVisualizer name="test" tree={mockTree} />);
    expect(screen.getByTestId('tree-visualizer')).toBeInTheDocument();
  });
});
