using backend.Entities;
using backend.Helpers;
namespace backend.Interfaces;

public interface ILikesRepository
{
    Task<Likes?> GetMemberLike(string sourceMemberId, string targetedMemberId);
    Task<PaginatedResults<Member>> GetMemberLikes(LikeParams likeParams);
    Task<IReadOnlyList<string>> GetMemberLikeIds(string memberId);

    void DeleteLike(Likes like);
    void AddLike(Likes like);
    Task<bool> SaveAllChanges();
}
