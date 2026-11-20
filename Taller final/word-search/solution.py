# 79. Word Search — backtracking (elegir celda, marcar, avanzar, desmarcar)
# Autor: Sebastian Restrepo Mira
#
# Estado: (r, c, k) = posición en la grilla e índice de la letra de `word` que toca.
# Se elige: un vecino ortogonal (arriba, abajo, izquierda, derecha) cuya letra
#           sea word[k]; se marca pisando la celda con '#' y se avanza a k + 1.
# Se deshace: al volver de la rama se restaura la letra original de la celda,
#             para que otros caminos puedan usarla.
# Tiempo O(m·n·4^L) en el peor caso (m×n celdas de inicio, hasta 4 ramas por
# letra, L = len(word)); espacio O(L) por la pila de recursión.

from typing import List


class Solution:
    def exist(self, board: List[List[str]], word: str) -> bool:
        m, n = len(board), len(board[0])

        def backtrack(r: int, c: int, k: int) -> bool:
            if k == len(word):
                return True
            if r < 0 or r >= m or c < 0 or c >= n or board[r][c] != word[k]:
                return False

            letra = board[r][c]
            board[r][c] = "#"  # elegir: marcar la celda como usada en este camino

            encontrado = (
                backtrack(r + 1, c, k + 1)
                or backtrack(r - 1, c, k + 1)
                or backtrack(r, c + 1, k + 1)
                or backtrack(r, c - 1, k + 1)
            )

            board[r][c] = letra  # deshacer: quitar la marca al volver
            return encontrado

        for r in range(m):
            for c in range(n):
                if backtrack(r, c, 0):
                    return True
        return False
