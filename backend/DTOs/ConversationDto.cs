namespace backend.DTOs;

public sealed record ConversationDto(
    string MemberId,
    string DisplayName,
    string? ImageUrl,
    string LastMessage,
    DateTime SentAt);
