namespace GameOfLife.WebAPI.Models;

public enum StepResult
{
    // Board state same as previous iteration, and has stabilized
    Stable,

    // Board state different from previous iteration
    Unstable,

    // Board state determined to be repeated after a number of iterations
    LoopDetected
}
