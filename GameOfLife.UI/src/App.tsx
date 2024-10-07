import {useEffect, useRef, useState} from "react";
import GameBoard from "./GameBoard.tsx";
import {
  computeNextGeneration,
  createNewGame,
  generateNewBoard, getFinalState,
  loadGame,
  loadGameList
} from "./services/GameService.ts";
import {SavedGame} from "./api";
import {base64ToUint8Array, unpackBase64Grid, unpackGrid} from "./utils/board-utils.ts";

const App = () => {
  const [rows, setRows] = useState(100);
  const [cols, setCols] = useState(100);
  const [grid, setGrid] = useState<boolean[][]>([]);

  const [updateSpeed, setUpdateSpeed] = useState(10); // Default speed value
  const [gameList, setGameList] = useState<string[]>([]); // List of saved games
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);

  const [savedGame, setSavedGame] = useState<SavedGame | null>(null);
  const [finalStateResult, setFinalStateResult] = useState<string|null>(null);
  const [maxStepsForFinalState, setMaxStepsForFinalState] = useState(1000);

  const updateIntervalMsRef = useRef<number>(1000 / 10);
  const updateSpeedSliderRef = useRef<number>(50);
  const isInitializedRef = useRef(false);
  const gridRef = useRef(grid);
  const timeoutRef = useRef<number | null>(null);
  const isPlayingRef = useRef(isPlaying);
  const [enableLoopSourceDetection, setEnableLoopSourceDetection] = useState<boolean>(false)

  // Sync gridRef with grid state
  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  // Sync isPlayingRef with isPlaying state
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  function showNotification(message: string) {
    setNotificationMessage(message);
    setTimeout(() => {
      setNotificationMessage(null);
    }, 3000);
  }

  async function onRandomizeBoard() {
    setSavedGame(null);
    const newBoard = await generateNewBoard(rows, cols);
    setGrid(newBoard);
  }

  async function onLoadGameList() {
    const games = await loadGameList();
    setGameList(games);
  }

  const onLoadGame = async (gameId: string) => {
    const sg = await loadGame(gameId);

    if (!sg) {
      showNotification("Failed to load game");
      return;
    }

    setSavedGame(sg);


    const byteArray = base64ToUint8Array(sg.grid!.packedData!);
    const grid = unpackGrid(byteArray, sg.grid!.height!, sg.grid!.width!);

    setGrid(grid);
    setRows(grid!.length);
    setCols(grid![0].length);
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
    if (response) {
      showNotification("Game created successfully");
      await onLoadGameList();
    }

    await onLoadGame(response!);
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

  async function onGetFinalState() {
    if (!savedGame) return;

    setLoading(true);
    setFinalStateResult(null);

    const result = await getFinalState(savedGame.id!, maxStepsForFinalState, enableLoopSourceDetection);

    let message = `Steps executed: ${result?.stepCount}. `;
    message += result!.errorMessage ? `Final state not reached: ${result?.errorMessage}` : 'Final state reached!';
    if (result?.loopDetectStep) {
      message += ` Loop detected from source step ${result.loopDetectStep}.`;
    }
    setFinalStateResult(message);

    if (result?.grid?.packedData) {
      setGrid(unpackBase64Grid(result.grid.packedData, result.grid.width!, result.grid.height!));
    }

    setLoading(false);
  }

  return (
    <div className="flex h-screen p-4">
      <div className="w-1/3 p-4 bg-blue-950 shadow-lg rounded-lg">
        <div className="card bg-blue-900">
          <div className="card-body">
            <h2 className="card-title">Current Board Operations</h2>

            <div className="flex-col">
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

        <div className="card bg-gray-800 mt-2">
          <div className="card-body">
            <h2 className="card-title">Saved Board Controls</h2>
            <p className="card-text">Create a new saved board based on the current state.</p>

            <button
              onClick={onCreateNewGame}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2 w-1/2 content-end"
              disabled={loading}
            >
              Save Board
            </button>

            {/* List of Saved Games */}
            <b className="mt-2">Saved Boards (Click to Load):</b>
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
                <li>No saved boards available</li>
              )}
            </ul>

            <div className="divider">Loaded Board</div>

            {savedGame && (
              <div>
                <div className="mt-2">
                  <span>Loaded Board: {savedGame.id}</span>
                </div>
                <div className="mt-2">
                  <span>Board Size: {savedGame.grid?.width}x{savedGame.grid?.height}</span>
                </div>
              </div>
            )}

            <button
              onClick={onGetFinalState}
              className="btn py-2 px-4 rounded ml-2"
              disabled={isPlaying || loading || !savedGame}
            >
              Get Final State
            </button>
            <label className="mr-2">Max Steps:
            <input
              type="number"
              value={maxStepsForFinalState}
              onChange={(e) => setMaxStepsForFinalState(Number(e.target.value))}
              className="p-1 w-20 border border-gray-300 rounded-md shadow-sm"
            />
            </label>
            <label>Enable Loop Source Detection? (slower)
            <input
              type="checkbox"
              checked={enableLoopSourceDetection}
              onChange={(e) => setEnableLoopSourceDetection(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            </label>
            {finalStateResult && (
              <div className="alert alert-success mt-2">
                <span>{finalStateResult}</span>
              </div>
            )}

          </div>
        </div>

        {(loading || isPlayingRef.current) && (
          <div className="text-center my-6">
            <span className="loading loading-ring loading-lg"></span>
          </div>
        )}
      </div>


      <div className="w-2/3 p-4">
        {notificationMessage && (
          <div className="toast toast-top toast-center">
            <div className="alert alert-info">
              <span>{notificationMessage}</span>
            </div>
          </div>
        )}
        <GameBoard grid={grid}/>
      </div>
    </div>
  );
};

export default App;
