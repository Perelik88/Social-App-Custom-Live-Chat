# Social-App--Angular-.NET

## Realtime chat

The app includes a small app-specific realtime layer built on the browser's native WebSocket API and ASP.NET Core WebSockets; it does not depend on SignalR. Authenticated clients connect to `/api/realtime` with the JWT in the `access_token` query parameter and send JSON commands such as:

```json
{"type":"chat.send","recipientId":"member-id","content":"Hello"}
```

The server validates and stores each message in SQLite, then delivers a `chat.message` event to the sender's and recipient's active connections. Chat history and the inbox are available through the authenticated `/api/messages` endpoints. The Angular app reconnects after a dropped socket and opens conversations from a member profile or the Messages inbox.

The Angular development server generates its own HTTPS certificate; local private keys are not included. Configure Cloudinary credentials locally (for example via .NET user secrets or environment variables) rather than committing them.