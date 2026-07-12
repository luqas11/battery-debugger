#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ESP8266WebServer.h>
#include <LittleFS.h>
#include <ArduinoJson.h>
#include "config.h"

const float REF_VOLTAGE = 11.46;
const int   REF_ADC     = 566;

const int           LED_GREEN_PIN       = 4;   // GPIO4  — external green LED (active HIGH)
const int           LED_RED_PIN         = 12;  // GPIO12 — external red LED   (active HIGH)
const unsigned long WIFI_TIMEOUT_MS     = 10000UL;
const char*         CONFIG_PATH         = "/config.json";
const unsigned long DEFAULT_INTERVAL_MS = 120000UL;

ESP8266WebServer server(80);

String        savedSSID;
String        savedPassword;
String        savedServerHost;
unsigned long readingIntervalMs = DEFAULT_INTERVAL_MS;
unsigned long lastSentAt        = DEFAULT_INTERVAL_MS; // triggers immediately on first loop

// ── LED state ─────────────────────────────────────────────────────────────────

enum LedState { CONNECTING, CONNECTED_OK, CONNECTED_ERROR, NO_WIFI };
LedState      ledState        = CONNECTING;
unsigned long lastLedBlinkMs  = 0;
bool          ledBlinkToggle  = false;

void setLedState(LedState state) {
  ledState       = state;
  ledBlinkToggle = false;
  lastLedBlinkMs = 0;
}

void updateLeds() {
  unsigned long now = millis();
  switch (ledState) {
    case CONNECTING:
      if (now - lastLedBlinkMs >= 500) {
        ledBlinkToggle = !ledBlinkToggle;
        digitalWrite(LED_GREEN_PIN, ledBlinkToggle ? HIGH : LOW);
        digitalWrite(LED_RED_PIN, LOW);
        lastLedBlinkMs = now;
      }
      break;
    case CONNECTED_OK:
      digitalWrite(LED_GREEN_PIN, HIGH);
      digitalWrite(LED_RED_PIN,   LOW);
      break;
    case CONNECTED_ERROR:
      digitalWrite(LED_GREEN_PIN, HIGH);
      if (now - lastLedBlinkMs >= 500) {
        ledBlinkToggle = !ledBlinkToggle;
        digitalWrite(LED_RED_PIN, ledBlinkToggle ? HIGH : LOW);
        lastLedBlinkMs = now;
      }
      break;
    case NO_WIFI:
      digitalWrite(LED_GREEN_PIN, LOW);
      digitalWrite(LED_RED_PIN,   HIGH);
      break;
  }
}

// ── Config (LittleFS) ─────────────────────────────────────────────────────────

bool loadConfig() {
  File f = LittleFS.open(CONFIG_PATH, "r");
  if (!f) return false;

  JsonDocument doc;
  if (deserializeJson(doc, f)) { f.close(); return false; }
  f.close();

  savedSSID         = doc["ssid"]       | "";
  savedPassword     = doc["password"]   | "";
  savedServerHost   = doc["serverHost"] | "";
  readingIntervalMs = doc["intervalMs"] | DEFAULT_INTERVAL_MS;
  return savedSSID.length() > 0;
}

bool saveConfig(const String& ssid, const String& password, const String& serverHost) {
  File f = LittleFS.open(CONFIG_PATH, "w");
  if (!f) return false;

  JsonDocument doc;
  doc["ssid"]        = ssid;
  doc["password"]    = password;
  doc["serverHost"]  = serverHost;
  doc["intervalMs"]  = readingIntervalMs;
  serializeJson(doc, f);
  f.close();
  return true;
}

// ── WiFi ──────────────────────────────────────────────────────────────────────

bool connectWiFi(const String& ssid, const String& password) {
  WiFi.begin(ssid.c_str(), password.c_str());

  unsigned long start  = millis();
  bool          toggle = false;
  while (WiFi.status() != WL_CONNECTED) {
    if (millis() - start > WIFI_TIMEOUT_MS) {
      WiFi.disconnect();
      return false;
    }
    toggle = !toggle;
    digitalWrite(LED_GREEN_PIN, toggle ? HIGH : LOW);
    digitalWrite(LED_RED_PIN, LOW);
    delay(500);
  }
  return true;
}

// ── Web server ────────────────────────────────────────────────────────────────

const char PAGE_STYLE[] PROGMEM = R"css(
  *, *::before, *::after { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100vh;
    background-color: #121212;
    color: #e0e0e0;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    display: flex;
    justify-content: center;
    padding: 32px 16px;
  }
  .container { width: 100%; max-width: 400px; }
  h1 { margin: 0 0 4px; font-size: 1.8rem; text-align: center; }
  .subtitle { color: #9a9a9a; font-size: 0.95rem; text-align: center; margin: 0 0 24px; }
  .card {
    background-color: #222222;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    margin-bottom: 16px;
  }
  .card h2 { margin: 0 0 12px; font-size: 1.1rem; }
  label { display: block; font-size: 0.85rem; color: #9a9a9a; margin-bottom: 4px; }
  input {
    width: 100%;
    padding: 8px 10px;
    margin-bottom: 14px;
    background-color: #2c2c2c;
    border: 1px solid #444444;
    border-radius: 6px;
    color: #e0e0e0;
    font-size: 0.95rem;
  }
  input:focus { outline: none; border-color: #64b5f6; }
  button {
    width: 100%;
    padding: 10px;
    background: #4caf50;
    color: #121212;
    border: none;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    border-radius: 6px;
  }
  button:hover { background: #66bb6a; }
  .row { display: flex; justify-content: space-between; align-items: center;
         padding: 6px 0; border-bottom: 1px solid #333333; font-size: 0.9rem; }
  .row:last-child { border-bottom: none; }
  .row .label { color: #9a9a9a; }
  .connected    { color: #4caf50; font-weight: 600; }
  .disconnected { color: #e57373; font-weight: 600; }
  .not-set      { color: #9a9a9a; font-style: italic; }
)css";

void handleRoot() {
  bool connected = WiFi.status() == WL_CONNECTED;

  String statusCard = "<div class=\"card\"><h2>Estado de conexión</h2>";
  statusCard += "<div class=\"row\"><span class=\"label\">Estado</span>"
                "<span class=\"" + String(connected ? "connected" : "disconnected") + "\">"
                + String(connected ? "Conectado" : "No conectado") + "</span></div>";
  if (connected) {
    statusCard += "<div class=\"row\"><span class=\"label\">Red</span><span>" + WiFi.SSID() + "</span></div>";
    statusCard += "<div class=\"row\"><span class=\"label\">IP</span><span>" + WiFi.localIP().toString() + "</span></div>";
  } else if (savedSSID.length() > 0) {
    statusCard += "<div class=\"row\"><span class=\"label\">Última red</span><span>" + savedSSID + "</span></div>";
  }
  statusCard += "<div class=\"row\"><span class=\"label\">Backend</span><span>"
                + (savedServerHost.length() > 0
                    ? savedServerHost
                    : String("<span class=\"not-set\">No configurado</span>"))
                + "</span></div>";
  statusCard += "<div class=\"row\"><span class=\"label\">Intervalo</span><span>"
                + String(readingIntervalMs / 60000) + " min</span></div>";
  statusCard += "</div>";

  String wifiForm = "<div class=\"card\"><h2>Configurar WiFi</h2>"
                   "<form method=\"POST\" action=\"/save-wifi\">"
                   "<label>SSID</label>"
                   "<input name=\"ssid\" type=\"text\" autocomplete=\"off\" value=\"" + savedSSID + "\">"
                   "<label>Password</label>"
                   "<input name=\"password\" type=\"password\">"
                   "<button type=\"submit\">Guardar</button>"
                   "</form></div>";

  String backendForm = "<div class=\"card\"><h2>Configurar backend</h2>"
                      "<form method=\"POST\" action=\"/save-backend\">"
                      "<label>Backend URL</label>"
                      "<input name=\"serverHost\" type=\"text\" placeholder=\"192.168.1.X:8000\" value=\"" + savedServerHost + "\">"
                      "<label>Intervalo de lectura (minutos)</label>"
                      "<input name=\"intervalMin\" type=\"number\" min=\"1\" value=\"" + String(readingIntervalMs / 60000) + "\">"
                      "<button type=\"submit\">Guardar</button>"
                      "</form></div>";

  String page = "<!DOCTYPE html><html><head><meta charset=\"utf-8\">"
                "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">"
                "<title>Battery Debugger</title>"
                "<style>" + String(FPSTR(PAGE_STYLE)) + "</style></head>"
                "<body><div class=\"container\">"
                "<h1>Battery Debugger</h1>"
                "<p class=\"subtitle\">ESP8266 Setup</p>"
                + statusCard + wifiForm + backendForm +
                "</div></body></html>";

  server.send(200, "text/html", page);
}

String errorPage(const String& msg) {
  return String("<!DOCTYPE html><html><head><meta charset=\"utf-8\">"
                "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">"
                "<title>Battery Debugger</title></head>"
                "<body style=\"background:#121212;color:#e0e0e0;font-family:system-ui,sans-serif;"
                "display:flex;justify-content:center;padding:32px 16px\">"
                "<div style=\"max-width:400px;width:100%\">"
                "<p style=\"color:#e57373\">") + msg +
         String("</p><a href=\"/\" style=\"color:#64b5f6\">Volver</a></div></body></html>");
}

void handleSaveWiFi() {
  String ssid     = server.arg("ssid");
  String password = server.arg("password");

  if (ssid.length() == 0) {
    server.send(400, "text/html", errorPage("El SSID no puede estar vacío."));
    return;
  }

  // If the password is left blank for the same network, keep the saved one.
  // A blank password for a different network is treated as an open network.
  if (password.length() == 0 && ssid == savedSSID) password = savedPassword;

  if (!saveConfig(ssid, password, savedServerHost)) {
    server.send(500, "text/html", errorPage("Error al guardar la configuración."));
    return;
  }

  savedSSID     = ssid;
  savedPassword = password;

  // Respond before attempting to connect: connectWiFi blocks for up to 10s,
  // and the browser would hang waiting for this response otherwise.
  server.sendHeader("Location", "/");
  server.send(303);

  if (WiFi.SSID() != ssid || WiFi.status() != WL_CONNECTED) {
    WiFi.disconnect();
    setLedState(CONNECTING);
    if (connectWiFi(ssid, password)) {
      setLedState(CONNECTED_OK);
      Serial.println("WiFi connected: " + WiFi.localIP().toString());
    } else {
      setLedState(NO_WIFI);
      Serial.println("WiFi connection failed");
    }
  }
}

void handleSaveBackend() {
  String serverHost  = server.arg("serverHost");
  String intervalStr = server.arg("intervalMin");

  if (intervalStr.length() > 0) {
    int mins = intervalStr.toInt();
    if (mins < 1) {
      server.send(400, "text/html", errorPage("El intervalo debe ser un número entero de minutos, mayor o igual a 1."));
      return;
    }
    readingIntervalMs = (unsigned long)mins * 60000UL;
  }

  if (!saveConfig(savedSSID, savedPassword, serverHost)) {
    server.send(500, "text/html", errorPage("Error al guardar la configuración."));
    return;
  }

  savedServerHost = serverHost;

  server.sendHeader("Location", "/");
  server.send(303);

  Serial.println("Backend host updated: " + savedServerHost);
  Serial.println("Reading interval updated: " + String(readingIntervalMs / 60000) + " min");
}

void startServer() {
  server.on("/",             HTTP_GET,  handleRoot);
  server.on("/save-wifi",    HTTP_POST, handleSaveWiFi);
  server.on("/save-backend", HTTP_POST, handleSaveBackend);
  server.begin();
  Serial.println("Web server started at http://192.168.4.1");
}

// ── Reading ───────────────────────────────────────────────────────────────────

bool sendReading(float voltage) {
  WiFiClient client;
  HTTPClient http;

  String url = "http://" + savedServerHost + "/save-reading";
  http.begin(client, url);
  http.addHeader("Content-Type", "application/json");

  String body = "{\"voltage\":" + String(voltage, 4) + "}";
  int status = http.POST(body);
  http.end();

  return status == 200;
}

// ── Main ──────────────────────────────────────────────────────────────────────

void setup() {
  Serial.begin(115200);
  pinMode(LED_GREEN_PIN, OUTPUT);
  pinMode(LED_RED_PIN,   OUTPUT);
  setLedState(CONNECTING);
  updateLeds();

  if (!LittleFS.begin()) {
    Serial.println("LittleFS mount failed, formatting...");
    LittleFS.format();
    if (!LittleFS.begin()) {
      Serial.println("LittleFS mount failed after format");
    }
  }

  WiFi.mode(WIFI_AP_STA);
  WiFi.softAP(AP_SSID, AP_PASSWORD);
  Serial.println("AP started: " + String(AP_SSID));

  startServer();

  if (loadConfig()) {
    Serial.println("Connecting to: " + savedSSID);
    if (connectWiFi(savedSSID, savedPassword)) {
      setLedState(CONNECTED_OK);
      Serial.println("WiFi connected: " + WiFi.localIP().toString());
    } else {
      setLedState(NO_WIFI);
      Serial.println("WiFi connection failed, continuing in AP-only mode");
    }
  } else {
    setLedState(NO_WIFI);
    Serial.println("No config found, waiting for configuration via portal");
  }
}

void loop() {
  server.handleClient();
  updateLeds();

  if (WiFi.status() == WL_CONNECTED && savedServerHost.length() > 0
      && millis() - lastSentAt >= readingIntervalMs) {
    lastSentAt = millis();

    float inputValue   = analogRead(A0);
    float voltageValue = inputValue * (REF_VOLTAGE / REF_ADC);

    Serial.printf("Sending: voltage=%.4f\n", voltageValue);

    if (sendReading(voltageValue)) {
      Serial.println("OK");
      setLedState(CONNECTED_OK);
    } else {
      Serial.println("ERROR");
      setLedState(CONNECTED_ERROR);
    }
  }
}
