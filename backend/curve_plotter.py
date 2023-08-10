import matplotlib.pyplot as plt
import csv

x = []
y = []
filename = 'example'

with open(f'./records/{filename}.csv', mode='r') as csv_file:
    csv_reader = csv.DictReader(csv_file)
    line_count = 0
    for row in csv_reader:
        line_count += 1
        x.append(float(row["Time"]))
        y.append(float(row["Voltage"]))

# Plots
plt.style.use('_mpl-gallery')

window_size = 0.5
fig, ax = plt.subplots(figsize=(window_size * 16, window_size * 9), tight_layout=True)

ax.plot(x, y, linewidth=2.0)

plt.title('Discharge curve')
plt.xlabel('Time (s)')
plt.ylabel('Voltage (V)')
plt.savefig(f'./records/{filename}.png', dpi=200)
