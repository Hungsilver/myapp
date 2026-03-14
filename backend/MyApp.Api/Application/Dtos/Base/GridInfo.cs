namespace MyApp.Application.DTOs.Base
{
    public class GridInfo
    {
        public PageInfo PageInfo { get; set; }
        public List<Sort> Sorts { get; set; }

        public GridInfo() { }
        public GridInfo(int pageSize)
        {
            this.PageInfo = new PageInfo()
            {
                Page = 1,
                PageSize = pageSize
            };
            this.Sorts = [];
        }
    }

}
