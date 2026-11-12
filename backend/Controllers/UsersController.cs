using System.Security.Claims;
using backend.Extensions;
using backend.DTOs;
using backend.Entities;
using backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Helpers;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MembersController(IMemberRepository memberRepository, IPhotoService photoService) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<Member>>> GetMembers([FromQuery] MembersParams membersParams)
    {
        membersParams.CurrentMemberId = User.GetMemberId();
        return Ok(await memberRepository.GetAllMembersAsync(membersParams));
    }
    [HttpGet("{id}")]
    public async Task<ActionResult<Member>> GetMemberById(string id)
    {
        var member = await memberRepository.GetMemberByIdAsync(id);
        if (member == null)
        {
            return NotFound();
        }
        return member;
    }
    [HttpGet("{id}/photos")]
    public async Task<ActionResult<IReadOnlyList<Photo>>> GetAllPhotosForMember(string id)
    {
        var photos = await memberRepository.GetAllPhotosForMemberAsync(id);
        return Ok(photos);
    }

    [HttpPut]
    public async Task<ActionResult> UpdateMember(MemberUpdateDto memberUpdateDto)
    {
        var memberId = User.GetMemberId();
        var member = await memberRepository.GetMemberForUpdateAsync(memberId);
        if (member == null)
        {
            return NotFound();
        }
        
        member.DisplayName = memberUpdateDto.DisplayName ?? member.DisplayName;
        member.Bio = memberUpdateDto.Bio ?? member.Bio;
        member.City = memberUpdateDto.City ?? member.City;
        member.Country = memberUpdateDto.Country ?? member.Country;
        member.User.DisplayName = memberUpdateDto.DisplayName ?? member.User.DisplayName;

        if (await memberRepository.SaveAllAsync()) return NoContent();
   
        return BadRequest("Failed to update member.");
    }

    [HttpPost("add-photo")]
    public async Task<ActionResult<Photo>> AddPhoto([FromForm] IFormFile file)
    {
        var member = await memberRepository.GetMemberForUpdateAsync(User.GetMemberId());
        if (member == null) return BadRequest("Member not found.");

        var result = await photoService.UploadPhotoAsync(file);
        if (result.Error != null) return BadRequest(result.Error.Message);

        var photo = new Photo
        {
            Url = result.SecureUrl.AbsoluteUri,
            PublicId = result.PublicId,
            MemberId = member.Id
        };

        if (member.ImageUrl == null)
        {
            member.ImageUrl = photo.Url;
            member.User.ImageUrl = photo.Url;
        }

        member.Photos.Add(photo);
        if (await memberRepository.SaveAllAsync()) return Ok(photo);

        return BadRequest("Problem adding photo");
    }
    
    [HttpDelete("delete-photo/{photoId}")]
    public async Task<ActionResult> DeletePhoto(int photoId)
    {
        var member = await memberRepository.GetMemberForUpdateAsync(User.GetMemberId());
        if (member == null) return BadRequest("Member not found.");

        var photo = member.Photos.FirstOrDefault(p => p.Id == photoId);
        if (photo == null || photo.Url == member.ImageUrl) return BadRequest("Cannot delete this photo.");
        if (photo.PublicId != null)
        {
            var result = await photoService.DeletePhotoAsync(photo.PublicId);
            if (result.Error != null) return BadRequest(result.Error.Message);
        }
        if (member.Photos.Remove(photo) && await memberRepository.SaveAllAsync()) return NoContent();

        return BadRequest("Problem deleting photo");
    }

    [HttpPut("set-main-photo/{photoId}")]
    public async Task<ActionResult> SetMainPhoto(int photoId)
    {
        var member = await memberRepository.GetMemberForUpdateAsync(User.GetMemberId());
        if (member == null) return BadRequest("Member not found.");

        var photo = member.Photos.SingleOrDefault(p => p.Id == photoId);
        if (photo == null) return BadRequest("Photo not found.");
        if (photo.Url == member.ImageUrl) return BadRequest("This photo is already the main photo.");

        member.ImageUrl = photo.Url;
        member.User.ImageUrl = photo.Url;

        if (await memberRepository.SaveAllAsync()) return NoContent();

        return BadRequest("Problem setting main photo");
    }
}
