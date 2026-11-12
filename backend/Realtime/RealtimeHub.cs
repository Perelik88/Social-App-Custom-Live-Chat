using System.Net.WebSockets;
using System.Text.Json;

namespace backend.Realtime;

public sealed class RealtimeHub(ILogger<RealtimeHub> logger)
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly object _connectionsLock = new();
    private readonly Dictionary<string, HashSet<HubConnection>> _connections = [];

    public HubConnection AddConnection(string memberId, WebSocket socket)
    {
        var connection = new HubConnection(socket);
        lock (_connectionsLock)
        {
            if (!_connections.TryGetValue(memberId, out var memberConnections))
            {
                memberConnections = [];
                _connections.Add(memberId, memberConnections);
            }

            memberConnections.Add(connection);
        }

        return connection;
    }

    public void RemoveConnection(string memberId, HubConnection connection)
    {
        lock (_connectionsLock)
        {
            if (!_connections.TryGetValue(memberId, out var memberConnections))
            {
                return;
            }

            memberConnections.Remove(connection);
            if (memberConnections.Count == 0)
            {
                _connections.Remove(memberId);
            }
        }
    }

    public async Task SendToUserAsync<T>(
        string memberId,
        string eventType,
        T payload,
        CancellationToken cancellationToken = default)
    {
        HubConnection[] connections;
        lock (_connectionsLock)
        {
            connections = _connections.TryGetValue(memberId, out var memberConnections)
                ? memberConnections.ToArray()
                : [];
        }

        var message = JsonSerializer.SerializeToUtf8Bytes(
            new RealtimeServerEvent<T>(eventType, payload),
            JsonOptions);

        foreach (var connection in connections)
        {
            try
            {
                await connection.SendAsync(message, cancellationToken);
            }
            catch (WebSocketException exception)
            {
                logger.LogDebug(exception, "Removing a closed realtime connection for member {MemberId}.", memberId);
                connection.Abort();
                RemoveConnection(memberId, connection);
            }
            catch (ObjectDisposedException exception)
            {
                logger.LogDebug(exception, "Removing a disposed realtime connection for member {MemberId}.", memberId);
                RemoveConnection(memberId, connection);
            }
        }
    }

    public sealed class HubConnection(WebSocket socket)
    {
        private readonly SemaphoreSlim _sendLock = new(1, 1);

        public async Task SendAsync(byte[] message, CancellationToken cancellationToken)
        {
            await _sendLock.WaitAsync(cancellationToken);
            try
            {
                await socket.SendAsync(
                    message.AsMemory(),
                    WebSocketMessageType.Text,
                    endOfMessage: true,
                    cancellationToken);
            }
            finally
            {
                _sendLock.Release();
            }
        }

        public void Abort()
        {
            socket.Abort();
        }
    }
}

public sealed record RealtimeServerEvent<T>(string Type, T Payload);
