# tracer.py
import ast
import copy
import inspect

# ──────────────────────────────────────────────
# 1.  Heuristic Big-O estimator
# ──────────────────────────────────────────────
class _ComplexityVisitor(ast.NodeVisitor):
    """
    Collects:
      • max nested loops     -> self.loop_depth
      • any “halving” op     -> self.halves (True/False)
      • self-recursion funcs -> self.recursive_funcs
    """
    def __init__(self):
        self.loop_depth = 0
        self._stack = []               # loop-nest stack
        self.recursive_funcs = set()
        self.halves = False            # flag: // constant or slicing seen

    def generic_visit(self, node):
        # track loop nesting
        is_loop = isinstance(node, (ast.For, ast.While))
        if is_loop:
            self._stack.append(node)
            self.loop_depth = max(self.loop_depth, len(self._stack))

        # detect floor-division by 2,4,8,16
        if isinstance(node, ast.BinOp) and isinstance(node.op, ast.FloorDiv):
            if isinstance(node.right, ast.Constant) and node.right.value in (2,4,8,16):
                self.halves = True
        if isinstance(node, ast.AugAssign) and isinstance(node.op, ast.FloorDiv):
            if isinstance(node.value, ast.Constant) and node.value.value in (2,4,8,16):
                self.halves = True

        # detect any slicing (e.g. arr[1:], arr[:-1], arr[:])
        if isinstance(node, ast.Subscript) and isinstance(node.slice, ast.Slice):
            self.halves = True

        super().generic_visit(node)

        if is_loop:
            self._stack.pop()

    def visit_FunctionDef(self, node):
        # first descend to gather loops & slices
        self.generic_visit(node)
        # then scan for calls to itself
        for n in ast.walk(node):
            if isinstance(n, ast.Call) and isinstance(n.func, ast.Name):
                if n.func.id == node.name:
                    self.recursive_funcs.add(node.name)
                    break


def estimate_complexity(code: str) -> str:
    """
    Heuristic Big-O estimate:
      1) recursion + (loops or halves) => O(n log n)
      2) recursion only                => O(log n)
      3) any halving op                => O(log n)
      4) k nested loops                => O(n^k)
      5) otherwise                     => O(1)
    Append ' rec' if any self-recursion.
    """
    try:
        tree = ast.parse(code)
        v = _ComplexityVisitor()
        v.visit(tree)

        if v.recursive_funcs:
            base = "O(n log n)" if (v.loop_depth>0 or v.halves) else "O(log n)"
        elif v.halves:
            base = "O(log n)"
        elif v.loop_depth == 0:
            base = "O(1)"
        elif v.loop_depth == 1:
            base = "O(n)"
        else:
            base = f"O(n^{v.loop_depth})"

        if v.recursive_funcs:
            base += " rec"
        return base
    except Exception:
        return "unknown"


# ──────────────────────────────────────────────
# 2.  Original tracer – returns both frames & complexity
# ──────────────────────────────────────────────
def trace_code(code_str: str) -> dict:
    frames = []
    current_line = [0]

    def __trace_line__(lineno):
        current_line[0] = lineno

    def snapshot():
        try:
            f = inspect.currentframe().f_back
            lists_snap, dicts_snap, prims_snap = {}, {}, {}
            linked_snap, tree_snap = {}, {}

            for name, val in f.f_locals.items():
                if name.startswith("__"):
                    continue
                if isinstance(val, list):
                    lists_snap[name] = copy.deepcopy(val)
                elif isinstance(val, dict):
                    dicts_snap[name] = copy.deepcopy(val)
                elif isinstance(val, (int, float, str, bool, type(None))):
                    prims_snap[name] = val
                elif hasattr(val, "next"):
                    # simple linked‐list
                    nodes, seen, node = [], set(), val
                    while node and id(node) not in seen:
                        seen.add(id(node))
                        nodes.append(getattr(node, "val", None))
                        node = getattr(node, "next", None)
                    linked_snap[name] = nodes
                elif hasattr(val, "left") or hasattr(val, "right"):
                    # simple binary tree
                    def ser(n):
                        if n is None:
                            return None
                        return {
                            "id": id(n),
                            "val": getattr(n, "val", None),
                            "left": ser(getattr(n, "left", None)),
                            "right": ser(getattr(n, "right", None)),
                        }
                    tree_snap[name] = ser(val)

            frames.append({
                "line_no": current_line[0],
                "lists": lists_snap,
                "dicts": dicts_snap,
                "prims": prims_snap,
                "linked": linked_snap,
                "trees": tree_snap,
            })
        except Exception as e:
            print("SNAPSHOT ERROR:", e)

    # ── inject tracing calls after each statement ─────────────────────
    tree = ast.parse(code_str)

    class Injector(ast.NodeTransformer):
        def inject(self, stmts):
            out = []
            for stmt in stmts:
                out.append(stmt)
                if hasattr(stmt, "lineno"):
                    out.extend([
                        ast.Expr(ast.Call(func=ast.Name("__trace_line__", ast.Load()),
                                          args=[ast.Constant(stmt.lineno)], keywords=[])),
                        ast.Expr(ast.Call(func=ast.Name("snapshot", ast.Load()),
                                          args=[], keywords=[])),
                    ])
            return out

        def visit_Module(self, node):
            self.generic_visit(node)
            node.body = self.inject(node.body)
            return node

        def visit_FunctionDef(self, node):
            self.generic_visit(node)
            node.body = self.inject(node.body)
            return node

        def visit_AsyncFunctionDef(self, node):
            self.generic_visit(node)
            node.body = self.inject(node.body)
            return node

        def visit_For(self, node):
            self.generic_visit(node)
            node.body = self.inject(node.body)
            node.orelse = self.inject(getattr(node, "orelse", []))
            return node

        def visit_While(self, node):
            self.generic_visit(node)
            node.body = self.inject(node.body)
            node.orelse = self.inject(getattr(node, "orelse", []))
            return node

        def visit_If(self, node):
            self.generic_visit(node)
            node.body = self.inject(node.body)
            node.orelse = self.inject(getattr(node, "orelse", []))
            return node

        def visit_With(self, node):
            self.generic_visit(node)
            node.body = self.inject(node.body)
            return node

        def visit_Try(self, node):
            self.generic_visit(node)
            node.body      = self.inject(node.body)
            node.orelse    = self.inject(getattr(node, "orelse", []))
            node.finalbody = self.inject(getattr(node, "finalbody", []))
            for h in node.handlers:
                h.body = self.inject(h.body)
            return node

    tree = Injector().visit(tree)
    ast.fix_missing_locations(tree)

    ns = {"__trace_line__": __trace_line__, "snapshot": snapshot}
    exec(compile(tree, "<string>", "exec"), ns, ns)

    return {
        "frames": frames,
        "complexity": estimate_complexity(code_str),
    }
