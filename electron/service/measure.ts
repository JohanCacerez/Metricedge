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
    return { success: false, message: "Error al guardar las mediciones" };
  }
}
