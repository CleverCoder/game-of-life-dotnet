using GameOfLife.WebAPI.Algorithms;
using GameOfLife.WebAPI.DTOs;
using GameOfLife.WebAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace GameOfLife.WebAPI.Controllers;

[ApiController]
[Route("grid")]
public class GridController : ControllerBase
{
  [HttpGet("create-bit-array")]
  public int[][]  CreateBitArray([FromQuery] int width, [FromQuery] int height, [FromQuery] int? seed)
  {
    if (width <= 0 || height <= 0)
    {
      throw new ArgumentException("Invalid request");
    }
    
    var bm = new BitMatrix(width, height);
    bm.Randomize(seed);
    return bm.ToIntArray();
  }
  
  [HttpGet("create-packed")]
  public byte[] CreatePacked([FromQuery] int width, [FromQuery] int height, [FromQuery] int? seed)
  {
    if (width <= 0 || height <= 0)
    {
      throw new ArgumentException("Invalid request");
    }
    
    var bm = new BitMatrix(width, height);
    bm.Randomize(seed);
    return bm.ToByteArray();
  }
  
  [HttpPost("generate-next")]
  public Grid GenerateNext([FromBody] Grid grid)
  {
    if (grid == null || grid.Width <= 0 || grid.Height <= 0 || (grid.PackedData == null && grid.IntArrayData == null))
    {
      throw new ArgumentException("Invalid request");
    }

    BitMatrix bm;
    bm = grid.PackedData != null ? new BitMatrix(grid.Width, grid.Height, grid.PackedData) : new BitMatrix(grid.IntArrayData!);
    
    var solver = new NaiveSolver(bm);
    solver.SolveNext();
    
    var newGrid = new Grid
    {
      Width = solver.Dimensions.Width,
      Height = solver.Dimensions.Height,
      PackedData = grid.PackedData != null ? solver.CurrentState.ToByteArray() : null,
      IntArrayData = grid.IntArrayData != null ? solver.CurrentState.ToIntArray() : null
    };

    return newGrid;
  }
}