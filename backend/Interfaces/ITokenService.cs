namespace backend.Interfaces;
using backend.Entities;
public interface ITokenService
{
    string CreateToken(User user);
}
