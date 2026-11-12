namespace backend.Helpers;

public class MembersParams: PagingParams
{
    public string? Gender { get; set; }
    public string? CurrentMemberId { get; set; }
    public int? MinAge { get; set; } = 18;
    public int? MaxAge { get; set; } = 99;

    public string? OrderBy { get; set; } = "lastActive";
}
