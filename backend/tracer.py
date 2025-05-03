# tracer.py — TraceDS (fully fixed complexity estimator)
import ast, copy, inspect


class _ComplexityVisitor(ast.NodeVisitor):
    def __init__(self):
        self.max_loop_depth_global = 0
        self._stack = []

        self.current_func = None
        self.recursive_funcs       = set()
        self.recursive_with_loops  = set()
        self.func_loops            = {}
        self.func_has_comp         = {}
        self.func_tree_recursion   = {}
        self.halves = False

    def _mark_comp(self):
        if self.current_func:
            self.func_has_comp[self.current_func] = True

    def _mark_tree_attr(self, attr):
        if self.current_func and attr in ("left", "right"):
            self.func_tree_recursion[self.current_func] = True

    def generic_visit(self, node):
        is_loop = isinstance(node, (ast.For, ast.While, ast.comprehension))
        if is_loop:
            self._stack.append(node)
            self.max_loop_depth_global = max(self.max_loop_depth_global,
                                             len(self._stack))
            if self.current_func:
                self.func_loops[self.current_func] = True

        if isinstance(node, ast.BinOp) and isinstance(node.op, ast.FloorDiv):
            if isinstance(node.right, ast.Constant) and node.right.value in (2,4,8,16):
                self.halves = True
        elif isinstance(node, ast.AugAssign) and isinstance(node.op, ast.FloorDiv):
            if isinstance(node.value, ast.Constant) and node.value.value in (2,4,8,16):
                self.halves = True
        elif isinstance(node, ast.Subscript) and isinstance(node.slice, ast.Slice):
            self.halves = True

        if isinstance(node, (ast.ListComp, ast.SetComp, ast.DictComp, ast.GeneratorExp)):
            self._mark_comp()

        if isinstance(node, ast.Attribute):
            self._mark_tree_attr(node.attr)

        super().generic_visit(node)
        if is_loop:
            self._stack.pop()

    def visit_FunctionDef(self, node):
        prev = self.current_func
        self.current_func = node.name

        self.func_loops.setdefault(node.name, False)
        self.func_has_comp.setdefault(node.name, False)
        self.func_tree_recursion.setdefault(node.name, False)

        self.generic_visit(node)

        for n in ast.walk(node):
            if isinstance(n, ast.Call) and isinstance(n.func, ast.Name) and n.func.id == node.name:
                self.recursive_funcs.add(node.name)
                if self.func_loops[node.name]:
                    self.recursive_with_loops.add(node.name)
                break

        self.current_func = prev


def estimate_complexity(code: str) -> str:
    try:
        tree = ast.parse(code)
        v = _ComplexityVisitor()
        v.visit(tree)

        if v.recursive_funcs:
            if v.recursive_with_loops:
                return "O(n log n)"
            if any(v.func_has_comp[f] for f in v.recursive_funcs) or v.halves:
                return "O(n log n)"
            if any(v.func_tree_recursion[f] for f in v.recursive_funcs):
                return "O(log n)"
            return "O(n)"

        if v.max_loop_depth_global > 1:
            return f"O(n^{v.max_loop_depth_global})"
        if v.max_loop_depth_global == 1 and v.halves:
            return "O(n log n)"
        if v.max_loop_depth_global == 1:
            return "O(n)"
        if v.halves:
            return "O(log n)"
        return "O(1)"
    except Exception:
        return "unknown"


def trace_code(code_str: str) -> dict:
    frames = []
    current_line = [0]

    def __trace_line__(lineno): current_line[0] = lineno

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
