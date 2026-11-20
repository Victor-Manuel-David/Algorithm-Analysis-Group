# 300. Longest Increasing Subsequence — programación dinámica (versión Θ(n²) de pizarrón)
# Autor: Sebastian Restrepo Mira
#
# Estado: dp[i] = longitud de la LIS que TERMINA en el índice i.
# Base:   dp[i] = 1 (el elemento solo ya es una subsecuencia creciente).
# Recurrencia: dp[i] = max(dp[i], 1 + dp[j]) para todo j < i con nums[j] < nums[i].
# Respuesta: max(dp), no dp[n-1] (la LIS más larga puede no terminar en el último).
# Tiempo Θ(n²), espacio Θ(n) con n = len(nums).

from typing import List


class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:
        n = len(nums)
        dp = [1] * n

        for i in range(1, n):
            for j in range(i):
                if nums[j] < nums[i]:
                    dp[i] = max(dp[i], 1 + dp[j])

        return max(dp)
