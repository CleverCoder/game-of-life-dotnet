namespace GameOfLife.WebAPI.DTOs
{
  public class SavedGame
  {
    public string Id { get; set; }
    public Grid Grid { get; set; }
  }
}