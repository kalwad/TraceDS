#!/usr/bin/env python3
"""
Test runner script for TraceDS backend
"""

import subprocess
import sys
import os

def run_tests():
    """Run all backend tests"""
    print("🧪 Running TraceDS Backend Tests...")
    print("=" * 50)
    
    # Install dependencies if needed
    try:
        import pytest
        import pytest_cov
    except ImportError:
        print("Installing test dependencies...")
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)
    
    # Run tests with coverage
    cmd = [
        sys.executable, "-m", "pytest",
        "--cov=tracer",
        "--cov=app", 
        "--cov-report=term-missing",
        "--cov-report=html",
        "-v"
    ]
    
    result = subprocess.run(cmd, cwd=os.path.dirname(__file__))
    
    if result.returncode == 0:
        print("\n✅ All tests passed!")
        print("📊 Coverage report generated in htmlcov/")
    else:
        print("\n❌ Some tests failed!")
        sys.exit(1)

if __name__ == "__main__":
    run_tests()
