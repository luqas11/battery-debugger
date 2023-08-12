// Built-in led pin number
const int LED_PIN = 2;
// Input voltage calibration value
const float ref_voltage = 11.46;
// Input ADC calibration value
const int ref_adc = 566;

void setup()
{
    pinMode(LED_PIN, OUTPUT);
    Serial.begin(115200);
}

void loop()
{
    digitalWrite(LED_PIN, HIGH);
    delay(500);
    digitalWrite(LED_PIN, LOW);
    delay(500);

    float inputValue = analogRead(A0);
    float voltageValue = inputValue * (ref_voltage / ref_adc);
    float currentTime = float(millis()) / (1000 * 60 * 60);

    Serial.println("ADC input value: " + String(inputValue));
    Serial.println("Calculated voltage value: " + String(voltageValue) + "V");
    Serial.println("Running time: " + String(currentTime) + "h");
    Serial.println();
}
