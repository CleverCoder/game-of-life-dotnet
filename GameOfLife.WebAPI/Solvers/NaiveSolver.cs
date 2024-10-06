using BloomFilter;
using BloomFilter.Configurations;
using GameOfLife.WebAPI.Models;

namespace GameOfLife.WebAPI.Algorithms;

public class NaiveSolver(BitMatrix initialState) : SolverBase(initialState)
{
  private IBloomFilter bf = FilterBuilder.Build(1000, HashMethod.Murmur128BitsX64);
  
  public override StepResult SolveNext()
  {
    this.Iterations++;
    var nextState = this.CurrentState.Clone();
    var hasChanged = false;
    foreach (var cell in this.CurrentState)
    {
      var liveNeighbors = CountLiveNeighbors(cell.X, cell.Y);

      if (cell.IsAlive)
      {
        if (liveNeighbors is < 2 or > 3 && nextState[cell.X, cell.Y])
        {
          hasChanged = true;
          nextState[cell.X, cell.Y] = false;
        }
      }
      else
      {
        if (liveNeighbors is 3 && !nextState[cell.X, cell.Y])
        {
          hasChanged = true;
          nextState[cell.X, cell.Y] = true;
        }
      }
    }
    
    if (!hasChanged)
    {
      return StepResult.Stable;
    }
    
    // Detect loops with bloom filter
    
    // Faster, but increased collision possibility
    // this.bf.Contains(nextState.Data.GetHashCode());

    var bytes = nextState.ToByteArray();
    if (this.bf.Contains(bytes))
    {
      return StepResult.LoopDetected;
    }
    this.bf.Add(bytes); // Add to bloom filter
    
    this.CurrentState = nextState;
    return StepResult.Unstable;
  }

  private int CountLiveNeighbors(int x, int y)
  {
    var neighbors = 0;
    var width = this.CurrentState.Width;
    var height = this.CurrentState.Height;
    
    for (var i = -1; i <= 1; i++)
    {
      for (var j = -1; j <= 1; j++)
      {
        if (i == 0 && j == 0) continue; // Skip the cell itself

        // Wrap around the grid edges
        int neighborX = (x + i + width) % width;
        int neighborY = (y + j + height) % height;

        if (this.CurrentState[neighborX, neighborY])
        {
          neighbors++;
        }
      }
    }

    return neighbors;
  }

   
}