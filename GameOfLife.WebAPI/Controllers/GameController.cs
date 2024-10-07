using GameOfLife.WebAPI.Algorithms;
using GameOfLife.WebAPI.DTOs;
using GameOfLife.WebAPI.Models;
using GameOfLife.WebAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace GameOfLife.WebAPI.Controllers;

[ApiController]
[Route("game")]
public class GameController(ILogger<GameController> logger, GameService gameService) : ControllerBase
{
    [HttpPost("create")]
    public string Create([FromBody] Grid grid)
    {
        if (grid == null || grid.Width <= 0 || grid.Height <= 0 ||
            (grid.PackedData == null && grid.IntArrayData == null))
        {
            throw new ArgumentException("Invalid request");
        }

        BitMatrix bm;
        bm = grid.PackedData != null
            ? new BitMatrix(grid.Width, grid.Height, grid.PackedData)
            : new BitMatrix(grid.IntArrayData!);

        var id = gameService.SaveGame(bm);

        logger.LogDebug("New game created with ID {id}", id);

        return id;
    }

    [HttpGet("list")]
    public List<string> GetGameList()
    {
        return gameService.GetGameList();
    }

    [HttpGet("load")]
    public SavedGame LoadGame([FromQuery] string gameId, [FromQuery] bool includeIntArray = false)
    {
        var gameState = gameService.LoadGame(gameId);
        if (gameState == null)
        {
            throw new ArgumentException("Game not found");
        }

        return new SavedGame
        {
            Id = gameId,
            Grid = new Grid
            {
                Width = gameState.CurrentGrid.Width,
                Height = gameState.CurrentGrid.Height,
                PackedData = gameState.CurrentGrid.ToByteArray(),
                IntArrayData = includeIntArray ? gameState.CurrentGrid.ToIntArray() : null
            }
        };
    }

    
    /// <summary>
    /// Get the final state of a game after a number of steps, or until a stable state is reached, detecting if a loop is found.
    /// </summary>
    /// <param name="includeIntArray">Include an integer array of 0's and 1's for testing in the results</param>
    /// <param name="locateMatchOnLoop">If a loop is found, re-runs the process to locate the match</param>
    [HttpGet("final-state")]
    public GetFinalStateResponse GetFinalGameState([FromQuery] string gameId, [FromQuery] int maxSteps = 1000, [FromQuery] bool includeIntArray = false, [FromQuery] bool locateMatchOnLoop = false)
    {
        var gameState = gameService.LoadGame(gameId);
        if (gameState == null)
        {
            throw new ArgumentException("Game not found");
        }

        var result = gameService.AdvanceGenerations(gameState, maxSteps, locateMatchOnLoop);

        var errorMessage = result.StepResult switch
        {
            StepResult.Stable => null,
            StepResult.Unstable => "Game did not stabilize after max steps",
            StepResult.LoopDetected => "Game board loop detected",
            _ => throw new ArgumentOutOfRangeException()
        };
        
        return new GetFinalStateResponse
        {
            GameId = gameId,
            StepCount = gameState.Iteration,
            ErrorMessage = errorMessage,
            LoopDetectStep = result.OriginalStepForLoop,
            Grid = new Grid
            {
                Width = gameState.CurrentGrid.Width,
                Height = gameState.CurrentGrid.Height,
                PackedData = gameState.CurrentGrid.ToByteArray(),
                IntArrayData = includeIntArray ? gameState.CurrentGrid.ToIntArray() : null
            }
        };
    }
}