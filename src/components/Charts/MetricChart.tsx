import React, { useEffect, useState } from "react";
import { MedidaData } from "../../types/chart";

const MetricChart: React.FC = () => {
  const [datos, setDatos] = useState<MedidaData[]>([]);
  const [datosMedida1, setDatosMedida1] = useState<MedidaData[]>([]);
  const [stats, setStats] = useState(null);

  const modeloId = "front-lh"; // tu modelo

  useEffect(() => {
    async function fetchData() {
      try {
        // 1️⃣ Obtener todos los grupos de todos las medidas
        const todosDatos: MedidaData[] =
          await window.electronAPI.chart.getGroupedStats(modeloId);
        setDatos(todosDatos);

        // 2️⃣ Filtrar solo la medida1
        const medida1 = await window.electronAPI.chart.filtrarPorMedida(
          todosDatos,
          "medida1"
        );
        setDatosMedida1(medida1);

        // 3️⃣ Calcular estadísticas para graficar (aunque no vamos a graficar aún)
        const resultadoStats = await window.electronAPI.chart.calcDataForChart(
          medida1,
          1250, // LSE
          1246 // LIE
        );
        setStats(resultadoStats);
      } catch (err) {
        console.error(err);
      }
    }

    fetchData();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Resultados de todas las medidas</h2>
      <pre>{JSON.stringify(datos, null, 2)}</pre>

      <h2>Datos filtrados para medida1</h2>
      <pre>{JSON.stringify(datosMedida1, null, 2)}</pre>

      <h2>Estadísticas calculadas</h2>
      <pre>{JSON.stringify(stats, null, 2)}</pre>
    </div>
  );
};

export default MetricChart;
