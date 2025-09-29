import { create } from "zustand";
import { Model } from "../types/model";

interface ModelState {
  activeModel: Model | null;
  setActiveModel: (model: Model) => void;
}

export const useModelStore = create<ModelState>((set) => ({
  activeModel: JSON.parse(localStorage.getItem("activeModel") || "null"),
  setActiveModel: (model: Model) => {
    localStorage.setItem("activeModel", JSON.stringify(model));
    set({ activeModel: model });
  },
}));
