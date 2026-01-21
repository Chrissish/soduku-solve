import { SolveStep, SudokuBoard, SolverStrategy } from '@/types';

// Dancing Links (DLX) Implementation
// This is a complex algorithm that maps exact cover problem to Sudoku

class DLXNode {
  left: DLXNode;
  right: DLXNode;
  up: DLXNode;
  down: DLXNode;
  column: ColumnNode | null;
  rowIndex: number; // To track which number in which cell (encoded)

  constructor(col: ColumnNode | null = null, rowIndex: number = -1) {
    this.left = this;
    this.right = this;
    this.up = this;
    this.down = this;
    this.column = col;
    this.rowIndex = rowIndex;
  }
}

class ColumnNode extends DLXNode {
  size: number;
  name: string;

  constructor(name: string) {
    super(null);
    this.size = 0;
    this.name = name;
    this.column = this; // Point to self
  }
}

export const dlxSolver: SolverStrategy = {
  solve(board: SudokuBoard): SolveStep[] {
    const steps: SolveStep[] = [];
    const workingBoard = board.map(row => [...row]);
    
    // 1. Build Exact Cover Matrix for Sudoku
    // Constraints:
    // 1. Cell Constraint: Each cell (r, c) must have exactly one number. (81 constraints)
    // 2. Row Constraint: Each row r must have number n. (81 constraints)
    // 3. Col Constraint: Each col c must have number n. (81 constraints)
    // 4. Box Constraint: Each box b must have number n. (81 constraints)
    // Total columns: 324
    
    const header = new ColumnNode("header");
    const columns: ColumnNode[] = [];
    
    // Create columns
    for (let i = 0; i < 324; i++) {
      const col = new ColumnNode(`col-${i}`);
      col.right = header;
      col.left = header.left;
      header.left.right = col;
      header.left = col;
      columns.push(col);
    }
    
    // Helper to append a node to a column
    function appendNodeToColumn(colIndex: number, rowIndex: number, rowNodes: DLXNode[]) {
      const col = columns[colIndex];
      const node = new DLXNode(col, rowIndex);
      
      node.down = col;
      node.up = col.up;
      col.up.down = node;
      col.up = node;
      
      col.size++;
      rowNodes.push(node);
    }
    
    // Add rows to the matrix
    // A row in matrix represents: putting number 'num' at 'row', 'col'
    // Total possible rows: 9*9*9 = 729
    // But we only add valid options based on current board state
    
    const matrixRows: {r: number, c: number, n: number}[] = [];
    
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const val = workingBoard[r][c];
        // If cell is pre-filled, only add that option
        // If empty, add all 9 options
        const start = val === 0 ? 1 : val;
        const end = val === 0 ? 9 : val;
        
        for (let n = start; n <= end; n++) {
          // Check validity if we are proposing a move (though DLX handles it, we can pre-filter)
          // Actually DLX relies on the structure, but pre-filled cells effectively filter others
          
          const box = Math.floor(r/3)*3 + Math.floor(c/3);
          
          // Row index in our lookup array
          const rowIndex = matrixRows.length;
          matrixRows.push({r, c, n});
          
          const rowNodes: DLXNode[] = [];
          
          // 1. Cell constraint: (r, c)
          // Index: 0-80 => r*9 + c
          appendNodeToColumn(r * 9 + c, rowIndex, rowNodes);
          
          // 2. Row constraint: row r has num n
          // Index: 81-161 => 81 + r*9 + (n-1)
          appendNodeToColumn(81 + r * 9 + (n - 1), rowIndex, rowNodes);
          
          // 3. Col constraint: col c has num n
          // Index: 162-242 => 162 + c*9 + (n-1)
          appendNodeToColumn(162 + c * 9 + (n - 1), rowIndex, rowNodes);
          
          // 4. Box constraint: box b has num n
          // Index: 243-323 => 243 + box*9 + (n-1)
          appendNodeToColumn(243 + box * 9 + (n - 1), rowIndex, rowNodes);
          
          // Link nodes in the row
          for (let i = 0; i < rowNodes.length; i++) {
            rowNodes[i].right = rowNodes[(i + 1) % rowNodes.length];
            rowNodes[i].left = rowNodes[(i - 1 + rowNodes.length) % rowNodes.length];
          }
        }
      }
    }
    
    // Cover/Uncover logic
    function cover(col: ColumnNode) {
      col.right.left = col.left;
      col.left.right = col.right;
      
      for (let i = col.down; i !== col; i = i.down) {
        for (let j = i.right; j !== i; j = j.right) {
          j.down.up = j.up;
          j.up.down = j.down;
          if (j.column) j.column.size--;
        }
      }
    }
    
    function uncover(col: ColumnNode) {
      for (let i = col.up; i !== col; i = i.up) {
        for (let j = i.left; j !== i; j = j.left) {
          if (j.column) j.column.size++;
          j.down.up = j;
          j.up.down = j;
        }
      }
      col.right.left = col;
      col.left.right = col;
    }
    
    // Search
    const solution: number[] = [];
    let solved = false;
    
    function search() {
      if (header.right === header) {
        solved = true;
        return;
      }
      
      // Choose column with min size (heuristic)
      let minSize = Infinity;
      let c: ColumnNode | null = null;
      
      for (let j = header.right as ColumnNode; j !== header; j = j.right as ColumnNode) {
        if (j.size < minSize) {
          minSize = j.size;
          c = j;
        }
      }
      
      if (!c || c.size === 0) return; // Dead end
      
      cover(c);
      
      for (let r = c.down; r !== c; r = r.down) {
        solution.push(r.rowIndex);
        
        // Record step
        const move = matrixRows[r.rowIndex];
        // Only record if it wasn't pre-filled
        if (board[move.r][move.c] === 0) {
            workingBoard[move.r][move.c] = move.n;
            steps.push({
                row: move.r,
                col: move.c,
                value: move.n,
                board: workingBoard.map(row => [...row]),
                reason: `DLX: 选中 (${move.r + 1}, ${move.c + 1}) 填入 ${move.n}`
            });
        }
        
        for (let j = r.right; j !== r; j = j.right) {
          if (j.column) cover(j.column);
        }
        
        search();
        if (solved) return;
        
        // Backtrack
        // Only record if it wasn't pre-filled
        if (board[move.r][move.c] === 0) {
             workingBoard[move.r][move.c] = 0;
             steps.push({
                row: move.r,
                col: move.c,
                value: 0,
                board: workingBoard.map(row => [...row]),
                reason: `DLX: 回溯`
            });
        }
        
        solution.pop();
        
        for (let j = r.left; j !== r; j = j.left) {
          if (j.column) uncover(j.column);
        }
      }
      
      uncover(c);
    }
    
    search();
    return steps;
  }
};
