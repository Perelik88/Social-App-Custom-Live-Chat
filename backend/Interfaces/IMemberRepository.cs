using backend.DTOs;
using backend.Entities;
using backend.Helpers;

namespace backend.Interfaces;

public interface IMemberRepository
{
    Task<bool> SaveAllAsync();
    Task<Member?> GetMemberByIdAsync(string id);
    Task<PaginatedResults<Member>> GetAllMembersAsync(MembersParams membersParams);
    Task<IReadOnlyList<Photo>> GetAllPhotosForMemberAsync(string memberId);
    Task<bool> UpdateMemberAsync(string id, MemberUpdateDto memberUpdateDto);
    Task<Member?> GetMemberForUpdateAsync(string id);
}
