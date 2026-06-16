# Firmware

An Arduino sketch for the **ESP8266** that periodically reads the battery voltage through the analog input and sends it to the backend every 2 minutes.

## Setup

### 1. Flash the sketch

Open `firmware-new.ino` in the Arduino IDE, select your ESP8266 board, and upload.

### 2. Configure via the setup portal

On first boot, the ESP starts a WiFi network called `ESP8266-Setup`. Connect to it and open `http://192.168.4.1` in a browser. Fill in:

- **SSID** and **Password** — your local WiFi network
- **Backend URL** — host and port of the machine running the backend (e.g. `192.168.1.42:8080`)

Press **Guardar**. The ESP saves the configuration to flash and connects to the network.

The setup portal stays available at `http://192.168.4.1` after a successful connection, so you can check the connection status, see the ESP's IP on the local network, or update any setting without reflashing.

## Voltage calibration

The voltage is converted from the ADC reading using two calibration constants defined directly in `firmware-new.ino`:

```cpp
const float REF_VOLTAGE = 11.46;  // known input voltage in Volts
const int   REF_ADC     = 566;    // ADC reading at that voltage
```

The conversion is: `voltage = analogRead(A0) * (REF_VOLTAGE / REF_ADC)`

To recalibrate, apply a known voltage to the input (close to the voltages you expect to measure for best accuracy), read the raw ADC value from the Serial monitor, and update both constants.

## LED patterns

| Pattern | Meaning |
|---|---|
| Blinking every 500 ms | Connecting to WiFi |
| Blinking every 1500 ms | AP mode active, waiting for credentials |
| 1 long blink | WiFi connected successfully |
| 3 short blinks | Reading sent successfully |
| 2 long blinks | Error sending reading |

## Dependencies

- **ArduinoJson 7.4.3** (Benoit Blanchon) — available in the Arduino Library Manager
- **ESP8266 Arduino Core 3.1.2** (ESP8266 Community) — available in the Arduino Boards Manager

If the code fails to compile after reinstalling dependencies, make sure the ArduinoJson version matches the one listed above.
