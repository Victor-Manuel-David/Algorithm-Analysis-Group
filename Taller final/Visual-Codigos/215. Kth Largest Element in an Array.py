import heapq
from typing import List

class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:
        # Min-heap de tamaño k. La raíz será el k-ésimo mayor.
        heap = []
        for num in nums:
            if len(heap) < k:
                heapq.heappush(heap, num)
            elif num > heap[0]:
                heapq.heappop(heap)
                heapq.heappush(heap, num)
        return heap[0]