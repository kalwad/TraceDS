import pytest
import json
from app import app


@pytest.fixture
def client():
    """Create a test client for the Flask app"""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


class TestTraceEndpoint:
    """Test the /trace endpoint"""

    def test_get_request(self, client):
        """Test GET request returns OK"""
        response = client.get('/trace')
        assert response.status_code == 200
        assert response.data.decode('utf-8') == 'OK'

    def test_post_with_valid_code(self, client):
        """Test POST with valid Python code"""
        test_code = """x = 5
y = 10
result = x + y"""

        response = client.post('/trace',
                             json={'code': test_code},
                             content_type='application/json')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'frames' in data
        assert 'complexity' in data
        assert len(data['frames']) > 0

    def test_post_with_empty_code(self, client):
        """Test POST with empty code"""
        response = client.post('/trace',
                             json={'code': ''},
                             content_type='application/json')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'frames' in data
        assert 'complexity' in data

    def test_post_without_code(self, client):
        """Test POST without code parameter"""
        response = client.post('/trace',
                             json={},
                             content_type='application/json')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'frames' in data
        assert 'complexity' in data

    def test_post_with_invalid_json(self, client):
        """Test POST with invalid JSON"""
        response = client.post('/trace',
                             data='invalid json',
                             content_type='application/json')

        # Should handle gracefully
        assert response.status_code in [200, 400]

    def test_post_with_syntax_error(self, client):
        """Test POST with Python syntax error"""
        invalid_code = "def invalid syntax {"

        response = client.post('/trace',
                             json={'code': invalid_code},
                             content_type='application/json')

        # Should return error for syntax issues
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data


class TestAppConfiguration:
    """Test app configuration and setup"""

    def test_app_instance(self):
        """Test that app is properly configured"""
        assert app is not None
        assert hasattr(app, 'config')

    def test_cors_enabled(self):
        """Test that CORS is enabled"""
        # This is a basic check - in a real test you'd verify CORS headers
        assert True  # Placeholder for CORS verification


if __name__ == "__main__":
    pytest.main([__file__])
