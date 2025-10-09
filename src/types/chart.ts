export interface MedidaData {
  medida: string;
  grupo: number;
  prom: number;
  rango: number;
  numeros: number[];
}

export interface Stat {
  Xmed: number;
  [key: string]: any; // para aceptar otros campos como CP, CPK, etc.
}

export interface TendenciaResultado {
  tendencia: "aumento" | "descenso" | "estable";
  pendiente: number;
}
