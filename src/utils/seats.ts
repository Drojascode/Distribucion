import type { Seat } from '../types';

const LEFT_COLS = 3;
const RIGHT_COLS = 2;

export function generateSeats(rows: number = 5): Seat[] {
  const seats: Seat[] = [];
  for (let row = 1; row <= rows; row++) {
    for (let col = 1; col <= LEFT_COLS; col++) {
      seats.push({ id: `F${row}-L${col}`, row, side: 'L', col });
    }
    for (let col = 1; col <= RIGHT_COLS; col++) {
      seats.push({ id: `F${row}-R${col}`, row, side: 'R', col });
    }
  }
  return seats;
}
