from flask import Flask, request, jsonify
from flask_cors import CORS
from tracer import trace_code
import traceback

app = Flask(__name__)
CORS(app)  # allow requests from frontend

@app.route("/trace", methods=["GET", "POST"])
def trace():
    if request.method == "GET":
        return "OK", 200  # health check response (for rendering)

    code = request.json.get("code", "")
    try:
        result = trace_code(code)
        return jsonify(result)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400



import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))  # default if not set
    app.run(host="0.0.0.0", port=port, debug=True)
