using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

public class ErrorController : BaseApiController
{
    [HttpGet("auth")]
    public IActionResult GetAuth()
    {
        return Unauthorized();
    }

    [HttpGet("not-found")]
    public IActionResult GetNotFound()
    {
        return NotFound();
    }

    [HttpGet("server-error")]
    public IActionResult GetServerError()
    {
        throw new Exception("Server error");
    }

    [HttpGet("bad-request")]
    public IActionResult GetBadRequest()
    {
        throw new Exception("Bad request");
    }
}
