from flask import Flask, render_template, request, jsonify
from transformers import BartTokenizer, BartForConditionalGeneration

app = Flask(__name__)

# Load model and tokenizer once at startup
print("Loading BART model and tokenizer...")
path = "KomeijiForce/bart-large-emojilm"
tokenizer = BartTokenizer.from_pretrained(path)
generator = BartForConditionalGeneration.from_pretrained(path)
print("BART model loaded successfully!")


def text_to_emoji(sentence):
    """Convert text to emojis using BART-based emoji language model."""
    inputs = tokenizer(sentence, return_tensors="pt")
    
    generated_ids = generator.generate(
        inputs["input_ids"], 
        num_beams=4, 
        do_sample=True, 
        max_length=100
    )
    
    decoded = tokenizer.decode(generated_ids[0], skip_special_tokens=True).replace(" ", "")
    return decoded


@app.route('/')
def index():
    """Serve the main HTML page."""
    return render_template('index.html')


@app.route('/convert', methods=['POST'])
def convert():
    """API endpoint to convert text to emojis."""
    data = request.json
    text = data.get('text', '')
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400
    
    try:
        emojis = text_to_emoji(text)
        return jsonify({'emojis': emojis})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=4000)
