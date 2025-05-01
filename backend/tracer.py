"""
TraceDS – execution tracer + Big-O heuristic

"""

import ast, copy, inspect

# Heuristic Big-O estimator

class _ComplexityVisitor(ast.NodeVisitor):
    def __init__(self):
        # global max loop nest
        self.max_loop_depth_global = 0
        self._stack = []

        # per-function loop depth plus recursion flag
        self.func_loop_depth = {}
        self.current_func = None
        self.recursive_funcs = set()

        # halving flag
        self.halves = False

    # generic visits
    def generic_visit(self, node):
        is_loop = isinstance(node, (ast.For, ast.While))

        if is_loop:
            self._stack.append(node)
            self.max_loop_depth_global = max(self.max_loop_depth_global, len(self._stack))
            if self.current_func:
                depth = self.func_loop_depth.setdefault(self.current_func, 0)
                self.func_loop_depth[self.current_func] = max(depth, len(self._stack))

        # detect halving
        if isinstance(node, ast.BinOp) and isinstance(node.op, ast.FloorDiv):
            if isinstance(node.right, ast.Constant) and node.right.value in (2, 4, 8, 16):
                self.halves = True
        if isinstance(node, ast.AugAssign) and isinstance(node.op, ast.FloorDiv):
            if isinstance(node.value, ast.Constant) and node.value.value in (2, 4, 8, 16):
                self.halves = True
        if isinstance(node, ast.Subscript) and isinstance(node.slice, ast.Slice):
            self.halves = True

        super().generic_visit(node)

        if is_loop:
            self._stack.pop()

    # define all funcs
    def visit_FunctionDef(self, node):
        prev = self.current_func
        self.current_func = node.name
        self.func_loop_depth.setdefault(node.name, 0)

        self.generic_visit(node)  # traverse body

        # detect self recursion
        for n in ast.walk(node):
            if isinstance(n, ast.Call) and isinstance(n.func, ast.Name) and n.func.id == node.name:
                self.recursive_funcs.add(node.name)
                break

        self.current_func = prev


def estimate_complexity(code: str) -> str:
    """
    recursions, then use loops inside those functions
    else, use global loop depth
    """
    try:
        tree = ast.parse(code)
        v = _ComplexityVisitor()
        v.visit(tree)

        rec_loop_depth = max(
            (v.func_loop_depth.get(f, 0) for f in v.recursive_funcs), default=0
        )

        effective_loop_depth = rec_loop_depth if v.recursive_funcs else v.max_loop_depth_global

        if v.recursive_funcs:
            base = "O(n log n)" if (effective_loop_depth > 0 or v.halves) else "O(log n)"
        elif v.halves:
            base = "O(log n)"
        elif effective_loop_depth == 0:
            base = "O(1)"
        elif effective_loop_depth == 1:
            base = "O(n)"
        else:
            base = f"O(n^{effective_loop_depth})"

        if v.recursive_funcs:
            base += " rec"
        return base
    except Exception:
        return "unknown"


# Tracer
def trace_code(code_str: str) -> dict:
    frames = []
    current_line = [0]

    def __trace_line__(lineno: int): current_line[0] = lineno

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
                    nodes, seen, node = [], set(), val
                    while node and id(node) not in seen:
                        seen.add(id(node))
                        nodes.append(getattr(node, "val", None))
                        node = getattr(node, "next", None)
                    linked_snap[name] = nodes
                elif hasattr(val, "left") or hasattr(val, "right"):

                    def ser(n):
                        if n is None:
                            return None
                        return {
                            "id": id(n),
                            "val": getattr(n, "val", None),
                            "left": ser(getattr(n, "left", None)),
                            "right": ser(getattr(n, "right", None)),
                            "color": getattr(n, "color", None),
                            "bf": getattr(n, "height", None),
                        }

                    tree_snap[name] = ser(val)

            frames.append(
                {
                    "line_no": current_line[0],
                    "lists":  lists_snap,
                    "dicts":  dicts_snap,
                    "prims":  prims_snap,
                    "linked": linked_snap,
                    "trees":  tree_snap,
                }
            )
        except Exception as e:
            print("SNAPSHOT ERROR:", e)

    # inject tracer calls
    tree = ast.parse(code_str)

    class Injector(ast.NodeTransformer):
        def inject(self, stmts):
            out = []
            for stmt in stmts:
                out.append(stmt)
                if hasattr(stmt, "lineno"):
                    out += [
                        ast.Expr(ast.Call(ast.Name("__trace_line__", ast.Load()), [ast.Constant(stmt.lineno)], [])),
                        ast.Expr(ast.Call(ast.Name("snapshot",      ast.Load()), [], [])),
                    ]
            return out

        def visit_Module(self, node):
            self.generic_visit(node); node.body = self.inject(node.body); return node
        def visit_FunctionDef(self, node):
            self.generic_visit(node); node.body = self.inject(node.body); return node
        visit_AsyncFunctionDef = visit_FunctionDef
        visit_For = visit_FunctionDef
        visit_While = visit_FunctionDef
        visit_If = visit_FunctionDef
        visit_With = visit_FunctionDef
        visit_Try = visit_FunctionDef

    tree = Injector().visit(tree)
    ast.fix_missing_locations(tree)

    ns = {"__trace_line__": __trace_line__, "snapshot": snapshot}
    exec(compile(tree, "<string>", "exec"), ns, ns)

    return {"frames": frames, "complexity": estimate_complexity(code_str)}
