import type { Dispatch, SetStateAction} from "react";
import type { Board } from "./generator";

type BoolRef = { current: boolean;};

export async function solveSudoku(

  board: Board,
  setBoard: Dispatch<SetStateAction<Board>>,
  setStatus: Dispatch<SetStateAction<string>>,
  setActiveCell: Dispatch<SetStateAction<[number, number] | null>>,
  setSolvedCells: Dispatch<SetStateAction<string[]>>,
  stopRef: BoolRef,
  pauseRef: BoolRef

) {

  // CONTROLLED DELAY

  async function controlledDelay(
    ms: number
  ) {
    while (pauseRef.current) {
      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            100
          )
      );
    }
    if (stopRef.current) {

      throw new Error(
        "Stopped"
      );
    }
    return new Promise(
      resolve =>
        setTimeout(
          resolve,
          ms
        )
    );
  }
  // VALIDATION
  function isValid(
    board: Board,
    row: number,
    col: number,
    num: number
  ) {
    // ROW + COLUMN
    for ( let x = 0; x < 9; x++ ) {
      if (board[row][x] === num || board[x][col] === num) {
        return false;
      }
    }
    // 3x3 BOX
    const startRow = row - (row % 3);
    const startCol = col - (col % 3);

    for (let i = 0; i < 3;i++) {
      for (let j = 0; j < 3; j++
      ) {
        if ( board[startRow + i][startCol + j] === num) {
          return false;
        }
      }
    }

    return true;
  }

  // AI HEURISTIC
  // FIND CELL WITH FEWEST OPTIONS
  function getBestCell() {
    let bestRow = -1;
    let bestCol = -1;
    let bestOptions:
      number[] = [];
    let minOptions = 10;

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9;col++ ) {
        if (board[row][col] === "") {
          const options: number[] = [];
          for ( let num = 1; num <= 9; num++ ) {
            if ( isValid(board, row, col, num)) {
              options.push(
                num
              );
            }
          }
          if (options.length <minOptions) {
            minOptions = options.length;
            bestRow = row;
            bestCol = col;
            bestOptions = options;
          }
        }
      }
    }
    return {
      row: bestRow,
      col: bestCol,
      options:bestOptions
    };
  }
  // SOLVER

  async function solve():
    Promise<boolean> {
    if (stopRef.current) {
      return false;
    }
    const { row, col, options } = getBestCell();
    // SOLVED
    if (row === -1) {
      setActiveCell(null );
      setStatus("Sudoku Solved Successfully 🎉");
      return true;
    }

    // HIGHLIGHT CELL
    setActiveCell([
      row,
      col
    ]);
    setStatus(
      `AI analyzing Row ${
        row + 1
      }, Column ${
        col + 1
      }`
    );
    await controlledDelay(
      700
    );
    // TRY OPTIONS
    for (const num of options) {
      board[row][col] = num;
      setBoard([...board.map(r => [...r] )]);
      setSolvedCells(
        prev => [ ...prev, `${row}-${col}`]
      );

      setStatus(
        `Placed ${num} at Row ${
          row + 1
        }, Column ${
          col + 1
        }`
      );

      await controlledDelay(
        900
      );
      // CONTINUE SOLVING

      if (await solve() ) {
        return true;
      }
      // BACKTRACK
      setStatus(`Backtracking → removing ${num}`);
      await controlledDelay(
        600
      );
      board[row][col] = "";

      setBoard([...board.map(r => [...r])]);
      setSolvedCells(prev => prev.filter( c => c !==`${row}-${col}` ) );
    }
    return false;
  }
  // START SOLVER
  try {
    return await solve();
  }
  catch {
    setStatus("Stopped");
    return false;
  }
}