using Microsoft.AspNetCore.Mvc;
using backend.Helpers;
namespace backend.Controllers
{
    [ServiceFilter(typeof(LogUserActivity))]
    [ApiController]
    [Route("api/[controller]")]
    public class BaseApiController : ControllerBase
    {
    }
}
