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
const int PERIOD = 2;

void setup()
{
    // Setup initial parameters
    pinMode(LED_PIN, OUTPUT);
    Serial.begin(115200);

    // Try to connect to WiFi, and keep the LED on while trying
    digitalWrite(LED_PIN, LOW);
    connectToWifi();
    digitalWrite(LED_PIN, HIGH);
}

void loop()
{
    // Read analog input and current time
    float inputValue = analogRead(A0);
    float voltageValue = inputValue * (REF_VOLTAGE / REF_ADC);
    float currentTime = float(millis()) / (1000 * 60 * 60);

    // Print those values to the serial monitor
    Serial.println();
    Serial.println("ADC input value: " + String(inputValue));
    Serial.println("Calculated voltage value: " + String(voltageValue) + "V");
    Serial.println("Running time: " + String(currentTime) + "h");

    // Send the values to the BE
    sendDataToBE(currentTime, voltageValue);

    // Wait the indicated time to do take the next values
    delay(PERIOD * 1000 * 60);
}

/**
 * Function to connect the device to the WiFi network, and print the connection information.
 * It will not return until a successful connection is established.
 * The network parameters are taken from the config.h file.
 */
void connectToWifi()
{
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
}

/**
 * Function to send time and voltage values to BE through a POST request, and print the request result in the serial monitor.
 * The BE URL is taken from the config.h file.
 * After the request is sent, the led will blink indicating the result. A single blink inidcates success, and a double blink indicates failure.
 */
void sendDataToBE(float time, float voltage)
{
    if (WiFi.status() == WL_CONNECTED)
    {
        WiFiClient client;
        HTTPClient http;

        http.begin(client, String(BASE_URL) + "/save-reading");
        http.addHeader("Content-Type", "application/json");
        int httpCode = http.POST("{\"voltage\":" + String(voltage) + ",\"time\":" + String(time) + "}");
        if (httpCode == HTTP_CODE_OK)
        {
            blink(1);
            Serial.println("Request successful");
        }
        else
        {
            blink(2);
            if (httpCode < 0)
            {
                Serial.println("Request failed. Error: " + http.errorToString(httpCode) + ".");
            }
            else
            {
                Serial.println("Request failed. Error code: " + String(httpCode) + ".");
            }
        }
        http.end();
    }
    else
    {
        blink(2);
        Serial.println("Request not sent. Unable to connect to WiFi.");
    }
}

/**
 * Function to make the built-in LED blink a given amount of times
 */
void blink(int times)
{
    for (int i = 0; i < times; i++)
    {
        digitalWrite(LED_PIN, LOW);
        delay(250);
        digitalWrite(LED_PIN, HIGH);
        delay(250);
    }
}
