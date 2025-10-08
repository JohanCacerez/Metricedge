import db from "../db";

import { MedidaData } from "../../src/types/chart";

// Función para obtener estadísticas agrupadas por medida
export function getGroupedStats(modeloId: string): MedidaData[] {
  const posiblesMedidas = ["medida1", "medida2", "medida3", "medida4"];
  const medidasValidas: string[] = [];

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

  for (const medida of medidasValidas) {
    const rows: { valor: number }[] = db
      .prepare(
        `SELECT ${medida} AS valor
         FROM mediciones
         WHERE modelo_id = ? AND ${medida} IS NOT NULL
         ORDER BY fecha ASC`
      )
      .all(modeloId);

    for (let i = 0; i < rows.length; i += 5) {
      const grupo: number[] = rows.slice(i, i + 5).map((r) => r.valor);

      if (grupo.length === 0) continue;

      const prom =
        grupo.reduce((a: number, b: number) => a + b, 0) / grupo.length;
      const rango = Math.max(...grupo) - Math.min(...grupo);

      resultados.push({
        medida,
        grupo: Math.floor(i / 5) + 1,
        prom: Number(prom.toFixed(3)),
        rango: Number(rango.toFixed(3)),
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

//funcion para calcular datos para graficar
export function calcDataForChart(
  datos: MedidaData[],
  LSE: number,
  LIE: number
) {
  if (datos.length === 0) return null;
  //Xmed = promedio de los promedios
  const sumaPromedios = datos.reduce((acc, item) => acc + item.prom, 0);
  const Xmed = sumaPromedios / datos.length;

  //Rmed = promedio de los rangos
  const sumaRangos = datos.reduce((acc, item) => acc + item.rango, 0);
  const Rmed = sumaRangos / datos.length;

  //Xmed =  LIC, LSC
  let LSCX = Xmed + 0.577 * Rmed;
  LSCX = LSCX + 0.00002 * LSCX;
  let LICX = Xmed - 0.577 * Rmed;
  LICX = LICX - 0.00002 * LICX;

  //Rmed = LSC
  const LSCR = 2.114 * Rmed;

  //Sigma
  const sigma = Rmed / 2.326;

  //CPK
  const CPK = Math.min((LSE - Xmed) / (3 * sigma), (Xmed - LIE) / (3 * sigma));

  //CP
  const CP = (LSE - LIE) / (6 * sigma);

  return {
    LSCX,
    LICX,
    LSCR,
    CPK,
    sigma,
    CP,
  };
}
