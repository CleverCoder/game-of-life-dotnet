using System.Collections;
using System.Text;
using Newtonsoft.Json;

namespace GameOfLife.WebAPI.Models
{
    [JsonObject(MemberSerialization.OptIn)]
    public class BitMatrix : IEnumerable<Cell>
    {
        [JsonProperty]
        public int Width { get; set; }
        [JsonProperty]
        public int Height { get; set; }

        [JsonIgnore]
        public BitArray Data { get; private set; }

        [JsonProperty("Data")]
        private byte[] SerializedData
        {
            get => ToByteArray();
            set => Data = new BitArray(value);
        }

        public BitMatrix()
        {
            
        }
        
        // Create new, uninitialized empty grid
        public BitMatrix(int width, int height)
        {
            this.Width = width;
            this.Height = height;
            this.Data = new BitArray(width * height);
        }

        // Create a BitMatrix from a byte array
        public BitMatrix(int width, int height, byte[] byteArray)
        {
            this.Width = width;
            this.Height = height;
            this.Data = new BitArray(width * height);

            // Unpack the byte array into the BitArray
            int bitIndex = 0;
            for (int i = 0; i < byteArray.Length && bitIndex < Data.Length; i++)
            {
                for (int bitOffset = 0; bitOffset < 8 && bitIndex < Data.Length; bitOffset++)
                {
                    Data[bitIndex++] = (byteArray[i] & (1 << bitOffset)) != 0;
                }
            }
        }

        public BitMatrix(int[][] zeroOneIntArray)
        {
            this.Width = zeroOneIntArray[0].Length;
            this.Height = zeroOneIntArray.Length;
            this.Data = new BitArray(Width * Height);

            for (int y = 0; y < Height; y++)
            {
                for (int x = 0; x < Width; x++)
                {
                    this[x, y] = zeroOneIntArray[y][x] == 1;
                }
            }
        }
        
        public BitMatrix Clone()
        {
            var clone = new BitMatrix(this.Width, this.Height);
            clone.Data = (BitArray)this.Data.Clone();
            return clone;
        }        
                
        // Indexer to access value at row, col
        public bool this[int x, int y]
        {
            get => this.Data[y * this.Width + x];
            set => this.Data[y * this.Width + x] = value;
        }
        

        public void Randomize(int? seed)
        {
            var rnd  = seed == null ? new System.Random() : new System.Random(seed.Value);
            for (int i = 0; i < Data.Length; i++)
            {
                Data[i] = rnd.Next(2) == 1;
            }
        }

        // Convert the BitMatrix to a 2D array of integers
        // where 1 represents true and 0 represents false. (useful for testing API as human)
        public int[][] ToIntArray()
        {
            var index = 0;
            int[][] result = new int[this.Height][];
            for (int i = 0; i < this.Height; i++)
            {
                result[i] = new int[this.Width];
                for (int j = 0; j < this.Width; j++)
                {
                    result[i][j] = this.Data[index++] ? 1 : 0;
                }
            }
            return result;
        }
        
        public bool[][] ToBoolArray()
        {
            var index = 0;
            bool[][] result = new bool[this.Height][];
            for (int i = 0; i < this.Height; i++)
            {
                result[i] = new bool[this.Width];
                for (int j = 0; j < this.Width; j++)
                {
                    result[i][j] = this.Data[index++];
                }
            }
            return result;
        }
        
        public byte[] ToByteArray()
        {
            byte[] bytes = new byte[(Data.Length + 7) / 8]; // Create byte array to hold bits
            Data.CopyTo(bytes, 0); // Copy bits into byte array
            return bytes;
        }

        public IEnumerator<Cell> GetEnumerator()
        {
            for (int y = 0; y < this.Height; y++)
            {
                for (int x = 0; x < this.Width; x++)
                {
                    yield return new Cell
                    {
                        X = x,
                        Y = y,
                        IsAlive = this[x, y]
                    };
                }
            }
        }

        public override string ToString()
        {
            var sb = new StringBuilder();
            var col = 0;
            foreach (bool bit in Data)
            {
                if (col == 0)
                {
                    sb.Append('[');
                }
                sb.Append(bit ? '1' : '0');
                if (col == Width-1)
                {
                    sb.AppendLine("]");
                    col = 0;
                }
                else
                {
                    col++;                    
                }
            }
            return sb.ToString();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return this.GetEnumerator();
        }
    }
}
