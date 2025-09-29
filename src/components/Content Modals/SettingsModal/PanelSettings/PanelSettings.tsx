import CreateUser from "./CreateUser";
import { ModelSelector } from "./ModelSelector";

export default function PanelSettings() {
  return (
    <>
      <section className="flex flex-col gap-4">
        <ModelSelector />

        <CreateUser />
      </section>
    </>
  );
}
