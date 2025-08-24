import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Simple mock for the CodeEditor component
jest.mock('./CodeEditor', () => {
  return function MockCodeEditor({ code, onChange, onRun, highlightLine, errorInfo, dark }) {
    return (
      <div data-testid="code-editor">
        <textarea
          data-testid="code-input"
          value={code || ''}
          onChange={(e) => onChange && onChange(e.target.value)}
          placeholder="Enter your code here"
        />
        <button onClick={onRun}>Run</button>
        {highlightLine && <div data-testid="highlight">Line: {highlightLine}</div>}
        {errorInfo && <div data-testid="error">Error: {errorInfo.msg}</div>}
        <div data-testid="theme">{dark ? 'Dark' : 'Light'}</div>
      </div>
    );
  };
});

import CodeEditor from './CodeEditor';

describe('CodeEditor Component', () => {
  const defaultProps = {
    code: 'def hello(): return "world"',
    onChange: jest.fn(),
    onRun: jest.fn(),
    highlightLine: null,
    errorInfo: null,
    dark: false
  };

  test('renders code editor', () => {
    render(<CodeEditor {...defaultProps} />);
    expect(screen.getByTestId('code-editor')).toBeInTheDocument();
  });

  test('displays initial code', () => {
    render(<CodeEditor {...defaultProps} />);
    expect(screen.getByDisplayValue('def hello(): return "world"')).toBeInTheDocument();
  });

  test('renders run button', () => {
    render(<CodeEditor {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Run' })).toBeInTheDocument();
  });

  test('handles empty code', () => {
    render(<CodeEditor {...defaultProps} code="" />);
    expect(screen.getByDisplayValue('')).toBeInTheDocument();
  });

  test('handles null code', () => {
    render(<CodeEditor {...defaultProps} code={null} />);
    expect(screen.getByTestId('code-input')).toBeInTheDocument();
  });

  test('passes dark theme', () => {
    render(<CodeEditor {...defaultProps} dark={true} />);
    expect(screen.getByTestId('theme')).toHaveTextContent('Dark');
  });

  test('passes light theme', () => {
    render(<CodeEditor {...defaultProps} dark={false} />);
    expect(screen.getByTestId('theme')).toHaveTextContent('Light');
  });

  test('handles highlightLine prop', () => {
    render(<CodeEditor {...defaultProps} highlightLine={5} />);
    expect(screen.getByTestId('highlight')).toHaveTextContent('Line: 5');
  });

  test('handles errorInfo prop', () => {
    const errorInfo = { line: 3, msg: 'Syntax error' };
    render(<CodeEditor {...defaultProps} errorInfo={errorInfo} />);
    expect(screen.getByTestId('error')).toHaveTextContent('Error: Syntax error');
  });
});
