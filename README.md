# FarmMate - AI Smart Farming Assistant

FarmMate is a production-ready, full-stack AI farming assistant application. It provides real-time, AI-driven agricultural advice to help farmers optimize their crop yields, monitor farming activities, and detect plant diseases.

## 🚀 Features Implemented

* **AI Crop Recommendation:** Recommends the best crop to plant based on soil pH, temperature, humidity, rainfall, and soil type.
* **AI Fertilizer Recommendation:** Provides tailored fertilizer suggestions based on the crop and soil pH.
* **Crop Disease Detection:** Analyzes plant images to detect diseases and suggests treatments.
* **Agriculture AI Chatbot:** An intelligent farming assistant powered by the Google Gemini API, capable of answering farming-related queries with bilingual support.
* **AI-driven Task Management:** Automatically generates specific daily farm tasks based on the tracked crop (e.g., watering schedules, pest inspections). Includes a checklist to track task completion.
* **Weather Info:** Provides real-time weather information optimized for farming activities.
* **Responsive UI:** A modern, clean, and farmer-friendly dashboard using HTML, CSS (Glassmorphism), and JavaScript.

## 🛠️ Technical Stack

**Frontend:**
* HTML5, CSS3, JavaScript
* Modern responsive design
* Clean farmer-friendly UI

**Backend & Data:**
* Python, FastAPI
* SQLite Database (SQLAlchemy ORM)
* REST API Architecture

**AI & External APIs:**
* Google Gemini API (for AI Chatbot and advice)
* Mock/Rule-based AI for predictions (Crop, Fertilizer, Disease)

## ⚙️ Setup & Installation

1. Open the project root folder `FARM-MATE/` in your terminal.
2. Install the necessary dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. Run the application:
   ```bash
   python main.py
   # or
   uvicorn main:app --reload
   ```
5. Open your browser and navigate to `http://127.0.0.1:8000`.