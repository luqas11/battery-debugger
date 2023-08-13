#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include "config.h"

// Built-in led pin number
const int LED_PIN = 2;
// Input voltage calibration value in Volts
const float REF_VOLTAGE = 11.46;
// Input ADC calibration value
const int REF_ADC = 566;
// Readings period in minutes
const int PERIOD = 5;

void setup()
{
    pinMode(LED_PIN, OUTPUT);
    Serial.begin(115200);

    digitalWrite(LED_PIN, LOW);
    Serial.print("Connecting to ");
    Serial.println(String(SSID));
    WiFi.mode(WIFI_STA);
    WiFi.begin(String(SSID), String(PASSWORD));

    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }

    Serial.println();
    Serial.println("WiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());
    digitalWrite(LED_PIN, HIGH);
}

void loop()
{
    float inputValue = analogRead(A0);
    float voltageValue = inputValue * (REF_VOLTAGE / REF_ADC);
    float currentTime = float(millis()) / (1000 * 60 * 60);

    Serial.println();
    Serial.println("ADC input value: " + String(inputValue));
    Serial.println("Calculated voltage value: " + String(voltageValue) + "V");
    Serial.println("Running time: " + String(currentTime) + "h");

    if (WiFi.status() == WL_CONNECTED)
    {
        WiFiClient client;
        HTTPClient http;

        http.begin(client, String(BASE_URL) + "/save-reading");
        http.addHeader("Content-Type", "application/json");
        int httpCode = http.POST("{\"voltage\":" + String(voltageValue) + ",\"time\":" + String(currentTime) + "}");
        if (httpCode == HTTP_CODE_OK)
        {
            Serial.println("Request successful");
        }
        else
        {
            Serial.println("Request failed. Error code: " + String(httpCode) + ".");
        }
        http.end();
    }
    else
    {
        Serial.println("Request not sent. Unable to connect to WiFi.");
    }

    delay(PERIOD * 1000 * 60);
    digitalWrite(LED_PIN, HIGH);
    delay(300);
    digitalWrite(LED_PIN, LOW);
}
