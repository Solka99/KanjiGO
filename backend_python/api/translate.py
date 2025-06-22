# Import the necessary libraries
from fastapi import APIRouter, HTTPException
from googletrans import Translator

# Create an APIRouter instance
router = APIRouter()

# Create a Translator instance once and reuse it to improve efficiency
translator = Translator()

# --- Define the translation endpoint ---
# The text to be translated is now part of the URL path itself.
# {text_to_translate} is a "path parameter".
@router.get("/translate/{text_to_translate}")
def translate_japanese_to_english(text_to_translate: str):
    """
    An endpoint that receives text as a path parameter
    and returns its English translation.
    """
    source_text = text_to_translate

    # Return an error if the input text is empty
    if not source_text.strip():
        raise HTTPException(status_code=400, detail="Text to translate cannot be empty.")

    try:
        # Execute the translation using the googletrans library
        result = translator.translate(source_text, src='ja', dest='en')

        # Return the translation result in JSON format
        return {"translated_text": result.text}

    except Exception as e:
        # If any error occurs during translation
        print(f"An error occurred during translation: {e}")
        raise HTTPException(status_code=500, detail="Translation failed due to an internal error.")