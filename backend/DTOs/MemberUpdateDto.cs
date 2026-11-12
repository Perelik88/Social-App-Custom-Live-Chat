using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class MemberUpdateDto
{
    public string? DisplayName { get; set; }
    public string? Bio { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
}
