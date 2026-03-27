import random
import os
import io
import json
from PIL import Image
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY and GEMINI_API_KEY != "your_gemini_api_key_here":
    genai.configure(api_key=GEMINI_API_KEY)


def recommend_crop(soil_ph, temp, humidity, rainfall, soil_type):
    # Rule based mapping
    crops = ["Rice", "Wheat", "Corn", "Cotton", "Sugarcane", "Tomato", "Potato"]
    selected = random.choice(crops)
    confidence = round(random.uniform(70.0, 98.0), 2)
    return {"crop": selected, "confidence": confidence, "explanation": f"{selected} thrives in the given conditions with {soil_type} soil."}

def recommend_fertilizer(crop, soil_ph):
    return {
        "fertilizer": "NPK 10-26-26" if soil_ph < 6 else "Urea",
        "amount": "50 kg/acre",
        "advice": "Apply evenly and ensure adequate watering post-application."
    }

def detect_disease(image_bytes):
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
        return {"error": "API key required! Please add your Gemini API Key in the .env file."}
    
    try:
        image = Image.open(io.BytesIO(image_bytes))
        model = genai.GenerativeModel("gemini-2.5-flash")
        prompt = '''
        Analyze this plant image. Identify any disease present.
        If it's healthy, identify as "Healthy".
        Return ONLY a JSON response in this exact format:
        {"disease": "Name", "confidence": 95.5, "treatment": "Short instruction"}
        '''
        response = model.generate_content([prompt, image])
        text = response.text.replace('```json', '').replace('```', '').strip()
        data = json.loads(text)
        
        # Ensure correct keys
        if "disease" not in data or "confidence" not in data or "treatment" not in data:
            raise ValueError("Invalid JSON format from AI")
            
        return data
    except Exception as e:
        print(f"Disease detection error: {e}")
        return {"disease": "Error detecting disease", "confidence": 0, "treatment": str(e)}

def generate_crop_tasks(crop_name):
    # Simulated AI Task Generation
    crop = crop_name.lower().strip()
    if "rice" in crop or "paddy" in crop:
        return [
            f"Check water level in {crop.title()} field (keep 5cm standing water)",
            f"Inspect {crop.title()} for stem borer signs",
            f"Apply nitrogen top-dressing to {crop.title()}"
        ]
    elif "wheat" in crop:
        return [
            f"Look for rust disease on {crop.title()} leaves",
            f"Schedule irrigation if soil is dry for {crop.title()}",
            f"Pull weeds around {crop.title()} borders"
        ]
    else:
        return [
            f"Monitor soil moisture for {crop.title()}",
            f"Check {crop.title()} leaves for pests",
            f"Clear weeds around {crop.title()} plants",
            f"Prepare appropriate fertilizer for {crop.title()}"
        ]
