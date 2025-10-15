import { useEffect, useState } from "react";
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

import { AiFillCarryOut } from "react-icons/ai";

import { useChartStore } from "../../store/chart";
import { useModelStore } from "../../store/modelStore"; // 👈 Asegúrate de tener la función aquí

export function MetricChart({
  width,
  medida,
  modeloId,
  LSE,
  LIE,
  medicion,
}: {
  width: number;
  medida: string;
  modeloId: string;
  LSE: number;
  LIE: number;
  medicion: string;
}) {
  const [, setDatos] = useState<MedidaData[]>([]);
  const [datosMedida1, setDatosMedida1] = useState<MedidaData[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [statsHistorial, setStatsHistorial] = useState<any[]>([]); // 👈 Nuevo: guardará el historial
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const { refreshKey, detectarTendencia } = useChartStore();
  const { activeModel } = useModelStore();
  const [tendencia, setTendencia] = useState("estable");

  const fetchData = async () => {
    try {
      const todosDatos: MedidaData[] =
        await window.electronAPI.chart.getGroupedStats(
          modeloId,
          startDate || undefined,
          endDate || undefined
        );

      setDatos(todosDatos);

      const medida1 = todosDatos.filter((d) => d.medida === medicion);
      setDatosMedida1(medida1);

      if (medida1.length) {
        const sumaPromedios = medida1.reduce((acc, item) => acc + item.prom, 0);
        const Xmed = sumaPromedios / medida1.length;
        const sumaRangos = medida1.reduce((acc, item) => acc + item.rango, 0);
        const Rmed = sumaRangos / medida1.length;

        const LSCX = Xmed + 0.577 * Rmed + 0.00002 * (Xmed + 0.577 * Rmed);
        const LICX = Xmed - 0.577 * Rmed - 0.00002 * (Xmed - 0.577 * Rmed);
        const LSCR = 2.114 * Rmed;
        const sigma = Rmed / 2.326;
        const CPK = Math.min(
          (LSE - Xmed) / (3 * sigma),
          (Xmed - LIE) / (3 * sigma)
        );
        const CP = (LSE - LIE) / (6 * sigma);

        const nuevoStats = { LSCX, LICX, LSCR, sigma, CPK, CP, Xmed };
        setStats(nuevoStats);

        // 👇 Añadimos el nuevo objeto al historial
        setStatsHistorial((prev) => {
          const nuevoHistorial = [...prev, nuevoStats];
          // Limitamos tamaño si quieres (ej. máximo 20 mediciones)
          if (nuevoHistorial.length > 20) nuevoHistorial.shift();
          return nuevoHistorial;
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 👇 Detectar tendencia cuando cambia el historial
  useEffect(() => {
    if (statsHistorial.length >= 6) {
      const analizarTendencia = async () => {
        try {
          const resultado = await detectarTendencia(statsHistorial);
          setTendencia(resultado.tendencia); // o resultado.tipo si tu API devuelve 'tipo'
        } catch (err) {
          console.error("Error al detectar tendencia:", err);
        }
      };
      analizarTendencia();
    }
  }, [statsHistorial]);

  // 👇 Prueba inicial de la función de tendencia
  /* useEffect(() => {
    // Arreglo de prueba manual
    const pruebaStats = [
      { Xmed: 585 },
      { Xmed: 586 },
      { Xmed: 585.5 },
      { Xmed: 586.5 },
      { Xmed: 587 },
      { Xmed: 587.5 },
      { Xmed: 588 },
    ];

    const testTendencia = async () => {
      try {
        const resultado = await detectarTendencia(pruebaStats); // store async
        console.log("Tendencia de prueba:", resultado);
        setTendencia(resultado.tendencia); // mostrar en UI si quieres
      } catch (err) {
        console.error(err);
      }
    };

    testTendencia();
  }, []); */

  useEffect(() => {
    fetchData();
  }, [refreshKey, activeModel, LSE, LIE, startDate, endDate]);

  if (!datosMedida1 || !stats) return <div>Cargando...</div>;

  const minY = Math.min(...datosMedida1.map((d) => d.prom), stats.LICX) - 2;
  const maxY = Math.max(...datosMedida1.map((d) => d.prom), stats.LSCX) + 2;

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md text-text-inverse font-body">
      <div className=" flex text-lg gap-10 font-bold mb-2">
        <h2>
          Medida <span className="text-primary">{medida}</span>{" "}
        </h2>

        <div className=" font-body font-semibold">
          Tendencia:{" "}
          <span
            className={
              tendencia === "aumento"
                ? "text-red-600"
                : tendencia === "descenso"
                ? "text-red-600"
                : "text-green-600"
            }
          >
            {tendencia}
          </span>
        </div>
      </div>

      <div className="flex gap-1 mb-4">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border w-32 rounded px-2 py-1"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border w-32 rounded px-2 py-1"
        />
        <button
          onClick={fetchData}
          className="bg-blue-500 text-white px-2 rounded"
        >
          <AiFillCarryOut className="inline" />
        </button>
      </div>

      {/* 👇 Muestra la tendencia actual */}

      <LineChart
        width={width}
        height={300}
        data={datosMedida1}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="grupo"
          label={{ value: "Grupo", position: "insideBottom", offset: -5 }}
        />
        <YAxis
          domain={[minY, maxY]}
          tickFormatter={(value) => value.toFixed(3)}
        />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="prom"
          name="Promedio"
          stroke="#FF0000"
          strokeWidth={2}
        />
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
