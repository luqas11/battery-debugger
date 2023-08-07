# battery-debugger

### Objective:
Have a way to track the health state of batteries, based on periodically measures of the charge and discharge curves under specific test conditions. Specifically, this project aims to know the degradation of a Lead Acid battery which is working along a solar panel installation. Taking the curves periodically (maybe annualy, or semi-anually), a simple comparisson between them will show the capacity loss. The test conditions to measure the curves should be always the same, to ensure comparability (e.g. same circuit load for discharge, same weather and sunlight hours for charge, etc.). Besides that specific objective, this project could also be useful to measure batteries of other types and other appliances.

### Proposed solution:
- For the hardware side, an ESP8266 based board should be enough to read the battery voltage periodically (maybe each 5 or 10 minutes) and send the value to a server.
- In the server side, a NodeJS backend could handle the requests sent by the ESP and write the values in a CSV file.
- After that, the backend could start a Python script to plot the values in a PNG image and store it in the server.
- Finally, a simple static frontend could take the generated PNGs and show them in a more user-friendly webpage.

The procedure to measure a discharge curve should be:
1. Disconnect the solar panel (to ensure that the battery is not charging)
2. Connect a defined load to the battery output
3. Connect the ESP
4. Indicate to the server that a new battery test is starting (to save the readings in a new file)
5. Wait until the battery is depleted
6. Disconnect the load and the ESP and see the results

The procedure to measure a charge curve should be:
1. Completely discharge the battery (to ensure an empty state at the starting point of the curve)
2. Check the weather conditions and choose an hour early in the morning (to ensure as many sunligh hours as possible)
3. The tests shoud also be taken in roughly the same days of each year, to have similar sun trajectories
4. Connect the ESP
5. Indicate to the server that a new battery test is starting (to save the readings in a new file)
6. Wait until the battery is full
7. Disconnect the ESP and see the results
