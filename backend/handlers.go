package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"regexp"
	"strings"
	"time"
)

var validNameRegexp = regexp.MustCompile(`^[a-zA-Z0-9_]+$`)

func writeJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(body)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"message": message})
}

// GET /get-current-test
func handleGetCurrentTest(w http.ResponseWriter, r *http.Request) {
	name, err := getCurrentTestName()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "An unexpected error has occurred.")
		return
	}

	if name == "" {
		writeJSON(w, http.StatusOK, map[string]string{"currentTestName": ""})
		return
	}

	metadata, err := readTestMetadata(name)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "An unexpected error has occurred.")
		return
	}

	readings, err := readLastReadings(name, 5)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "An unexpected error has occurred.")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"currentTestName": name,
		"metadata":        metadata,
		"lastReadings":    readings,
	})
}

// GET /get-test-list
func handleGetTestList(w http.ResponseWriter, r *http.Request) {
	entries, err := os.ReadDir(recordsDir)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "An unexpected error has occurred.")
		return
	}

	testNames := []string{}
	for _, entry := range entries {
		name := entry.Name()
		if entry.IsDir() || !strings.HasSuffix(name, ".csv") || strings.HasPrefix(name, currentPrefix) {
			continue
		}
		testNames = append(testNames, strings.TrimSuffix(name, ".csv"))
	}

	writeJSON(w, http.StatusOK, map[string]any{"testNames": testNames})
}

// POST /save-reading
func handleSaveReading(w http.ResponseWriter, r *http.Request) {
	currentTestName, err := getCurrentTestName()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "An unexpected error has occurred.")
		return
	}

	if currentTestName == "" {
		writeError(w, http.StatusBadRequest, "No test is currently in progress. To start one, use /start-test.")
		return
	}

	var body struct {
		Time    *float64 `json:"time"`
		Voltage *float64 `json:"voltage"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Time == nil || body.Voltage == nil {
		writeError(w, http.StatusBadRequest, "Invalid reading value/s. Time and voltage must be numbers.")
		return
	}

	file, err := os.OpenFile(csvFileName(currentTestName), os.O_APPEND|os.O_WRONLY, 0644)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "An unexpected error has occurred. The reading was not saved.")
		return
	}
	defer file.Close()

	content := fmt.Sprintf("%v,%v\n", *body.Time, *body.Voltage)
	if _, err := file.WriteString(content); err != nil {
		writeError(w, http.StatusInternalServerError, "An unexpected error has occurred. The reading was not saved.")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"message": "Reading saved to the test \"" + currentTestName + "\".",
	})
}

// POST /start-test
func handleStartTest(w http.ResponseWriter, r *http.Request) {
	currentTestName, err := getCurrentTestName()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "An unexpected error has occurred.")
		return
	}

	if currentTestName != "" {
		writeError(w, http.StatusBadRequest, "Test \""+currentTestName+"\" is currently in progress. To stop it, use /end-test.")
		return
	}

	var body struct {
		Name    string   `json:"name"`
		Date    string   `json:"date"`
		Current *float64 `json:"current"`
		Age     *float64 `json:"age"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body.")
		return
	}

	if body.Name == "" || !validNameRegexp.MatchString(body.Name) {
		writeError(w, http.StatusBadRequest, "Invalid test name. It must be a non-empty string, and can only contain letters, numbers and underscores.")
		return
	}

	if _, err := time.Parse("2006-01-02", body.Date); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid date. It must be a string with format YYYY-MM-DD.")
		return
	}

	if body.Current == nil || body.Age == nil {
		writeError(w, http.StatusBadRequest, "Invalid current/age value/s. They must be numbers.")
		return
	}

	available, err := isTestNameAvailable(body.Name)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "An unexpected error has occurred.")
		return
	}
	if !available {
		writeError(w, http.StatusBadRequest, "A test with name \""+body.Name+"\" already exists.")
		return
	}

	if err := os.WriteFile(csvFileName(body.Name), []byte("Time,Voltage\n"), 0644); err != nil {
		writeError(w, http.StatusInternalServerError, "An unexpected error has occurred. The test has not started.")
		return
	}

	metadata := TestMetadata{Date: body.Date, Current: *body.Current, Age: *body.Age}
	metadataBytes, err := json.Marshal(metadata)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "An unexpected error has occurred. The test has not started.")
		return
	}
	if err := os.WriteFile(jsonFileName(body.Name), metadataBytes, 0644); err != nil {
		writeError(w, http.StatusInternalServerError, "An unexpected error has occurred. The test has not started.")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"message": "New test started with name \"" + body.Name + "\".",
	})
}

// POST /end-test
func handleEndTest(w http.ResponseWriter, r *http.Request) {
	currentTestName, err := getCurrentTestName()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "An unexpected error has occurred.")
		return
	}

	if currentTestName == "" {
		writeError(w, http.StatusBadRequest, "No test is currently in progress.")
		return
	}

	if err := os.Rename(csvFileName(currentTestName), finalCSVFileName(currentTestName)); err != nil {
		writeError(w, http.StatusInternalServerError, "An unexpected error has occurred. The test has not stopped.")
		return
	}

	if err := os.Rename(jsonFileName(currentTestName), finalJSONFileName(currentTestName)); err != nil {
		writeError(w, http.StatusInternalServerError, "An unexpected error has occurred. The test has not stopped.")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"message": "Test with name \"" + currentTestName + "\" has been stopped.",
	})
}
