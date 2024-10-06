using GameOfLife.WebAPI.Models;

namespace GameOfLife.WebAPI.Algorithms;

public interface ISolver
{
  public BitMatrix InitialState { get; }
  BitMatrix CurrentState { get; }
  int Iterations { get; }
  StepResult SolveNext();
  void Reset();
}