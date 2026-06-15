package main

import (
	"log"
	"net/http"
	"os"
)

func main() {
	recordsDir, frontendDir := resolveDirs()

	if err := generateData(recordsDir, frontendDir); err != nil {
		log.Fatal(err)
	}

	if len(os.Args) > 1 && os.Args[1] == "generate-data" {
		return
	}

	host := os.Getenv("HOST")
	port := os.Getenv("PORT")
	if port == "" {
		port = "8001"
	}
	addr := host + ":" + port

	log.Printf("Serving %s on %s", frontendDir, addr)
	if err := http.ListenAndServe(addr, http.FileServer(http.Dir(frontendDir))); err != nil {
		log.Fatal(err)
	}
}
