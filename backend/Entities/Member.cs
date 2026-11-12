using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace backend.Entities;

public class Member
{
    public string Id { get; set; } = null!;
    public DateOnly DateOfBirth { get; set; }
    public required string DisplayName { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime Created { get; set; } = DateTime.UtcNow;
    public DateTime LastActive { get; set; } = DateTime.UtcNow;
    public required string Gender { get; set; }
    public string? Bio { get; set; }
    public required string City { get; set; }
    public required string Country { get; set; }

    // Navigation properties for related entities
    [ForeignKey(nameof(Id))]
    [JsonIgnore]
    public User User { get; set; } = null!;
    [JsonIgnore]
    public List<Photo> Photos { get; set; } = [];
    [JsonIgnore]
    public List<Likes> LikedByMembers { get; set; } = [];
    [JsonIgnore]
    public List<Likes> LikedMembers { get; set; } = [];
}
