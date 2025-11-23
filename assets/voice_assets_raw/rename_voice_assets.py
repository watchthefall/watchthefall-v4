import whisper
import os
import re

# Settings: adjust the folder path below to the location of your MP3 files.
# For example: r"C:\\Users\\Jamie\\OneDrive\\Desktop\\WTF_audio\\voice_assets_raw"
FOLDER = r"C:/Users/Jamie/OneDrive/Desktop/WTF_audio/voice_assets_raw"

# Choose the Whisper model size. Options include: tiny, base, small, medium, large
MODEL_SIZE = "base"


def slugify(text: str, max_words: int = 5) -> str:
    """Convert a transcript into a filename-friendly slug using the first few words."""
    text = text.lower()
    # Remove non-alphanumeric characters except spaces
    text = re.sub(r"[^a-z0-9\s]", "", text)
    words = [w for w in text.split() if w]  # filter empty strings
    return "_".join(words[:max_words]) if words else ""


def transcribe_and_rename(folder: str) -> None:
    """Transcribe each MP3 in the folder and rename it based on the first few words."""
    # Load Whisper model once
    model = whisper.load_model(MODEL_SIZE)
    files = [f for f in os.listdir(folder) if f.lower().endswith(".mp3")]
    counter = 1
    for filename in files:
        full_path = os.path.join(folder, filename)
        print(f"Processing {filename}...")
        # Transcribe the audio
        result = model.transcribe(full_path, fp16=False)
        transcript = result.get("text", "").strip()
        # Generate a slug from the first few words
        slug = slugify(transcript)
        if not slug:
            slug = f"clip_{counter}"
        # Build new filename with zero-padded counter
        new_name = f"{counter:02d}_{slug}.mp3"
        new_full_path = os.path.join(folder, new_name)
        # Save transcript to .txt
        transcript_path = os.path.join(folder, f"{counter:02d}_{slug}.txt")
        with open(transcript_path, "w", encoding="utf-8") as t:
            t.write(transcript)
        # Rename the MP3 file
        os.rename(full_path, new_full_path)
        print(f"Renamed to {new_name}")
        counter += 1
    print("\nAll files processed and renamed.")


if __name__ == "__main__":
    # Ensure the folder exists
    if not os.path.isdir(FOLDER):
        raise SystemExit(f"The folder '{FOLDER}' does not exist. Adjust the FOLDER path in the script.")
    transcribe_and_rename(FOLDER)