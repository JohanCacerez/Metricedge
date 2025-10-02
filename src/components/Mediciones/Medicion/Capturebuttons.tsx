export default function Capturebuttons() {
  return (
    <div className="flex flex-col h-full gap-4 justify-center">
      <button className="bg-primary hover:bg-primary-dark rounded-2xl text-text font-ui font-bold text-2xl cursor-pointer flex-1">
        Guardar
      </button>
      <button className="bg-lime-600 hover:bg-lime-700 rounded-2xl text-text font-ui font-bold text-2xl cursor-pointer flex-1">
        Medir
      </button>
      <button className="bg-orange-600 hover:bg-orange-700 rounded-2xl text-text font-ui font-bold text-2xl cursor-pointer flex-1">
        Establecer 0
      </button>
      <button className="bg-yellow-600 hover:bg-yellow-700 rounded-2xl text-text font-ui font-bold text-2xl cursor-pointer flex-1">
        Reiniciar
      </button>
    </div>
  );
}
