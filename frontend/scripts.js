const PALETTE = [
  '#4caf50', '#64b5f6', '#ba68c8', '#ffb74d',
  '#4db6ac', '#f06292', '#9575cd', '#aed581',
  '#4dd0e1', '#fff176'
];

let tests = [];
let compareChart, capacityChart;
let capacityGroup = null;
let capacityUnit = 'ah';

function currentGroup(current) {
  return Math.round(current * 10) / 10;
}

// Least-squares linear regression: returns {slope, intercept}.
function linearRegression(points) {
  const n = points.length;
  if (n < 2) return null;

  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumXX = points.reduce((s, p) => s + p.x * p.x, 0);

  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return null;

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return {slope, intercept};
}

async function fetchJSON(url) {
  const res = await fetch(url);
  return res.json();
}

async function fetchCSV(url) {
  const res = await fetch(url);
  const text = await res.text();
  const lines = text.trim().split('\n');
  const readings = [];
  for (let i = 1; i < lines.length; i++) {
    const [time, voltage] = lines[i].split(',').map(Number);
    if (!isNaN(time) && !isNaN(voltage)) {
      readings.push({time, voltage});
    }
  }
  return readings;
}

function capacityOf(test) {
  if (test.readings.length === 0) return 0;
  const lastTime = test.readings[test.readings.length - 1].time;
  return test.current * lastTime;
}

function renderTestList() {
  const list = document.getElementById('testList');
  list.innerHTML = '';

  tests.forEach(test => {
    const li = document.createElement('li');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = true;
    checkbox.addEventListener('change', renderCompareChart);
    test.checkbox = checkbox;

    const swatch = document.createElement('span');
    swatch.className = 'swatch';
    swatch.style.backgroundColor = test.color;

    const name = document.createElement('span');
    name.className = 'name';
    name.textContent = test.name;

    const current = document.createElement('span');
    current.className = 'current';
    current.textContent = `${test.current} A`;

    const date = document.createElement('span');
    date.className = 'date';
    date.textContent = test.date;

    li.append(checkbox, swatch, name, current, date);
    list.appendChild(li);
  });
}

function initCompareChart() {
  compareChart = new Chart(document.getElementById('compareChart'), {
    type: 'line',
    data: { datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'nearest', intersect: false },
      scales: {
        x: {
          type: 'linear',
          title: { display: true, text: 'Tiempo (h)', color: '#9a9a9a' },
          ticks: { color: '#9a9a9a' },
          grid: { color: '#333333' }
        },
        y: {
          title: { display: true, text: 'Voltaje (V)', color: '#9a9a9a' },
          ticks: { color: '#9a9a9a' },
          grid: { color: '#333333' }
        }
      },
      plugins: {
        legend: { labels: { color: '#e0e0e0' } }
      }
    }
  });
}

function renderCompareChart() {
  const selected = tests.filter(t => t.checkbox.checked);

  compareChart.data.datasets = selected.map(test => ({
    label: `${test.name} (${test.date})`,
    borderColor: test.color,
    backgroundColor: test.color,
    pointRadius: 0,
    borderWidth: 2,
    data: test.readings.map(r => ({x: r.time, y: r.voltage}))
  }));
  compareChart.update();

  const tags = document.getElementById('compareTags');
  tags.innerHTML = '';
  selected.forEach(test => {
    const tag = document.createElement('span');
    tag.className = 'tag';

    const swatch = document.createElement('span');
    swatch.className = 'swatch';
    swatch.style.backgroundColor = test.color;

    tag.appendChild(swatch);
    tag.append(`${test.name} — ${test.date} — ${test.current}A / ${test.age} meses`);
    tags.appendChild(tag);
  });
}

function initCapacityChart() {
  capacityChart = new Chart(document.getElementById('capacityChart'), {
    type: 'line',
    data: { datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'linear',
          title: { display: true, text: 'Edad de la batería (meses)', color: '#9a9a9a' },
          ticks: { color: '#9a9a9a' },
          grid: { color: '#333333' }
        },
        y: {
          title: { display: true, text: 'Capacidad (Ah)', color: '#9a9a9a' },
          ticks: { color: '#9a9a9a' },
          grid: { color: '#333333' }
        }
      },
      plugins: {
        legend: { labels: { color: '#e0e0e0' } }
      }
    }
  });
}

function setupCapacityTabs() {
  const groups = [...new Set(tests.map(t => currentGroup(t.current)))].sort((a, b) => b - a);
  capacityGroup = groups[0];

  const container = document.getElementById('capacityTabs');
  container.innerHTML = '';

  groups.forEach((group, i) => {
    const btn = document.createElement('button');
    btn.textContent = `~${group} A`;
    if (i === 0) btn.classList.add('active');
    btn.addEventListener('click', () => {
      container.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      capacityGroup = group;
      renderCapacityChart();
    });
    container.appendChild(btn);
  });
}

function setupCapacityUnitTabs() {
  document.querySelectorAll('#capacityUnitTabs button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#capacityUnitTabs button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      capacityUnit = btn.dataset.unit;
      renderCapacityChart();
    });
  });
}

function renderCapacityChart() {
  const points = tests
    .filter(t => currentGroup(t.current) === capacityGroup)
    .map(t => ({age: t.age, capacity: capacityOf(t)}))
    .sort((a, b) => a.age - b.age);

  const baseline = points.length > 0 ? points[0].capacity : 1;

  const chartPoints = points.map(p => ({
    x: p.age,
    y: capacityUnit === 'pct' ? (p.capacity / baseline) * 100 : p.capacity
  }));

  capacityChart.options.scales.y.title.text = capacityUnit === 'pct'
    ? 'Capacidad (% respecto a la primera medición)'
    : 'Capacidad (Ah)';

  capacityChart.data.datasets = [
    {
      label: capacityUnit === 'pct'
        ? `Capacidad relativa (%) — ~${capacityGroup} A`
        : `Capacidad estimada (Ah) — ~${capacityGroup} A`,
      borderColor: '#e57373',
      backgroundColor: '#e57373',
      pointRadius: 4,
      borderWidth: 2,
      tension: 0.2,
      data: chartPoints
    }
  ];

  const trend = linearRegression(chartPoints);
  if (trend) {
    const xs = chartPoints.map(p => p.x);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    capacityChart.data.datasets.push({
      label: 'Tendencia (regresión lineal)',
      borderColor: '#9a9a9a',
      backgroundColor: '#9a9a9a',
      borderWidth: 2,
      borderDash: [6, 4],
      pointRadius: 0,
      data: [
        {x: minX, y: trend.slope * minX + trend.intercept},
        {x: maxX, y: trend.slope * maxX + trend.intercept}
      ]
    });
  }

  capacityChart.update();
}

async function init() {
  const manifest = await fetchJSON('data/manifest.json');
  tests = manifest.tests.map((test, i) => ({
    ...test,
    color: PALETTE[i % PALETTE.length],
    readings: null
  }));

  if (tests.length === 0) {
    document.getElementById('emptyMessage').style.display = 'block';
    document.getElementById('capacityCard').style.display = 'none';
    return;
  }

  await Promise.all(tests.map(async test => {
    test.readings = await fetchCSV(`data/${test.name}.csv`);
  }));

  renderTestList();
  initCompareChart();
  renderCompareChart();

  initCapacityChart();
  setupCapacityTabs();
  setupCapacityUnitTabs();
  renderCapacityChart();
}

init();
