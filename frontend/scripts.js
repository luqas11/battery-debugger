// Base URL of the backend
const BASE_URL = 'http://192.168.0.11:3000'

/**
 * Fetches the tests names list from the backend, and loads it into the test selector.
 */
const fetchTestList = () => {
    fetch(BASE_URL + "/get-test-list").then(response => {
        if (!response.ok) {
            throw new Error();
        }
        return response.json();
    })
    .then(data => {
        const testSelector = document.getElementById("testSelector");
        data.testNames.forEach((element, index, array) =>{
            const newOption = document.createElement("option");
            newOption.value = element;
            newOption.textContent = element;
            testSelector.appendChild(newOption);
        });
        testSelector.removeAttribute("disabled");  
    })
    .catch(error => {
        const errorMessage = document.getElementById("errorMessage");
        errorMessage.style.display = "block";
        errorMessage.textContent  = "The test list couldn't be retrieved. Try reloading the page, or checking the server status.";
    });
};

/**
 * Displays the graph for the selected test name on the page.
 */
const getGraph = () => {
    // Hide all error messages
    const errorMessage = document.getElementById("errorMessage");
    errorMessage.style.display = "none";

    // Remove any graph being displayed
    const targetDiv = document.getElementById("plotContainer");
    if (targetDiv.firstChild) {
        targetDiv.removeChild(targetDiv.firstChild);                
    }

    // Show the selected graph
    const testSelector = document.getElementById("testSelector");
    const testName = testSelector.options[testSelector.selectedIndex]?.value;
    const newImage = document.createElement("img");
    newImage.src = `${BASE_URL}/records/${testName}`;  
    targetDiv.appendChild(newImage);
    newImage.onerror = () => {
        newImage.remove();
        errorMessage.style.display = "block";
        errorMessage.textContent  = "The graph couldn't be loaded. Try reloading the page, or checking the server status.";
    };
}

fetchTestList();
