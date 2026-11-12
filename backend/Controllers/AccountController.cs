using System.Security.Cryptography;
using backend.Data;
using backend.Entities;
using Microsoft.AspNetCore.Mvc;
using backend.DTOs;
using Microsoft.EntityFrameworkCore;
using backend.Interfaces;

namespace backend.Controllers;

public class AccountController(AppDbContext context, ITokenService tokenService) : BaseApiController
{
    [HttpPost("register")]
    public async Task<ActionResult<UserDTO>> Register(RegisterUserDTO registerUserDTO)
    {
        if (await UserExists(registerUserDTO.Email))
        {
            return BadRequest("Email is already taken");
        }

       using var hmac = new HMACSHA512();
       
        var user = new User
        {
            Email = registerUserDTO.Email,
            DisplayName = registerUserDTO.DisplayName,
            PasswordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(registerUserDTO.Password)),
            PasswordSalt = hmac.Key,
            Member = new Member
            {
                DisplayName = registerUserDTO.DisplayName,
                Gender = registerUserDTO.Gender,
                DateOfBirth = registerUserDTO.DateOfBirth,
                City = registerUserDTO.City,
                Country = registerUserDTO.Country
            }
        };

        context.Users.Add(user);
        await context.SaveChangesAsync();

        return user.ToUserDTO(tokenService);
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserDTO>> Login(LoginUserDTO loginUserDTO)
    {
        var user = await context.Users.SingleOrDefaultAsync(u => u.Email == loginUserDTO.Email);
        if (user == null)
        {
            return Unauthorized("Invalid email or password");
        }

        var passwordHash = user.PasswordHash;
        if (passwordHash is null || user.PasswordSalt is null)
        {
            return Unauthorized("Invalid email or password");
        }

        using var hmac = new HMACSHA512(user.PasswordSalt);
        var computedHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(loginUserDTO.Password));

        for (int i = 0; i < computedHash.Length; i++)
        {
            if (computedHash[i] != passwordHash[i])
            {   
                return Unauthorized("Invalid email or password");
            }
        }

        return user.ToUserDTO(tokenService);
    }

    private async Task<bool> UserExists(string email)
    {
        return await context.Users.AnyAsync(u => u.Email.ToLower() == email.ToLower());
    }
}