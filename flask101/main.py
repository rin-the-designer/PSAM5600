from flask import Flask, render_template, jsonify, request
from transformers import pipeline

app = Flask(__name__)

text_classifer = pipeline("sentiment-analysis")


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/classify_text")
def classify_text():
    text = request.args.get("text")
    results = text_classifer(text)
    return jsonify(results)


@app.route("/hello")
def hello():
    return "hello again!"