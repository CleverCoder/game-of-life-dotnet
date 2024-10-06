namespace GameOfLife.WebAPI.Utils;

public class GameDataConverter
{
    public static byte[] ConvertGridToPackedGrid(int[][] grid)
    {
        var packedGrid = new List<byte>();
        for (var i = 0; i < grid.Length; i++)
        {
            for (var j = 0; j < grid[i].Length; j++)
            {
                packedGrid.Add((byte)grid[i][j]);
            }
        }

        return packedGrid.ToArray();
    }

    public static int[][] ConvertPackedGridToGrid(byte[] packedGrid, int width, int height)
    {
        var grid = new int[height][];
        for (var i = 0; i < height; i++)
        {
            grid[i] = new int[width];
            for (var j = 0; j < width; j++)
            {
                grid[i][j] = packedGrid[i * width + j];
            }
        }

        return grid;
    }
}