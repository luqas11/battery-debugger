# battery-debugger

### Objective:
Have a way to track the health state of batteries, based on periodically measure the discharge curves under constant load conditions. Specifically, this project aims to know the degradation grade of a Lead Acid battery which is working along a solar panel installation. Taking the curves periodically (maybe annualy, or semi-annually), a simple comparisson between them will show the capacity loss. The load conditions to measure the curves should always be the same to ensure comparability. Besides that specific objective, this project could also be useful to test batteries of other types and other appliances.

### Developed solution:
- During the test, an **ESP8266** based board takes periodic readings of the battery voltage through it's analog input, and sends the values to a backend.
- A **NodeJS** backend takes those readings, and saves them in a **CSV** file.
- When the test is complete, the **NodeJS** backend runs a **Python** script that plots the readings as a graph in a **PNG** image, using **matplotlib**.
- Finally, a static webpage served with **http-server** allows the user to see the graphs. That webpage also has interactive menus to start and stops tests fron there.

Those projects, are in the `backend`, `frontend` and `firmware` directories.  
The graphs images are saved in the `records` directory.

### Usage:
The procedure to measure a discharge curve should be:
1. Ensure that there is nothing charging the battery (in my specific case, that the solar pannel is disconnected)
2. Connect a fixed load to the battery terminals
3. Connect the **ESP** to the battery terminals
4. Navigate to the webpage and start a new test (to tell the backend to save the readings in a new file)
5. Wait until the battery is depleted
6. Disconnect the load and the **ESP**
7. Navigate to the webpage and stop the test (to tell the backend to stop saving readings in that file and generate a **PNG**)
8. Navigate to the webpage and see the graph

### Example:
Example of real battery test, viewed on the webpage.  

<img src="discharge_example.png" height="75%" width="75%">
