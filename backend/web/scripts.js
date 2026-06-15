const panel = document.getElementById("panel");
const testList = document.getElementById("testList");
const refreshListButton = document.getElementById("refreshListButton");

const POLL_INTERVAL_MS = 30000;
let pollingTimer = null;

/**
 * Disables the given button, runs the async function, and re-enables it afterwards.
 */
const withLoading = async (button, fn) => {
  button.disabled = true;
  try {
    await fn();
  } finally {
    button.disabled = false;
  }
};

/**
 * Renders the form to start a new test.
 */
const renderStartForm = (errorMessage) => {
  const today = new Date().toISOString().slice(0, 10);

  panel.innerHTML = `
    <h2>Iniciar nuevo test</h2>
    <div class="field">
      <label for="testName">Nombre del test</label>
      <input type="text" id="testName" placeholder="Test1" />
    </div>
    <div class="field">
      <label for="testDate">Fecha</label>
      <input type="date" id="testDate" value="${today}" />
    </div>
    <div class="field">
      <label for="testCurrent">Corriente de carga (A)</label>
      <input type="number" id="testCurrent" step="0.01" placeholder="0.25" />
    </div>
    <div class="field">
      <label for="testAge">Edad de la batería (meses)</label>
      <input type="number" id="testAge" step="1" placeholder="12" />
    </div>
    <button id="startButton" class="primary">Iniciar test</button>
    ${errorMessage ? `<div class="error-message">${errorMessage}</div>` : ""}
  `;

  document
    .getElementById("startButton")
    .addEventListener("click", () => withLoading(document.getElementById("startButton"), startTest));
};

/**
 * Renders the panel for the test currently in progress, including its metadata
 * and a preview of the last readings.
 */
const renderInProgress = (data, errorMessage) => {
  const { currentTestName, metadata, lastReadings } = data;

  const readingsHtml =
    lastReadings && lastReadings.length > 0
      ? `
        <table>
          <thead>
            <tr><th>Time (h)</th><th>Voltage (V)</th></tr>
          </thead>
          <tbody>
            ${lastReadings
              .map((r) => `<tr><td>${r.time}</td><td>${r.voltage}</td></tr>`)
              .join("")}
          </tbody>
        </table>
      `
      : `<div class="empty-message">Sin lecturas todavía</div>`;

  panel.innerHTML = `
    <div class="status-banner">
      <span class="name">Test <strong>${currentTestName}</strong> en progreso</span>
    </div>

    <h2>Datos del test</h2>
    <div class="metadata">
      <div class="metadata-item">
        <span class="label">Fecha</span>
        <span class="value">${metadata.date}</span>
      </div>
      <div class="metadata-item">
        <span class="label">Corriente de carga (A)</span>
        <span class="value">${metadata.current}</span>
      </div>
      <div class="metadata-item">
        <span class="label">Edad de la batería (meses)</span>
        <span class="value">${metadata.age}</span>
      </div>
    </div>

    <h2>Últimas lecturas</h2>
    ${readingsHtml}

    <button id="stopButton" class="danger">Detener test</button>
    ${errorMessage ? `<div class="error-message">${errorMessage}</div>` : ""}
  `;

  document
    .getElementById("stopButton")
    .addEventListener("click", () => withLoading(document.getElementById("stopButton"), stopTest));
};

/**
 * Starts or stops the polling of the test status, based on whether a test is in progress.
 */
const setPolling = (enabled) => {
  if (enabled && !pollingTimer) {
    pollingTimer = setInterval(refreshStatus, POLL_INTERVAL_MS);
  } else if (!enabled && pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
  }
};

/**
 * Fetches the current test status and renders the corresponding panel.
 */
const refreshStatus = async () => {
  try {
    const response = await fetch("/get-current-test");
    if (!response.ok) {
      throw new Error();
    }
    const data = await response.json();

    if (data.currentTestName) {
      renderInProgress(data);
      setPolling(true);
    } else {
      renderStartForm();
      setPolling(false);
    }
  } catch (error) {
    panel.innerHTML = `<div class="error-message">No se pudo obtener el estado actual. Probá recargar la página, o revisá el estado del servidor.</div>`;
    setPolling(false);
  }
};

/**
 * Reads the start-test form, validates it, and sends the request to start a new test.
 */
const startTest = async () => {
  const name = document.getElementById("testName").value.trim();
  const date = document.getElementById("testDate").value;
  const current = parseFloat(document.getElementById("testCurrent").value);
  const age = parseFloat(document.getElementById("testAge").value);

  if (!name || !date || isNaN(current) || isNaN(age)) {
    renderStartForm("Completá todos los campos con valores válidos.");
    return;
  }

  try {
    const response = await fetch("/start-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, date, current, age }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      renderStartForm(data.message || "El test no pudo iniciarse.");
      return;
    }

    await refreshStatus();
    await refreshTestList();
  } catch (error) {
    renderStartForm("El test no pudo iniciarse. Probá recargar la página, o revisá el estado del servidor.");
  }
};

/**
 * Sends the request to stop the test currently in progress.
 */
const stopTest = async () => {
  try {
    const response = await fetch("/end-test", { method: "POST" });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      await refreshStatus();
      panel.insertAdjacentHTML(
        "beforeend",
        `<div class="error-message">${data.message || "El test no pudo detenerse."}</div>`
      );
      return;
    }

    await refreshStatus();
    await refreshTestList();
  } catch (error) {
    await refreshStatus();
    panel.insertAdjacentHTML(
      "beforeend",
      `<div class="error-message">El test no pudo detenerse. Probá recargar la página, o revisá el estado del servidor.</div>`
    );
  }
};

/**
 * Fetches the list of finished tests and renders it.
 */
const refreshTestList = async () => {
  try {
    const response = await fetch("/get-test-list");
    if (!response.ok) {
      throw new Error();
    }
    const data = await response.json();

    if (data.testNames && data.testNames.length > 0) {
      testList.innerHTML = `
        <ul class="test-list">
          ${data.testNames.map((name) => `<li>${name}</li>`).join("")}
        </ul>
      `;
    } else {
      testList.innerHTML = `<div class="empty-message">No hay tests registrados</div>`;
    }
  } catch (error) {
    testList.innerHTML = `<div class="error-message">No se pudo obtener la lista de tests.</div>`;
  }
};

refreshListButton.addEventListener("click", () => withLoading(refreshListButton, refreshTestList));

refreshStatus();
refreshTestList();
