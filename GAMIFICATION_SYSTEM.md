# Gamifikační Systém - eArcheo

**Status:** 📋 Návrh | **Verze:** 1.0  
**Datum:** 27. listopadu 2024

---

## 🎯 Přehled

Základní gamifikační systém postavený na **existujících databázových datech** bez potřeby rozsáhlých změn schématu. Využívá aktivity, které už uživatelé provádějí (nálezy, vybavení, fotky, hlasování).

---

## 📊 Co už máme k dispozici

### Existující Data v DB:
```
✓ Počet nálezů (Finding records)
✓ Počet fotek (FindingImage records)
✓ Kategorie nálezů (Finding.category)
✓ Veřejné vs. soukromé nálezy (Finding.isPublic)
✓ Vybavení a jeho použití (Equipment + FindingEquipment)
✓ Hlasování na feature requests (FeatureVote)
✓ Oblíbené lokace (FavoriteLocation)
✓ Datum vytvoření účtu (User.createdAt)
✓ Hloubka nálezů (Finding.depth)
✓ Materiály nálezů (Finding.material)
```

---

## 🏆 Level & XP Systém

### Základní mechanika

**Výpočet XP** se provádí **dynamicky z existujících dat** - není potřeba ukládat!

```typescript
// Příklad výpočtu XP
function calculateUserXP(user: User): number {
  let xp = 0;
  
  // Nálezy
  xp += user.findings.length * 50;  // 50 XP za každý nález
  
  // Veřejné nálezy (sdílení s komunitou)
  xp += user.findings.filter(f => f.isPublic).length * 25;
  
  // Fotky (dokumentace)
  const totalImages = user.findings.reduce((sum, f) => sum + f.images.length, 0);
  xp += totalImages * 10;  // 10 XP za každou fotku
  
  // Vybavení (investice do hobby)
  xp += user.equipment.length * 30;
  
  // Hlasování (aktivita v komunitě)
  xp += user.featureVotes.length * 5;
  
  // Oblíbené lokace (explorační aktivita)
  xp += user.favoriteLocations.length * 20;
  
  // Bonus za různorodost kategorií
  const uniqueCategories = new Set(user.findings.map(f => f.category)).size;
  xp += uniqueCategories * 40;
  
  return xp;
}

// Level = sqrt(XP / 100)
function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100));
}
```

### Level Tiers (Tituly)

| Level | XP Required | Titul |
|-------|-------------|-------|
| 1-4 | 0 - 1,600 | 🔰 **Nováček** |
| 5-9 | 1,600 - 8,100 | ⚡ **Průzkumník** |
| 10-14 | 8,100 - 19,600 | 🎯 **Detektorista** |
| 15-19 | 19,600 - 36,100 | 🏅 **Veterán** |
| 20-24 | 36,100 - 57,600 | 💎 **Expert** |
| 25+ | 57,600+ | 👑 **Mistr Archeolog** |

---

## 🏅 Achievements (Odznaky)

Všechny achievements jsou **queryovatelné z existujících dat**.

### 1️⃣ Základní Aktivity

| Odznak | Podmínka | Query |
|--------|----------|-------|
| 🎯 **První Nález** | Přidat 1. nález | `findings.length >= 1` |
| 📸 **Fotograf** | Nahrát první fotku | `totalImages >= 1` |
| 🗺️ **Mapovač** | Označit oblíbenou lokaci | `favoriteLocations.length >= 1` |
| 🛠️ **Vybaven** | Přidat první equipment | `equipment.length >= 1` |
| 🌍 **Sdílející** | Zveřejnit první nález | `findings.filter(f => f.isPublic).length >= 1` |

### 2️⃣ Milestones

| Odznak | Podmínka | Query |
|--------|----------|-------|
| 🏆 **Sběratel I** | 10 nálezů | `findings.length >= 10` |
| 🏆 **Sběratel II** | 50 nálezů | `findings.length >= 50` |
| 🏆 **Sběratel III** | 100 nálezů | `findings.length >= 100` |
| 📷 **Fotograf I** | 25 fotek | `totalImages >= 25` |
| 📷 **Fotograf II** | 100 fotek | `totalImages >= 100` |
| 🛠️ **Kolekcionář výbavy** | 5 kusů equipmentu | `equipment.length >= 5` |

### 3️⃣ Specializace

| Odznak | Podmínka | Query |
|--------|----------|-------|
| 🪙 **Numismatik** | 10 mincí | `findings.filter(f => f.category === 'mince').length >= 10` |
| ⚔️ **Militarista** | 10 vojenských nálezů | `findings.filter(f => f.category === 'vojenské').length >= 10` |
| 💍 **Klenotník** | 5 šperků | `findings.filter(f => f.category === 'šperky').length >= 5` |
| 🏛️ **Archeolog** | 5 historických artefaktů | `findings.filter(f => f.category === 'archeologické').length >= 5` |
| 🔨 **Industrialista** | 10 průmyslových nálezů | `findings.filter(f => f.category === 'průmyslové').length >= 10` |

### 4️⃣ Speciální

| Odznak | Podmínka | Query |
|--------|----------|-------|
| 🌈 **Univerzál** | Alespoň 1 nález v 5 kategoriích | `uniqueCategories >= 5` |
| 🏔️ **Hloubkař** | Nález z 50+ cm hloubky | `findings.some(f => f.depth >= 50)` |
| 🗓️ **Veterán komunity** | 1 rok v eArcheo | `daysSinceRegistration >= 365` |
| 🗳️ **Komunitní hlas** | 10 hlasů na feature requests | `featureVotes.length >= 10` |
| 📚 **Historik** | 10 nálezů s hist. kontextem | `findings.filter(f => f.historicalContext).length >= 10` |

---

## 📈 Statistiky pro Profil

Všechny statistiky se počítají **za běhu** z existujících dat:

### Přehledová Karta (Stats Card)

```typescript
interface UserStats {
  // Základní
  level: number;
  xp: number;
  xpToNextLevel: number;
  title: string;  // "Průzkumník", "Expert", atd.
  
  // Aktivity
  totalFindings: number;
  publicFindings: number;
  totalImages: number;
  equipmentCount: number;
  
  // Specializace
  favoriteCategory: string;  // nejčastější kategorie
  deepestFind: number;       // max depth
  uniqueCategories: number;
  
  // Komunita
  communityVotes: number;
  favoriteLocations: number;
  
  // Čas
  memberSince: Date;
  daysSinceMembership: number;
  
  // Achievements
  unlockedAchievements: Achievement[];
  totalAchievements: number;
  achievementProgress: number; // 15/30 = 50%
}
```

### Vizualizace

```
┌─────────────────────────────────────────────────┐
│ 👤 Jan Novák                     Level 12 ⚡     │
│    Průzkumník                                    │
│                                                  │
│ ████████████░░░░░░░░ 8,500 / 14,400 XP         │
│                                                  │
│ 🏆 Statistiky                                    │
│ ├─ 42 nálezů (28 veřejných)                     │
│ ├─ 95 fotografií                                 │
│ ├─ 3 kusy vybavení                               │
│ └─ 7 různých kategorií                           │
│                                                  │
│ 🏅 Odznaky (12/30)         [Zobrazit všechny]   │
│ 🏆 🪙 ⚔️ 📸 🎯 🗺️ ...                           │
└─────────────────────────────────────────────────┘
```

---

## 🏆 Leaderboard (Žebříček)

### Základní Žebříčky

**1. Celkový Level**
```sql
SELECT id, nickname, level, xp
ORDER BY xp DESC
LIMIT 100
```

**2. Počet Nálezů**
```sql
SELECT u.id, u.nickname, COUNT(f.id) as total_findings
FROM User u
LEFT JOIN Finding f ON f.userId = u.id
GROUP BY u.id
ORDER BY total_findings DESC
```

**3. Nejaktivnější tento měsíc**
```sql
SELECT u.id, u.nickname, COUNT(f.id) as monthly_findings
FROM User u
LEFT JOIN Finding f ON f.userId = u.id
WHERE f.createdAt >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY u.id
ORDER BY monthly_findings DESC
```

**4. Nejlepší fotografové**
```sql
SELECT u.id, u.nickname, COUNT(fi.id) as total_images
FROM User u
LEFT JOIN Finding f ON f.userId = u.id
LEFT JOIN FindingImage fi ON fi.findingId = f.id
GROUP BY u.id
ORDER BY total_images DESC
```

### UI Pro Leaderboard

```
┌─────────────────────────────────────────────────┐
│ 🏆 ŽEBŘÍČEK                                      │
│                                                  │
│ [Celkový] [Nálezy] [Tento měsíc] [Fotografie]   │
│                                                  │
│ 1. 👑 MirekDetektor      Level 28  (42,100 XP)  │
│ 2. 🥈 PetrKopáč          Level 24  (32,400 XP)  │
│ 3. 🥉 JanaArcheoložka    Level 22  (28,900 XP)  │
│ 4.    TomášHledač        Level 18  (18,600 XP)  │
│ 5.    AnnaMincoložka     Level 16  (14,200 XP)  │
│ ...                                              │
│ 42.   ⭐ TY              Level 12  (8,500 XP)    │
│ ...                                              │
└─────────────────────────────────────────────────┘
```

---

## 🔧 Implementační Plán

### Fáze 1: Základní Infrastruktura (2-3 dny)

**Databázové změny:**
- ❌ **ŽÁDNÉ!** (všechno se počítá z existujících dat)
- Volitelně: přidat index na `Finding.createdAt` pro rychlé měsíční statistiky

**Backend API:**
```typescript
// GET /api/stats/user/:userId
// Vrací UserStats object

// GET /api/achievements/:userId
// Vrací seznam všech achievements + unlock status

// GET /api/leaderboard?type=xp|findings|monthly|images&limit=100
// Vrací žebříček
```

**Utility funkce:**
```typescript
// utils/gamification.ts
- calculateUserXP(user)
- calculateLevel(xp)
- getUserTitle(level)
- checkAchievements(user)
- calculateUserStats(user)
```

### Fáze 2: UI Komponenty (3-4 dny)

**Nové komponenty:**
```
components/gamification/
├── LevelBadge.tsx          # Level + titul badge
├── XPProgressBar.tsx       # Progress bar k dalšímu levelu
├── AchievementCard.tsx     # Jednotlivý odznak
├── AchievementGrid.tsx     # Mřížka odznaků
├── StatsOverview.tsx       # Stats karta
├── LeaderboardTable.tsx    # Tabulka žebříčku
└── AchievementNotification.tsx  # Toast notifikace při unlock
```

**Integrace do existujících stránek:**
- **ProfileModal:** Přidat stats + achievements tab
- **AuthHeader:** Zobrazit level badge vedle avataru
- **MapPage:** Možnost zobrazit leaderboard

### Fáze 3: Real-time Updates (1-2 dny)

**Toast notifikace při:**
- Odemknutí nového achievements
- Dosažení nového levelu
- První místo v měsíčním žebříčku

**Optimalizace:**
- Cachování user stats (aktualizace při změně dat)
- Debounced rekalkulace XP
- Lazy loading leaderboardu

---

## 🎨 Design Konzistence

Gamifikační prvky budou plně respektovat váš **sci-fi dark theme**:

### Barevné schéma:
```css
/* Levely a XP */
--level-primary: #00f3ff;      /* Neon cyan */
--level-background: #0f172a;
--xp-bar-bg: #1e293b;
--xp-bar-fill: linear-gradient(90deg, #00f3ff, #0ea5e9);

/* Achievements */
--achievement-locked: #334155;
--achievement-unlocked: #00f3ff;
--achievement-glow: rgba(0, 243, 255, 0.3);

/* Tiers */
--tier-novice: #64748b;        /* Šedá */
--tier-explorer: #3b82f6;      /* Modrá */
--tier-veteran: #8b5cf6;       /* Fialová */
--tier-expert: #f59e0b;        /* Oranžová */
--tier-master: #fbbf24;        /* Zlatá */
```

### Komponenty:
- Glassmorphism pro karty
- Neon glow na achievements
- Tech font (Share Tech Mono) pro čísla
- Corner decorations na stats kartách

---

## 📊 Příklady Query

### Výpočet všech stats pro uživatele:

```typescript
import { prisma } from './db';

async function getUserGamificationStats(userId: string) {
  // Načíst user s relacemi
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      findings: {
        include: {
          images: true,
          equipment: true,
        }
      },
      equipment: true,
      favoriteLocations: true,
      featureVotes: true,
    }
  });
  
  if (!user) return null;
  
  // Statistiky
  const totalFindings = user.findings.length;
  const publicFindings = user.findings.filter(f => f.isPublic).length;
  const totalImages = user.findings.reduce((sum, f) => sum + f.images.length, 0);
  const equipmentCount = user.equipment.length;
  
  // Kategorie
  const categories = user.findings.map(f => f.category);
  const uniqueCategories = new Set(categories).size;
  const categoryCount = categories.reduce((acc, cat) => {
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const favoriteCategory = Object.entries(categoryCount)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Žádná';
  
  // Hloubka
  const depths = user.findings.map(f => f.depth).filter(d => d !== null) as number[];
  const deepestFind = depths.length > 0 ? Math.max(...depths) : 0;
  
  // Čas
  const daysSinceMembership = Math.floor(
    (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // XP a Level
  const xp = calculateUserXP(user);
  const level = calculateLevel(xp);
  const nextLevelXP = Math.pow(level + 1, 2) * 100;
  const xpToNextLevel = nextLevelXP - xp;
  const title = getUserTitle(level);
  
  // Achievements
  const achievements = checkAchievements(user);
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  
  return {
    level,
    xp,
    xpToNextLevel,
    title,
    totalFindings,
    publicFindings,
    totalImages,
    equipmentCount,
    uniqueCategories,
    favoriteCategory,
    deepestFind,
    communityVotes: user.featureVotes.length,
    favoriteLocations: user.favoriteLocations.length,
    memberSince: user.createdAt,
    daysSinceMembership,
    achievements: unlockedAchievements,
    totalAchievements: achievements.length,
    achievementProgress: (unlockedAchievements.length / achievements.length) * 100,
  };
}
```

### Leaderboard query:

```typescript
// Top 100 uživatelů podle XP
async function getLeaderboard(type: 'xp' | 'findings' | 'monthly' | 'images', limit = 100) {
  const users = await prisma.user.findMany({
    include: {
      findings: {
        where: type === 'monthly' ? {
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        } : undefined,
        include: type === 'images' ? { images: true } : undefined,
      },
      equipment: true,
      favoriteLocations: true,
      featureVotes: true,
    }
  });
  
  // Vypočítat metriku pro každého uživatele
  const leaderboard = users.map(user => {
    let score = 0;
    
    switch (type) {
      case 'xp':
        score = calculateUserXP(user);
        break;
      case 'findings':
        score = user.findings.length;
        break;
      case 'monthly':
        score = user.findings.length;
        break;
      case 'images':
        score = user.findings.reduce((sum, f) => sum + f.images.length, 0);
        break;
    }
    
    return {
      userId: user.id,
      nickname: user.nickname || 'Anonym',
      avatarUrl: user.avatarUrl,
      level: calculateLevel(calculateUserXP(user)),
      score,
    };
  });
  
  // Seřadit a vzít top N
  return leaderboard
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
```

---

## ✅ Výhody tohoto přístupu

1. **✅ Žádné změny v DB schématu** - všechno počítáme z existujících dat
2. **✅ Zpětně kompatibilní** - starší záznamy automaticky započítány
3. **✅ Transparentní** - uživatel vidí, jak je XP vypočítáno
4. **✅ Motivující** - odměňuje všechny typy aktivit
5. **✅ Rozšiřitelné** - snadné přidat nové achievements
6. **✅ Rychlé** - výpočty jsou jednoduché agregace

---

## 🚀 Next Steps

1. **Review tohoto návrhu** - zkontrolovat, že odpovídá vašim cílům
2. **Upřesnit achievements** - seznam můžeme rozšířit/upravit
3. **Naimplementovat Fázi 1** - backend utils a API
4. **Naimplementovat Fázi 2** - UI komponenty
5. **Naimplementovat Fázi 3** - notifikace a polish
6. **Testing & Launch** 🎉

---

## 💡 Budoucí rozšíření (v2)

- **Daily quests** ("Najdi dnes 3 nálezy")
- **Seasonal events** (Letní soutěž, Vánoční výzva)
- **Rare achievements** (RNG šance na speciální odznak při nálezu)
- **Profile badges** (zobrazitelné odznaky na profilu)
- **Team competitions** (týmové výzvy)
- **Referral system** (pozvánky přátel)

---

**Připraveno k implementaci! 🚀**




