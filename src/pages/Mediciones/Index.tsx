import { useState, useEffect } from "react";
import { MetricChart } from "../../components/Charts/MetricChart";
import Metric from "../../components/Mediciones/Medicion/Metric";
import { useModelStore } from "../../store/modelStore";

export default function Index() {
  const { activeModel } = useModelStore();
  const [limites, setLimites] = useState<
    Record<string, { lse: string; lie: string }>
  >({});

  useEffect(() => {
    if (!activeModel) return;

    // Leemos el array completo guardado en el storage del modelo
    const stored = localStorage.getItem(`${activeModel.id}-limits`);
    if (stored) {
      const arr = JSON.parse(stored); // 👈 Esto debe ser un array de objetos [{lse,lie}, ...]
      const nuevosLimites: Record<string, { lse: string; lie: string }> = {};

      // Dependiendo del modelo, asignamos los valores por orden
      let medidas: string[] = [];
      if (activeModel.id === "front-lh" || activeModel.id === "front-rh") {
        medidas = ["F7", "F6", "F1"];
      } else if (activeModel.id === "rear-lh" || activeModel.id === "rear-rh") {
        medidas = ["F14", "F15", "F1", "F8"];
      }

      medidas.forEach((m, i) => {
        nuevosLimites[m] = arr[i] || { lse: "0", lie: "0" }; // 👈 asigna en orden
      });

      console.log("✅ Límites cargados:", nuevosLimites);
      setLimites(nuevosLimites);
    }
  }, [activeModel]);

  if (!activeModel) return <div>Cargando modelo activo...</div>;

  let graficas: { medida: string; width: number; medicion: string }[] = [];

  if (activeModel.id === "front-lh" || activeModel.id === "front-rh") {
    graficas = [
      { medida: "F7", width: 450, medicion: "medida1" },
      { medida: "F6", width: 450, medicion: "medida2" },
      { medida: "F1", width: 450, medicion: "medida3" },
    ];
  } else if (activeModel.id === "rear-lh" || activeModel.id === "rear-rh") {
    graficas = [
      { medida: "F14", width: 350, medicion: "medida1" },
      { medida: "F15", width: 350, medicion: "medida2" },
      { medida: "F1", width: 350, medicion: "medida3" },
      { medida: "F8", width: 350, medicion: "medida4" },
    ];
  }

  return (
    <div className="flex flex-col h-full text-text">
      <div className="flex justify-center mb-2">
        <h1 className="text-text font-title text-4xl">Medición</h1>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        <section className="flex-[1] h-[50vh] bg-surface shadow-md border border-border rounded-2xl p-4">
          <div className="flex flex-row flex-wrap gap-2">
            {graficas.map((g, index) => (
              <MetricChart
                key={index}
                width={g.width}
                medida={g.medida}
                modeloId={activeModel.id}
                LSE={Number(limites[g.medida]?.lse || 0)}
                LIE={Number(limites[g.medida]?.lie || 0)}
                medicion={g.medicion}
              />
            ))}
          </div>
        </section>

        <section className="flex-[1] h-[50vh] bg-surface shadow-md border border-border rounded-2xl p-4">
          <Metric />
        </section>
      </div>
    </div>
  );
}
