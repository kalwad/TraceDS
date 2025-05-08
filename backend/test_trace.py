# test_trace.py
"""
This script tests the functionality of the `trace_code` function from the `tracer` module
by tracing the execution of a sample Python code snippet. The code snippet defines a 
function `closest_pair_1d` that calculates the smallest distance between any two elements 
in a 1D array using a merge sort-based approach.

Modules:
    - json: Used for pretty-printing the trace result in JSON format.
    - tracer: Contains the `trace_code` function to trace the execution of Python code.

Constants:
    - CODE (str): A multi-line string containing the Python code to be traced. The code 
      defines the `closest_pair_1d` function and demonstrates its usage with a sample array.

Functions:
    - closest_pair_1d(arr): A function defined within the `CODE` string that computes the 
      smallest distance between any two elements in a 1D array using a merge sort-based 
      approach.

Execution:
    - The `trace_code` function is invoked with the `CODE` string to trace its execution.
    - The resulting trace is pretty-printed in JSON format for inspection.
"""

import json
from tracer import trace_code

CODE = """def closest_pair_1d(arr):
    def merge_sort(arr):
        if len(arr) <= 1:
            return arr
        mid = len(arr) // 2
        left = merge_sort(arr[:mid])
        right = merge_sort(arr[mid:])
        return merge(left, right)

    def merge(left, right):
        result = []
        i = j = 0
        while i < len(left) and j < len(right):
            if left[i] < right[j]:
                result.append(left[i])
                i += 1
            else:
                result.append(right[j])
                j += 1
        result.extend(left[i:])
        result.extend(right[j:])
        return result

    sorted_arr = merge_sort(arr)
    min_dist = float('inf')
    for i in range(1, len(sorted_arr)):
        min_dist = min(min_dist, abs(sorted_arr[i] - sorted_arr[i-1]))
    return min_dist

# Example usage
arr = [10, 2, 14, 4, 7]
print("closest_pair_1d(arr) =", closest_pair_1d(arr))
"""

# run tracer and pretty-print
result = trace_code(CODE)
print(json.dumps(result, indent=2))
