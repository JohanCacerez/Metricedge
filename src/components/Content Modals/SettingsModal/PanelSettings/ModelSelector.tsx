import { useState, useEffect } from "react";
import { useModelStore } from "../../../../store/modelStore";
import { Model } from "../../../../types/model";
import { toast } from "sonner";

import rearlh from "../../../../assets/models/rearlh.png";
import rearrh from "../../../../assets/models/rearrh.png";
import frontlh from "../../../../assets/models/frontlh.png";
import frontrh from "../../../../assets/models/frontrh.png";

const models: Model[] = [
  {
    id: "rear-lh",
    name: "REAR LH",
    np_saargumi: "DA17677",
    np_client: "5A79965",
    photo: rearlh,
  },
  {
    id: "rear-rh",
    name: "REAR RH",
    np_saargumi: "DA17676",
    np_client: "5A79966",
    photo: rearrh,
  },
  {
    id: "front-lh",
    name: "FRONT LH",
    np_saargumi: "DA17671",
    np_client: "5A79963",
    photo: frontlh,
  },
  {
    id: "front-rh",
    name: "FRONT RH",
    np_saargumi: "DA17670",
    np_client: "5A79964",
    photo: frontrh,
  },
];

export const ModelSelector = () => {
  const { activeModel, setActiveModel } = useModelStore();
  const [selectedModel, setSelectedModel] = useState(activeModel?.id || "");
  const [limits, setLimits] = useState<{ lse: string; lie: string }[]>([]);

  // 🔹 Determina cuántos pares mostrar
  const getNumPairs = (modelId: string) => {
    if (modelId === "rear-lh" || modelId === "rear-rh") return 4;
    if (modelId === "front-lh" || modelId === "front-rh") return 3;
    return 0;
  };

  // 🔹 Cargar datos del modelo actual desde localStorage
  useEffect(() => {
    if (selectedModel) {
      const stored = localStorage.getItem(`${selectedModel}-limits`);
      if (stored) {
        setLimits(JSON.parse(stored));
      } else {
        // Inicializa vacíos según el modelo
        const pairs = Array.from(
          { length: getNumPairs(selectedModel) },
          () => ({
            lse: "",
            lie: "",
          })
        );
        setLimits(pairs);
      }
    }
  }, [selectedModel]);

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(e.target.value);
  };

  const handleInputChange = (
    index: number,
    field: "lse" | "lie",
    value: string
  ) => {
    setLimits((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const model = models.find((m) => m.id === selectedModel);
    if (!model) {
      toast.error("Selecciona un modelo válido");
      return;
    }

    // Guarda los valores en localStorage
    localStorage.setItem(`${selectedModel}-limits`, JSON.stringify(limits));

    // También puedes guardar los primeros (opcional, compatibilidad con código actual)
    localStorage.setItem("lse", limits[0]?.lse || "");
    localStorage.setItem("lie", limits[0]?.lie || "");

    setActiveModel(model);
    toast.success(
      `Modelo ${model.name} activado con ${limits.length} pares de límites.`
    );
  };

  return (
    <section className="flex flex-col justify-center items-center p-6 border border-border rounded-2xl shadow-md">
      <h1 className="text-2xl font-title text-text mb-6">Activar Modelo</h1>

      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col gap-4 text-primary"
      >
        <label htmlFor="model" className="text-lg font-body text-text">
          Selecciona un modelo:
        </label>
        <select
          id="model"
          value={selectedModel}
          onChange={handleModelChange}
          className="p-3 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
        >
          <option value="">--Selecciona--</option>
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>

        {limits.map((lim, index) => (
          <div key={index} className="flex gap-2 items-center">
            <label className="text-md text-text font-semibold">
              LSE {index + 1}:
            </label>
            <input
              type="number"
              value={lim.lse}
              onChange={(e) => handleInputChange(index, "lse", e.target.value)}
              className="p-2 border rounded w-24"
            />
            <label className="text-md text-text font-semibold">
              LIE {index + 1}:
            </label>
            <input
              type="number"
              value={lim.lie}
              onChange={(e) => handleInputChange(index, "lie", e.target.value)}
              className="p-2 border rounded w-24"
            />
          </div>
        ))}

        <button
          type="submit"
          className="bg-primary text-text text-lg font-ui py-3 rounded-lg hover:bg-primary-dark transition-colors"
        >
          Guardar
        </button>
      </form>
    </section>
  );
};
