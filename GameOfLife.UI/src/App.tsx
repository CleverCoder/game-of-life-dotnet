import {useEffect, useRef, useState} from "react";
import GameBoard from "./GameBoard.tsx";
import {
  computeNextGeneration,
  createNewGame,
  generateNewBoard,
  loadGame,
  loadGameList
} from "./services/GameService.ts";

const App = () => {
  const [rows, setRows] = useState(100);
  const [cols, setCols] = useState(100);
  const [grid, setGrid] = useState<boolean[][]>([]);
  const [updateSpeed, setUpdateSpeed] = useState(10); // Default speed value
  const [gameList, setGameList] = useState<string[]>([]); // List of saved games
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const updateIntervalMsRef = useRef<number>(1000 / 10);
  const updateSpeedSliderRef = useRef<number>(50);
  const isInitializedRef = useRef(false);
  const gridRef = useRef(grid);
  const timeoutRef = useRef<number | null>(null);
  const isPlayingRef = useRef(isPlaying);

  // Sync gridRef with grid state
  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  // Sync isPlayingRef with isPlaying state
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Randomize the board
  async function onRandomizeBoard() {
    const newBoard = await generateNewBoard(rows, cols);
    setGrid(newBoard);
  }

  // Load game list
  async function onLoadGameList() {
    const games = await loadGameList();
    setGameList(games);
  }

  // Stub to load game when clicked
  const onLoadGame = async (gameId: string) => {
    const gridData = await loadGame(gameId);
    setGrid(gridData!);
  };

  // Compute the next generation
  async function onGenerateNextGeneration() {
    setLoading(true);
    const newBoard = await computeNextGeneration(gridRef.current);
    setGrid(newBoard!);
    setLoading(false);

    if (isPlayingRef.current) {
      timeoutRef.current = window.setTimeout(async () => {
        await onGenerateNextGeneration();
      }, updateIntervalMsRef.current);
    }
  }

  // Create a new game
  async function onCreateNewGame() {
    const response = await createNewGame(grid);



    await onLoadGameList();
  }

  const togglePlay = async () => {
    if (isPlaying) {
      clearTimeout(timeoutRef.current!);
      timeoutRef.current = null;
    }
    setIsPlaying(!isPlaying);
    await onGenerateNextGeneration();
  };

  // Load games when component mounts
  useEffect(() => {
    if (isInitializedRef.current) return;
    onRandomizeBoard();
    onLoadGameList();
    isInitializedRef.current = true;
  }, []);

  const onUpdateSpeedSliderChanged = (value: number) => {
    setUpdateSpeed(value);
    updateSpeedSliderRef.current = value;
    updateIntervalMsRef.current = 1000 / value;
  };

  return (
    <div className="flex h-screen p-4">
      <div className="w-1/3 p-4 bg-blue-950 shadow-lg rounded-lg">
        <div className="card bg-blue-900">
          <div className="card-body">
            <h2 className="card-title">Initialize New Game</h2>
            <p className="card-text">Generate a new board or step through the game state without affecting saved games.</p>
            <div className="card-actions justify-end">
              <label className="mr-2">Board Size:</label>
              <input
                type="number"
                value={cols}
                onChange={(e) => setCols(Number(e.target.value))}
                className="p-1 w-20 border border-gray-300 rounded-md shadow-sm"
              />
              <span className="mx-2">x</span>
              <input
                type="number"
                value={rows}
                onChange={(e) => setRows(Number(e.target.value))}
                className="p-1 w-20 border border-gray-300 rounded-md shadow-sm"
              />
              <button
                onClick={onRandomizeBoard}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold ml-2 py-2 px-4 rounded"
                disabled={isPlaying || loading}
              >
                Randomize Board
              </button>

              <button
                onClick={onGenerateNextGeneration}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2"
                disabled={isPlaying || loading}
              >
                Next Step
              </button>
              <button
                onClick={togglePlay}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2"
              >
                {isPlaying ? "Stop" : "Play"}
              </button>
              <div className="mx-2 py-2 flex items-center">
                <label className="mr-2">Speed:</label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={updateSpeed}
                  onChange={(e) => onUpdateSpeedSliderChanged(Number(e.target.value))}
                  className="bg-gray-200 rounded-lg"
                />
                <span className="ml-2">{updateSpeed}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-blue-900 mt-2">
          <div className="card-body">
            <h2 className="card-title">Game Controls</h2>
            <p className="card-text">Create a new saved game based on the current board state and interact with saved games.</p>

            <button
              onClick={onCreateNewGame}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2"
              disabled={loading}
            >
              Create Game
            </button>

            {/* List of Saved Games */}
            <ul className="mt-4">
              {gameList.length > 0 ? (
                gameList.map((game, index) => (
                  <li key={index}>
                    <button
                      onClick={() => onLoadGame(game)}
                      className="btn btn-outline btn-sm mt-2"
                    >
                      {game}
                    </button>
                  </li>
                ))
              ) : (
                <li>No saved games available</li>
              )}
            </ul>

          </div>
        </div>

        {(loading || isPlayingRef.current) && (
          <div className="text-center my-6">
            <span className="loading loading-ring loading-lg"></span>
          </div>
        )}
      </div>

      <div className="w-2/3 p-4">
        <GameBoard grid={grid} />
      </div>
    </div>
  );
};

export default App;
