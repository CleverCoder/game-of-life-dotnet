namespace GameOfLife.WebAPI.DTOs;

public class NewGameFromPackedGridRequest
{
  public int Width { get; set; }
  public int Height { get; set; }
  public byte[] PackedGrid { get; set; }
}