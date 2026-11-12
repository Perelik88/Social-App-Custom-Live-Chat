namespace backend.Errors;

public class ApiException (int statusCode, string message, string? details = null)
{
    public int StatusCode { set; get; } = statusCode;
    public string Message { set; get; } = message;
    public string? Details { set; get; } = details;
}
