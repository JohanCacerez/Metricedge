import { useEffect, useState } from "react";

interface Medicion {
  id: number;
  modelo_id: number;
  user_id: number;
  fecha: string;
  medida1: number;
  medida2: number;
  medida3: number;
  medida4: number | null;
}

export default function MeasurementTable({
  modeloId,
  userId,
}: {
  modeloId?: number;
  userId?: number;
}) {
  const [data, setData] = useState<Medicion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await window.electronAPI.measurements.getAll(
        modeloId,
        userId
      );
      if (result.success && result.data) {
        setData(result.data);
      } else {
        console.error(result.message);
      }
      setLoading(false);
    };

    fetchData();
  }, [modeloId, userId]);

  if (loading)
    return (
      <p className="text-[var(--color-text-muted)] text-center mt-4 font-ui">
        Cargando mediciones...
      </p>
    );

  return (
    <div
      className="p-6 rounded-2xl shadow-md border border-[var(--color-border)]"
      style={{ backgroundColor: "var(--color-surface)" }}
    >
      <h2
        className="text-2xl font-title text-center mb-5"
        style={{ color: "var(--color-text)" }}
      >
        Mediciones registradas
      </h2>

      <div className="overflow-x-auto rounded-xl border border-[var(--color-divider)]">
        <table className="min-w-full border-collapse font-body text-sm">
          <thead
            className="uppercase text-xs tracking-wider"
            style={{
              backgroundColor: "var(--color-bg)",
              color: "var(--color-text-muted)",
            }}
          >
            <tr>
              {[
                "ID",
                "Modelo",
                "Usuario",
                "Fecha",
                "Medida 1",
                "Medida 2",
                "Medida 3",
                "Medida 4",
              ].map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left border-b border-[var(--color-divider)] font-ui"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((m, i) => (
              <tr
                key={m.id}
                className="transition-colors"
                style={{
                  backgroundColor:
                    i % 2 === 0 ? "var(--color-bg)" : "var(--color-surface)",
                }}
              >
                <td className="px-4 py-2 border-b border-[var(--color-divider)] text-[var(--color-text)]">
                  {m.id}
                </td>
                <td className="px-4 py-2 border-b border-[var(--color-divider)] text-[var(--color-text)]">
                  {m.modelo_id}
                </td>
                <td className="px-4 py-2 border-b border-[var(--color-divider)] text-[var(--color-text)]">
                  {m.user_id}
                </td>
                <td className="px-4 py-2 border-b border-[var(--color-divider)] text-[var(--color-text-muted)]">
                  {new Date(m.fecha).toLocaleString()}
                </td>
                <td className="px-4 py-2 border-b border-[var(--color-divider)] text-[var(--color-text)]">
                  {m.medida1}
                </td>
                <td className="px-4 py-2 border-b border-[var(--color-divider)] text-[var(--color-text)]">
                  {m.medida2}
                </td>
                <td className="px-4 py-2 border-b border-[var(--color-divider)] text-[var(--color-text)]">
                  {m.medida3}
                </td>
                <td className="px-4 py-2 border-b border-[var(--color-divider)] text-[var(--color-text)]">
                  {m.medida4 ?? "-"}
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="text-center py-4 italic text-[var(--color-text-muted)]"
                >
                  No hay mediciones registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
