"""
This module defines a Flask application that provides an API endpoint for tracing Python code execution.

Modules:
    - flask: Used to create the web application and handle HTTP requests.
    - flask_cors: Enables Cross-Origin Resource Sharing (CORS) for the application.
    - tracer: Contains the `trace_code` function to trace the execution of Python code.
    - traceback: Used to print detailed error information for debugging purposes.
    - os: Provides a way to access environment variables for configuration.

Routes:
    - /trace (GET): Health check endpoint.
    - /trace (POST): Accepts a JSON payload with Python code and returns the execution trace.
"""

import os
import traceback
from flask import Flask, request, jsonify  # Ensure Flask is installed in your environment
from flask_cors import CORS  # Ensure flask_cors is installed in your environment
from tracer import trace_code

app = Flask(__name__)
CORS(app)  # Allow requests from frontend

@app.route("/trace", methods=["GET", "POST"])
def trace():
    """
    Handles the /trace endpoint for tracing Python code execution.

    GET:
        Returns a health check response.

    POST:
        Accepts a JSON payload with the key "code" containing Python code.
        Returns the execution trace as a JSON response or an error message if tracing fails.

    Returns:
        - (str, int): Health check response for GET requests.
        - (Response): JSON response containing the trace result or an error message for POST requests.
    """
    if request.method == "GET":
        return "OK", 200  # Health check response

    code = request.json.get("code", "")
    try:
        result = trace_code(code)
        return jsonify(result)
    except ValueError as e:  # Catch specific exceptions if possible
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "An unexpected error occurred"}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))  # Default port if not set
    app.run(host="0.0.0.0", port=port, debug=True)
