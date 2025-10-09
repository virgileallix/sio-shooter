```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null",
        ".write": "$uid === auth.uid",
        "friends": {
          ".read": "auth != null",
          ".write": "$uid === auth.uid"
        },
        "stats": {
          ".read": "auth != null"
        }
      }
    },
    "matchmaking_queue": {
      ".read": "auth != null",
      ".write": "auth != null",
      ".indexOn": ["status", "mode", "playerMMR", "createdAt"]
    },
    "active_matches": {
      ".read": "auth != null",
      ".write": "auth != null",
      ".indexOn": ["status", "createdAt"],
      "$matchId": {
        "players": {
          "$playerId": {
            ".indexOn": ["connected", "ready"]
          }
        }
      }
    },
    "game_sessions": {
      "$matchId": {
        ".read": "auth != null",
        ".write": "auth != null",
        "players": {
          "$playerId": {
            ".read": "auth != null",
            ".write": "auth != null"
          }
        },
        "state": {
          ".read": "auth != null",
          ".write": "auth != null"
        }
      }
    },
    "games": {
      "$gameId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "notifications": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "profiles": {
      "$userId": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid == $userId"
      }
    },
    "leaderboards": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```
