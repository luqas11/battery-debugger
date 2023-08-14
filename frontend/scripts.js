/**
 * Function to validate the test name input and display the graph for the given test name on the page.
 */
function getGraph() {
    // Hide all error messages
    const errorMessage = document.getElementById("errorMessage");
    errorMessage.style.display = "none";

    // Validate and sanitize the test name input
    const testName = document.getElementById('nameInput').value
    const validationRegex = /[^\w\d.]/;
    if (!testName || typeof testName !== "string" || testName.length === 0 || validationRegex.test(testName)) {
        errorMessage.style.display = "block";
        errorMessage.textContent  = "Invalid graph name. The name can only contain letters, numbers and underscores.";
        return;
    }

    // Remove any graph being displayed
    const targetDiv = document.getElementById("plotContainer");
    if (targetDiv.firstChild) {
        targetDiv.removeChild(targetDiv.firstChild);                
    }

    // Show the selected graph
    const newImage = document.createElement("img");
    newImage.src = `../records/${testName}.png`;  
    targetDiv.appendChild(newImage);
    newImage.onerror = () => {
        newImage.remove();
        errorMessage.style.display = "block";
        errorMessage.textContent  = "The graph couldn't be loaded. Maybe the file doesn't exists, or there is a problem in the connection with the server.";
    };
}
