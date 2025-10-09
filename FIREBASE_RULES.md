```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "users": {
      ".indexOn": ["displayName"],
      "$uid": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid === $uid",
        "friends": {
          "$friendId": {
            ".read": "auth != null && ($uid === auth.uid || $friendId === auth.uid)",
            ".write": "auth != null && $uid === auth.uid"
          }
        },
        "stats": {
          ".read": "auth != null"
        }
      }
    },
    "matchmaking_queue": {
      "$queueId": {
        ".read": "auth != null",
        ".write": "auth != null && ((!data.exists() && newData.child('playerId').val() === auth.uid) || data.child('playerId').val() === auth.uid)",
        ".validate": "!newData.exists() || (newData.hasChildren(['playerId', 'mode', 'status', 'createdAt']) && newData.child('playerId').val() === auth.uid)"
      },
      ".indexOn": ["status", "mode", "playerMMR", "createdAt"]
    },
    "active_matches": {
      "$matchId": {
        ".read": "auth != null && (data.child('players/' + auth.uid).exists() || data.child('host').val() === auth.uid)",
        ".write": "auth != null && ((!data.exists() && newData.child('host').val() === auth.uid) || data.child('host').val() === auth.uid || data.child('players/' + auth.uid).exists() || newData.child('players/' + auth.uid).exists())",
        "players": {
          "$playerId": {
            ".read": "auth != null && (auth.uid === $playerId || root.child('active_matches/' + $matchId + '/host').val() === auth.uid)",
            ".write": "auth != null && auth.uid === $playerId"
          }
        }
      },
      ".indexOn": ["status", "createdAt"]
    },
    "game_sessions": {
      "$matchId": {
        ".read": "auth != null && (root.child('active_matches/' + $matchId + '/players/' + auth.uid).exists() || root.child('active_matches/' + $matchId + '/host').val() === auth.uid)",
        ".write": "auth != null && (root.child('active_matches/' + $matchId + '/players/' + auth.uid).exists() || root.child('active_matches/' + $matchId + '/host').val() === auth.uid || newData.child('players/' + auth.uid).exists())",
        "players": {
          "$playerId": {
            ".read": "auth != null && (auth.uid === $playerId || root.child('active_matches/' + $matchId + '/host').val() === auth.uid)",
            ".write": "auth != null && auth.uid === $playerId"
          }
        },
        "events": {
          "$eventId": {
            ".read": "auth != null && root.child('active_matches/' + $matchId + '/players/' + auth.uid).exists()",
            ".write": "auth != null && root.child('active_matches/' + $matchId + '/players/' + auth.uid).exists() && newData.child('playerId').val() === auth.uid"
          }
        }
      }
    },
    "games": {
      "$gameId": {
        ".read": "auth != null",
        ".write": "auth != null && auth.token.admin === true"
      }
    },
    "notifications": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid"
      }
    },
    "profiles": {
      "$userId": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid === $userId"
      }
    },
    "leaderboards": {
      ".read": "auth != null",
      ".write": "auth != null && auth.token.admin === true"
    }
  }
}
```
