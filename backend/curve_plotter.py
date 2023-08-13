import sys
import matplotlib.pyplot as plt
import csv

x = []
y = []

if len(sys.argv) < 2 or not sys.argv[1]:
        print("Invalid file name")
        sys.exit(1)

test_name = sys.argv[1]

with open(f'../records/{test_name}.csv', mode='r') as csv_file:
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

plt.title(test_name)
plt.xlabel('Time (h)')
plt.ylabel('Voltage (V)')
plt.savefig(f'../records/{test_name}.png', dpi=200)
