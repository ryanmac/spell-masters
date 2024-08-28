# misspell.py
# Generate misspellings for words based on common phonetic and orthographic errors.
import random
import json
import argparse
# from collections import defaultdict


class MisspellingGenerator:
    def __init__(self):
        self.vowels = 'aeiou'
        self.consonants = 'bcdfghjklmnpqrstvwxyz'
        self.phonetic_subs = {
            # Long 'a' sound
            'ai': ['ay', 'a-e', 'eigh', 'ey', 'i', 'e', 'ea', 'ei', 'a'],
            'ay': ['ai', 'a-e', 'eigh', 'ey', 'i', 'e', 'ea', 'ei'],
            'a-e': ['ai', 'ay', 'eigh', 'ey', 'i', 'e', 'ea', 'ei'],
            'aigh': ['ay', 'a-e', 'ey', 'eigh', 'ei', 'a', 'i', 'e'],

            # Short 'a' sound
            'a': ['ah', 'ar', 'au', 'aw'],

            # Long 'e' sound
            'ee': ['ea', 'ie', 'ei', 'i', 'ey', 'e', 'y'],
            'ea': ['ee', 'ie', 'ei', 'i', 'ey', 'e', 'y'],
            'ie': ['ee', 'ea', 'ei', 'i', 'ey', 'e', 'y'],

            # Short 'e' sound
            'e': ['eh', 'ae', 'ea'],

            # Long 'i' sound
            'igh': ['i', 'y', 'ie', 'ai', 'a-e'],
            'i': ['igh', 'y', 'ie', 'ai', 'a-e', 'e'],
            'y': ['igh', 'i', 'ie', 'ai', 'a-e'],

            # Short 'i' sound
            # 'i': ['ie', 'y', 'e'],

            # Long 'o' sound
            'oa': ['ow', 'o-e', 'ou', 'oe', 'o'],
            'o-e': ['oa', 'ow', 'ou', 'oe', 'o'],
            'oe': ['oa', 'o-e', 'ou', 'ow', 'o'],

            # Short 'o' sound
            'o': ['au', 'aw', 'ah', 'ough'],

            # Long 'u' sound
            'oo': ['ew', 'ue', 'ou', 'o', 'oe', 'ough', 'ui'],
            'ew': ['oo', 'ue', 'ou', 'o', 'oe', 'ough', 'ui'],
            'ue': ['oo', 'ew', 'ou', 'o', 'oe', 'ough', 'ui'],

            # Short 'u' sound
            'u': ['oo', 'ue', 'ou', 'o', 'oe', 'ough', 'ui'],

            # Consonant sounds
            'ch': ['sh', 'tch', 'k', 'ci', 'ti'],
            'sh': ['ch', 'ci', 'ti', 's'],
            'k': ['c', 'ck', 'q', 'qu', 'x'],
            'g': ['j', 'dg', 'dge', 'gh'],
            'c': ['k', 'ck', 'q', 's', 'x'],
            'dg': ['g', 'dge', 'ge', 'gi', 'd'],
            'dge': ['g', 'dg', 'ge', 'gi', 'd'],
            'qu': ['kw', 'k', 'q'],
            'tch': ['ch', 'ti', 'sh'],
            'ti': ['ch', 'sh', 'ci', 'tch'],
            'ci': ['ch', 'sh', 'ti', 'tch'],
            'si': ['ci', 'shi', 'ce', 'sci', 'ti'],
            'sci': ['ci', 'shi', 'ce', 'si'],
            'shu': ['sh', 'su', 'chu'],
            'ce': ['ci', 'shi', 'si', 'sci'],
            's': ['c', 'z', 'x'],

            # Diphthongs
            'ow': ['ou', 'ough', 'oa', 'o', 'oe', 'ew'],
            'ou': ['ow', 'ough', 'oa', 'o', 'oe', 'ew'],
            'oi': ['oy', 'oy', 'oie', 'oey'],
            'oy': ['oi', 'oie', 'oey'],

            # Silent letters influence
            'kn': ['n'],
            'wr': ['r'],
            'gn': ['n'],
            'mb': ['m'],
            'mn': ['n'],
            'pn': ['n'],
            'gh': [''],
            'h': [''],
            'w': [''],
            'b': [''],

            # Complex vowel sounds
            'au': ['aw', 'ou', 'o', 'ough'],
            'aw': ['au', 'ou', 'o', 'ough'],
            'ough': ['ow', 'ou', 'oa', 'o', 'oe', 'ew'],

            # Miscellaneous
            'ph': ['f'],
            'tion': ['sion', 'cian', 'shun'],
            'sion': ['tion', 'cian', 'shun'],
            'x': ['ks', 'z'],
            'z': ['s', 'x'],
        }
        self.silent_patterns = {
            'kn': 'n', 'gn': 'n', 'wr': 'r', 'mb': 'm', 'mn': 'm', 'pn': 'n',
            'gh': '', 'h': '', 'w': '', 'b': '', 'n': '', 'm': '', 'l': '', 'k': '', 'p': '', 't': '', 'd': '',
            'sc': 's', 'ps': 's', 'pt': 't', 'st': 's', 'ct': 't', 'ph': 'f', 'ch': 'k', 'th': 't', 'wh': 'w',
            'ck': 'k', 'dge': 'j', 'tch': 'ch', 'gn': 'n', 'kn': 'n', 'lm': 'm', 'mn': 'm', 'mb': 'm',
            'pn': 'n', 'ps': 's', 'pt': 't', 'st': 's', 'sc': 's', 'ct': 't', 'wr': 'r', 'rh': 'r', 'ngue': 'ng',
            'gue': 'g', 're': 'er', 'le': 'el', 'ce': 'se', 'ge': 'j', 'se': 's', 'te': 't', 've': 'v', 'ze': 'z',
            'mb': 'm', 'ph': 'f', 'gh': '', 'ch': 'k', 'sh': 's', 'th': 't', 'wh': 'w', 'ck': 'k', 'dge': 'j',
            'mn': 'm', 'kn': 'n', 'gn': 'n', 'lm': 'm', 'ps': 's', 'pt': 't', 'st': 's', 'sc': 's', 'ct': 't',
            'wr': 'r', 'rh': 'r', 'ngue': 'ng', 'gue': 'g', 're': 'er', 'le': 'el', 'ce': 'se', 'ge': 'j', 'se': 's',
            'bt': 't', 'dt': 't', 'ft': 't', 'gt': 't', 'kt': 't', 'lt': 't', 'mt': 't', 'nt': 't', 'pt': 't',
            'tch': 'ch', 'xt': 't', 'bb': 'b', 'cb': 'b', 'db': 'b', 'fb': 'b', 'gb': 'b', 'kb': 'b', 'lb': 'b',
        }
        self.prefixes = ['mis', 'dis', 'un', 'in', 'im', 'il', 'ir', 'non', 'over', 'under', 'sub', 'super', 'semi',
                         'pre', 'post', 'anti', 'de', 're', 'fore', 'mid', 'out', 'extra', 'hyper', 'semi',
                         'ultra', 'auto', 'bi', 'co', 'ex', 'inter', 'macro', 'micro', 'mono', 'multi', 'neo',
                         'poly', 'pro', 'tele']
        self.suffixes = ['able', 'ible', 'ful', 'less', 'ness', 'ly', 'y', 'al', 'ous', 'tion', 'sion', 'ment', 'ity',
                         'ify', 'ize', 'ise', 'en', 'ify', 'ate', 'en', 'ify', 'fy', 'er', 'or', 'ar', 'ist', 'ic',
                         'al', 'ive', 'ous', 'ful', 'less', 'ly', 'y', 'ed', 'ing', 'es', 's', 'er', 'est', 'en']
        self.common_mistakes = {
            'ie': 'ei', 'ei': 'ie',
            'ceed': 'cede', 'sede': 'ceed',
            'ant': 'ent', 'ent': 'ant',
            'ance': 'ence', 'ence': 'ance',
            'able': 'ible', 'ible': 'able',
            'oose': 'ose', 'ose': 'oose', 'oos': 'oose', 'ooze': 'ose', 'oze': 'oose', 'ooz': 'ose',
            'ise': 'ize', 'ize': 'ise', 'ice': 'isz'
        }

    def generate_misspellings(self, word, n=10):
        print("\nMisspelling: ", word)
        misspellings = set()

        # Generate the phonetic representation of the word
        phonetic_form = self.generate_phonetic_representation(word)
        print(f"Phonetic form of '{word}': {phonetic_form}")
        new_words = self.generate_part_misspellings(phonetic_form)
        misspellings.update(new_words)
        print(f"Misspellings from phonetic substitutions: added {len(new_words)}\n{new_words}")

        # Handle words with apostrophes or hyphens
        new_words = []
        parts = word.replace("'", " ").replace("-", " ").split()
        for part in parts:
            new_words.extend(self.generate_part_misspellings(part))
        misspellings.update(new_words)
        print(f"Misspellings from part misspellings: {len(new_words)}\n{new_words}")

        # Recombine parts for multi-word expressions
        if len(parts) > 1:
            new_words = self.recombine_parts(parts, misspellings)
            misspellings.update(new_words)
        print(f"Misspellings from recombined parts: {len(new_words)}\n{new_words}")

        # Filter out implausible misspellings
        misspellings = self.filter_implausible_misspellings(misspellings, word)
        print(f"Misspellings after filtering: {len(misspellings)}\n{misspellings}")

        # Remove duplicates and the original word
        misspellings = list(misspellings - {word})
        print(f"Final misspellings: {len(misspellings)}\n{misspellings}")

        # Filter out misspellings with unusual consonant combinations
        misspellings = self.filter_unusual_combinations(misspellings)
        print(f"Misspellings after filtering unusual combinations: {len(misspellings)}\n{misspellings}")

        # Sort misspellings by plausibility score
        scored_misspellings = [(m, self.plausibility_score(word, m)) for m in misspellings]
        scored_misspellings.sort(key=lambda x: x[1], reverse=True)
        print(f"Misspellings sorted by plausibility score: {len(scored_misspellings)}\n{scored_misspellings}")

        return [m for m, _ in scored_misspellings[:n]]

    def filter_implausible_misspellings(self, misspellings, original):
        plausible = set()
        for misspelling in misspellings:
            if len(misspelling) < 2 or misspelling == original:
                continue
            if misspelling[0] != original[0] or misspelling[-1] != original[-1]:
                continue
            if not self.plausible_consonant_patterns(misspelling):
                continue
            plausible.add(misspelling)
        return plausible

    def plausible_consonant_patterns(self, word):
        # Avoid triple consonants and unusual consonant combinations
        for i in range(len(word) - 2):
            if word[i] == word[i+1] == word[i+2]:
                return False
        return True

    def phonetic_substitutions(self, word):
        result = set()
        for sound, replacements in self.phonetic_subs.items():
            if sound in word:
                for replacement in replacements:
                    new_word = word.replace(sound, replacement)
                    if self.is_phonetically_believable(new_word, sound):
                        result.add(new_word)
        return result

    def is_phonetically_believable(self, misspelling, original_sound):
        # Define a mapping of original sounds to conditions that must be met in the misspelling
        conditions = {
            'ci': 'ci',
            'tion': 'tion',
            'sion': 'sion',
            'ch': 'ch',
            'ph': 'f',
            'dge': 'g',
            'sh': 'sh',
            'ti': 'ti',
            'si': 'si',
            'sci': 'sci',
            'shu': 'shu',
            'ce': 'ce',
            's': 's',
            'x': 'x',
        }

        # Check if the misspelling contains the required sound replacement
        required_sound = conditions.get(original_sound)
        if required_sound and required_sound not in misspelling:
            return False

        return True

    def generate_part_misspellings(self, word):
        misspellings = set()
        misspellings.update(self.phonetic_substitutions(word))
        misspellings.update(self.silent_letter_omissions(word))
        misspellings.update(self.affix_mistakes(word))
        misspellings.update(self.common_mistake_substitutions(word))
        return misspellings

    def recombine_parts(self, parts, misspellings):
        recombined = set()
        for misspelling in misspellings:
            for i, part in enumerate(parts):
                if misspelling != part:
                    new_parts = parts.copy()
                    new_parts[i] = misspelling
                    recombined.add("'".join(new_parts))
                    recombined.add("-".join(new_parts))
        return recombined

    def silent_letter_omissions(self, word):
        result = set()
        for pattern, replacement in self.silent_patterns.items():
            if pattern in word:
                result.add(word.replace(pattern, replacement))
        return result

    def affix_mistakes(self, word):
        result = set()
        for prefix in self.prefixes:
            if word.startswith(prefix):
                result.add(word[len(prefix):])
                result.add(prefix + prefix[-1] + word[len(prefix):])
        for suffix in self.suffixes:
            if word.endswith(suffix):
                result.add(word[:-len(suffix)])
                if suffix in ['able', 'ible']:
                    result.add(word[:-len(suffix)] + ('ible' if suffix == 'able' else 'able'))
        return result

    def common_mistake_substitutions(self, word):
        result = set()
        for mistake, correction in self.common_mistakes.items():
            if mistake in word:
                result.add(word.replace(mistake, correction))
        return result

    def plausibility_score(self, original, misspelled):
        score = 10 - self.levenshtein_distance(original, misspelled)
        if len(misspelled) == len(original):
            score += 1
        if len(misspelled) == len(original) + 1 or len(misspelled) == len(original) - 1:
            score += 1
        if any(sound in misspelled for sound in self.phonetic_subs):
            score += 2
        if any(pattern in misspelled for pattern in self.silent_patterns):
            score += 1
        if any(mistake in misspelled for mistake in self.common_mistakes):
            score += 3
        return max(score, 0)

    def levenshtein_distance(self, s1, s2):
        if len(s1) < len(s2):
            return self.levenshtein_distance(s2, s1)
        if len(s2) == 0:
            return len(s1)
        previous_row = range(len(s2) + 1)
        for i, c1 in enumerate(s1):
            current_row = [i + 1]
            for j, c2 in enumerate(s2):
                insertions = previous_row[j + 1] + 1
                deletions = current_row[j] + 1
                substitutions = previous_row[j] + (c1 != c2)
                current_row.append(min(insertions, deletions, substitutions))
            previous_row = current_row
        return previous_row[-1]

    def filter_unusual_combinations(self, misspellings):
        unusual_combinations = ['jq', 'qj', 'vx', 'xv', 'zx', 'xz', 'fq', 'qf', 'qv', 'vq', 'qz', 'zq']
        return [word for word in misspellings if not any(combo in word.lower() for combo in unusual_combinations)]

    def generate_phonetic_representation(self, word):
        phonetic_map = {
            'ph': 'f',
            'gh': 'f',
            'ck': 'k',
            'ci': 'si',
            'ce': 'se',
            'cy': 'sy',
            'ch': 'ch',  # Sometimes 'k' or 'sh', but 'ch' is most common
            'sh': 'sh',
            'th': 'th',
            'tion': 'shun',
            'sion': 'zhun',
            'dge': 'j',
            'ge': 'j',
            'gi': 'j',
            'gy': 'j',
            'gn': 'n',
            'kn': 'n',
            'wh': 'w',
            'wr': 'r',
            'qu': 'kw',
            'x': 'ks',
            'y': 'i',  # Y can be a vowel sound 'i'
            'oo': 'u',
            'ou': 'ow',
            'ow': 'ow',  # Sometimes 'o'
            'ea': 'ee',
            'ie': 'ee',
            'ei': 'ay',
            'ai': 'ay',
            'ay': 'ay',
            'oi': 'oy',
            'oy': 'oy',
            'au': 'aw',
            'aw': 'aw',
            'a': 'a',   # Can be 'ah', 'ay', etc.
            'e': 'e',   # Can be 'eh', 'ee', etc.
            'i': 'i',   # Can be 'ih', 'eye', etc.
            'o': 'o',   # Can be 'ah', 'oh', etc.
            'u': 'u',   # Can be 'uh', 'oo', etc.
            'b': 'b',
            'd': 'd',
            'f': 'f',
            'g': 'g',
            'h': 'h',
            'j': 'j',
            'k': 'k',
            'l': 'l',
            'm': 'm',
            'n': 'n',
            'p': 'p',
            'r': 'r',
            's': 's',
            't': 't',
            'v': 'v',
            'w': 'w',
            'z': 'z',
        }

        # Replace complex phonemes with simpler representations
        phonetic_word = word.lower()
        for key, value in phonetic_map.items():
            phonetic_word = phonetic_word.replace(key, value)

        # Replace remaining vowels with their likely sounds
        phonetic_word = phonetic_word.replace('a', 'a')
        phonetic_word = phonetic_word.replace('e', 'e')
        phonetic_word = phonetic_word.replace('i', 'i')
        phonetic_word = phonetic_word.replace('o', 'o')
        phonetic_word = phonetic_word.replace('u', 'u')

        return phonetic_word


def load_word_list(file_path):
    with open(file_path, 'r') as f:
        data = json.load(f)
    return data


def get_sample_words(word_list, level, n=5):
    level_words = word_list['levels'].get(str(level), {}).get('words', [])
    return random.sample(level_words, min(n, len(level_words)))


def main():
    """
    Usage examples:
    python misspell.py 1 -n 6 --words almost lady tiny city church
    """
    parser = argparse.ArgumentParser(description="Generate misspellings for words.")
    parser.add_argument("level", type=int, help="Level to select words from")
    parser.add_argument("-n", type=int, default=6, help="Number of misspellings to generate per word")
    parser.add_argument("--word_list", default="word_lists.json", help="Path to word list JSON file")
    parser.add_argument("--words", nargs='+', default=['almost', 'lady', 'tiny', 'city', 'church'], help="List of words to generate misspellings for")
    args = parser.parse_args()

    if args.words:
        sample_words = args.words
        word_list = {'levels': {'1': {'words': sample_words}}}
    else:
        word_list = load_word_list(args.word_list)
        sample_words = get_sample_words(word_list, args.level)

    generator = MisspellingGenerator()

    for word in sample_words:
        misspellings = generator.generate_misspellings(word, args.n)
        print(f"Misspellings for '{word}': {misspellings}")


if __name__ == "__main__":
    main()
