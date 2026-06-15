# Backend

This **Go** backend handles all the logic related to running and saving battery discharge tests. It has no external dependencies (standard library only), and serves both the **HTTP API** and the **frontend** (embedded via `go:embed`) from a single static binary, with no runtime required on the target machine.

The working flow is the following: when a new test is started, a **CSV** file and a **JSON** metadata file are created, both named by appending the string `current_` to the given test name. Any saved reading is appended to that **CSV** file. When the test is ended, both files are renamed, removing the `current_` prefix. After that, the test's name appears in the test list, and its metadata and readings remain in the `/records` folder.

### API:

`[GET] /get-current-test`

Returns the name of the test that is currently in progress. If a test is in progress, returns:
```json
{
    "currentTestName": "Example",
    "metadata": { "date": "2026-06-14", "current": 0.25, "age": 12 },
    "lastReadings": [
        { "time": 1.50, "voltage": 12.10 },
        { "time": 1.53, "voltage": 12.05 }
    ]
}
```
If not, returns:
```json
{
    "currentTestName": ""
}
```

`[GET] /get-test-list`

Returns a list with the names of the finished tests saved in the `/records` folder. For example:
```json
{
    "testNames": [
        "Example",
        "Example2",
        "Example3"
    ]
}
```

`[POST] /start-test`

Starts a new test on the backend. The given name can only contain numbers, letters and underscores, and cannot be a name already present in the test list. `date` must have the format `YYYY-MM-DD`, and `current`/`age` must be numbers. The request body must be:
```json
{
    "name": "Example",
    "date": "2026-06-14",
    "current": 0.25,
    "age": 12
}
```

`[POST] /save-reading`

Saves a voltage and time value to the current test file. Both values should be numbers. The request body must be:
```json
{
    "voltage": 12.0,
    "time": 1
}
```

`[POST] /end-test`

Ends the test that is currently in progress.

### Development notes:

To run the app in development:
```
go run .
```

The server listens on port `8000` by default, on all network interfaces. This can be configured with environment variables:
- `PORT` — port to listen on (default `8000`)
- `HOST` — interface to bind to (default empty, i.e. all interfaces)

For example, to use a different port:
```
PORT=9000 go run .
```

### Building:

The app compiles to a single static binary, with no external dependencies. Always build with `CGO_ENABLED=0` to ensure the binary doesn't link against system libraries.

Prebuilt binaries for the supported targets are kept in the `binaries/` folder:

| Target | Binary | Build command |
|---|---|---|
| Ubuntu (32-bit, `i686`) | `binaries/backend-386` | `CGO_ENABLED=0 GOOS=linux GOARCH=386 go build -o binaries/backend-386 .` |
| Ubuntu (64-bit, `x86_64`) | `binaries/backend-amd64` | `CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o binaries/backend-amd64 .` |
| Windows (64-bit) | `binaries/backend.exe` | `CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -o binaries/backend.exe .` |

Any of these binaries can be copied to and run on the corresponding target machine directly, without installing Go or any other dependency. The binary automatically locates the `/records` folder at the project root, whether it's run from `backend/` or from `backend/binaries/`.

### Running:

To run a binary, either from `backend/`:
```
./binaries/backend-386
```
or from within `backend/binaries/`:
```
./backend-386
```
(on Windows, `.\binaries\backend.exe` or `.\backend.exe` respectively).

Once running, open `http://<host>:<port>/` in a browser (e.g. `http://localhost:8000/` or `http://192.168.1.11:8000/` from another machine on the same network) to access the web UI.
