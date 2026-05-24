export type Board = (number | "")[][];

// RANDOM SHUFFLE

function shuffle(array: number[]) {

  const arr = [...array];

  for ( let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor( Math.random() * (i + 1) );
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

export function generatePuzzle(): Board {

  const base = [

    [1,2,3,4,5,6,7,8,9],
    [4,5,6,7,8,9,1,2,3],
    [7,8,9,1,2,3,4,5,6],

    [2,3,4,5,6,7,8,9,1],
    [5,6,7,8,9,1,2,3,4],
    [8,9,1,2,3,4,5,6,7],

    [3,4,5,6,7,8,9,1,2],
    [6,7,8,9,1,2,3,4,5],
    [9,1,2,3,4,5,6,7,8]
  ];

  const nums = shuffle([
    1,2,3,4,5,6,7,8,9
  ]);

  const mapped = base.map(row =>
    row.map(n => nums[n - 1])
  );

  const puzzle = mapped.map(row =>
    row.map(value =>
      Math.random() > 0.60
        ? value
        : ""
    )
  );

  return puzzle;
}