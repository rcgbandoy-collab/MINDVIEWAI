import os, json
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
import requests

load_dotenv()
app = Flask(__name__)

@app.get("/")
def home():
    return render_template("index.html")

def local_insights(data):
    """Transparent fallback analysis for offline/demo use; not a medical diagnosis."""
    tests = data.get("tests", {})
    notes = []
    acuity = tests.get("acuity", {})
    if acuity:
        left = acuity.get("left", {}).get("correct", 0)
        right = acuity.get("right", {}).get("correct", 0)
        total_l = acuity.get("left", {}).get("total", 0)
        total_r = acuity.get("right", {}).get("total", 0)
        if total_l and total_r:
            notes.append(
                f"Visual acuity task: left eye {left}/{total_l} correct; "
                f"right eye {right}/{total_r} correct. These are task results, "
                "not a Snellen prescription or clinical acuity measurement."
            )
            if abs((left/total_l) - (right/total_r)) >= 0.25:
                notes.append("There was a noticeable difference between the two eye-task scores. Consider a professional eye examination.")
    color = tests.get("color", {})
    if color:
        notes.append(f"Color-pattern task: {color.get('correct', 0)}/{color.get('total', 0)} responses matched the displayed patterns.")
        if color.get("correct", 0) < color.get("total", 0):
            notes.append("Some color-pattern items were missed. Display calibration, brightness, and lighting can affect this task.")
    contrast = tests.get("contrast", {})
    if contrast:
        notes.append(f"Contrast task: {contrast.get('correct', 0)}/{contrast.get('total', 0)} responses correct.")
    astig = tests.get("astigmatism", {})
    if astig:
        notes.append("Radial-line task response: " + astig.get("response", "not recorded") + ". This subjective activity cannot determine astigmatism.")
    if not notes:
        notes.append("Complete one or more screening activities to receive a summary.")
    return {
        "headline": "Screening summary prepared",
        "observations": notes,
        "recommendations": [
            "Treat these results as preliminary self-screening information only.",
            "Repeat tests in a well-lit room with a clean screen and consistent viewing distance.",
            "Arrange a comprehensive examination with an optometrist or ophthalmologist if you have concerns, symptoms, or inconsistent results."
        ],
        "source": "Built-in analysis engine (offline fallback)"
    }

@app.post("/api/analyze")
def analyze():
    data = request.get_json(silent=True) or {}
    fallback = local_insights(data)
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        return jsonify(fallback)

    prompt = (
        "You are an educational vision-screening report assistant, not a clinician. "
        "Do not diagnose, estimate prescription, or claim a test confirms a condition. "
        "Explain only the supplied task results, mention display/distance limitations, "
        "and recommend professional eye care for concerns. Return valid JSON with keys "
        "headline (string), observations (array of strings), recommendations (array of strings). "
        "Keep it concise, calm, and understandable. Data: " + json.dumps(data)
    )
    try:
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={
                "model": os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
                "messages": [
                    {"role": "system", "content": "You produce cautious, non-diagnostic vision screening explanations."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.2
            },
            timeout=25
        )
        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"]
        start, end = content.find("{"), content.rfind("}")
        result = json.loads(content[start:end+1])
        result["source"] = "OpenAI API"
        return jsonify(result)
    except Exception:
        fallback["source"] = "Built-in analysis engine (AI service unavailable; fallback used)"
        return jsonify(fallback)

if __name__ == "__main__":
    app.run(debug=True)
