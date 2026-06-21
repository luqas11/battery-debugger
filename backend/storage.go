package main

import (
	"encoding/csv"
	"encoding/json"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

const currentPrefix = "current_"

// recordsDir is the path to the records directory, resolved relative to the
// current working directory. This allows the binary to be run either from
// the backend/ directory (e.g. `go run .`) or from backend/binaries/
// (where the prebuilt binaries live), in both cases finding records/ at the
// project root.
var recordsDir = resolveRecordsDir()

func resolveRecordsDir() string {
	for _, candidate := range []string{"../records", "../../records"} {
		if info, err := os.Stat(candidate); err == nil && info.IsDir() {
			return candidate
		}
	}
	// Fall back to the development layout; this will surface a clear
	// "no such file or directory" error if records/ can't be found.
	return "../records"
}

// TestMetadata is the content of a <name>.json file.
type TestMetadata struct {
	Date      string  `json:"date"`
	Current   float64 `json:"current"`
	Age       float64 `json:"age"`
	Outlier   bool    `json:"outlier"`
	StartTime int64   `json:"startTime,omitempty"`
}

// Reading is a single Time/Voltage pair read from a test's CSV file.
type Reading struct {
	Time    float64 `json:"time"`
	Voltage float64 `json:"voltage"`
}

func csvFileName(name string) string {
	return filepath.Join(recordsDir, currentPrefix+name+".csv")
}

func jsonFileName(name string) string {
	return filepath.Join(recordsDir, currentPrefix+name+".json")
}

func finalCSVFileName(name string) string {
	return filepath.Join(recordsDir, name+".csv")
}

func finalJSONFileName(name string) string {
	return filepath.Join(recordsDir, name+".json")
}

// getCurrentTestName returns the name of the test currently in progress.
// If none is in progress, it returns an empty string.
func getCurrentTestName() (string, error) {
	entries, err := os.ReadDir(recordsDir)
	if err != nil {
		return "", err
	}

	for _, entry := range entries {
		name := entry.Name()
		if !entry.IsDir() && strings.HasPrefix(name, currentPrefix) && strings.HasSuffix(name, ".csv") {
			return strings.TrimSuffix(strings.TrimPrefix(name, currentPrefix), ".csv"), nil
		}
	}

	return "", nil
}

// isTestNameAvailable reports whether a finished test with the given name already exists.
func isTestNameAvailable(name string) (bool, error) {
	_, err := os.Stat(finalCSVFileName(name))
	if os.IsNotExist(err) {
		return true, nil
	}
	if err != nil {
		return false, err
	}
	return false, nil
}

// readTestMetadata reads and parses the current_<name>.json file.
func readTestMetadata(name string) (TestMetadata, error) {
	var metadata TestMetadata

	content, err := os.ReadFile(jsonFileName(name))
	if err != nil {
		return metadata, err
	}

	if err := json.Unmarshal(content, &metadata); err != nil {
		return metadata, err
	}

	return metadata, nil
}

// readLastReadings reads the current_<name>.csv file and returns the last n readings.
func readLastReadings(name string, n int) ([]Reading, error) {
	file, err := os.Open(csvFileName(name))
	if err != nil {
		return nil, err
	}
	defer file.Close()

	reader := csv.NewReader(file)
	rows, err := reader.ReadAll()
	if err != nil {
		return nil, err
	}

	// Skip the header row, if present.
	if len(rows) > 0 {
		rows = rows[1:]
	}

	if len(rows) > n {
		rows = rows[len(rows)-n:]
	}

	readings := make([]Reading, 0, len(rows))
	for _, row := range rows {
		if len(row) < 2 {
			continue
		}

		time, err := strconv.ParseFloat(row[0], 64)
		if err != nil {
			continue
		}

		voltage, err := strconv.ParseFloat(row[1], 64)
		if err != nil {
			continue
		}

		readings = append(readings, Reading{Time: time, Voltage: voltage})
	}

	return readings, nil
}
