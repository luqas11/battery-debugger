# Circuit

KiCad schematic for the circuit that connects the ESP8266 board to the battery terminals. A PDF export is available at [`circuit-schematic.pdf`](circuit-schematic.pdf).

## What it does

- **Voltage divider** (R1 10k / R2 56k) scales the battery voltage down to a range the ESP8266's analog input (`A0`) can read safely. The firmware converts the raw ADC reading back to the real battery voltage using the `REF_VOLTAGE`/`REF_ADC` calibration constants — see [`../firmware/README.md`](../firmware/README.md).
- **Two status LEDs** (green and red), each behind a 220 Ω current-limiting resistor, connected to GPIO4 and GPIO12. These indicate the WiFi connection and last-reading status — see the LED indicators table in [`../firmware/README.md`](../firmware/README.md).
- **J1** is the two-pin connector to the battery terminals.

## Case

`Case.scad` is an OpenSCAD model for a 3D-printable enclosure, with `Case_Base.stl` and `Case_Lid.stl` as the exported, ready-to-print parts.
