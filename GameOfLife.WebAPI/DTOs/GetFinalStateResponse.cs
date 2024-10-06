namespace GameOfLife.WebAPI.DTOs;

public class GetFinalStateResponse
{
    public string GameId { get; set; }
    public Grid Grid { get; set; }
    public int StepCount { get; set; }
    public string? ErrorMessage { get; set; }
}