namespace backend.Entities;

public class ChatMessage
{
    public int Id { get; set; }
    public required string SenderId { get; set; }
    public required string RecipientId { get; set; }
    public required string Content { get; set; }
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
}
