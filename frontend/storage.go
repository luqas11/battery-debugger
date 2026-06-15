package main

import (
	"encoding/json"
	"io"
	"os"
	"path/filepath"
	"strings"
)

const currentPrefix = "current_"

// TestMetadata is the content of a <name>.json file in records/.
type TestMetadata struct {
	Date    string  `json:"date"`
	Current float64 `json:"current"`
	Age     float64 `json:"age"`
}

// ManifestEntry describes a finished test in frontend/data/manifest.json.
type ManifestEntry struct {
	Name    string  `json:"name"`
	Date    string  `json:"date"`
	Current float64 `json:"current"`
	Age     float64 `json:"age"`
}

// Manifest is the content of frontend/data/manifest.json.
type Manifest struct {
	Tests []ManifestEntry `json:"tests"`
}

// resolveDirs locates the records/ directory and the frontend/ directory
// (the one containing index.html), relative to the current working
// directory. This allows the binary to run either from frontend/ (dev,
// `go run .`) or from frontend/binaries/ (prebuilt binaries).
func resolveDirs() (recordsDir, frontendDir string) {
	if _, err := os.Stat("index.html"); err == nil {
		return "../records", "."
	}
	return "../../records", ".."
}

// generateData copies finished tests from recordsDir into
// <frontendDir>/data and writes data/manifest.json.
func generateData(recordsDir, frontendDir string) error {
	dataDir := filepath.Join(frontendDir, "data")

	if err := os.RemoveAll(dataDir); err != nil {
		return err
	}
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		return err
	}

	entries, err := os.ReadDir(recordsDir)
	if err != nil {
		return err
	}

	var manifest Manifest

	for _, entry := range entries {
		name := entry.Name()
		if entry.IsDir() || strings.HasPrefix(name, currentPrefix) || !strings.HasSuffix(name, ".json") {
			continue
		}

		testName := strings.TrimSuffix(name, ".json")
		csvName := testName + ".csv"

		if _, err := os.Stat(filepath.Join(recordsDir, csvName)); err != nil {
			continue
		}

		content, err := os.ReadFile(filepath.Join(recordsDir, name))
		if err != nil {
			return err
		}

		var metadata TestMetadata
		if err := json.Unmarshal(content, &metadata); err != nil {
			return err
		}

		if err := copyFile(filepath.Join(recordsDir, name), filepath.Join(dataDir, name)); err != nil {
			return err
		}
		if err := copyFile(filepath.Join(recordsDir, csvName), filepath.Join(dataDir, csvName)); err != nil {
			return err
		}

		manifest.Tests = append(manifest.Tests, ManifestEntry{
			Name:    testName,
			Date:    metadata.Date,
			Current: metadata.Current,
			Age:     metadata.Age,
		})
	}

	manifestJSON, err := json.MarshalIndent(manifest, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(filepath.Join(dataDir, "manifest.json"), manifestJSON, 0644)
}

func copyFile(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()

	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, in)
	return err
}
