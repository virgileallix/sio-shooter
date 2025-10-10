# 🗑️ Guide de Nettoyage de la Base de Données

## 📖 Introduction

Ce guide explique comment utiliser l'outil de nettoyage de la base de données Firebase pour SIO Shooter.

## 🚀 Accès à l'outil

1. Ouvrez le fichier `clean-database.html` dans votre navigateur
2. Connectez-vous automatiquement (utilise vos identifiants sauvegardés)
3. Attendez que le statut Firebase soit "Connecté" (vert)

## 🔧 Fonctionnalités disponibles

### 🧹 Nettoyage automatique (Recommandé)

**Ce qui est nettoyé :**
- ✅ Matchs terminés (status: "ended")
- ✅ Matchs vides (0 joueurs)
- ✅ File d'attente de matchmaking
- ✅ Sessions de jeu de plus de 24h

**Comment l'utiliser :**
1. Cochez les éléments à nettoyer
2. Cliquez sur "🧹 Nettoyer la base de données"
3. Attendez la fin du processus (logs en bas)

**Recommandation :** Exécutez ce nettoyage **une fois par semaine** pour maintenir la base propre.

---

### 🔄 Migrations et Corrections

#### Corriger les MMR manquants
- Ajoute un MMR par défaut (1000) pour tous les utilisateurs qui n'en ont pas
- **Quand l'utiliser :** Si les classements ne s'affichent pas correctement

#### Corriger les statistiques manquantes
- Ajoute les stats de base (kills, deaths, wins, losses, level) pour tous les utilisateurs
- **Quand l'utiliser :** Si les profils affichent des données manquantes

#### Migrer les inventaires
- Crée un inventaire vide pour tous les utilisateurs qui n'en ont pas
- **Quand l'utiliser :** Après une mise à jour du système d'inventaire

---

### ⚠️ Actions Dangereuses (À utiliser avec précaution!)

#### 🔄 Réinitialiser tous les MMR
- Remet tous les MMR à 1000
- ⚠️ **ATTENTION :** Cela efface la progression de tous les joueurs!
- **Quand l'utiliser :** En cas de bug majeur du système de ranking

#### 🗑️ Supprimer TOUS les matchs
- Supprime tous les matchs actifs, sessions de jeu et la file d'attente
- ⚠️ **DANGER :** Les joueurs en cours de partie seront déconnectés!
- **Quand l'utiliser :** En cas de bug majeur du matchmaking ou pour un reset total

---

## 📊 Structure de la Base de Données

Voici comment est organisée la base Firebase :

```
firebase-database/
├── users/
│   ├── {userId}/
│   │   ├── username
│   │   ├── email
│   │   ├── level
│   │   ├── kills
│   │   ├── deaths
│   │   ├── wins
│   │   ├── losses
│   │   ├── mmr/
│   │   │   ├── competitive
│   │   │   ├── duel
│   │   │   └── unrated
│   │   ├── inventory/
│   │   │   ├── skins[]
│   │   │   ├── cases[]
│   │   │   ├── agents[]
│   │   │   ├── equippedAgent
│   │   │   └── currency/
│   │   │       ├── coins
│   │   │       └── vp
│   │   └── privacy/
│   │       └── publicStats
│
├── active_matches/
│   ├── {matchId}/
│   │   ├── status (waiting/starting/in_progress/ended)
│   │   ├── mode
│   │   ├── map
│   │   ├── players/
│   │   ├── score/
│   │   └── ...
│
├── game_sessions/
│   ├── {sessionId}/
│   │   ├── matchId
│   │   ├── status
│   │   ├── players/
│   │   └── events/
│
└── matchmaking_queue/
    ├── {queueId}/
    │   ├── playerId
    │   ├── mode
    │   └── timestamp
```

---

## 🐛 Résolution de Problèmes

### Les classements affichent "Erreur lors du chargement"

**Solution :**
1. Ouvrez `clean-database.html`
2. Cliquez sur "🔧 Corriger les MMR manquants"
3. Cliquez sur "📈 Corriger les statistiques manquantes"
4. Rafraîchissez la page du jeu

### Les matchs ne se lancent pas / Joueurs bloqués en recherche

**Solution :**
1. Ouvrez `clean-database.html`
2. Cochez "Nettoyer la file d'attente (queue)"
3. Cochez "Supprimer les matchs vides (0 joueurs)"
4. Cliquez sur "🧹 Nettoyer la base de données"

### Les inventaires ne s'affichent pas

**Solution :**
1. Ouvrez `clean-database.html`
2. Cliquez sur "📦 Migrer les inventaires"
3. Rafraîchissez la page du jeu

### La base est complètement cassée

**Solution (Reset complet) :**
1. Ouvrez `clean-database.html`
2. Cliquez sur "🗑️ Supprimer TOUS les matchs"
3. Cliquez sur "🔧 Corriger les MMR manquants"
4. Cliquez sur "📈 Corriger les statistiques manquantes"
5. Cliquez sur "📦 Migrer les inventaires"
6. Rafraîchissez la page du jeu

---

## 📝 Logs

Les logs en bas de la page affichent toutes les actions effectuées :

- 🔵 **Info** (bleu) : Actions en cours
- ✅ **Success** (vert) : Actions réussies
- ❌ **Error** (rouge) : Erreurs rencontrées

---

## ⏰ Maintenance Recommandée

### Quotidienne
- Rien (la base se nettoie automatiquement avec onDisconnect)

### Hebdomadaire
- Nettoyage automatique des matchs terminés et sessions anciennes

### Mensuelle
- Vérification des statistiques manquantes
- Migration des inventaires si nécessaire

### En cas de problème
- Consulter la section "Résolution de Problèmes" ci-dessus

---

## 🔒 Sécurité

**IMPORTANT :**
- Seuls les utilisateurs authentifiés peuvent utiliser cet outil
- Les actions sont irréversibles
- Toujours vérifier les logs pour s'assurer que tout s'est bien passé
- En cas de doute, demander de l'aide avant d'utiliser les actions dangereuses

---

## 📞 Support

En cas de problème :
1. Vérifiez les logs dans l'outil
2. Consultez la section "Résolution de Problèmes"
3. Vérifiez la console du navigateur (F12) pour plus de détails
4. Contactez le développeur si le problème persiste

---

**Dernière mise à jour :** 2025-10-10
