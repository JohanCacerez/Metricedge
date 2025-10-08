import { MetricChart } from "../../components/Charts/MetricChart";
import Metric from "../../components/Mediciones/Medicion/Metric";

import { useModelStore } from "../../store/modelStore";

import { useState, useEffect } from "react";

export default function Index() {
  const { activeModel } = useModelStore();
  const [lse, setLse] = useState("");
  const [lie, setLie] = useState("");

  useEffect(() => {
    const storedLse = localStorage.getItem("lse") || "";
    const storedLie = localStorage.getItem("lie") || "";

    setLse(storedLse);
    setLie(storedLie);
  }, []);

  if (!activeModel) return <div>Cargando modelo activo...</div>;

  // Definir las gráficas según el modelo
  let graficas: { medida: string; width: number; medicion: string }[] = [];

  if (activeModel.id === "front-lh" || activeModel.id === "front-rh") {
    graficas = [
      { medida: "F1", width: 600, medicion: "medida1" },
      { medida: "F2", width: 600, medicion: "medida2" },
      { medida: "F3", width: 600, medicion: "medida3" },
    ];
  } else if (activeModel.id === "rear-lh" || activeModel.id === "rear-rh") {
    graficas = [
      { medida: "R1", width: 500, medicion: "medida1" },
      { medida: "R2", width: 500, medicion: "medida2" },
      { medida: "R3", width: 500, medicion: "medida3" },
      { medida: "R4", width: 500, medicion: "medida4" },
    ];
  }

  return (
    <div className="flex flex-col h-full text-text">
      <div className="flex justify-center mb-2">
        <h1 className="text-text font-title text-4xl">Medicion</h1>
      </div>
      <div className="flex-1 flex flex-col gap-2">
        <section className="flex-[1] h-[50vh] bg-surface shadow-md border border-border rounded-2xl p-4">
          <div className="flex flex-wrap justify-around gap-2">
            {graficas.map((g, index) => (
              <MetricChart
                key={index}
                width={g.width}
                medida={g.medida}
                modeloId={activeModel.id}
                LSE={Number(lse)}
                LIE={Number(lie)}
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
