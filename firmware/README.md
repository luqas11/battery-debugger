# Firmware
This **ESP8266** sketch takes the readings from the battery and sends them to the **Node** backend. The WiFi credentials and the backend URL are stored in the `config.h` file, and the reading period is defined (in minutes) in the sketch, as the integer variable `PERIOD`. It will indefinetly try to send the current value of it's analog input to the backend, wait the `PERIOD` time, and try again. The built-in led will blink one if the request sent is successful, and blink twice if it's not.  

The time is read from the `millis()` function and converted to hours, and the voltage is read from the analog input, and converted with a correction constant. Since the relation between the read voltage and the analog value is linear, the conversion is quite simple:  

`Voltage = Analog reading * k`  

Defining the constant `k` as:  

`k = Reference voltage / Reference analog value`  

Where the reference values could be taken applying a reference external voltage. Those values can be taken giving a known extenal voltage to the input, and printing the analog value that corresponds to that specific voltage. With that, `k` can be defined and the conversion can be done. Following that procedure the device can be calibrated. To get a better calibration, use a reference voltage similar to the ones that are going to be measured.
