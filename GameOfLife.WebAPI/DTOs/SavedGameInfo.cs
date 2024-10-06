namespace GameOfLife.WebAPI.DTOs;

public class SavedGameInfo
{
    public string ID { get; set; }
    public int Iterations { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
    public bool HasStabilized { get; set; }
}