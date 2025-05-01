# TraceDS

**TraceDS** is a web-based visual debugger for data structures and algorithms, built with React and Flask. Users can write Python code and visualize how arrays, linked lists, trees, and hash maps evolve at every step during execution.

Live site: [https://traceds-frontend.onrender.com](https://traceds-frontend.onrender.com)
Built by [Tanish Kalwad](mailto:kalwadtanish@gmail.com)

---

## Features

- **Step-by-step execution tracing**
- **Live visualizations** for:
  - Arrays
  - Linked Lists
  - Trees (BST, AVL, Red-Black Tree)
  - Hash Maps
- **Big-O Complexity Estimator** (heuristic-based)
- **Light/Dark mode toggle**
- Sorting algorithm templates and tree insert demos

---

## Tech Stack

- **Frontend:** React, Monaco Editor, Framer Motion
- **Backend:** Flask, Python AST for instrumentation
- **Deployment:** Render (Frontend: Static Site, Backend: Web Service)

---

## Run Locally

### Prerequisites

- Node.js + npm
- Python 3.10+
- pip

### Frontend

```bash
cd frontend
npm install
npm start
```

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Make sure backend is running at `http://127.0.0.1:5000/trace` for frontend requests to work.

---

## Deployment

This project is deployed on [Render](https://render.com):

- **Backend:** Flask service at `https://traceds-backend.onrender.com`
- **Frontend:** Static React site at `https://traceds-frontend.onrender.com`

---

## License

This project is released under a **custom non-commercial license**.

- You may view, fork, and use this project for **personal or educational purposes**.
- You may **not** use this project or its derivatives in **commercial products or services** without permission.

For commercial inquiries, please contact: [kalwadtanish@gmail.com](mailto:kalwadtanish@gmail.com)

---
