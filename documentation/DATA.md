# DATA.md

## Overview

The Spell Masters app utilizes a combination of local word list files, a free Dictionary API, and custom-generated data to provide a comprehensive and effective set of data assets. This approach balances simplicity in data management with rich word information, supporting the app's educational goals across various grade levels and difficulty tiers.

## 1. Core Word Data

### 1.1 Grade-Level Word Lists

#### Primary Source: word_lists.json

The primary source for grade-level word lists is the `word_lists.json` file. This file contains a structured list of words organized by levels, corresponding to different grade levels or difficulty tiers.

Structure of word_lists.json:

```json
{
  "levels": {
    "1": {
      "words": ["bat", "tooth", "spin", ...],
      "bonus": ["cut", "net", "hot", ...]
    },
    "2": {
      "words": ["four", "plan", "paid", ...],
      "bonus": ["fast", "kite", "laugh", ...]
    },
    ...
  },
  "metadata": {
    "totalLevels": 13,
    "totalWords": 5788,
    "lastUpdated": "2024-08-26T15:43:30.821913Z"
  }
}
```

- Each level contains a list of primary words and bonus words.
- The metadata provides information about the total number of levels, words, and the last update timestamp.

#### Additional Sources:
- Fry Word List: High-frequency words sorted by grade level
- Dolch Word List: Common sight words for lower grades
- Words Their Way: Research-based word study lists by developmental level
- State Educational Standards: Grade-specific word lists from Common Core State Standards (CCSS)

These additional sources can be used to supplement and validate the `word_lists.json` file.

### 1.2 Word Information

For each word, the following data should be collected or generated:
- Spelling
- Grade level
- Part of speech
- Definition(s)
- Example sentence(s)
- Audio pronunciation
- Image representation (where applicable)
- Synonyms and antonyms
- Common misspellings

#### Primary Source: Free Dictionary API

To obtain detailed information about each word, including definitions, phonetics, origins, and example sentences, the app uses the free Dictionary API.

API Endpoint: `https://api.dictionaryapi.dev/api/v2/entries/en/<word>`

Example usage:
```
GET https://api.dictionaryapi.dev/api/v2/entries/en/hello
```

The API returns a JSON response containing:
- Word pronunciation (phonetics)
- Word origin
- Multiple meanings with parts of speech
- Definitions
- Example sentences (when available)

#### Additional Sources:
- Merriam-Webster Dictionary API (as a backup or for additional information)
- Oxford Dictionaries API (as a backup or for additional information)
- Vocabulary.com API (for additional learning resources)
- Custom generation using Language Models (e.g., GPT-4) for example sentences and common misspellings

## 2. Learning Mode-Specific Data

### 2.1 Assessment Mode
- Word lists grouped into sets of approximately 20 words
- Multiple-choice options (5-6 per word), including common misspellings and plausible alternatives

### 2.2 Performance Review
- User response data (correct/incorrect, time taken)
- Aggregated performance metrics (accuracy rate, average time per word)

### 2.3 Kinesthetic Practice
- Tracing data (attempts, success rate)
- Similarity threshold for successful tracing

### 2.4 Targeted Reinforcement
- List of words requiring additional practice
- Practice session history (date, words practiced, success rate)

### 2.5 Bonus Challenges
- Separate list of bonus words for each level (stored in `word_lists.json`)
- Bonus progress data (words attempted, words mastered, total words)

### 2.6 Comprehensive Evaluation
- Test composition data (words from previous three levels)
- Test results (date, level tested, score, total questions, words tested, incorrect words)

## 3. User Progress Data

### 3.1 Overall Progress
- Current grade level
- Completed sections
- Stars earned
- Words mastered

### 3.2 Section-Level Progress
- Completion status
- Stars earned
- Words attempted and mastered

### 3.3 Word-Level Progress
- Attempts
- Correct attempts
- Time spent
- Error patterns
- Last practiced date
- Tracing attempts
- Targeted practice status

## 4. Gamification Data

- Badges and achievements data
- Leaderboard information (if implemented)
- Progress visualization data (e.g., progress bars, stars)

## 5. Data Persistence and Storage

All user data, including profiles, progress, and settings, will be stored locally using browser LocalStorage or IndexedDB. The data structure should follow the format outlined in SCOPE.md, section 5 (Data Structures).

### 5.1 LocalStorage Schema
```json
{
  "user_001": {
    "name": "John Doe",
    "current_grade": 1,
    "progress": {
      "section_1": {
        "completed": false,
        "stars": 2,
        "words": {
          "word_001": {
            "attempts": 3,
            "correct_attempts": 2,
            "time_spent": 120,
            "error_pattern": "ei vs. ie",
            "last_practiced": "2023-04-15T10:30:00Z",
            "tracing_attempts": 2,
            "in_targeted_practice": true
          }
        }
      }
    },
    "statistics": {
      "total_attempts": 100,
      "words_mastered": 50,
      "incorrect": ["word_005", "word_008", "..."],
      "common_errors": {
        "ei vs. ie": 10,
        "double letters": 5
      }
    },
    "bonus_progress": {
      "section_1": {
        "completed": false,
        "stars": 1,
        "words_mastered": 5
      }
    },
    "comprehensive_evaluations": [
      {
        "date": "2023-04-10T14:00:00Z",
        "level_tested": 1,
        "score": 18,
        "total_questions": 20,
        "words_tested": ["word_001", "word_002", "..."],
        "incorrect": ["word_005", "word_008", "..."]
      }
    ],
    "targeted_reinforcement": {
      "words": ["word_003", "word_007", "word_012"],
      "sessions": [
        {
          "date": "2023-04-17T14:00:00Z",
          "words_practiced": ["word_003", "word_007"],
          "success_rate": 0.5
        }
      ]
    }
  }
}
```

## 6. Multisensory Learning Data

### 6.1 Audio Data
- Text-to-speech API integration for word pronunciation
- Pre-recorded audio files for common words and phonemes

### 6.2 Visual Data
- Images representing words (where applicable)
- SVG or Canvas data for interactive tracing exercises

## 7. Data Management Strategy

1. **Word List Updates:**
   - Regularly review and update the `word_lists.json` file to ensure it remains aligned with current educational standards.
   - Use the `lastUpdated` field in the metadata to track when the list was last modified.

2. **API Integration:**
   - Implement caching mechanisms to store API responses locally, reducing the number of API calls and improving app performance.
   - Update cached data periodically to ensure the information remains current.

3. **Misspellings Generation:**
   - Generate misspellings in batches and store them alongside the word lists.
   - Update misspellings when new words are added to the lists.

4. **Data Pipeline:**
   - Develop a system to automatically integrate and update word lists, misspellings, and example sentences.
   - Implement data validation and cleaning processes to ensure data quality.

## 8. Data Security and Privacy

- Implement data integrity checks when reading from or writing to LocalStorage.
- Avoid storing sensitive personal information.
- Provide clear information to users about data storage and usage.
- Implement data export and deletion features for user control.

## 9. Licensing and Permissions

- Ensure compliance with licensing agreements for all third-party data sources (e.g., dictionary APIs, word lists).
- Document all data sources and their respective licenses.
- If using APIs, review and adhere to usage limits and terms of service.

## 10. Operational Considerations

- Implement data backup and recovery mechanisms for locally stored data.
- Develop a strategy for updating core word data and app content without requiring full app updates.
- Consider data migration strategies for future app versions or data structure changes.
- Utilize Next.js API routes for any server-side operations, such as data processing or external API interactions.
- Implement efficient client-side data management using React hooks and Context API.

## 11. Benefits of This Approach

- Simplified data management with a single primary source for word lists.
- Reduced reliance on multiple external APIs and resources.
- Easy to update and maintain word lists independently of other app components.
- Access to comprehensive word information through the free Dictionary API.
- Efficient client-side rendering and data management using Next.js and React.
- Improved performance through Next.js's built-in optimizations and static site generation capabilities.

## 12. Limitations and Mitigations

1. **API Dependency:** The app relies on the availability and stability of the free Dictionary API.
   - Mitigation: Implement robust error handling and fallback mechanisms, such as using a local dictionary database for core functionality.

2. **Limited Control Over Word Definitions:** The app cannot customize the content returned by the API.
   - Mitigation: Implement content filtering or simplification algorithms to adapt API responses to different grade levels.

3. **Potential Lack of Specialized Vocabulary:** The word lists may not include domain-specific terms.
   - Mitigation: Allow for easy addition of custom words and definitions to the `word_lists.json` file.

## Conclusion

By leveraging the `word_lists.json` file, the free Dictionary API, and custom-generated data, the Spell Masters app can provide a robust and comprehensive spelling education experience. This approach balances simplicity in data management with rich word information, supporting the app's educational goals across various grade levels and difficulty tiers. The combination of local storage, API integration, and multisensory learning data ensures a responsive and engaging user experience while maintaining data privacy and security.