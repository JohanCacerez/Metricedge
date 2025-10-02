export default function CaptureImage() {
  return (
    <section className="w-full h-full flex items-center justify-center overflow-hidden relative">
      <img
        src="./models/frontlh.png"
        alt="modelo"
        className=" object-contain rounded-2xl"
      />

      {/* Inputs sobre la imagen */}
      <input
        type="text"
        className="absolute bg-gray-600 border rounded px-2 py-1"
        style={{ top: "30%", left: "25%" }}
        placeholder="Input 1"
      />
      <input
        type="text"
        className="absolute bg-gray-600 border rounded px-2 py-1"
        style={{ top: "30%", left: "55%" }}
        placeholder="Input 2"
      />
      <input
        type="text"
        className="absolute bg-gray-600 border rounded px-2 py-1"
        style={{ top: "27%", left: "72%" }}
        placeholder="Input 3"
      />
    </section>
  );
}
