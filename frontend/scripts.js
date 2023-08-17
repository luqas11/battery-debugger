// Base backend URL
const BASE_URL = "http://" + BACKEND_IP + ":" + PORT;

/**
 * Stops the current test.
 */
const stopTest = () => {
  // Hide any error message
  const statusErrorMessage = document.getElementById("statusErrorMessage");
  statusErrorMessage.style.display = "none";

  // Disable the button while waiting the BE response
  const stopButton = document.getElementById("stopButton");
  stopButton.disabled = true;

  // Send the end-test request, and display an error message if something fails
  fetch(BASE_URL + "/end-test", {
    method: "POST",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error();
      }
      fetchTestStatus();
    })
    .catch((error) => {
      statusErrorMessage.style.display = "block";
      statusErrorMessage.textContent =
        "The test couldn't be stopped. Try reloading the page, or checking the server status.";
    })
    .finally(() => (stopButton.disabled = false));
};

/**
 * Starts a new test with the name written in the input.
 */
const startTest = () => {
  // Hide any error message
  const statusErrorMessage = document.getElementById("statusErrorMessage");
  statusErrorMessage.style.display = "none";

  // Disable the button while waiting the BE response
  const startButton = document.getElementById("startButton");
  startButton.disabled = true;

  // Send the start-test request with the given name, and display an error message if something fails
  const testNameInput = document.getElementById("testNameInput");
  const testName = testNameInput.value;
  fetch(BASE_URL + "/start-test", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: testName,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error();
      }
      fetchTestStatus();
    })
    .catch((error) => {
      statusErrorMessage.style.display = "block";
      statusErrorMessage.textContent =
        "The test couldn't be started. Try reloading the page, or checking the server status.";
    })
    .finally(() => (startButton.disabled = false));
};

/**
 * Fetches the tests names list from the backend, and loads it into the test selector.
 */
const fetchTestList = () => {
  // Disable the button and selector while waiting the BE response
  const getButton = document.getElementById("getButton");
  const testSelector = document.getElementById("testSelector");
  getButton.disabled = true;
  testSelector.disabled = true;

  // Fetch the tests names list, and load it on the selector or display an error message if something fails
  fetch(BASE_URL + "/get-test-list")
    .then((response) => {
      if (!response.ok) {
        throw new Error();
      }
      return response.json();
    })
    .then((data) => {
      data.testNames.forEach((element, index, array) => {
        const newOption = document.createElement("option");
        newOption.value = element;
        newOption.textContent = element;
        testSelector.appendChild(newOption);
      });
      testSelector.removeAttribute("disabled");
      getButton.removeAttribute("disabled");
    })
    .catch((error) => {
      const errorMessage = document.getElementById("errorMessage");
      errorMessage.style.display = "block";
      errorMessage.textContent =
        "The test list couldn't be retrieved. Try reloading the page, or checking the server status.";
    });
};

/**
 * Fetches the current test status, displaying the corresponding container based on the backend response.
 */
const fetchTestStatus = () => {
  const stopText = document.getElementById("stopText");

  // Hides the buttons containers
  const stopContainer = document.getElementById("stopContainer");
  const startContainer = document.getElementById("startContainer");
  startContainer.style.display = "none";
  stopContainer.style.display = "none";

  // Fetches the current test name, and displays either a container or an error message if something fails
  fetch(BASE_URL + "/get-current-test-name")
    .then((response) => {
      if (!response.ok) {
        throw new Error();
      }
      return response.json();
    })
    .then((data) => {
      if (data.currentTestName) {
        stopContainer.style.display = "flex";
        stopText.textContent = `The test ${data.currentTestName} is currently in progress.`;
      } else {
        startContainer.style.display = "flex";
      }
    })
    .catch((error) => {
      const statusErrorMessage = document.getElementById("statusErrorMessage");
      statusErrorMessage.style.display = "block";
      statusErrorMessage.textContent =
        "The current test status couldn't be retrieved. Try reloading the page, or checking the server status.";
    });
};

/**
 * Displays the graph for the selected test name on the page.
 */
const getGraph = () => {
  // Hide any error message
  const errorMessage = document.getElementById("errorMessage");
  errorMessage.style.display = "none";

  // Remove any graph being displayed
  const targetDiv = document.getElementById("plotContainer");
  if (targetDiv.firstChild) {
    targetDiv.removeChild(targetDiv.firstChild);
  }

  // Show the selected graph, or display an error message if something fails
  const testSelector = document.getElementById("testSelector");
  const testName = testSelector.options[testSelector.selectedIndex]?.value;
  const newImage = document.createElement("img");
  newImage.src = `${BASE_URL}/records/${testName}`;
  targetDiv.appendChild(newImage);
  newImage.onerror = () => {
    newImage.remove();
    errorMessage.style.display = "block";
    errorMessage.textContent =
      "The graph couldn't be loaded. Try reloading the page, or checking the server status.";
  };
};

// Fetches the tests names list and the current test status when the page is loaded.
window.onload = () => {
  fetchTestList();
  fetchTestStatus();
};
