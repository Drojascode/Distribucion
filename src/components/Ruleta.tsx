import { useRef, useEffect, useState } from 'react';
import type { RuletaProps } from '../types';

const COLORS = [
  '#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f',
  '#edc948', '#b07aa1', '#ff9da7', '#9c755f', '#bab0ac',
  '#d37295', '#a0cbe8',
];

export default function Ruleta({
  candidatos,
  nicknames,
  onResult,
  onReset,
  preguntados,
}: RuletaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const angleRef = useRef(0);

  const names = candidatos.map((s) => nicknames[s] || s);

  function drawWheel(angle: number) {
    const canvas = canvasRef.current;
    if (!canvas || names.length === 0) return;
    const ctx = canvas.getContext('2d')!;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = cx - 10;
    const arc = (2 * Math.PI) / names.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    names.forEach((name, i) => {
      const start = angle + i * arc;
      const end = start + arc;

      // Segment
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${names.length > 8 ? 11 : 13}px system-ui`;
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 3;
      const label = name.length > 14 ? name.slice(0, 13) + '…' : name;
      ctx.fillText(label, r - 8, 5);
      ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, 2 * Math.PI);
    ctx.fillStyle = '#1a1a2e';
    ctx.fill();

    // Pointer arrow (right side)
    ctx.beginPath();
    ctx.moveTo(canvas.width - 4, cy);
    ctx.lineTo(canvas.width - 26, cy - 10);
    ctx.lineTo(canvas.width - 26, cy + 10);
    ctx.closePath();
    ctx.fillStyle = '#1a1a2e';
    ctx.fill();
  }

  useEffect(() => {
    drawWheel(angleRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [names.join(',')]);

  function spin() {
    if (spinning || names.length === 0) return;
    setWinner(null);
    setSpinning(true);

    // Pick winner index, compute target angle so winner segment faces pointer (right = 0°)
    const winIdx = Math.floor(Math.random() * candidatos.length);
    const arc = (2 * Math.PI) / names.length;
    // Pointer is at angle 0 (right). We want winIdx segment midpoint to land at 0.
    // Segment midpoint at angle: startAngle + arc/2 + winIdx*arc
    // We want that = 2π*k  →  targetAngle = -(winIdx * arc + arc/2) + extra full spins
    const extraSpins = (6 + Math.floor(Math.random() * 4)) * 2 * Math.PI;
    const finalAngle = -((winIdx * arc) + arc / 2) + extraSpins;

    const startAngle = angleRef.current;
    const totalDelta = finalAngle - (startAngle % (2 * Math.PI));
    const duration = 3500 + Math.random() * 1000;
    const startTime = performance.now();

    function easeOut(t: number) {
      return 1 - Math.pow(1 - t, 4);
    }

    function frame(now: number) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      angleRef.current = startAngle + totalDelta * easeOut(t);
      drawWheel(angleRef.current);

      if (t < 1) {
        animRef.current = requestAnimationFrame(frame);
      } else {
        setSpinning(false);
        setWinner(candidatos[winIdx]);
        onResult(candidatos[winIdx]);
      }
    }

    animRef.current = requestAnimationFrame(frame);
  }

  useEffect(() => () => cancelAnimationFrame(animRef.current), []);

  if (candidatos.length === 0 && preguntados.length === 0) {
    return (
      <div className="ruleta-empty">
        <p>No hay estudiantes sentados para preguntar.</p>
      </div>
    );
  }

  if (candidatos.length === 0) {
    return (
      <div className="ruleta-empty">
        <p>🎉 ¡Ya se preguntó a todos los estudiantes!</p>
        <button className="btn-reset" onClick={onReset}>Reiniciar ruleta</button>
      </div>
    );
  }

  return (
    <div className="ruleta-wrap">
      <div className="ruleta-canvas-area">
        <canvas
          ref={canvasRef}
          width={280}
          height={280}
          className="ruleta-canvas"
        />
        <button
          className={`btn-girar ${spinning ? 'spinning' : ''}`}
          onClick={spin}
          disabled={spinning}
        >
          {spinning ? 'Girando…' : '🎯 Girar'}
        </button>
      </div>

      {winner && (
        <div className="ruleta-winner">
          <span className="winner-label">Estudiante seleccionado:</span>
          <span className="winner-name">{nicknames[winner] || winner}</span>
          {nicknames[winner] && nicknames[winner] !== winner && (
            <span className="winner-realname">({winner})</span>
          )}
        </div>
      )}

      {preguntados.length > 0 && (
        <div className="preguntados-list">
          <h4>Ya preguntados ({preguntados.length})</h4>
          <ul>
            {preguntados.map((s) => (
              <li key={s}>{nicknames[s] || s}</li>
            ))}
          </ul>
          <button className="btn-reset" onClick={onReset}>Reiniciar ruleta</button>
        </div>
      )}
    </div>
  );
}
