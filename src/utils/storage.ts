import type { Asignaciones, Nicknames, Avatares } from '../types';

export interface JSONSnapshot {
  asignaciones: Asignaciones;
  listaEspera: string[];
  alias: Nicknames;
  iconos: Avatares;
}

export function exportJSON(
  asignaciones: Asignaciones,
  listaEspera: string[],
  alias: Nicknames,
  iconos: Avatares,
): string {
  const snapshot: JSONSnapshot = { asignaciones, listaEspera, alias, iconos };
  return JSON.stringify(snapshot, null, 2);
}
