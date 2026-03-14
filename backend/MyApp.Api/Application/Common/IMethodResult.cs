namespace MyApp.Application.Common
{
    public interface IMethodResult<T>
    {
        bool IsSuccess { get; }
        T Data { get; }
        string? Error { get; }
        string? Message { get; }
        int? Status { get; }
        int TotalRecord {  get; }
    }

    public class MethodResult<TResult> : IMethodResult<TResult>
    {
        public bool IsSuccess { set; get; } = true;

        public TResult Data { set; get; } = default!;

        public string? Error { set; get; }

        public string? Message { set; get; }

        public int? Status { set; get; }

        public int TotalRecord { set; get; }

        public static MethodResult<TResult> ResultWithData(TResult data, string message = "", int totalRecord = 0)
        {
            return new MethodResult<TResult>
            {
                Data = data,
                Message = message,
                Status = 200,
                TotalRecord = totalRecord
            };
        }

        public static MethodResult<TResult> ResultWithError(string message = "", string error = "Lỗi", int status = 200, TResult data = default(TResult), int totalRecord = 0)
        {
            return new MethodResult<TResult>
            {
                IsSuccess = false,
                Error = error,
                Data = data,
                Message = message,
                Status = status,
                TotalRecord = totalRecord
            };
        }
    }
}
