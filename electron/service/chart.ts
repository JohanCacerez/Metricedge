import db from "../db";

import { MedidaData } from "../../src/types/chart";

// Función para obtener estadísticas agrupadas por medida
export function getGroupedStats(modeloId: string): MedidaData[] {
  const posiblesMedidas = ["medida1", "medida2", "medida3", "medida4"];
  const medidasValidas: string[] = [];

  // Detectamos qué medidas tienen datos
  for (const medida of posiblesMedidas) {
    const row = db
      .prepare(
        `SELECT COUNT(${medida}) AS total
         FROM mediciones
         WHERE modelo_id = ? AND ${medida} IS NOT NULL`
      )
      .get(modeloId);

    if (row?.total > 0) {
      medidasValidas.push(medida);
    }
  }

  const resultados: MedidaData[] = [];

  // Recorremos cada medida válida
  for (const medida of medidasValidas) {
    const rows: { valor: number }[] = db
      .prepare(
        `SELECT ${medida} AS valor
         FROM mediciones
         WHERE modelo_id = ? AND ${medida} IS NOT NULL
         ORDER BY fecha ASC`
      )
      .all(modeloId);

    // Agrupamos en grupos de 5
    for (let i = 0; i < rows.length; i += 5) {
      const grupo: number[] = rows.slice(i, i + 5).map((r) => Number(r.valor));

      if (grupo.length === 0) continue;

      // Log para ver los números exactos de cada grupo
      console.log(`Grupo ${Math.floor(i / 5) + 1} de ${medida}:`, grupo);

      const prom = grupo.reduce((a, b) => a + b, 0) / grupo.length;
      const rango = Math.max(...grupo) - Math.min(...grupo);

      resultados.push({
        medida,
        grupo: Math.floor(i / 5) + 1,
        prom: prom,
        rango: rango,
        numeros: grupo, // <-- agregamos los números exactos
      });
    }
  }

  return resultados;
}

//funcion para filtrar por medida (medida1, medida2, medida3, medida4)
export function filtrarPorMedida(
  datos: MedidaData[],
  medida: string
): MedidaData[] {
  return datos.filter((item) => item.medida === medida);
}

//funcion para calcular datos para graficar (corregida)
export function calcDataForChart(
  datos: MedidaData[],
  LSE: number,
  LIE: number
) {
  if (datos.length === 0) return null;

  // Obtener todos los números de todas las mediciones
  const todosLosNumeros = datos.flatMap((item) => item.numeros);

  // Promedio de todas las mediciones
  const Xmed =
    todosLosNumeros.reduce((a, b) => a + b, 0) / todosLosNumeros.length;

  // Rango medio (promedio de rangos de cada grupo)
  const Rmed = datos.reduce((acc, item) => acc + item.rango, 0) / datos.length;

  // Xmed => LIC y LSC
  let LSCX = Xmed + 0.577 * Rmed;
  LSCX = LSCX + 0.00002 * LSCX;

  let LICX = Xmed - 0.577 * Rmed;
  LICX = LICX - 0.00002 * LICX;

  // Rmed => LSC de la variabilidad
  const LSCR = 2.114 * Rmed;

  // Sigma
  const sigma = Rmed / 2.326;

  // CPK
  const CPK = Math.min((LSE - Xmed) / (3 * sigma), (Xmed - LIE) / (3 * sigma));

  // CP
  const CP = (LSE - LIE) / (6 * sigma);

  return {
    LSCX: Number(LSCX.toFixed(2)),
    LICX: Number(LICX.toFixed(2)),
    LSCR: Number(LSCR.toFixed(3)),
    CPK: Number(CPK.toFixed(2)),
    sigma: Number(sigma.toFixed(4)),
    CP: Number(CP.toFixed(2)),
  };
}
