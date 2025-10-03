import sys
import random

def read_sensor(port, mm_max, zero_mm=0.0, device="1"):
    """
    Simulación de lectura de sensor:
    genera un valor aleatorio en mm dentro del rango.
    """
    mm = random.uniform(0, mm_max) - zero_mm
    mm = round(mm, 2)
    print(f"Puerto: {port}, Dispositivo: {device}, Lectura: {mm} mm, zero_mm: {zero_mm}")
    return mm


if __name__ == "__main__":
    if len(sys.argv) < 3 or len(sys.argv) > 5:
        print("Uso: python script.py <puerto> <mm_max> [zero_mm] [device]")
    else:
        port = sys.argv[1]
        mm_max = float(sys.argv[2])
        zero_mm = float(sys.argv[3]) if len(sys.argv) >= 4 else 0.0
        device = sys.argv[4] if len(sys.argv) == 5 else "1"

        # Solo una lectura simulada
        read_sensor(port, mm_max, zero_mm, device)
