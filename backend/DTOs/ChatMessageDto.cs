namespace backend.DTOs;

public sealed record ChatMessageDto(
    int Id,
    string SenderId,
    string RecipientId,
    string Content,
    DateTime SentAt);
