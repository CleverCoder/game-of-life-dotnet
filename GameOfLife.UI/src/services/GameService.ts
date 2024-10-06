import {
  getGameList, getGameLoad,
  getGridCreatePacked, Grid, postGameCreate,
  postGridGenerateNext
} from "../api";
import {base64ToUint8Array, packGrid, uint8ArrayToBase64, unpackGrid} from "../utils/board-utils.ts";


export async function generateNewBoard(rows: number, cols: number): Promise<boolean[][]> {
  const response = await getGridCreatePacked({
    query: {
      width: rows,
      height: cols,
    }
  });

  if (!response.data) return [];

  const byteArray = base64ToUint8Array(response.data);
  return unpackGrid(byteArray, rows, cols);
}

export async function computeNextGeneration(boardData: boolean[][]): Promise<boolean[][] | undefined> {
  let byteArray = packGrid(boardData);
  const base64 = uint8ArrayToBase64(byteArray);

  const gridData: Grid = {
    width: boardData[0].length,
    height: boardData.length,
    packedData: base64,
  }
  const response = await postGridGenerateNext({
    body: gridData,
  });

  if (!response.data || !response.data.packedData) {
    throw new Error('Invalid response data');
  }

  byteArray = base64ToUint8Array(response.data.packedData);
  return unpackGrid(byteArray, boardData.length, boardData[0].length);
}

export async function createNewGame(boardData: boolean[][]): Promise<string | undefined> {
  const byteArray = packGrid(boardData);
  const base64 = uint8ArrayToBase64(byteArray);

  const gridData: Grid = {
    width: boardData[0].length,
    height: boardData.length,
    packedData: base64,
  }
  const response = await postGameCreate({
    body: gridData,
  });

  return response.data;
}

export async function loadGameList(): Promise<string[]> {
  const response = await getGameList();

  if (!response.data) return [];

  return response.data;
}

export async function loadGame(gameId: string): Promise<boolean[][] | undefined> {
  const gameData = await getGameLoad({
    query: {
      gameId: gameId,
    }
  });

  if (!gameData.data || !gameData.data.grid || !gameData.data.grid.packedData) {
    throw new Error('Invalid game data');
  }

  const byteArray = base64ToUint8Array(gameData.data.grid.packedData);
  return unpackGrid(byteArray, gameData.data.grid.width!, gameData.data.grid.height!);
}
