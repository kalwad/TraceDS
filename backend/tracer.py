"""
TraceDS – execution tracer + Big-O heuristic
"""

import ast, copy, inspect

# ──────────────────────────────────────────────────────────────────────────────
# Big-O heuristic visitor
class _ComplexityVisitor(ast.NodeVisitor):
    def __init__(self):
        # Track maximum nesting of ANY loops
        self.max_loop_depth_global = 0
        self._stack = []

        # Which functions are recursive?
        self.current_func = None
        self.recursive_funcs = set()

        # Did we see a halving pattern (n // 2, slicing, etc.)?
        self.halves = False

    def generic_visit(self, node):
        is_loop = isinstance(node, (ast.For, ast.While))
        if is_loop:
            self._stack.append(node)
            self.max_loop_depth_global = max(self.max_loop_depth_global,
                                             len(self._stack))
        # detect halving ops
        if isinstance(node, ast.BinOp) and isinstance(node.op, ast.FloorDiv):
            if isinstance(node.right, ast.Constant) and node.right.value in (2,4,8,16):
                self.halves = True
        if isinstance(node, ast.AugAssign) and isinstance(node.op, ast.FloorDiv):
            if isinstance(node.value, ast.Constant) and node.value.value in (2,4,8,16):
                self.halves = True
        if isinstance(node, ast.Subscript) and isinstance(node.slice, ast.Slice):
            self.halves = True

        super().generic_visit(node)

        if is_loop:
            self._stack.pop()

    def visit_FunctionDef(self, node):
        prev = self.current_func
        self.current_func = node.name
        # traverse into it
        self.generic_visit(node)
        # did it call itself?
        for c in ast.walk(node):
            if isinstance(c, ast.Call) and isinstance(c.func, ast.Name)\
               and c.func.id == node.name:
                self.recursive_funcs.add(node.name)
                break
        self.current_func = prev

def estimate_complexity(code: str) -> str:
    """
    If recursion is present:
      • and we saw ANY loops at all → O(n log n)
      • otherwise → O(log n)
    If no recursion:
      • no loops but halving → O(log n)
      • no loops and no halving → O(1)
      • one level of loops → O(n)
      • k nested loops → O(n^k)
    """
    try:
        tree = ast.parse(code)
        v = _ComplexityVisitor()
        v.visit(tree)

        if v.recursive_funcs:
            # merge/quick sort both hit loops in merge/partition,
            # so max_loop_depth_global>0 gives O(n log n)
            if v.max_loop_depth_global > 0:
                return "O(n log n) rec"
            else:
                return "O(log n) rec"

        # no recursion
        if v.max_loop_depth_global > 1:
            return f"O(n^{v.max_loop_depth_global})"
        if v.max_loop_depth_global == 1:
            return "O(n)"
        if v.halves:
            return "O(log n)"
        return "O(1)"
    except Exception:
        return "unknown"

# ──────────────────────────────────────────────────────────────────────────────
# Full tracer

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
                elif isinstance(val, (int,float,str,bool,type(None))):
                    prims_snap[name] = val
                elif hasattr(val, "next"):
                    # singly-linked list
                    nodes, seen, node = [], set(), val
                    while node and id(node) not in seen:
                        seen.add(id(node))
                        nodes.append(getattr(node, "val", None))
                        node = getattr(node, "next", None)
                    linked_snap[name] = nodes
                elif hasattr(val, "left") or hasattr(val, "right"):
                    # binary tree / BST / AVL / RB
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

            frames.append({
                "line_no": current_line[0],
                "lists":  lists_snap,
                "dicts":  dicts_snap,
                "prims":  prims_snap,
                "linked": linked_snap,
                "trees":  tree_snap,
            })
        except Exception as e:
            print("SNAPSHOT ERROR:", e)

    # inject tracing calls via AST transformer
    tree = ast.parse(code_str)
    class Injector(ast.NodeTransformer):
        def inject(self, stmts):
            out = []
            for stmt in stmts:
                out.append(stmt)
                if hasattr(stmt, "lineno"):
                    out.extend([
                      ast.Expr(ast.Call(ast.Name("__trace_line__", ast.Load()),
                                        [ast.Constant(stmt.lineno)], [])),
                      ast.Expr(ast.Call(ast.Name("snapshot", ast.Load()), [], [])),
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

        visit_AsyncFunctionDef = visit_FunctionDef
        visit_For            = visit_FunctionDef
        visit_While          = visit_FunctionDef
        visit_If             = visit_FunctionDef
        visit_With           = visit_FunctionDef
        visit_Try            = visit_FunctionDef

    tree = Injector().visit(tree)
    ast.fix_missing_locations(tree)

    ns = {"__trace_line__": __trace_line__, "snapshot": snapshot}
    exec(compile(tree, "<string>", "exec"), ns, ns)

    return {
      "frames": frames,
      "complexity": estimate_complexity(code_str)
    }
