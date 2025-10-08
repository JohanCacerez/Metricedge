import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { MedidaData } from "../../types/chart";

export function MetricChart({
  width,
  medida,
}: {
  width: number;
  medida: string;
}) {
  const [datos, setDatos] = useState<MedidaData[]>([]);
  const [datosMedida1, setDatosMedida1] = useState<MedidaData[]>([]);
  const [stats, setStats] = useState<any>(null);

  const widthStr = width ? `${width}px` : "400px";

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

        // 3️⃣ Calcular estadísticas para graficar
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

  if (!datosMedida1 || !stats) return <div>Cargando...</div>;

  // Definir rango Y dinámico
  const minY = Math.min(...datosMedida1.map((d) => d.prom), stats.LICX) - 5;
  const maxY = Math.max(...datosMedida1.map((d) => d.prom), stats.LSCX) + 5;

  return (
    <div
      className={`w-[${widthStr}] p-4 bg-white rounded-2xl text-text-inverse font-body `}
    >
      <h2>
        Medida <span className="text-primary font-bold">{medida}</span>
      </h2>
      <LineChart
        width={width}
        height={400}
        data={datosMedida1}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="grupo"
          label={{ value: "Grupo", position: "insideBottom", offset: -5 }}
        />
        <YAxis domain={[minY, maxY]} />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="prom"
          name="Promedio"
          stroke="#FF0000"
          strokeWidth={2}
        />

        {/* Líneas de referencia */}
        <ReferenceLine
          y={stats.Xmed}
          stroke="#0000FF"
          strokeWidth={2}
          label="Media"
        />
        <ReferenceLine
          y={stats.LSCX}
          stroke="#FFA500"
          strokeDasharray="5 5"
          label="LSC"
        />
        <ReferenceLine
          y={stats.LICX}
          stroke="#FFA500"
          strokeDasharray="5 5"
          label="LIC"
        />
      </LineChart>
    </div>
  );
}
