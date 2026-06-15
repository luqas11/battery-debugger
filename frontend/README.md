# Frontend

This **Go** module generates the data for, and serves, a static dashboard that visualizes the battery discharge tests saved in `/records`: a comparison of voltage curves between tests, and the decay of estimated battery capacity over time.

It has no external dependencies (standard library only). The dashboard uses **Chart.js** loaded from a CDN, with no build step or npm involved.

### How it works:

Running the binary with no arguments does two things:
1. **Generates the data**: reads `/records`, and for every finished test (a matching `<name>.csv` + `<name>.json` pair) copies both files into `frontend/data/`, and writes `frontend/data/manifest.json` with a list of all tests and their metadata.
2. **Serves the dashboard**: starts an HTTP server serving the `frontend/` folder (including the `data/` just generated), so `index.html` can fetch the manifest and CSV/JSON files directly.

`frontend/data/` is regenerated on every run and is not committed to the repository (see `.gitignore`).

Running the binary with the `generate-data` subcommand only performs step 1, without starting the server. This is the mode used by the GitHub Actions workflow that deploys the dashboard to GitHub Pages.

### Development notes:

To run in development (generates data and serves on `:8001`):
```
go run .
```

To only generate `frontend/data/` without serving:
```
go run . generate-data
```

The server listens on port `8001` by default, on all network interfaces. This can be configured with environment variables:
- `PORT` — port to listen on (default `8001`)
- `HOST` — interface to bind to (default empty, i.e. all interfaces)

### Building:

The app compiles to a single static binary, with no external dependencies. Always build with `CGO_ENABLED=0` to ensure the binary doesn't link against system libraries.

Prebuilt binaries for the supported targets are kept in the `binaries/` folder:

| Target | Binary | Build command |
|---|---|---|
| Ubuntu (32-bit, `i686`) | `binaries/frontend-386` | `CGO_ENABLED=0 GOOS=linux GOARCH=386 go build -o binaries/frontend-386 .` |
| Linux (64-bit, used by CI) | `binaries/frontend-amd64` | `CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o binaries/frontend-amd64 .` |
| Windows (64-bit) | `binaries/frontend.exe` | `CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -o binaries/frontend.exe .` |

The binary automatically locates `/records` and the `frontend/` folder, whether it's run from `frontend/` or from `frontend/binaries/`.

### Running:

On Linux, the binary needs execute permissions, which may be lost when copying it from another OS:
```
chmod +x binaries/frontend-amd64
```

To run a binary, either from `frontend/`:
```
./binaries/frontend-amd64
```
or from within `frontend/binaries/`:
```
./frontend-amd64
```
(on Windows, `.\binaries\frontend.exe` or `.\frontend.exe` respectively).

Once running, open `http://localhost:8001/` in a browser to view the dashboard.

### Deployment:

The dashboard is published to GitHub Pages via `.github/workflows/deploy-frontend.yml`, which runs on every push to `main` that touches `records/` or `frontend/`. It runs `binaries/frontend-amd64 generate-data` to populate `frontend/data/`, then publishes the `frontend/` folder as a Pages artifact.

For this to work, GitHub Pages must be configured with **Source: GitHub Actions** in the repository settings.
