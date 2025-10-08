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
  const [lse, setLse] = useState(localStorage.getItem("lse") || "");
  const [lie, setLie] = useState(localStorage.getItem("lie") || "");

  useEffect(() => {
    // Si hay un modelo activo, setear los valores en los inputs
    if (activeModel) {
      setSelectedModel(activeModel.id);
    }
  }, [activeModel]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const model = models.find((m) => m.id === selectedModel);
    if (!model) {
      toast.error("Selecciona un modelo válido");
      return;
    }

    setActiveModel(model);
    localStorage.setItem("lse", lse);
    localStorage.setItem("lie", lie);

    toast.info(`Modelo ${model.name} activado. LSE: ${lse}, LIE: ${lie}`);
  };

  return (
    <section className="flex flex-col justify-center items-center p-6 border border-border rounded-2xl shadow-">
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
          onChange={handleChange}
          className="p-4 text-lg font-ui border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
        >
          <option value="">--Selecciona--</option>
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>

        <label htmlFor="lse" className="text-lg font-body text-text">
          LSE:
        </label>
        <input
          type="number"
          id="lse"
          value={lse}
          onChange={(e) => setLse(e.target.value)}
          className="p-4 text-lg font-ui border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <label htmlFor="lie" className="text-lg font-body text-text">
          LIE:
        </label>
        <input
          type="number"
          id="lie"
          value={lie}
          onChange={(e) => setLie(e.target.value)}
          className="p-4 text-lg font-ui border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

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
