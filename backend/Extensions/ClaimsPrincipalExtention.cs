using System.Security.Claims;

namespace backend.Extensions;

public static class ClaimsPrincipalExtention
{
    public static string GetMemberId(this ClaimsPrincipal user)
    {
        return user.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new Exception("Member ID not found in claims.");
    }
}