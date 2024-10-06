// Convert a byte array representing the game grid to a 2D boolean grid [rows][cols].
export function unpackGrid(byteArray: Uint8Array, rows: number, cols: number): boolean[][] {
  const grid: boolean[][] = [];
  let bitIndex = 0;

  for (let row = 0; row < rows; row++) {
    const gridRow: boolean[] = [];
    for (let col = 0; col < cols; col++) {
      const byteIndex = Math.floor(bitIndex / 8); // Get byte index
      const bitOffset = bitIndex % 8; // Get bit offset within the byte

      const bit = (byteArray[byteIndex] & (1 << bitOffset)) !== 0; // Extract bit value
      gridRow.push(bit); // Add bit to the row
      bitIndex++;
    }
    grid.push(gridRow); // Add row to the grid
  }

  return grid;
}

export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64); // Decode Base64 to a binary string
  const len = binaryString.length;
  const bytes = new Uint8Array(len); // Create a Uint8Array of the same length
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i); // Convert each character to a byte
  }
  return bytes;
}

// Convert a 2D boolean grid [rows][cols] to a Uint8Array
export function packGrid(grid: boolean[][]): Uint8Array {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;

  const totalBits = rows * cols;
  const byteArray = new Uint8Array(Math.ceil(totalBits / 8)); // Create the byte array large enough to hold all bits
  let bitIndex = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const byteIndex = Math.floor(bitIndex / 8); // Get byte index
      const bitOffset = bitIndex % 8; // Get bit offset within the byte

      if (grid[row][col]) {
        byteArray[byteIndex] |= 1 << bitOffset; // Set the bit to 1 if the boolean is true
      }
      bitIndex++;
    }
  }

  return byteArray;
}

// Convert a Uint8Array to a Base64 string
export function uint8ArrayToBase64(byteArray: Uint8Array): string {
  let binaryString = "";
  for (let i = 0; i < byteArray.length; i++) {
    binaryString += String.fromCharCode(byteArray[i]); // Convert each byte to a character
  }
  return btoa(binaryString); // Encode the binary string as Base64
}
