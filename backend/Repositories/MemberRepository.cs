using backend.Data;
using backend.DTOs;
using backend.Entities;
using backend.Helpers;
using backend.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories;

public class MemberRepository(AppDbContext context) : IMemberRepository
{
    public async Task<bool> SaveAllAsync()
    {
        return await context.SaveChangesAsync() > 0;
    }

    public async Task<Member?> GetMemberByIdAsync(string id)
    {
        return await context.Members.FindAsync(id);
    }

    public async Task<PaginatedResults<Member>> GetAllMembersAsync(MembersParams membersParams)
    {
        var query = context.Members.AsQueryable();

        query = query.Where(m => m.Id != membersParams.CurrentMemberId);

        if (membersParams.Gender != null)
        {
            query = query.Where(m => m.Gender == membersParams.Gender);
        }

        var minAob = DateOnly.FromDateTime(DateTime.Today.AddYears(-membersParams.MaxAge!.Value - 1));
        var maxAob = DateOnly.FromDateTime(DateTime.Today.AddYears(-membersParams.MinAge!.Value));

        query = query.Where(m => m.DateOfBirth >= minAob && m.DateOfBirth <= maxAob);

        query = membersParams.OrderBy switch 
        {
            "created" => query.OrderByDescending(m => m.Created),
            _ => query.OrderByDescending(m => m.LastActive)
        };

        return await PaginationHelper.CreateAsync(query, membersParams.PageNumber, membersParams.PageSize);
    }

    public async Task<IReadOnlyList<Photo>> GetAllPhotosForMemberAsync(string memberId)
    {
        return await context.Photos.Where(p => p.MemberId == memberId).ToListAsync();
    }

    public Task<bool> UpdateMemberAsync(string id, MemberUpdateDto memberUpdateDto)
    {
        throw new NotImplementedException();
    }

    public async Task<Member?> GetMemberForUpdateAsync(string id)
    {
        return await context.Members.Include(m => m.User).Include(m => m.Photos).FirstOrDefaultAsync(m => m.Id == id);
    }
}
