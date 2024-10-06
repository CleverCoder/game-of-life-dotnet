namespace GameOfLife.WebAPI.Models;

public class GameState
{
  public string Id { get; set; }
  public int Iteration { get; set; }
  public BitMatrix InitialGrid { get; set; }
  public BitMatrix CurrentGrid { get; set; }
}