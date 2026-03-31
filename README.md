# Lanco Zelt — „Lang, lang, kurz kurz"

Interaktive Aufbauanleitung für das Lanco-Zelt mit scroll-gesteuerten 3D-Animationen.

## Features

- **3D-Zeltmodell** — Prozedurale Aluminium-Stangen mit Three.js, 120°-Giebeldach
- **Scroll-Animationen** — GSAP ScrollTrigger steuert den schrittweisen Zeltaufbau
- **3 Farbmodi** — Dark, Light, Natur (Toggle oben rechts, wird in localStorage gespeichert)
- **Mobile-first** — Responsive Design, optimiert für alle Bildschirmgrößen

## Tech-Stack

| Technologie          | Zweck                                       |
| -------------------- | ------------------------------------------- |
| Three.js             | 3D-Rendering (Stangen, Knochen, Zeltplanen) |
| GSAP + ScrollTrigger | Scroll-basierte Animationen                 |
| Vite                 | Dev-Server & Build-Tool                     |
| Vanilla HTML/CSS/JS  | Kein Framework-Overhead                     |

## Aufbau-Schritte (auf der Website)

1. **Stangen zusammenstecken** — 3 Beine bleiben zunächst lose
2. **Innenzelt einhängen**
3. **Außenzelt überziehen**
4. **Restliche 3 Beine anstecken**
5. **Fertig!**

## Entwicklung

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm run preview
```

## Docker

```bash
docker build -t lanco-app .
docker run -p 8080:80 lanco-app
```

## Zeltkonstruktion

- **12× kurze Stangen** (~1,20 m) — Beine (je 3 pro Seite) + Dach-Querstreben
- **6× lange Stangen** (~1,50 m) — Längsstreben entlang des Daches
- **Knochen** — Verbindungsstücke an allen Kreuzungspunkten

## Lizenz

MIT
