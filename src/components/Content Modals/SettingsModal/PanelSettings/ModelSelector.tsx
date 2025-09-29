import { useState } from "react";
import { useModelStore } from "../../../../store/modelStore";
import { Model } from "../../../../types/model";
import { toast } from "sonner";

const models: Model[] = [
  { id: "rear-lh", name: "REAR LH" },
  { id: "rear-rh", name: "REAR RH" },
  { id: "front-lh", name: "FRONT LH" },
  { id: "front-rh", name: "FRONT RH" },
];

export const ModelSelector = () => {
  const { activeModel, setActiveModel } = useModelStore();
  const [selectedModel, setSelectedModel] = useState(activeModel?.id || "");

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const model = models.find((m) => m.id === selectedModel);
    if (model) setActiveModel(model);
    toast.info(`Modelo ${model?.name} activado`);
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
