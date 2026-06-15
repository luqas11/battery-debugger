package main

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
	"os"
)

//go:embed web
var webDir embed.FS

func logger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Println(r.Method, r.URL.Path)
		next.ServeHTTP(w, r)
	})
}

func main() {
	mux := http.NewServeMux()

	webFS, err := fs.Sub(webDir, "web")
	if err != nil {
		log.Fatal(err)
	}
	mux.Handle("/", http.FileServerFS(webFS))

	mux.HandleFunc("GET /get-current-test", handleGetCurrentTest)
	mux.HandleFunc("GET /get-test-list", handleGetTestList)
	mux.HandleFunc("POST /save-reading", handleSaveReading)
	mux.HandleFunc("POST /start-test", handleStartTest)
	mux.HandleFunc("POST /end-test", handleEndTest)

	host := os.Getenv("HOST")
	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	addr := host + ":" + port
	log.Printf("Listening on %s", addr)
	if err := http.ListenAndServe(addr, logger(mux)); err != nil {
		log.Fatal(err)
	}
}
