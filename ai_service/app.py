from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import json
import io
import os

app = Flask(__name__)
# Enabling CORS so your Node.js and React apps can communicate with this API
CORS(app)

# 1. Configuration and Model Loading
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
MODEL_PATH = 'food_model_final.pth'
MAPPING_PATH = 'food_classes.json'

# Load the nutrition mapping from the JSON file
if os.path.exists(MAPPING_PATH):
    with open(MAPPING_PATH, 'r') as f:
        label_mapping = json.load(f)
else:
    print(f"ERROR: {MAPPING_PATH} not found!")

# Function to initialize and load the ResNet18 model
def load_trained_model():
    # Use pretrained=False since we are loading our own weights
    model = models.resnet18(pretrained=False)
    num_ftrs = model.fc.in_features
    # Setting the final layer to 20 classes as per your dataset
    model.fc = nn.Linear(num_ftrs, 20) 
    
    if os.path.exists(MODEL_PATH):
        model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
        model.to(DEVICE)
        model.eval()
        print("SUCCESS: Model weights loaded successfully.")
    else:
        print(f"ERROR: {MODEL_PATH} not found!")
        
    return model

model = load_trained_model()

# 2. Image Preprocessing (Standard ResNet Transformations)
def transform_image(image_bytes):
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    return transform(image).unsqueeze(0).to(DEVICE)

# 3. Prediction Route
@app.route('/predict', methods=['POST'])
def predict():
    # Check if an image file was uploaded
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded. Please upload an image with the key 'file'."}), 400

    file = request.files['file']
    img_bytes = file.read()
    
    try:
        # Preprocess the image and get prediction
        input_tensor = transform_image(img_bytes)
        with torch.no_grad():
            outputs = model(input_tensor)
            _, predicted = torch.max(outputs, 1)
            prediction_id = str(predicted.item())

        # Retrieve nutrition details from our JSON mapping
        result = label_mapping.get(prediction_id)

        if result:
            return jsonify({
                "status": "success",
                "prediction": result
            })
        else:
            return jsonify({"error": "Prediction successful but ID details not found in JSON."}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 4. Health Check Route
@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"message": "AI Food Recognition Service is Live!"})

if __name__ == '__main__':
    print("Starting AI Service on http://localhost:5000...")
    app.run(host='0.0.0.0', port=5000, debug=True)