import os
import json
import random
from datetime import datetime


def process_word_lists(base_dir):
    levels = {}
    total_words = 0

    for level in range(1, 14):  # 13 levels
        levels[str(level)] = {"words": [], "bonus": []}

        # Process regular words
        words_dir = os.path.join(base_dir, "words")
        for section in range(1, 20):  # Assuming max 19 sections per level
            filename = f"{level}-{section}.txt"
            file_path = os.path.join(words_dir, filename)
            if os.path.exists(file_path):
                with open(file_path, 'r') as f:
                    words = f.read().splitlines()
                    levels[str(level)]["words"].extend(words)
                    total_words += len(words)

        # Shuffle the words within the level
        random.shuffle(levels[str(level)]["words"])

        # Process bonus words
        bonus_dir = os.path.join(base_dir, "bonus")
        for section in range(1, 7):  # Assuming max 6 bonus sections per level
            filename = f"{level}-{section}.txt"
            file_path = os.path.join(bonus_dir, filename)
            if os.path.exists(file_path):
                with open(file_path, 'r') as f:
                    words = f.read().splitlines()
                    levels[str(level)]["bonus"].extend(words)
                    total_words += len(words)

        # Shuffle the bonus words within the level
        random.shuffle(levels[str(level)]["bonus"])

    word_list_data = {
        "levels": levels,
        "metadata": {
            "totalLevels": 13,
            "totalWords": total_words,
            "lastUpdated": datetime.now().isoformat() + "Z"
        }
    }

    return word_list_data


if __name__ == "__main__":
    base_dir = "./"
    word_list_data = process_word_lists(base_dir)

    with open("word_lists.json", "w") as f:
        json.dump(word_list_data, f, indent=2)

    print(f"Word lists processed. Total words: {word_list_data['metadata']['totalWords']}")
