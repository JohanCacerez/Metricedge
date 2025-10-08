import { MetricChart } from "../../components/Charts/MetricChart";
import Metric from "../../components/Mediciones/Medicion/Metric";

export default function Index() {
  return (
    <div className="flex flex-col h-full text-text">
      <div className="flex justify-center mb-2">
        <h1 className="text-text font-title text-4xl">Medicion</h1>
      </div>
      <div className="flex-1 flex flex-col gap-2">
        <section className="flex-[1] h-[50vh] bg-surface shadow-md border border-border rounded-2xl p-4">
          <div className="flex justify-around">
            <MetricChart width={600} medida="F1" />
            <MetricChart width={600} medida="F2" />
            <MetricChart width={600} medida="F3" />
          </div>
        </section>
        <section className="flex-[1] h-[50vh] bg-surface shadow-md border border-border rounded-2xl p-4">
          <Metric />
        </section>
      </div>
    </div>
  );
}
