import db from "../db/index";
import { Measurement } from "../../src/types/measurement";

export function saveMeasurements(measurement: Measurement) {
  const { modeloId, userId, measurements } = measurement;
  try {
    const insert = db.prepare(
      `INSERT INTO mediciones (modelo_id, user_id, medida1, medida2, medida3, medida4)
       VALUES (?, ?, ?, ?, ?, ?)`
    );

    insert.run(
      modeloId,
      userId,
      measurements[0],
      measurements[1],
      measurements[2],
      measurements[3]
    );

    return { success: true, message: "Mediciones guardadas con éxito" };
  } catch (error) {
    console.error("Error al guardar las mediciones:", error);
    return { success: false, message: error };
  }
}

export function getMeasurements(modeloId?: number, userId?: number) {
  try {
    let query = `SELECT * FROM mediciones`;
    const params: (number | string)[] = [];

    if (modeloId || userId) {
      query += ` WHERE`;
      if (modeloId) {
        query += ` modelo_id = ?`;
        params.push(modeloId);
      }
      if (userId) {
        if (modeloId) query += ` AND`;
        query += ` user_id = ?`;
        params.push(userId);
      }
    }

    query += ` ORDER BY fecha DESC`;

    const rows = db.prepare(query).all(...params);
    return { success: true, data: rows };
  } catch (error) {
    console.error("Error al obtener mediciones:", error);
    return { success: false, message: error };
  }
}
