# Firebase Realtime Database Rules

Pour corriger l'erreur de permissions `permission_denied at /game_sessions/-Ob32pVbZSmtBt6ClwRo/players`, vous devez configurer les règles Firebase suivantes dans votre console Firebase :

## Instructions

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet
3. Dans le menu de gauche, allez à **Realtime Database** > **Rules**
4. Remplacez les règles existantes par celles ci-dessous
5. Cliquez sur **Publier**

## Règles complètes à appliquer

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

## Explication des règles

- **game_sessions** : Permet à tous les joueurs de lire les sessions, et chaque joueur peut écrire ses propres données
- **players** : Chaque joueur peut uniquement modifier ses propres données (via son UID)
- **matchmaking_queue** : Accessible en lecture à tous, écriture pour les utilisateurs authentifiés
- **users** : Chaque utilisateur ne peut accéder qu'à ses propres données
- **profiles** : Lisible par tous, modifiable uniquement par le propriétaire
- **leaderboards** : Lisible par tous, modifiable par les utilisateurs authentifiés

## Pour tester localement (optionnel)

Si vous voulez tester avec l'émulateur Firebase :

1. Installez Firebase CLI : `npm install -g firebase-tools`
2. Créez `firebase.json` et `database.rules.json`
3. Lancez : `firebase emulators:start`

## Règles plus restrictives (recommandé pour la production)

Pour la production, utilisez ces règles plus sécurisées :

```json
{
  "rules": {
    "game_sessions": {
      "$matchId": {
        ".read": "auth != null",
        "players": {
          "$playerId": {
            ".write": "auth != null && auth.uid == $playerId"
          }
        },
        "state": {
          ".write": "auth != null && (
            root.child('game_sessions').child($matchId).child('host').val() == auth.uid ||
            root.child('game_sessions').child($matchId).child('players').child(auth.uid).exists()
          )"
        }
      }
    }
  }
}
```
