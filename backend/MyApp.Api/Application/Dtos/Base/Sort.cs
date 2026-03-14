namespace MyApp.Application.DTOs.Base
{
    public class Sort
    {
        public string? Field { get; set; }
        public int Dir { get; set; }
    }
    public enum SortDirection 
    { 
        Ascending = 1,
        Descending = 2,
    }
}
