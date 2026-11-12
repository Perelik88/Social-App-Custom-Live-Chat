using backend.Entities;
using backend.Extensions;
using backend.Interfaces;
using backend.Helpers;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

public class LikesController(ILikesRepository likesRepository) : BaseApiController
{
    [HttpPost("{targetedMemberId}")]
    public async Task<ActionResult> ToggleLike(string targetedMemberId)
    {
        var sourceMemberId = User.GetMemberId();

        if(sourceMemberId == targetedMemberId)
            return BadRequest("You cannot like yourself.");

        var existingLike = await likesRepository.GetMemberLike(sourceMemberId, targetedMemberId);

        if(existingLike == null)
        {
            var like = new Likes
            {
                SourceMemberId = sourceMemberId,
                TargetedMemberId = targetedMemberId
            };
            likesRepository.AddLike(like);
        } else
        {
            likesRepository.DeleteLike(existingLike);
        }
        if(await likesRepository.SaveAllChanges())
            return Ok();

        return BadRequest("Failed to update like.");
    }

    [HttpGet("list")]
    public async Task<ActionResult<IReadOnlyList<string>>> GetCurrentMemberLikes()
    {
        return Ok(await likesRepository.GetMemberLikeIds(User.GetMemberId()));
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResults<Member>>> GetMemberLikes([FromQuery] LikeParams likeParams)
    {
        likeParams.MemberId = User.GetMemberId();
        var members = await likesRepository.GetMemberLikes(likeParams);
        return Ok(members);
    }
}
