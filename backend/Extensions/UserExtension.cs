using backend.DTOs;
using backend.Entities;
using backend.Interfaces;


public static class UserExtension
{
    public static UserDTO ToUserDTO(this User user, ITokenService tokenService)
    {
        return new UserDTO
        {
            Id = user.Id,
            DisplayName = user.DisplayName,
            Email = user.Email,
            ImageUrl = user.ImageUrl,
            Token = tokenService.CreateToken(user)
        };
    }
}
