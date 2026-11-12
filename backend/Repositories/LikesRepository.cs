using backend.Data;
using backend.Entities;
using backend.Helpers;
using backend.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories;

public class LikesRepository(AppDbContext context): ILikesRepository
{

    public async Task<Likes?> GetMemberLike(string sourceMemberId, string targetedMemberId)
    {
        return await context.Likes.FindAsync(sourceMemberId, targetedMemberId);
    }

    public async Task<PaginatedResults<Member>> GetMemberLikes(LikeParams likeParams)
    {
        var query = context.Likes.AsQueryable();
        IQueryable<Member> result;

        switch (likeParams.Predicate)
        {
            case "liked":
                result = query
                    .Where(l => l.SourceMemberId == likeParams.MemberId)
                    .Select(l => l.TargetedMember);
                break;
            case "likedBy":
                result = query
                    .Where(l => l.TargetedMemberId == likeParams.MemberId)
                    .Select(l => l.SourceMember);
                break;
            default:
                var likeIds = await GetMemberLikeIds(likeParams.MemberId);

                result = query
                    .Where(l => l.TargetedMemberId == likeParams.MemberId && likeIds.Contains(l.SourceMemberId))
                    .Select(l => l.SourceMember);
                break;
        }
        return await PaginationHelper.CreateAsync(result, likeParams.PageNumber, likeParams.PageSize);
    }

    public async Task<IReadOnlyList<string>> GetMemberLikeIds(string memberId)
    {
        return await context.Likes
            .Where(l => l.SourceMemberId == memberId)
            .Select(l => l.TargetedMemberId)
            .ToListAsync();
    }

    public void DeleteLike(Likes like)
    {
        context.Likes.Remove(like);
    }

    public void AddLike(Likes like)
    {
        context.Likes.Add(like);
    }

    public async Task<bool> SaveAllChanges()
    {
        return await context.SaveChangesAsync() > 0;
    }
}
