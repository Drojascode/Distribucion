import { useState, useEffect } from 'react';
import type { Asignaciones, Nicknames, Avatares } from './types';
import { generateSeats } from './utils/seats';
import { exportJSON } from './utils/storage';
import ESTUDIANTES from './data/estudiantes';
import VistaEstudiante from './components/VistaEstudiante';
import VistaProfesor from './components/VistaProfesor';

type Vista = 'estudiante' | 'profesor';

const SEATS = generateSeats();
const STORAGE_KEY = 'aula-distribucion-v1';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as {
      asignaciones: Asignaciones;
      listaEspera: string[];
      alias: Nicknames;
      iconos: Avatares;
    };
  } catch {
    return null;
  }
}

export default function App() {
  const saved = loadFromStorage();

  const [vista, setVista] = useState<Vista>('estudiante');
  const [asignaciones, setAsignaciones] = useState<Asignaciones>(saved?.asignaciones ?? {});
  const [listaEspera, setListaEspera] = useState<string[]>(saved?.listaEspera ?? ESTUDIANTES);
  const [nicknames, setNicknames] = useState<Nicknames>(saved?.alias ?? {});
  const [avatares, setAvatares] = useState<Avatares>(saved?.iconos ?? {});
  const [preguntados, setPreguntados] = useState<string[]>([]);
  const [estudianteDestacado, setEstudianteDestacado] = useState<string | null>(null);
  const [jsonAbierto, setJsonAbierto] = useState(false);

  const jsonSnapshot = exportJSON(asignaciones, listaEspera, nicknames, avatares);

  // Persist to localStorage on every relevant state change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, jsonSnapshot);
  }, [jsonSnapshot]);

  function handleRuletaResult(student: string): void {
    setPreguntados((prev) => prev.includes(student) ? prev : [...prev, student]);
    setEstudianteDestacado(student);
  }

  function handleRuletaReset(): void {
    setPreguntados([]);
    setEstudianteDestacado(null);
  }

  function handleNicknameChange(student: string, nickname: string): void {
    setNicknames((prev) => ({ ...prev, [student]: nickname }));
  }

  function handleAvatarChange(student: string, emoji: string): void {
    setAvatares((prev) => ({ ...prev, [student]: emoji }));
  }

  function handleSeatSelect(student: string, seatId: string): void {
    setAsignaciones((prevAsig) => {
      const newAsig = { ...prevAsig };

      const currentOccupant = Object.keys(newAsig).find(
        (s) => newAsig[s] === seatId
      );

      let newWaitlist: string[] = [...listaEspera];

      if (currentOccupant && currentOccupant !== student) {
        delete newAsig[currentOccupant];
        if (!newWaitlist.includes(currentOccupant)) {
          newWaitlist = [...newWaitlist, currentOccupant];
        }
      }

      newWaitlist = newWaitlist.filter((s) => s !== student);
      newAsig[student] = seatId;

      setListaEspera(newWaitlist);
      return newAsig;
    });
  }

  function handleReset(): void {
    if (!confirm('¿Reiniciar toda la distribución? Se perderán todos los asientos, alias e íconos.')) return;
    setAsignaciones({});
    setListaEspera(ESTUDIANTES);
    setNicknames({});
    setAvatares({});
    setPreguntados([]);
    setEstudianteDestacado(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Distribución de Asientos</h1>
        <nav className="tabs">
          <button
            className={`tab ${vista === 'estudiante' ? 'active' : ''}`}
            onClick={() => setVista('estudiante')}
          >
            👤 Vista Estudiante
          </button>
          <button
            className={`tab ${vista === 'profesor' ? 'active' : ''}`}
            onClick={() => setVista('profesor')}
          >
            👨‍🏫 Vista Profesor
          </button>
          <button className="tab tab-reset" onClick={handleReset}>
            🗑 Reiniciar
          </button>
        </nav>
      </header>

      <main className="app-main">
        {vista === 'estudiante' ? (
          <VistaEstudiante
            seats={SEATS}
            asignaciones={asignaciones}
            listaEspera={listaEspera}
            nicknames={nicknames}
            avatares={avatares}
            onSeatSelect={handleSeatSelect}
            onNicknameChange={handleNicknameChange}
            onAvatarChange={handleAvatarChange}
          />
        ) : (
          <VistaProfesor
            seats={SEATS}
            asignaciones={asignaciones}
            listaEspera={listaEspera}
            nicknames={nicknames}
            avatares={avatares}
            preguntados={preguntados}
            estudianteDestacado={estudianteDestacado}
            onRuletaResult={handleRuletaResult}
            onRuletaReset={handleRuletaReset}
          />
        )}
      </main>

      <section className="json-section">
        <div className="json-header">
          <button className="json-toggle" onClick={() => setJsonAbierto((v) => !v)}>
            {jsonAbierto ? '▲' : '▼'} Estado guardado (JSON)
          </button>
          <a
            className="btn-download"
            href={`data:application/json;charset=utf-8,${encodeURIComponent(jsonSnapshot)}`}
            download="distribucion-asientos.json"
          >
            ⬇ Descargar JSON
          </a>
        </div>
        {jsonAbierto && <pre className="json-pre">{jsonSnapshot}</pre>}
      </section>
    </div>
  );
}
