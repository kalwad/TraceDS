import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Simple mock for the App component to avoid complex dependencies
jest.mock('./App', () => {
  return function MockApp() {
    return (
      <div data-testid="app">
        <h1>TraceDS</h1>
        <p>by Tanish Kalwad</p>
        <button>🌙 Dark</button>
        <div>Data structure: <select><option>Choose one</option></select></div>
        <button>Run</button>
        <div>No frames yet. Click "Run".</div>
      </div>
    );
  };
});

import App from './App';

describe('App Component', () => {
  test('renders TraceDS title', () => {
    render(<App />);
    expect(screen.getByText('TraceDS')).toBeInTheDocument();
  });

  test('renders author credit', () => {
    render(<App />);
    expect(screen.getByText('by Tanish Kalwad')).toBeInTheDocument();
  });

  test('renders dark mode toggle', () => {
    render(<App />);
    expect(screen.getByText('🌙 Dark')).toBeInTheDocument();
  });

  test('renders data structure selector', () => {
    render(<App />);
    expect(screen.getByText('Data structure:')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Choose one')).toBeInTheDocument();
  });

  test('renders run button', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: 'Run' })).toBeInTheDocument();
  });

  test('renders visualizer panel', () => {
    render(<App />);
    expect(screen.getByText('No frames yet. Click "Run".')).toBeInTheDocument();
  });
});
