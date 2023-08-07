# battery-debugger

### Objective:
Have a way to track the health state of batteries, based on periodically measures of the charge and discharge curves under specific test conditions. Specifically, this project aims to know the degradation of a Lead Acid battery which is working along a solar panel installation. Taking the curves periodically (maybe annualy, or semi-anually), a simple comparisson between them will show the capacity loss. The test conditions to measure the curves should be always the same, to ensure comparability (e.g. same circuit load for discharge, same weather and sunlight hours for charge, etc.). Besides that specific objective, this project could also be useful to measure batteries of other types and other appliances.

### Proposed solution:
- For the hardware side, an ESP8266 based board should be enough to read the battery voltage periodically (maybe each 5 or 10 minutes) and send the value to a server.
- In the server side, a NodeJS backend could handle the requests sent by the ESP and write the values in a CSV file.
- After that, the backend could start a Python script to plot the values in a PNG image and store it in the server.
- Finally, a simple static frontend could take the generated PNGs and show them in a more user-friendly webpage.
