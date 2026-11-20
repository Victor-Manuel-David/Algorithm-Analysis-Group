# 72. Edit Distance — programación dinámica (tabla de Wagner–Fischer)
# Autor: Sebastian Restrepo Mira
#
# Estado: dp[i][j] = mínimo de ediciones para convertir word1[0..i) en word2[0..j).
# Base:   dp[i][0] = i (borrar i letras), dp[0][j] = j (insertar j letras).
# Recurrencia:
#   si word1[i-1] == word2[j-1]:  dp[i][j] = dp[i-1][j-1]
#   si no: dp[i][j] = 1 + min(dp[i-1][j],    # borrar
#                             dp[i][j-1],    # insertar
#                             dp[i-1][j-1])  # sustituir
# Tiempo Θ(n·m), espacio Θ(n·m) con n = len(word1), m = len(word2).


class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        n, m = len(word1), len(word2)
        dp = [[0] * (m + 1) for _ in range(n + 1)]

        for i in range(n + 1):
            dp[i][0] = i
        for j in range(m + 1):
            dp[0][j] = j

        for i in range(1, n + 1):
            for j in range(1, m + 1):
                if word1[i - 1] == word2[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1]
                else:
                    dp[i][j] = 1 + min(
                        dp[i - 1][j],      # borrar word1[i-1]
                        dp[i][j - 1],      # insertar word2[j-1]
                        dp[i - 1][j - 1],  # sustituir
                    )

        return dp[n][m]
