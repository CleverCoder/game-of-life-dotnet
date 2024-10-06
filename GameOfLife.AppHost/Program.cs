var builder = DistributedApplication.CreateBuilder(args);

var cache = builder.AddRedis("redis");

var api = builder
    .AddProject<Projects.GameOfLife_WebAPI>("gameoflifeapi")
    .WithReference(cache);

builder.AddNpmApp("gameoflifeui", "../GameOfLife.UI", scriptName: "codegen_start")
    .WithReference(api)
    .WithEnvironment("BROWSER", "none") // Disable opening browser on npm start
    .WithHttpEndpoint(env: "PORT", port: 60001)
    .WithExternalHttpEndpoints()
    .PublishAsDockerFile();

builder.Build().Run();
