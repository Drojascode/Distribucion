import { useState } from 'react';
import type { Seat, VistaEstudianteProps } from '../types';
import LaptopIcon from './LaptopIcon';

const EMOJI_OPTIONS = [
  '🐱','🦊','🐼','🦁','🐸','🦄','🐙','🦋',
  '🌵','🚀','⚽','🎸','🍕','👾','🎩','🌙',
  '🔥','💎','🐲','🎯','🌈','🦖','🐬','🎃',
];

export default function VistaEstudiante({
  seats,
  asignaciones,
  listaEspera,
  nicknames,
  avatares,
  onSeatSelect,
  onNicknameChange,
  onAvatarChange,
}: VistaEstudianteProps) {
  const [activeStudent, setActiveStudent] = useState<string>('');
  const [nicknameInput, setNicknameInput] = useState<string>('');

  // Reverse map: seatId -> student
  const seatOccupant: Record<string, string> = {};
  for (const [student, seatId] of Object.entries(asignaciones)) {
    seatOccupant[seatId] = student;
  }

  const rows = Array.from({ length: 5 }, (_, i) => i + 1);

  function getSeatsByRow(row: number, side: 'L' | 'R'): Seat[] {
    return seats.filter((s) => s.row === row && s.side === side);
  }

  function handleSelectStudent(student: string) {
    setActiveStudent(student);
    setNicknameInput(nicknames[student] ?? '');
  }

  function handleNicknameSave() {
    if (!activeStudent) return;
    const trimmed = nicknameInput.trim();
    onNicknameChange(activeStudent, trimmed || activeStudent);
  }

  function handleClick(seatId: string) {
    if (!activeStudent) {
      alert('Por favor selecciona un estudiante primero.');
      return;
    }
    onSeatSelect(activeStudent, seatId);
  }

  function displayName(student: string): string {
    return nicknames[student] || student;
  }

  function seatState(occupant: string | undefined, seatId: string): 'libre' | 'ocupado' | 'mio' {
    if (!occupant) return 'libre';
    if (asignaciones[activeStudent] === seatId) return 'mio';
    return 'ocupado';
  }

  return (
    <div className="vista vista-estudiante-layout">
      <div className="vista-left">
        <h2>Vista del Estudiante</h2>
        <p className="subtitle">Perspectiva superior — Frente del aula arriba</p>

        <div className="aula-top">
          <div className="pizarron">🖥 PIZARRÓN</div>

          {rows.map((row) => (
            <div key={row} className="fila">
              <span className="fila-label">Fila {row}</span>
              <div className="grupo grupo-izq">
                {getSeatsByRow(row, 'L').map((seat) => {
                  const occupant = seatOccupant[seat.id];
                  const st = seatState(occupant, seat.id);
                  return (
                    <button
                      key={seat.id}
                      className="laptop-btn"
                      onClick={() => handleClick(seat.id)}
                      title={occupant ? `Ocupado por ${displayName(occupant)}` : 'Libre'}
                    >
                      <LaptopIcon
                        state={st}
                        emoji={occupant ? avatares[occupant] : undefined}
                        label={occupant ? displayName(occupant) : undefined}
                        seatId={seat.id}
                      />
                    </button>
                  );
                })}
              </div>
              <div className="pasillo" />
              <div className="grupo grupo-der">
                {getSeatsByRow(row, 'R').map((seat) => {
                  const occupant = seatOccupant[seat.id];
                  const st = seatState(occupant, seat.id);
                  return (
                    <button
                      key={seat.id}
                      className="laptop-btn"
                      onClick={() => handleClick(seat.id)}
                      title={occupant ? `Ocupado por ${displayName(occupant)}` : 'Libre'}
                    >
                      <LaptopIcon
                        state={st}
                        emoji={occupant ? avatares[occupant] : undefined}
                        label={occupant ? displayName(occupant) : undefined}
                        seatId={seat.id}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="leyenda">
          <span className="badge libre">Libre</span>
          <span className="badge ocupado">Ocupado</span>
          <span className="badge mio">Tu asiento</span>
        </div>
      </div>

      <aside className="vista-right">
        <h3 className="panel-title">¿Quién elige asiento?</h3>

        {listaEspera.length === 0 ? (
          <p className="empty-list">Todos los estudiantes ya tienen asiento.</p>
        ) : (
          <ul className="student-list">
            {listaEspera.map((student) => (
              <li
                key={student}
                className={`student-card ${activeStudent === student ? 'selected' : ''}`}
                onClick={() => handleSelectStudent(student)}
              >
                <span className="student-avatar">
                  {avatares[student] || (nicknames[student] || student).charAt(0).toUpperCase()}
                </span>
                <div className="student-info">
                  <span className="student-realname">{student}</span>
                  {nicknames[student] && nicknames[student] !== student && (
                    <span className="student-nick">"{nicknames[student]}"</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {activeStudent && (
          <div className="nickname-panel">
            <p className="nickname-label">
              ¿Cómo quieres que te llamen, <strong>{displayName(activeStudent)}</strong>?
            </p>
            <div className="nickname-row">
              <input
                type="text"
                placeholder={activeStudent}
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNicknameSave()}
                maxLength={30}
              />
              <button className="btn-save" onClick={handleNicknameSave}>
                Guardar
              </button>
            </div>

            <p className="nickname-label" style={{ marginTop: '0.75rem' }}>Elige tu ícono:</p>
            <div className="emoji-picker">
              {EMOJI_OPTIONS.map((em) => (
                <button
                  key={em}
                  className={`emoji-opt ${avatares[activeStudent] === em ? 'active' : ''}`}
                  onClick={() => onAvatarChange(activeStudent, em)}
                  title={em}
                >
                  {em}
                </button>
              ))}
            </div>

            <p className="seat-hint" style={{ marginTop: '0.5rem' }}>
              {asignaciones[activeStudent]
                ? `Asiento actual: ${asignaciones[activeStudent]} — haz clic en otro para cambiar.`
                : 'Haz clic en un asiento para sentarte.'}
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
