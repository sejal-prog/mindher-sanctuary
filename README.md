# MindHer - AI Mental Wellness Companion

A mental wellness application designed for women who struggle silently due to societal judgment, isolation, or lack of support. MindHer provides a safe, anonymous space for self-expression while connecting users to professional healthcare support when needed.

---

## Problem Statement

Mental health challenges disproportionately affect women, with studies showing women are twice as likely to experience depression and anxiety compared to men. Many women struggle silently because:

- Fear of societal judgment and stigma around mental health
- Lack of a trusted person to confide in without being judged or dismissed
- Long waitlists for professional therapy (often months)
- Financial barriers to accessing mental health services
- Cultural or family pressures that discourage seeking help

Traditional mental health apps often operate in isolation, with no safety net if a user is in crisis. There is a gap between self-help tools and professional intervention.

---

## Solution

MindHer bridges this gap by combining AI-powered self-help tools with professional healthcare oversight:

1. **Anonymous Safe Space**: Users can journal and express themselves without fear of judgment. Any sensitive data shared with healthcare providers uses anonymous IDs only.

2. **AI Companion (Mira)**: An empathetic AI chat companion powered by Llama 3.3 70B that provides supportive conversations, CBT-based techniques, and emotional validation.

3. **Intelligent Sentiment Analysis**: Every journal entry is analyzed using HuggingFace NLP models to detect emotional state and risk level (low, medium, high, crisis).

4. **Healthcare Integration**: When elevated risk is detected, healthcare providers are automatically alerted through a dedicated dashboard, enabling proactive intervention.

5. **Crisis Resources**: Immediate access to helplines and resources when crisis-level content is detected.

---

## Features

### User Application

| Feature | Description |
|---------|-------------|
| Mood Tracking | Daily mood check-ins with visual trends |
| Journaling | Text and voice journaling with writing prompts |
| AI Chat | Empathetic conversations with Mira, the AI companion |
| Sentiment Analysis | Automatic mood detection from journal entries |
| Crisis Support | One-tap access to helplines and breathing exercises |
| Privacy First | Anonymous usage with user-controlled data sharing |

### Healthcare Dashboard

| Feature | Description |
|---------|-------------|
| Risk Overview | Real-time counts of crisis, high, medium, and low risk entries |
| Alert Management | View and filter alerts by risk level |
| Mood Trends | Weekly visualization of user emotional patterns |
| Review System | Mark alerts as reviewed to track follow-ups |
| Anonymous IDs | User privacy maintained with randomized identifiers |

---

## Tech Stack

### AI and ML
- Groq API with Llama 3.3 70B for conversational AI
- HuggingFace Inference API for sentiment analysis
- distilbert-base-uncased-finetuned-sst-2-english (sentiment)
- j-hartmann/emotion-english-distilroberta-base (emotion detection)

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- Recharts for data visualization
- React Router for navigation

### Backend
- Supabase Edge Functions (Deno runtime)
- Supabase for backend infrastructure

---

## Project Structure

```
mindher-sanctuary/
├── src/
│   ├── components/          # Reusable UI components
│   ├── hooks/               # Custom React hooks
│   │   ├── useMiraChat.ts   # AI chat hook
│   │   └── useSentimentAnalysis.ts
│   ├── pages/               # Application pages
│   │   ├── Home.tsx
│   │   ├── JournalNew.tsx
│   │   ├── JournalList.tsx
│   │   ├── Chat.tsx
│   │   ├── Crisis.tsx
│   │   ├── HealthcareDashboard.tsx
│   │   └── HealthcareLogin.tsx
│   ├── services/            # API service layers
│   │   ├── miraAI.ts
│   │   └── sentimentAnalysis.ts
│   └── lib/                 # Utilities and storage
├── supabase/
│   └── functions/
│       ├── chat-with-mira/  # AI chat edge function
│       └── analyze-journal/ # Sentiment analysis edge function
└── public/
```

---

## Installation

### Prerequisites

- Node.js v18 or higher
- npm or yarn
- Supabase CLI
- Groq API account
- HuggingFace account

### Setup

1. Clone the repository

```bash
git clone https://github.com/yourusername/mindher-sanctuary.git
cd mindher-sanctuary
```

2. Install dependencies

```bash
npm install
```

3. Create environment file

```bash
cp .env.example .env.local
```

4. Add your Supabase credentials to `.env.local`

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Set up Supabase secrets

```bash
supabase secrets set GROQ_API_KEY=your_groq_api_key
supabase secrets set HUGGINGFACE_API_KEY=your_huggingface_api_key
```

6. Deploy edge functions

```bash
supabase functions deploy chat-with-mira
supabase functions deploy analyze-journal
```

7. Start the development server

```bash
npm run dev
```

---

## Usage

### User Application

1. Open the application in your browser at `http://localhost:8080`
2. Complete the onboarding flow
3. Use the home screen to:
   - Check in with your daily mood
   - Write journal entries
   - Chat with Mira
   - Access crisis resources if needed

### Healthcare Dashboard

1. Navigate to `http://localhost:8080/healthcare`
2. Enter the provider password: `mindher2024`
3. View and manage user alerts
4. Filter by risk level
5. Mark alerts as reviewed after follow-up

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

## Acknowledgments

- Groq for providing fast LLM inference
- Lovable for rapid application development and deployment
- HuggingFace for sentiment analysis models
- Supabase for backend infrastructure
- The mental health community for inspiration and guidance

---

## Contact

For questions or support, please open an issue on GitHub or contact the maintainers.

---

## Disclaimer

MindHer is not a substitute for professional mental health treatment. If you are experiencing a mental health crisis, please contact emergency services or a mental health helpline immediately.

**Crisis Resources:**
- USA: National Suicide Prevention Lifeline - 988
- India: iCall - 9152987821
- Germany: Telefonseelsorge - 0800 111 0 111
- International: findahelpline.com
