# 134. Gas Station — greedy (una pasada)
# Autor: Sebastian Restrepo Mira
#
# 1) Si sum(gas) < sum(cost) no alcanza la gasolina para la vuelta: -1.
# 2) Si alcanza, hay exactamente un inicio válido. Se recorre una vez sumando
#    gas[i] - cost[i] al tanque. Si el tanque queda negativo al salir de i,
#    NINGUNA estación entre `start` e i sirve de inicio: cualquiera de ellas
#    llega a i con el mismo tanque o menos (empezar más adelante quita el
#    aporte no negativo del prefijo). Se descarta el tramo, start = i + 1 y
#    el tanque vuelve a 0. No hay que volver atrás.
# Tiempo Θ(n), espacio extra Θ(1) con n = len(gas).

from typing import List


class Solution:
    def canCompleteCircuit(self, gas: List[int], cost: List[int]) -> int:
        if sum(gas) < sum(cost):
            return -1

        start = 0
        tank = 0
        for i in range(len(gas)):
            tank += gas[i] - cost[i]
            if tank < 0:
                # el tramo [start..i] no sirve: el siguiente candidato es i + 1
                start = i + 1
                tank = 0

        return start
