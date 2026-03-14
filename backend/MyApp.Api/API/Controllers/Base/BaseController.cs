using Microsoft.AspNetCore.Mvc;
using MyApp.Application.Common;
using MyApp.Application.DTOs.Authen;

namespace MyApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public abstract class BaseController : ControllerBase
    {
        public UserLogin? CurrentLogin => HttpContext.Items["Accounts"] as UserLogin;

        public IActionResult ResponseResult<T>(IMethodResult<T> result)
        {
            if (result == null) return BadRequest("bad request");
            if (result.IsSuccess) return Ok(result);
            switch (result.Status)
            {
                case 403:
                    return StatusCode(StatusCodes.Status403Forbidden, result);
                case 404:
                    return NotFound(result);
                case 409:
                    return StatusCode(StatusCodes.Status409Conflict, result);
                default:
                    return Ok(result);
            }
        }
    }
}
