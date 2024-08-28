# SCOPE.md

## 1. Overview

This document provides a comprehensive scope for the development of the Spell Masters app. It outlines the user stories, architecture, components, data structures, and dependencies necessary to implement the app according to the goals and requirements specified in the `REQUIREMENTS.md` document. The focus is on creating an efficient, maintainable, and scalable solution using Vue.js as the chosen framework.

## 2. User Stories

### 2.1. User Story 1: User Profile Creation and Selection
**As a** student or parent,  
**I want** to create a new profile or select an existing profile on the app,  
**so that** I can track my (or my child’s) progress in spelling.

**Acceptance Criteria:**
- The app prompts for profile creation if no profiles exist.
- The user can select an existing profile from a list on the home screen.
- User data is stored locally and is associated with a unique identifier.

### 2.2. User Story 2: Dashboard and Progress Overview
**As a** student,  
**I want** to view my progress in the current grade,  
**so that** I can see how far I’ve come and what I still need to accomplish.

**Acceptance Criteria:**
- The dashboard shows the current grade and sections within that grade.
- Progress indicators (e.g., stars, progress bars) reflect the completion status of each section.
- Users can access detailed statistics and options to start or continue a section.

### 2.3. User Story 3: Interactive Spelling Exercises (Assessment Mode)
**As a** student,
**I want** to complete spelling exercises where I choose the correct word from multiple options,
**so that** I can practice and improve my spelling skills.

**Acceptance Criteria:**
- Each exercise presents a sentence with a blank and 5-6 word choices.
- Audio playback is available for words when possible.
- Quick access to word information (part of speech, definitions, examples, synonyms, antonyms) is provided.
- Relevant images are displayed to aid visual learning.
- The app records attempts, correct/incorrect status, and time spent on each word.

### 2.4. User Story 4: Performance Review
**As a** student,
**I want** to review my performance immediately after completing an assessment,
**so that** I can understand my strengths and areas for improvement.

**Acceptance Criteria:**
- A summary of assessment results is displayed after each session.
- All words from the session are listed, with correct answers in green and incorrect answers in red.
- For incorrect answers, both the student's response and the correct spelling are shown.

### 2.5. User Story 5: Kinesthetic Practice
**As a** student,
**I want** to practice tracing words I frequently misspell,
**so that** I can reinforce correct spelling through muscle memory and visual recognition.

**Acceptance Criteria:**
- Words previously misspelled are presented for tracing practice.
- The correct spelling is displayed in light gray font.
- A digital "paint brush" tool is provided for tracing.
- The app determines when a tracing attempt is successful based on a similarity threshold.
- A reset option is available to clear the current tracing and start over.

### 2.6. User Story 6: Targeted Reinforcement
**As a** student,
**I want** to focus on practicing words I have previously struggled with,
**so that** I can improve my spelling of challenging words.

**Acceptance Criteria:**
- A dedicated practice mode presents only words the student has previously misspelled.
- Words are gradually removed from this list as they are successfully mastered.
- The assessment format is similar to the main mode but focuses solely on challenging words.

### 2.7. User Story 7: Bonus Challenges
**As a** student,
**I want** to attempt bonus words for extra credit,
**so that** I can challenge myself and earn additional recognition.

**Acceptance Criteria:**
- A separate list of bonus words is maintained for each level.
- Bonus words are presented in the same format as the main assessment mode.
- Bonus progress is tracked separately from main level progress.
- Additional rewards or recognition are provided for completing bonus challenges.

### 2.8. User Story 8: Comprehensive Evaluation
**As a** parent or educator,
**I want** to see detailed reports on a student's long-term spelling progress,
**so that** I can understand their overall improvement and retention.

**Acceptance Criteria:**
- Periodic tests are generated using words from the previous three levels.
- Randomized 20-question assessments are created for these tests.
- Test results are stored separately, including date, level tested, and performance metrics.
- A dedicated view is provided for parents and educators to review test history and progress over time.

### 2.9. User Story 9: Progress Reports and Statistics
**As a** parent or educator,  
**I want** to see detailed reports on a student’s spelling progress,  
**so that** I can understand their strengths and areas for improvement.

**Acceptance Criteria:**
- The app generates reports showing accuracy, time spent, and error patterns.
- Reports are accessible from the dashboard and can be exported if needed.
- The app provides visual aids like charts and graphs to illustrate progress.

### 2.10. User Story 10: Multisensory Learning Features
**As a** student,  
**I want** to hear words spoken aloud and trace them with my finger,  
**so that** I can reinforce my learning through multiple senses.

**Acceptance Criteria:**
- Text-to-speech reads aloud the word or sentence on each exercise page.
- An interactive tracing feature allows students to trace the word on the screen.
- Visual aids and images are included where appropriate to enhance understanding.

## 3. Architecture

### 3.1. Frontend Framework
- **Vue.js**: The app will be built using Vue.js for its simplicity, reactivity, and component-based architecture, which allows for efficient development and maintainability.

### 3.2. State Management
- **Vuex** (optional, for global state management): If the app grows in complexity, Vuex may be used to manage the global state, including user profiles, progress data, and settings. However, for a simpler implementation, Vue’s native reactivity system should suffice.

### 3.3. Routing
- **Vue Router**: This will manage navigation between different screens (e.g., Home, Dashboard, Section Overview, Word Exercise). Routes will be parameterized to handle different users and sections dynamically.

### 3.4. Data Persistence
- **LocalStorage**: All user data, including profiles, progress, and settings, will be stored locally in the browser’s LocalStorage. This ensures data persistence across sessions without needing a backend.
- **IndexedDB** (optional): If data storage requirements grow beyond LocalStorage’s capacity (typically 5-10MB), IndexedDB can be used for more complex data storage needs.

### 3.5. Security
- **HTTPS**: Ensure the app is served over HTTPS to protect data integrity and user privacy during session interactions.
- **Data Integrity Checks**: Implement data validation and integrity checks when reading from or writing to LocalStorage to prevent data corruption.

### 3.6. Learning Mode Implementation
- **Assessment Mode**: Implement as the core learning experience, using Vue.js components to render questions, multiple-choice options, and feedback.
- **Performance Review**: Develop as a separate component that processes and displays results from completed assessment sessions.
- **Kinesthetic Practice**: Implement using HTML5 Canvas or SVG for the tracing functionality, with Vue.js handling user interactions and progress tracking.
- **Targeted Reinforcement**: Utilize Vuex (if implemented) or Vue's reactivity system to manage the list of words requiring additional practice.
- **Bonus Challenges**: Implement as an extension of the Assessment Mode, with additional tracking for bonus progress.
- **Comprehensive Evaluation**: Develop as a separate module that generates tests based on data from previous levels and tracks long-term progress.

## 4. Components

### 4.1. Core Components

#### 4.1.1. _app.js
- **Description:** The root component that initializes the application and wraps all pages.
- **Responsibilities:** 
  - Set up global styles and layouts.
  - Manage global state (user selection, current screen).

#### 4.1.2. pages/index.js
- **Description:** The landing page where users create or select a profile.
- **Responsibilities:**
  - Profile creation and selection.
  - Navigation to the dashboard.

#### 4.1.3. pages/dashboard.js
- **Description:** The main dashboard that displays the user's progress and allows navigation to different sections.
- **Responsibilities:**
  - Display progress summary (current grade, sections completed).
  - Provide access to detailed stats and section overviews.
  - Quick-start buttons for resuming last session.

#### 4.1.4. pages/sections/[sectionId].js
- **Description:** Provides a detailed view of a specific section, showing all words within that section and progress metrics.
- **Responsibilities:**
  - List words in the section with completion and mastery status.
  - Show section-level metrics (e.g., stars earned, time spent).
  - Start or resume section exercises.

### 4.2. Learning Mode Components

#### 4.2.1. components/AssessmentMode.js
- **Description:** The core component where students interact with spelling exercises in the main assessment mode.
- **Responsibilities:**
  - Present word in context with multiple-choice options.
  - Provide audio playback for words when available.
  - Display quick access to word information.
  - Show relevant images to aid visual learning.
  - Capture and store the user's answer, provide immediate feedback.
- **Additional Responsibilities:**
  - Implement logic for generating distractors (incorrect options).
  - Handle audio playback and image display.

#### 4.2.2. components/PerformanceReview.js
- **Description:** A component that displays the results of an assessment session.
- **Responsibilities:**
  - Show a summary of assessment results.
  - List all words from the session, color-coding correct and incorrect responses.
  - Display both incorrect and correct spellings for missed words.
- **Additional Responsibilities:**
  - Calculate and display performance metrics (e.g., accuracy percentage, time per word).

#### 4.2.3. components/KinestheticPractice.js
- **Description:** A component for tracing exercises to reinforce spelling through muscle memory.
- **Responsibilities:**
  - Display words for tracing practice.
  - Provide a digital "paint brush" tool for tracing.
  - Implement similarity checking for tracing attempts.
  - Offer a reset option to clear current tracing.
- **Additional Responsibilities:**
  - Implement drawing functionality using HTML5 Canvas or a library like react-canvas-draw.
  - Develop algorithm for comparing user's tracing to the correct spelling.

#### 4.2.4. components/TargetedReinforcement.js
- **Description:** A component dedicated to practicing challenging words.
- **Responsibilities:**
  - Present exercises focusing on previously misspelled words.
  - Track mastery of challenging words and update the practice list.
- **Additional Responsibilities:**
  - Implement spaced repetition algorithm for word selection.
  - Track and update mastery levels for each word.

#### 4.2.5. components/BonusChallenges.js
- **Description:** A component for bonus word exercises.
- **Responsibilities:**
  - Present bonus words in an assessment format.
  - Track and display bonus progress separately.
  - Provide additional rewards for completing bonus challenges.
- **Additional Responsibilities:**
  - Implement logic for unlocking bonus words based on main progress.
  - Design and implement bonus rewards system.

#### 4.2.6. components/ComprehensiveEvaluation.js
- **Description:** A component for periodic tests covering words from previous levels.
- **Responsibilities:**
  - Generate and present randomized 20-question assessments.
  - Store and display test results, including date and performance metrics.
  - Provide a view for reviewing test history and long-term progress.
- **Additional Responsibilities:**
  - Develop algorithm for selecting words from previous levels.
  - Implement long-term progress tracking and visualization.

### 4.3. Utility Components

#### 4.3.1. pages/stats.js
- **Description:** A detailed statistics page that shows the user's overall performance, including error patterns and time spent.
- **Responsibilities:**
  - Aggregate data from all sections and display metrics visually (charts, graphs).
  - Provide a breakdown of progress by section and word.
  - Option to export reports for review or printing.

#### 4.3.2. pages/settings.js
- **Description:** A page for managing app settings and user preferences.
- **Responsibilities:**
  - Allow users to adjust difficulty settings (e.g., number of distractors).
  - Manage text-to-speech options, tracing, and other multisensory features.
  - Enable/disable gamification elements like leaderboards.

### 4.4. Component Interactions

- **Assessment Flow:**
  - dashboard.js initiates AssessmentMode.js for a selected section.
  - Upon completion of an assessment session, AssessmentMode.js triggers PerformanceReview.js.
  - PerformanceReview.js updates user progress data, which is reflected in dashboard.js and [sectionId].js.

- **Learning Mode Transitions:**
  - Based on user performance in AssessmentMode.js, the app may recommend KinestheticPractice.js or TargetedReinforcement.js for specific words.
  - BonusChallenges.js is accessible from dashboard.js or [sectionId].js when certain progress thresholds are met.
  - ComprehensiveEvaluation.js is triggered periodically based on user progress across multiple sections.

- **Data Flow:**
  - User interactions in learning mode components update the central user progress data using React hooks and Context API.
  - dashboard.js and stats.js components listen for these updates to refresh their displays.
  - settings.js may influence the behavior of learning mode components (e.g., adjusting difficulty or enabling/disabling features).

- **State Management:**
  - Core components (_app.js, index.js, dashboard.js) manage global app state using React Context.
  - Learning mode components maintain local state for ongoing sessions using React hooks.
  - Utility components (stats.js, settings.js) primarily read from and update global state.

## 5. Data Structures

### 5.1. User Data
- **Structure:** Stored as JSON in LocalStorage.
- **Example:**
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
              "in_targeted_practice": true            }
          },
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
          "incorrect": ["word_005", "word_008", "..."],
        }
      ]
    }
  }
  ```

### 5.2. Word Data
- **Structure:** Stored as JSON, containing information for each word.
- **Example:**
  ```json
  {
    "word_001": {
      "word": "hello",
      "grade_level": 1,
      "part_of_speech": "interjection",
      "definition": "used as a greeting or to begin a phone conversation",
      "example_sentence": "_____ there, Katie!",
      "audio_url": "https://api.dictionaryapi.dev/media/pronunciations/en/hello-us.mp3",
      "image_url": "https://unsplash.com/photos/example-hello-image",
      "synonyms": ["hi", "greetings", "salutations"],
      "antonyms": ["goodbye", "farewell"],
      "common_misspellings": ["helo", "hallo", "hullo"]
    }
  }
  ```

### 5.3. Assessment Session Data
- **Structure:** Stored temporarily during an assessment session.
- **Example:**
  ```json
  {
    "session_id": "sess_001",
    "user_id": "user_001",
    "start_time": "2023-04-15T10:00:00Z",
    "end_time": "2023-04-15T10:15:00Z",
    "words": [
      {
        "word_id": "word_001",
        "user_answer": "hello",
        "correct": true,
        "time_taken": 5
      },
      {
        "word_id": "word_002",
        "user_answer": "beleive",
        "correct": false,
        "time_taken": 8
      }
    ],
    "total_correct": 18,
    "total_words": 20
  }
  ```

### 5.4. Progress Tracking
- **Structure:** Nested within each user’s profile, tracking progress by grade, section, and word.
- **Example:**
  ```json
  {
    "section_1": {
      "completed": true,
      "stars": 3,
      "words": {
        "word_001": {
          "attempts": 2,
          "correct_attempts": 2,
          "time_spent": 90
        },
        "word_002": {
          "attempts": 5,
          "correct_attempts": 3,
          "time_spent": 150,
          "error_pattern": "reversed letters"
        }
      }
    }
  }
  ```

### 5.5. Kinesthetic Practice Data
- **Structure:** Stored as part of the user's progress data.
- **Example:**
  ```json
  {
    "word_001": {
      "tracing_attempts": 5,
      "last_traced": "2023-04-16T09:30:00Z",
      "mastery_level": 0.7
    }
  }
  ```

### 5.6. Targeted Reinforcement Data
- **Structure:** List of words requiring additional practice.
- **Example:**
  ```json
  {
    "targeted_words": ["word_003", "word_007", "word_012"],
    "practice_sessions": [
      {
        "date": "2023-04-17T14:00:00Z",
        "words_practiced": ["word_003", "word_007"],
        "success_rate": 0.5
      }
    ]
  }
  ```

### 5.7. Bonus Challenge Data
- **Structure:** Separate progress tracking for bonus words.
- **Example:**
  ```json
  {
    "bonus_section_1": {
      "words_attempted": 10,
      "words_mastered": 7,
      "total_words": 15
    }
  }
  ```

## 6. Dependencies

### 6.1. Next.js
- **Version:** Latest stable version.
- **Purpose:** Core framework for building the app, providing server-side rendering, routing, and API capabilities.

### 6.2. React
- **Version:** Latest stable version (included with Next.js).
- **Purpose:** UI library for building components and managing component state.

### 6.3. LocalStorage/IndexedDB Wrappers
- **Purpose:** Ensure consistent behavior across different browsers for LocalStorage or IndexedDB usage.
- **Options:** localforage or idb for more advanced storage needs.

### 6.4. Text-to-Speech API
- **Purpose:** Provide text-to-speech functionality for multisensory learning.
- **Options:** Use the Web Speech API or a library like react-speech-kit.

### 6.5. Chart.js or D3.js with React wrappers
- **Purpose:** Generate visual reports and statistics in the stats component.
- **Options:** react-chartjs-2 for Chart.js or recharts for D3.js-based charts.

### 6.6. Tailwind CSS
- **Purpose:** Provide a responsive, modern UI design with minimal custom CSS.

### 6.7. SWR (optional)
- **Purpose:** For efficient data fetching and caching in client-side rendering scenarios.

## 7. Development Guidelines

### 7.1. Coding Standards
- Follow React and Next.js best practices, including functional components and hooks.
- Use ESLint and Prettier for consistent code formatting and error checking.

### 7.2. Version Control
- Use Git for version control.
- Commit regularly with clear, descriptive messages.
- Use feature branches and pull requests for collaborative development.

### 7.3. Testing
- Unit Testing: Use Jest and React Testing Library for testing individual components.
- Integration Testing: Ensure that different components work together as expected, particularly for state management and data persistence.
- Use Next.js's built-in testing capabilities for API routes and pages.

### 7.4. Deployment
- Deploy to Vercel for quick and easy deployment with automatic preview builds for pull requests.
- Utilize Next.js's static site generation (SSG) capabilities for improved performance where applicable.

### 7.5. Learning Mode Implementation
- Ensure consistent user experience across all learning modes.
- Implement robust error handling and data validation for each mode.
- Use custom hooks for shared functionality across modes (e.g., word selection, progress tracking).

### 7.6. Performance Optimization
- Utilize Next.js's built-in code splitting and lazy loading features.
- Optimize images using Next.js Image component.
- Implement caching strategies for API responses and frequently accessed data.

### 7.7. Accessibility
- Ensure all components are keyboard accessible.
- Implement ARIA attributes for screen reader compatibility.
- Maintain a minimum contrast ratio of 4.5:1 for text and background colors.
- Utilize Next.js's built-in features for improved accessibility, such as automatic language detection.

### 7.8. Mobile Responsiveness
- Design components with a mobile-first approach using Tailwind CSS.
- Utilize Next.js's responsive image optimization features.
- Implement touch-friendly interactions for mobile devices, especially for the KinestheticPractice component.
  
## 8. Conclusion

This `SCOPE.md` document outlines the detailed architecture and components necessary to build the Spell Masters app. By following this scope, the engineering team will ensure that the app is not only functional but also aligned with the educational goals specified in the `REQUIREMENTS.md` document. The architecture is designed to be scalable, efficient, and easy to maintain, with a focus on providing a superior learning experience for students.