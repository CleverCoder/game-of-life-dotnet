using GameOfLife.WebAPI.Models;
using Microsoft.AspNetCore.Authorization;

namespace GameOfLife.WebAPI.Algorithms;

public abstract class SolverBase(BitMatrix initialState) : ISolver
{
  public BitMatrix InitialState { get; } = initialState;
  public BitMatrix CurrentState { get; protected set; } = initialState;
  public int Iterations { get; protected set; } = 0;
  public Dimensions Dimensions => new(this.CurrentState.Width, this.CurrentState.Height);
  
  public abstract StepResult SolveNext();

  public void Reset()
  {
    this.CurrentState = InitialState;
    this.Iterations = 0;
  }
}