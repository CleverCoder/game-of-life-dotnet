namespace GameOfLife.WebAPI.DTOs
{
    // Game grid data transfer object. Can express a grid as a packed byte array or as a 2D integer array,
    // To cover testing and performance scenarios.
    public class Grid
    {
        public int Width { get; set; }
        public int Height { get; set; }
        public byte[]? PackedData { get; set; }
        public int[][]? IntArrayData { get; set; }
    }
}
