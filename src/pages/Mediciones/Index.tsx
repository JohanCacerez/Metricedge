import Metric from "../../components/Mediciones/Medicion/Metric";

export default function Index() {
  return (
    <div className="flex flex-col h-full text-text">
      <div className="flex justify-center mb-2">
        <h1 className="text-text font-title text-4xl">Medicion</h1>
      </div>
      <div className="flex flex-col gap-8">
        <section className=" bg-surface shadow-md border border-border rounded-2xl p-4">
          <Metric />
        </section>
      </div>
    </div>
  );
}
