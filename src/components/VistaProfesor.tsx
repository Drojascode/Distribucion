import type { Seat, VistaProfesorProps } from '../types';
import Ruleta from './Ruleta';
import LaptopIcon from './LaptopIcon';

export default function VistaProfesor({
  seats,
  asignaciones,
  listaEspera,
  nicknames,
  avatares,
  preguntados,
  estudianteDestacado,
  onRuletaResult,
  onRuletaReset,
}: VistaProfesorProps) {

  function displayName(student: string): string {
    return nicknames[student] || student;
  }

  // Reverse map: seatId -> student
  const seatOccupant: Record<string, string> = {};
  for (const [student, seatId] of Object.entries(asignaciones)) {
    seatOccupant[seatId] = student;
  }

  // Seated students not yet asked
  const seatedStudents = Object.keys(asignaciones);
  const candidatos = seatedStudents.filter((s) => !preguntados.includes(s));

  // Teacher sees from the front: row 5 at top (back of class), row 1 at bottom (front)
  const rows = [5, 4, 3, 2, 1];

  function getSeatsByRow(row: number, side: 'L' | 'R'): Seat[] {
    return seats.filter((s) => s.row === row && s.side === side);
  }

  function seatClass(occupant: string | undefined): string {
    if (!occupant) return 'libre';
    if (occupant === estudianteDestacado) return 'ocupado destacado';
    if (preguntados.includes(occupant)) return 'ocupado preguntado';
    return 'ocupado';
  }

  type LaptopState = 'libre' | 'ocupado' | 'destacado' | 'preguntado';
  function laptopState(occupant: string | undefined): LaptopState {
    if (!occupant) return 'libre';
    if (occupant === estudianteDestacado) return 'destacado';
    if (preguntados.includes(occupant)) return 'preguntado';
    return 'ocupado';
  }

  return (
    <div className="vista vista-profesor-layout">
      <div className="vista-prof-left">
        <h2>Vista del Profesor</h2>
        <p className="subtitle">Perspectiva frontal — El profesor mira hacia los estudiantes</p>

        <div className="aula-front">
          {rows.map((row) => (
            <div key={row} className="fila">
              <span className="fila-label">Fila {row}</span>
              {/* From teacher's perspective, left/right are mirrored */}
              <div className="grupo grupo-izq">
                {getSeatsByRow(row, 'R').map((seat) => {
                  const occupant = seatOccupant[seat.id];
                  return (
                    <div key={seat.id} className={`laptop-btn no-click ${seatClass(occupant)}`} title={seat.id}>
                      <LaptopIcon
                        state={laptopState(occupant)}
                        emoji={occupant ? avatares[occupant] : undefined}
                        label={occupant ? displayName(occupant) : undefined}
                        seatId={seat.id}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="pasillo" />
              <div className="grupo grupo-der">
                {getSeatsByRow(row, 'L').map((seat) => {
                  const occupant = seatOccupant[seat.id];
                  return (
                    <div key={seat.id} className={`laptop-btn no-click ${seatClass(occupant)}`} title={seat.id}>
                      <LaptopIcon
                        state={laptopState(occupant)}
                        emoji={occupant ? avatares[occupant] : undefined}
                        label={occupant ? displayName(occupant) : undefined}
                        seatId={seat.id}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="pizarron">🖥 PIZARRÓN (FRENTE)</div>
        </div>

        <div className="leyenda">
          <span className="badge ocupado">Sentado</span>
          <span className="badge preguntado">Ya preguntado</span>
          <span className="badge destacado">Seleccionado ahora</span>
          <span className="badge libre">Libre</span>
        </div>

        <div className="lista-espera">
          <h3>Lista de Espera ({listaEspera.length})</h3>
          {listaEspera.length === 0 ? (
            <p className="empty-list">Todos los estudiantes tienen asiento.</p>
          ) : (
            <ol>
              {listaEspera.map((student, i) => (
                <li key={i}>
                  {displayName(student)}
                  {nicknames[student] && nicknames[student] !== student && (
                    <span className="real-name-hint"> ({student})</span>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <aside className="vista-prof-right">
        <h3 className="panel-title">🎡 Ruleta de preguntas</h3>
        <Ruleta
          candidatos={candidatos}
          nicknames={nicknames}
          onResult={onRuletaResult}
          onReset={onRuletaReset}
          preguntados={preguntados}
        />
      </aside>
    </div>
  );
}
