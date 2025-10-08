import db from "../db";

import { MedidaData } from "../../src/types/chart";

// Función para obtener estadísticas agrupadas por medida
export function getGroupedStats(
  modeloId: string,
  startDate?: string,
  endDate?: string
): MedidaData[] {
  const posiblesMedidas = ["medida1", "medida2", "medida3", "medida4"];
  const medidasValidas: string[] = [];

  // Detectamos qué medidas tienen datos
  for (const medida of posiblesMedidas) {
    let query = `SELECT COUNT(${medida}) AS total FROM mediciones WHERE modelo_id = ?`;
    const params: string[] = [modeloId];

    if (startDate) {
      query += ` AND fecha >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND fecha <= ?`;
      params.push(endDate);
    }

    const row = db.prepare(query).get(...params);
    if (row?.total > 0) medidasValidas.push(medida);
  }

  const resultados: MedidaData[] = [];

  for (const medida of medidasValidas) {
    let query = `SELECT ${medida} AS valor FROM mediciones WHERE modelo_id = ? AND ${medida} IS NOT NULL`;
    const params: (string | number)[] = [modeloId];

    if (startDate) {
      query += ` AND fecha >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND fecha <= ?`;
      params.push(endDate);
    }

    query += ` ORDER BY fecha ASC`;

    const rows: { valor: number }[] = db.prepare(query).all(...params);

    for (let i = 0; i < rows.length; i += 5) {
      const grupo = rows.slice(i, i + 5).map((r) => Number(r.valor));
      if (!grupo.length) continue;

      const prom = grupo.reduce((a, b) => a + b, 0) / grupo.length;
      const rango = Math.max(...grupo) - Math.min(...grupo);

      resultados.push({
        medida,
        grupo: Math.floor(i / 5) + 1,
        prom: Number(prom.toFixed(3)),
        rango: Number(rango.toFixed(3)),
        numeros: grupo,
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
    Xmed: Number(Xmed.toFixed(1)),
    LSCX: Number(LSCX.toFixed(2)),
    LICX: Number(LICX.toFixed(2)),
    LSCR: Number(LSCR.toFixed(3)),
    CPK: Number(CPK.toFixed(2)),
    sigma: Number(sigma.toFixed(4)),
    CP: Number(CP.toFixed(2)),
  };
}
