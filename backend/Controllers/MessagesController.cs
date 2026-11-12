using backend.Data;
using backend.DTOs;
using backend.Extensions;
using backend.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[Authorize]
public class MessagesController(AppDbContext context) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ConversationDto>>> GetConversations()
    {
        var currentMemberId = User.GetMemberId();
        var latestMessageIds = context.ChatMessages
            .Where(message => message.SenderId == currentMemberId || message.RecipientId == currentMemberId)
            .GroupBy(message => message.SenderId == currentMemberId ? message.RecipientId : message.SenderId)
            .Select(conversation => conversation.Max(message => message.Id));

        var latestMessages = await context.ChatMessages
            .AsNoTracking()
            .Where(message => latestMessageIds.Contains(message.Id))
            .OrderByDescending(message => message.SentAt)
            .ToListAsync();

        var memberIds = latestMessages
            .Select(message => GetOtherMemberId(message, currentMemberId))
            .Distinct()
            .ToArray();
        var members = await context.Members
            .AsNoTracking()
            .Where(member => memberIds.Contains(member.Id))
            .ToDictionaryAsync(member => member.Id);

        var conversations = latestMessages
            .Where(message => members.ContainsKey(GetOtherMemberId(message, currentMemberId)))
            .Select(message =>
            {
                var member = members[GetOtherMemberId(message, currentMemberId)];
                return new ConversationDto(
                    member.Id,
                    member.DisplayName,
                    member.ImageUrl,
                    message.Content,
                    message.SentAt);
            })
            .ToArray();

        return Ok(conversations);
    }

    [HttpGet("{memberId}")]
    public async Task<ActionResult<IReadOnlyList<ChatMessageDto>>> GetConversation(string memberId)
    {
        var currentMemberId = User.GetMemberId();
        if (memberId == currentMemberId)
        {
            return BadRequest("You cannot open a conversation with yourself.");
        }

        var memberExists = await context.Members.AnyAsync(member => member.Id == memberId);
        if (!memberExists)
        {
            return NotFound();
        }

        var messages = await context.ChatMessages
            .AsNoTracking()
            .Where(message =>
                (message.SenderId == currentMemberId && message.RecipientId == memberId) ||
                (message.SenderId == memberId && message.RecipientId == currentMemberId))
            .OrderBy(message => message.SentAt)
            .Select(message => new ChatMessageDto(
                message.Id,
                message.SenderId,
                message.RecipientId,
                message.Content,
                message.SentAt))
            .ToListAsync();

        return Ok(messages);
    }

    private static string GetOtherMemberId(ChatMessage message, string currentMemberId)
    {
        return message.SenderId == currentMemberId ? message.RecipientId : message.SenderId;
    }
}
