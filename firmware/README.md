# Firmware

An Arduino sketch for the **ESP8266** that periodically reads the battery voltage through the analog input and sends it to the backend, at a configurable interval (2 minutes by default).

## Setup

### 1. Configure the setup access point

Copy `config.example.h` to `config.h` and set the SSID and password for the access point the ESP exposes when configuring WiFi:

```cpp
#define AP_SSID     "SSID"
#define AP_PASSWORD "PASSWORD"
```

The password must be at least 8 characters (WPA2 requirement). `config.h` is gitignored and never committed.

### 2. Flash the sketch

Open `firmware.ino` in the Arduino IDE, select your ESP8266 board, and upload.

### 3. Configure via the setup portal

On first boot, the ESP starts a WiFi network using the SSID and password from `config.h`. Connect to it and open `http://192.168.4.1` in a browser.

The page has two independent configuration sections:

- **Configurar WiFi** — enter your network's SSID and password and press **Guardar**. The ESP saves the credentials and connects. Leaving the password field blank when re-saving the same network keeps the previously saved password.
- **Configurar backend** — enter the host and port of the machine running the backend (e.g. `192.168.1.42:8000`) and the reading interval in minutes, then press **Guardar**. The interval takes effect immediately, without a restart.

The setup portal stays available at `http://192.168.4.1` after a successful connection, so you can check the connection status, see the ESP's IP on the local network, or update any setting without reflashing.

## Voltage calibration

The voltage is converted from the ADC reading using two calibration constants defined directly in `firmware.ino`:

```cpp
const float REF_VOLTAGE = 11.46;  // known input voltage in Volts
const int   REF_ADC     = 566;    // ADC reading at that voltage
```

The conversion is: `voltage = analogRead(A0) * (REF_VOLTAGE / REF_ADC)`

To recalibrate, apply a known voltage to the input (close to the voltages you expect to measure for best accuracy), read the raw ADC value from the Serial monitor, and update both constants.

## LED indicators

The firmware uses two external LEDs connected to GPIO4 (green) and GPIO12 (red). Wire each LED with a resistor (~220–330 Ω) between the GPIO pin and the anode; connect the cathode to GND.

| Green LED | Red LED | Meaning |
|---|---|---|
| Blinking | Off | Connecting to WiFi |
| Solid | Off | Connected, last reading OK |
| Solid | Blinking | Connected, error sending last reading |
| Off | Solid | No WiFi connection |

## Dependencies

- **ArduinoJson 7.4.3** (Benoit Blanchon) — available in the Arduino Library Manager
- **ESP8266 Arduino Core 3.1.2** (ESP8266 Community) — available in the Arduino Boards Manager

If the code fails to compile after reinstalling dependencies, make sure the versions listed above are used.
