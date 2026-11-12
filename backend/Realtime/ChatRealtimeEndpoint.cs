using System.Net.WebSockets;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using backend.Data;
using backend.DTOs;
using backend.Entities;
using Microsoft.EntityFrameworkCore;

namespace backend.Realtime;

public sealed class ChatRealtimeEndpoint
{
    private const int MaxMessageBytes = 16 * 1024;
    private const int MaxContentLength = 4000;
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public static async Task HandleAsync(
        HttpContext context,
        RealtimeHub hub,
        IServiceScopeFactory scopeFactory,
        ILogger<ChatRealtimeEndpoint> logger)
    {
        if (!context.WebSockets.IsWebSocketRequest)
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsync("A WebSocket connection is required.");
            return;
        }

        var memberId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(memberId))
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return;
        }

        using var socket = await context.WebSockets.AcceptWebSocketAsync();
        var connection = hub.AddConnection(memberId, socket);

        try
        {
            while (socket.State == WebSocketState.Open)
            {
                var requestJson = await ReceiveTextMessageAsync(socket, context.RequestAborted);
                if (requestJson is null)
                {
                    break;
                }

                RealtimeClientCommand? command;
                try
                {
                    command = JsonSerializer.Deserialize<RealtimeClientCommand>(requestJson, JsonOptions);
                }
                catch (JsonException)
                {
                    await SendErrorAsync(hub, memberId, "The message format is invalid.", context.RequestAborted);
                    continue;
                }

                if (command?.Type != "chat.send")
                {
                    await SendErrorAsync(hub, memberId, "Unsupported realtime message type.", context.RequestAborted);
                    continue;
                }

                var recipientId = command.RecipientId?.Trim();
                var content = command.Content?.Trim();
                if (string.IsNullOrWhiteSpace(recipientId) ||
                    string.IsNullOrWhiteSpace(content) ||
                    content.Length > MaxContentLength)
                {
                    await SendErrorAsync(hub, memberId, $"A recipient and a message of 1-{MaxContentLength} characters are required.", context.RequestAborted);
                    continue;
                }

                if (recipientId == memberId)
                {
                    await SendErrorAsync(hub, memberId, "You cannot send a message to yourself.", context.RequestAborted);
                    continue;
                }

                using var scope = scopeFactory.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var senderExists = await dbContext.Members.AnyAsync(member => member.Id == memberId, context.RequestAborted);
                var recipientExists = await dbContext.Members.AnyAsync(member => member.Id == recipientId, context.RequestAborted);
                if (!senderExists || !recipientExists)
                {
                    await SendErrorAsync(hub, memberId, "The sender or recipient account could not be found.", context.RequestAborted);
                    continue;
                }

                var message = new ChatMessage
                {
                    SenderId = memberId,
                    RecipientId = recipientId,
                    Content = content
                };
                dbContext.ChatMessages.Add(message);
                await dbContext.SaveChangesAsync(context.RequestAborted);

                var messageDto = new ChatMessageDto(
                    message.Id,
                    message.SenderId,
                    message.RecipientId,
                    message.Content,
                    message.SentAt);
                await hub.SendToUserAsync(memberId, "chat.message", messageDto, context.RequestAborted);
                await hub.SendToUserAsync(recipientId, "chat.message", messageDto, context.RequestAborted);
            }
        }
        catch (WebSocketException exception)
        {
            logger.LogDebug(exception, "Realtime connection closed for member {MemberId}.", memberId);
        }
        finally
        {
            hub.RemoveConnection(memberId, connection);
            if (socket.State == WebSocketState.CloseReceived)
            {
                await socket.CloseOutputAsync(
                    WebSocketCloseStatus.NormalClosure,
                    "Connection closed",
                    CancellationToken.None);
            }
        }
    }

    private static async Task<string?> ReceiveTextMessageAsync(WebSocket socket, CancellationToken cancellationToken)
    {
        using var message = new MemoryStream();
        var buffer = new byte[4096];

        while (true)
        {
            var result = await socket.ReceiveAsync(buffer.AsMemory(), cancellationToken);
            if (result.MessageType == WebSocketMessageType.Close)
            {
                return null;
            }

            if (result.MessageType != WebSocketMessageType.Text)
            {
                await socket.CloseAsync(
                    WebSocketCloseStatus.InvalidMessageType,
                    "Only text messages are supported.",
                    cancellationToken);
                return null;
            }

            if (message.Length + result.Count > MaxMessageBytes)
            {
                await socket.CloseAsync(
                    WebSocketCloseStatus.MessageTooBig,
                    "Message is too large.",
                    cancellationToken);
                return null;
            }

            await message.WriteAsync(buffer.AsMemory(0, result.Count), cancellationToken);
            if (result.EndOfMessage)
            {
                return Encoding.UTF8.GetString(message.GetBuffer(), 0, (int)message.Length);
            }
        }
    }

    private static Task SendErrorAsync(
        RealtimeHub hub,
        string memberId,
        string message,
        CancellationToken cancellationToken)
    {
        return hub.SendToUserAsync(memberId, "error", new RealtimeError(message), cancellationToken);
    }
}

public sealed record RealtimeClientCommand(string? Type, string? RecipientId, string? Content);

public sealed record RealtimeError(string Message);
