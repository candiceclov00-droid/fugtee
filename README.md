# Pixel Fighters

Arcade-style 2D fighting game — pure HTML5 + Canvas.  
**Ready for GitHub Pages.**

## Play online

After enabling GitHub Pages, your game will be at:

```
https://YOUR-USERNAME.github.io/REPO-NAME/
```

## How to publish on GitHub Pages (2 minutes)

1. Create a **new public repository** on GitHub
2. Upload **all the files that are inside this folder** (not the folder itself)
   - You must see `index.html` at the root of the repository
3. Go to **Settings → Pages**
4. Under **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: `main` (or `master`)
   - Folder: **/ (root)**
5. Click **Save**
6. Wait 1–3 minutes → a green banner appears with your link

### Important
- Repository must be **Public**
- `index.html` must be at the **root** of the repo (same level as this README)
- Do not upload a ZIP file — upload the files themselves

## Controls

| Action     | Player 1 | Player 2 |
|------------|----------|----------|
| Move       | Q / D    | ← / →    |
| Jump       | Z        | ↑        |
| Block      | S        | ↓        |
| Punch      | F        | 1        |
| Kick       | G        | 2        |
| Special    | H        | 3        |

## Features

- 1v1 local multiplayer
- 4 characters + 4 arenas
- Punch / Kick / Special + combos
- Blocking system
- Health bars + special meter
- Particle effects + screen shake
- Fully static — no backend needed

## Local test

Just open `index.html` in a modern browser  
or run a local server:

```bash
python -m http.server 8000
```

## License

MIT
