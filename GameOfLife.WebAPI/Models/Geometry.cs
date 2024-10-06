namespace GameOfLife.WebAPI.Models;

// Represents a 2d point within a coordinate system
public struct Point(int x, int y)
{
  public int X { get; set; } = x;
  public int Y { get; set; } = y;
}

// Represents the dimensions of a 2d rectangular object
public struct Dimensions(int width, int height)
{
  public int Width { get; set; } = width;
  public int Height { get; set; } = height;
}

// Represents a 2d rectangular object with a location and size
public struct Rect(Point location, Dimensions dimensions)
{
  public Point Location { get; set; } = location;
  public Dimensions Dimensions { get; set; } = dimensions;
}


public struct Cell(int x, int y, bool isAlive)
{
  public int X { get; set; } = x;
  public int Y { get; set; } = y;
  public bool IsAlive { get; init; } = isAlive;

  public override string ToString()
  {
    return $"({this.X}, {this.Y}): {this.IsAlive}";
  }
}

public struct CellCluster
{
  public Rect Rect { get; private set; }
  
  public CellCluster(BitMatrix data, Rect rect)
  {
    this.Rect = rect;
  }
}