# Testing Guide for TraceDS

This document provides comprehensive information about running tests for both the frontend and backend components of TraceDS.

## 🧪 Backend Testing

### Prerequisites
- Python 3.7+
- pip

### Installation
```bash
cd backend
pip install -r requirements.txt
```

### Running Tests
```bash
# Run all tests
python run_tests.py

# Or run with pytest directly
pytest

# Run with coverage
pytest --cov=tracer --cov=app --cov-report=html

# Run specific test file
pytest test_tracer.py

# Run specific test class
pytest test_tracer.py::TestComplexityVisitor

# Run specific test method
pytest test_tracer.py::TestComplexityVisitor::test_simple_function
```

### Test Coverage
- **tracer.py**: Tests for complexity analysis and code tracing
- **app.py**: Tests for Flask API endpoints
- **Coverage reports**: Generated in `htmlcov/` directory

### Test Structure
```
backend/
├── test_tracer.py      # Core tracer functionality tests
├── test_app.py         # Flask API tests
├── pytest.ini         # Pytest configuration
└── run_tests.py       # Test runner script
```

## 🎨 Frontend Testing

### Prerequisites
- Node.js 14+
- npm

### Installation
```bash
cd frontend
npm install
```

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- App.test.jsx

# Run tests in CI mode
npm test -- --ci --coverage --watchAll=false
```

### Test Structure
```
frontend/src/
├── App.test.jsx           # Main App component tests
├── TreeVisualizer.test.jsx # Tree visualization tests
├── CodeEditor.test.jsx     # Code editor tests
└── setupTests.js          # Test configuration and mocks
```

## 🚀 Running All Tests

### Backend Tests
```bash
cd backend
python run_tests.py
```

### Frontend Tests
```bash
cd frontend
npm test -- --coverage --watchAll=false
```

## 📊 Test Coverage

### Backend Coverage
- **tracer.py**: Complexity analysis, AST parsing, code execution
- **app.py**: API endpoints, error handling, CORS
- **Target**: >90% coverage

### Frontend Coverage
- **App.jsx**: Main application logic, state management
- **TreeVisualizer.jsx**: Tree rendering and interactions
- **CodeEditor.jsx**: Monaco editor integration
- **Target**: >80% coverage

## 🧩 Test Categories

### Unit Tests
- Individual function testing
- Component rendering
- State management
- Error handling

### Integration Tests
- API endpoint testing
- Component interaction testing
- Data flow testing

### Edge Cases
- Empty/null inputs
- Invalid data
- Error conditions
- Boundary conditions

## 🔧 Test Configuration

### Backend (pytest.ini)
- Verbose output
- Coverage reporting
- HTML coverage reports
- Custom markers

### Frontend (package.json)
- Jest configuration
- React Testing Library
- Coverage thresholds
- Mock configurations

## 📝 Writing New Tests

### Backend Test Template
```python
def test_function_name():
    """Test description"""
    # Arrange
    input_data = "test"
    
    # Act
    result = function_to_test(input_data)
    
    # Assert
    assert result == "expected"
```

### Frontend Test Template
```jsx
test('component behavior', () => {
  // Arrange
  render(<Component prop="value" />);
  
  // Act
  fireEvent.click(screen.getByRole('button'));
  
  // Assert
  expect(screen.getByText('expected')).toBeInTheDocument();
});
```

## 🚨 Common Issues

### Backend
- **Import errors**: Ensure virtual environment is activated
- **Module not found**: Check Python path and dependencies
- **Coverage issues**: Verify pytest-cov is installed

### Frontend
- **Mock errors**: Check setupTests.js configuration
- **Component errors**: Verify all required props are provided
- **Async issues**: Use waitFor for asynchronous operations

## 📈 Continuous Integration

### GitHub Actions
Tests run automatically on:
- Pull requests
- Push to main branch
- Scheduled runs

### Pre-commit Hooks
- Lint checking
- Test running
- Coverage verification

## 🎯 Best Practices

1. **Test naming**: Use descriptive test names
2. **Arrange-Act-Assert**: Follow AAA pattern
3. **Mock external dependencies**: Don't test third-party code
4. **Test edge cases**: Include error conditions
5. **Maintain coverage**: Aim for high test coverage
6. **Fast execution**: Keep tests quick and focused

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Pytest Documentation](https://docs.pytest.org/)
- [Coverage.py](https://coverage.readthedocs.io/)

## 🤝 Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Ensure all tests pass
3. Maintain or improve coverage
4. Update this documentation if needed

---

**Happy Testing! 🧪✨**
