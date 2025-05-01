# test_trace.py
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
