# battery-debugger

A system for tracking the health of a lead-acid battery over time, by periodically measuring its discharge curve under a constant load. Comparing curves taken months apart reveals how much capacity the battery has lost.

## How it works

A discharge test goes like this:

1. Connect a fixed load and the ESP8266 board to the battery terminals.
2. Open the backend web UI and start a new test, entering the date, the load current, and the battery's age in months.
3. The ESP takes periodic voltage readings and sends them to the backend, which saves them to a CSV file.
4. Once the battery is depleted, stop the test from the web UI.
5. Push the new records to the repository — the dashboard on GitHub Pages updates automatically.

## Parts of the project

### `firmware-new/`

An Arduino sketch for the **ESP8266** that periodically reads the battery voltage through the analog input and sends it to the backend. WiFi credentials and the backend URL are configured at runtime via a built-in setup portal — no hardcoded credentials. See [`firmware-new/README.md`](firmware-new/README.md) for setup and calibration details.

### `circuit/`

KiCad schematic for the circuit that connects the ESP8266 board to the battery terminals. A PDF export is available at [`circuit/circuit-schematic.pdf`](circuit/circuit-schematic.pdf).

### `backend/`

A **Go** backend (single static binary) that exposes an HTTP API to start and stop tests and receive voltage readings, and serves a web UI to control everything from a browser. It runs on the machine where records are stored. Supports Linux (32-bit and 64-bit) and Windows. See [`backend/README.md`](backend/README.md).

### `frontend/`

A **Go** tool that reads the `records/` folder and generates a static dashboard, published to **GitHub Pages**. The dashboard lets you compare discharge curves between tests and visualize battery capacity decay over time. See [`frontend/README.md`](frontend/README.md).

### `records/`

CSV and JSON files for every finished test. Each test produces a `<name>.csv` (time/voltage readings) and a `<name>.json` (date, current, and battery age). This folder is the single source of data for both the backend and the dashboard.

## Running the backend

Prebuilt binaries are in `backend/binaries/`. Run the one that matches your machine:

```
# Linux 32-bit
./backend/binaries/backend-386

# Linux 64-bit
./backend/binaries/backend-amd64

# Windows
.\backend\binaries\backend.exe
```

On Linux, mark the binary as executable first if needed: `chmod +x backend/binaries/backend-386`.

Once running, open `http://<host>:8000/` in a browser to access the web UI.

## Viewing the dashboard

The dashboard is published automatically to GitHub Pages on every push to `main` that modifies `records/` or `frontend/`. To view it locally, run:

```
./frontend/binaries/frontend.exe        # Windows
./frontend/binaries/frontend-amd64     # Linux 64-bit
./frontend/binaries/frontend-386       # Linux 32-bit
```

Then open `http://localhost:8001/`.
