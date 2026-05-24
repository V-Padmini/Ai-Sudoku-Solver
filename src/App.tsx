import { useEffect, useRef, useState } from "react";
import { generatePuzzle } from "./generator";
import { solveSudoku } from "./solver";
import type { Board } from "./generator";
export default function App() {

  // CREATE INITIAL PUZZLE ONLY ONCE
  const [board, setBoard] =useState<Board>(() =>
      generatePuzzle()
    );
  const [originalBoard, setOriginalBoard] = useState<Board>(() =>
      JSON.parse(
        JSON.stringify(
          board
        )
      )
    );

  const [status, setStatus] = useState("Ready to Solve");
  const [activeCell, setActiveCell] = useState<[number, number] | null>(null);
  const [solvedCells, setSolvedCells] = useState<string[]>([]);
  const [isSolving, setIsSolving] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const stopRef = useRef(false);
  const pauseRef = useRef(false);

  // TIMER
  useEffect(() => {
    let interval: number;
    if ( isSolving && !isPaused) {
      interval = window.setInterval(() => {
      setSeconds(prev => prev + 1);
      }, 1000);
    }

    return () =>
      clearInterval(interval);
  }, [isSolving, isPaused]);

  function formatTime() {
    const mins =
      Math.floor(seconds / 60);
    const secs =
      seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  // SOLVE
  async function handleSolve() {
    if (isSolving || isCompleted) return;
    stopRef.current = false;
    pauseRef.current = false;
    setIsPaused(false);
    setIsSolving(true);
    setStatus("AI Started Solving..." );

    const solved = await solveSudoku(
        board,
        setBoard,
        setStatus,
        setActiveCell,
        setSolvedCells,
        stopRef,
        pauseRef
      );
    setIsSolving(false);
    if (solved) {
      setIsCompleted(true);
      setStatus(
        "Solved Successfully 🎉"
      );
    }
  }

  // PAUSE
  function handlePause() {
    pauseRef.current = !pauseRef.current;
    setIsPaused(
      pauseRef.current
    );
    setStatus( pauseRef.current ? "Paused" : "Resumed Solving...");
  }

  // STOP
  function handleStop() {
    stopRef.current = true;
    setIsSolving(false);
    setIsPaused(false);
    setActiveCell(null);
    setStatus("Stopped");
  }

  // RESET
  function handleReset() {
    if (isSolving) return;
    setBoard(JSON.parse(JSON.stringify(originalBoard))
    );
    setSolvedCells([]);
    setActiveCell(null);
    setStatus(
      "Puzzle Reset"
    );
    setSeconds(0);
    setIsCompleted(false);
  }

  // NEW PUZZLE
  function handleNewPuzzle() {
    if (isSolving) return;
    const newPuzzle = generatePuzzle();
    setBoard(newPuzzle);
    setOriginalBoard(JSON.parse(JSON.stringify(newPuzzle))
    );
    setSolvedCells([]);
    setActiveCell(null);
    setStatus(
      "New Puzzle Ready"
    );
    setSeconds(0);
    setIsCompleted(false);
  }

  return (

    <div className="container">
      {/* LEFT PANEL */}
      <div className="left-panel">
        <div>
          <h1> AI Sudoku Solver</h1>
          <div className="timer">
            ⏱ Time: {" "}
            {formatTime()}
          </div>

          <div className="controls">

            <button onClick={handleSolve} disabled={isSolving || isCompleted}>{isSolving ? "Solving..." : "Start Solving"} </button>
            <button onClick={handlePause} disabled={!isSolving ||isCompleted}>{isPaused ? "Resume":"Pause"}</button>
            <button onClick={handleStop} disabled={!isSolving || isCompleted}>Stop</button>
            <button onClick={ handleReset } disabled={isSolving}> Reset </button>
            <button onClick={handleNewPuzzle} disabled={isSolving}> New Puzzle </button>
          </div>
        </div>
      </div>
      {/* RIGHT PANEL */}
      <div className="right-panel">
        {/* STATUS */}
        <div
          className={`board-status ${
            isCompleted ? "success" : "" }`}
        >
          {status}
        </div>

        {/* BOARD */}
        <div className="board">
          {board.map(( row, rowIndex ) => (
            row.map((cell,colIndex) => {

              const key =`${rowIndex}-${colIndex}`;
              const isActive = activeCell?.[0] === rowIndex && activeCell?.[1] === colIndex;
              const isSolved = solvedCells.includes(key);
              const sameRow =activeCell?.[0] === rowIndex;
              const sameCol = activeCell?.[1] === colIndex;

              return (
                <div
                  key={key}
                  className={`
                    cell
                    ${isActive ? "active" : ""}
                    ${isSolved ? "solved" : ""}
                    ${sameRow ? "highlight" : ""}
                    ${sameCol ? "highlight" : ""}
                  `}
                >
                  {cell}
                </div>
              );
            })
          ))}
        </div>
      </div>
    </div>
  );
}