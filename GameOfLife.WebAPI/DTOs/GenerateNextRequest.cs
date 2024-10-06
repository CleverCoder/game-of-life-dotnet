namespace GameOfLife.WebAPI.DTOs;

public class GenerateNextRequest
{
  
  public Grid PackedGrid { get; set; }
  public int[][] SimpleGrid { get; set; }
}