namespace backend.Entities;

public class Likes
{
    public string SourceMemberId { get; set; } = null!;
    public Member SourceMember { get; set; } = null!;


    public string TargetedMemberId { get; set; } = null!;
    public Member TargetedMember { get; set; } = null!;
}
