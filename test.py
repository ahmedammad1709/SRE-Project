import google.generativeai as genai

# Put your Google Gemini API key here
genai.configure(api_key="AIzaSyAYsv2Jw8OAaZIp2DynQ9QzDYpElNRHdKE")

# Load a model
model = genai.GenerativeModel("gemini-2.0-flash")

# Test the API
response = model.generate_content("Say Hello Wolrd.")

print(response.text)