using System.Collections;
using System.Text.Json;
using GameOfLife.WebAPI.Algorithms;
using GameOfLife.WebAPI.Models;
using Newtonsoft.Json;
using StackExchange.Redis;

namespace GameOfLife.WebAPI.Services
{
    public class GameService(ILogger<GameService> logger, IConnectionMultiplexer redis)
    {
        public string SaveGame(BitMatrix initialState)
        {
            var gameState = new GameState
            {
                Id = GenerateId(),
                Iteration = 0,
                CurrentGrid = initialState
            };


            var db = redis.GetDatabase();

            var serialized = JsonConvert.SerializeObject(gameState);
            var redisKey = $"game:{gameState.Id}";
            
            db.StringSet(redisKey, serialized);
            
            // Add game to list
            var gameListKey = "gamelist";
            var gameList = GetGameList();
            gameList.Add(gameState.Id);
            db.StringSet(gameListKey, JsonConvert.SerializeObject(gameList));
            
            // // test deserialize
            // var cachedData = db.StringGet(redisKey);
            // var deserialized = JsonConvert.DeserializeObject<GameState>(cachedData);
            // logger.LogDebug("Game state deserialized: {deserialized}", deserialized.ToString());
            
            return gameState.Id;
        }


        public GameState? LoadGame(string id)
        {
            var db = redis.GetDatabase();
            var redisKey = $"game:{id}";
            var cachedData = db.StringGet(redisKey);
            
            if (cachedData.IsNullOrEmpty)
            {
                return null;
            }
            
            var deserialized = JsonConvert.DeserializeObject<GameState>(cachedData!);
            return deserialized;
        }

        public List<string> GetGameList()
        {
            var db = redis.GetDatabase();
            var redisKey = $"gamelist";
            var cachedData = db.StringGet(redisKey);

            if (cachedData.IsNullOrEmpty)
            {
                return new List<string>();
            }
            var gameList = JsonConvert.DeserializeObject<List<string>>(cachedData!);
            return gameList!;
        }
        
        // Advance the passed game state by the specified number of generations,
        // returning true or false on whether the game stabilized after the last generation.
        public StepResult AdvanceGenerations(GameState gameState, int maxSteps)
        {
            var solver = new NaiveSolver(gameState.CurrentGrid);

            StepResult stepResult = StepResult.Unstable;
            for (var i = 0; i < maxSteps; i++)
            {
                stepResult = solver.SolveNext();
                if (stepResult != StepResult.Unstable)
                {
                    break;
                }
            }

            gameState.CurrentGrid = solver.CurrentState;
            gameState.Iteration = solver.Iterations;
            return stepResult;
        }

        private string GenerateId()
        {
            return Guid.NewGuid().ToString();
        }
    }
}