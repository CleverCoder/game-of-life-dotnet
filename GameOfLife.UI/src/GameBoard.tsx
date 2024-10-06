import {useEffect, useRef, useState} from 'react';

interface GameBoardProps {
  grid?: boolean[][];
}

const GameBoard = ({grid = []}: GameBoardProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [prevGrid, setPrevGrid] = useState<boolean[][]>([]);
  const drawGridLinesRef = useRef(true);

  // Function to resize the canvas based on the parent container size
  const resizeCanvasForDimensions = (rows: number, cols: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = containerRef.current;
    if (!container) return;

    if (!rows || !cols) return;

    // Disappear the canvas while resizing
    canvas.width = 0;
    canvas.height = 0;

    // Get the container's dimensions
    const {width, height} = container.getBoundingClientRect();

    // Calculate aspect ratios
    const gridAspect = cols / rows;
    const containerAspect = width / height;

    let canvasWidth, canvasHeight;

    // Adjust the canvas size based on the aspect ratios
    if (gridAspect > containerAspect) {
      // Grid is wider than the container aspect, adjust width and scale height
      canvasWidth = width;
      canvasHeight = canvasWidth / gridAspect;
    } else {
      // Grid is taller than the container aspect, adjust height and scale width
      canvasHeight = height;
      canvasWidth = canvasHeight * gridAspect;
    }

    // Apply the calculated canvas size (allow shrink/grow)
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    renderCells(true); // Re-render all cells
  };

  // Function to draw the static grid lines
  const drawGridLines = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.strokeStyle = 'gray'; // Grid line color
    ctx.lineWidth = 0.5; // Grid line width

    const cellSize = getCellSize();

    // Draw horizontal lines
    for (let rowIndex = 0; rowIndex <= grid?.length; rowIndex++) {
      const y = rowIndex * cellSize.height;
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
    }

    // Draw vertical lines
    for (let colIndex = 0; colIndex <= grid[0].length; colIndex++) {
      const x = colIndex * cellSize.width;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
    }

    ctx.stroke();
  };

  const getCellSize = (): { width: number, height: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return {width: 0, height: 0};

    const cols = grid[0]?.length || 0;
    const rows = grid.length;
    // return {
    //   width: Math.floor(canvas.width / cols),
    //   height: Math.floor(canvas.height / rows)
    // }
    return {
      width: canvas.width / cols,
      height: canvas.height / rows
    }
  }

  // Function to update only the changed cells
  const renderCells = (renderAll: boolean = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    const cols = grid[0]?.length || 0;
    const rows = grid.length;
    const cellSize = getCellSize();

    if (cellSize.width < 10 && drawGridLinesRef.current) {
      drawGridLinesRef.current = false;
    } else if (cellSize.width >= 10 && !drawGridLinesRef.current) {
      drawGridLinesRef.current = true;
    }

    // if (!renderAll) {
    //   ctx.fillStyle = 'white';
    //   ctx.globalAlpha = 0.2;
    //   ctx.fillRect(0, 0, canvas.width, canvas.height);
    //   ctx.globalAlpha = 1;
    // }

    // Iterate through the grid and update only changed cells
    for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
      for (let colIndex = 0; colIndex < cols; colIndex++) {
        const cell = grid[rowIndex][colIndex];
        const prevCell = prevGrid[rowIndex]?.[colIndex];

        if (cell !== prevCell || renderAll) {
          // Fill the cell with new color
          ctx.fillStyle = cell ? 'black' : 'white';

          const x = colIndex * cellSize.width;
          const y = rowIndex * cellSize.height;
          const width = cellSize.width;
          const height = cellSize.height;
          // const x = Math.floor(colIndex * cellSize.width);
          // const y = Math.floor(rowIndex * cellSize.height);
          // const width = Math.floor(cellSize.width);
          // const height = Math.floor(cellSize.height);
          // const x = Math.round(colIndex * cellSize.width);
          // const y = Math.round(rowIndex * cellSize.height);
          // const width = Math.round(cellSize.width);
          // const height = Math.round(cellSize.height);


          ctx.fillRect(x, y, width, height);
        }
      }
    }

    if (drawGridLinesRef.current) {
      drawGridLines();
    }
  };

  // Update canvas and grid rendering when grid changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !grid.length || !grid[0].length) return;

    const rows = grid.length;
    const cols = grid[0].length;

    // Resize canvas only if the grid size has changed
    if (!prevGrid || rows !== prevGrid.length || cols !== prevGrid[0].length) {
      resizeCanvasForDimensions(rows, cols);
    }

    // Draw the cells that have changed
    renderCells();

    setPrevGrid(grid);
  }, [grid, prevGrid]); // Re-run this effect only when grid or grid size changes

  // Handle window resize event
  useEffect(() => {
    const handleResize = () => {
      const rows = grid.length;
      const cols = grid[0]?.length || 0;
      if (rows && cols) {
        resizeCanvasForDimensions(rows, cols);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [grid]); // Track changes in grid size

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col items-center justify-center">
      <canvas ref={canvasRef} className="bg-white"/>
    </div>
  );
};

export default GameBoard;
