package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	_ "github.com/lib/pq"
)

// Структура данных
type Feedback struct {
	Message string `json:"message"`
}

var db *sql.DB

func main() {
	// 1. Подключение к БД (замени user, password и dbname на свои)
	connStr := "user=postgres password=123 dbname=traffic_db sslmode=disable"
	var err error
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}

	// 2. Роут для API
	http.HandleFunc("/api/feedback", handleFeedback)

	fmt.Println("Server started at :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func handleFeedback(w http.ResponseWriter, r *http.Request) {
	// Разрешаем CORS (чтобы фронтенд мог достучаться)
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		return
	}

	if r.Method == "POST" {
		var f Feedback
		err := json.NewDecoder(r.Body).Decode(&f)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Запись в PostgreSQL
		_, err = db.Exec("INSERT INTO feedbacks (content) VALUES ($1)", f.Message)
		if err != nil {
			log.Println("DB Error:", err)
			http.Error(w, "Ошибка БД", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		fmt.Fprint(w, "OK")
	}
}
