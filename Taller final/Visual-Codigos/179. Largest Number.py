from functools import cmp_to_key
from typing import List

class Solution:
    def largestNumber(self, nums: List[int]) -> str:
        # Convertimos a string para poder concatenar
        strs = [str(x) for x in nums]

        # Comparador: a va antes que b si a+b > b+a
        def compare(a: str, b: str) -> int:
            if a + b > b + a:
                return -1   # a debe ir primero
            elif a + b < b + a:
                return 1    # b debe ir primero
            else:
                return 0

        strs.sort(key=cmp_to_key(compare))
        result = "".join(strs)

        # Caso especial: todos ceros → "0"
        return "0" if result[0] == "0" else result