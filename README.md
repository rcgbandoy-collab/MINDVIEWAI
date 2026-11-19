# EYEWISE AI — Capstone Prototype

A Flask + HTML/CSS/JavaScript prototype for guided preliminary vision-screening activities.

## Features
- Guided visual acuity symbol activity with separate left/right eye flow and explicit cover-the-other-eye instructions.
- Generated color-dot pattern identification activity.
- Progressive contrast-symbol activity.
- Subjective radial-line observation activity.
- Session dashboard, completion states, result cards, print-friendly report.
- AI-assisted report endpoint: uses the OpenAI Chat Completions API when `OPENAI_API_KEY` is configured; otherwise uses a transparent built-in analysis fallback.

## Run locally (Windows PowerShell)
1. Install Python 3.10+.
2. Open this folder in VS Code.
3. Create a virtual environment:
   ```powershell
   py -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```
4. Install dependencies:
   ```powershell
   python -m pip install -r requirements.txt
   ```
5. Optional: copy `.env.example` to `.env` and add your own API key. Never publish the `.env` file or commit your API key to GitHub.
6. Start:
   ```powershell
   python app.py
   ```
7. Open `http://127.0.0.1:5000`.

## AI integration
Without an API key, `/api/analyze` uses a deterministic local analysis engine. With a valid key in `.env`, it sends the session's test response summary to the configured OpenAI model and returns cautious, non-diagnostic explanatory insights.

## Important clinical and academic limitations
This is an educational prototype, not a validated medical device. The acuity activity uses symbols at CSS pixel sizes and does not calibrate physical optotype size, viewing distance, or display pixel density; it must not report Snellen fractions or prescribe lenses. Color patterns are procedurally generated and are not standardized Ishihara plates. Contrast levels are illustrative, not calibrated contrast sensitivity measurements. The radial-line activity is subjective. A proper clinical implementation requires validated test protocols, calibrated displays, controlled viewing distance/lighting, accessibility testing, privacy safeguards, and review by qualified eye-care professionals.

Do not use this prototype to diagnose or rule out any eye condition.
