# Backend Auto-Reload Setup

## Real-Time Database Updates

The backend now automatically reloads when `db.json` or `routes.json` changes, without requiring a server restart.

## How It Works

1. **File Watching**: Uses Node.js `fs.watch()` to monitor database files
2. **Automatic Reload**: When changes are detected, the router is reloaded with fresh data
3. **Frontend Updates**: Frontend polls every 2-3 seconds for instant updates

## Features

✅ **No Manual Restart Required** - Changes are picked up automatically
✅ **Real-Time Updates** - Database changes reflect within seconds
✅ **Safe Reload** - Validates JSON before reloading to prevent crashes
✅ **Debounced Updates** - Prevents multiple rapid reloads
✅ **Windows Compatible** - Works on Windows file systems

## Starting the Server

```bash
cd Backend
node index.js
```

You should see:
```
🚀 Patient Dashboard backend running on PORT 3000
👀 Watching db.json for changes (real-time file watching enabled)...
📡 API available at http://localhost:3000
💡 Tip: Changes to db.json will automatically reload without restarting!
⚡ Updates will reflect immediately in the frontend!
```

## Testing

1. Start the backend server
2. Make a change to `db.json` (manually or through frontend)
3. Check console for: `✅ Database reloaded successfully`
4. Frontend will update within 2-3 seconds automatically

## Troubleshooting

If changes aren't reflected:
1. Check console for error messages
2. Verify `db.json` is valid JSON
3. Ensure backend server is running
4. Check file permissions on `db.json`

