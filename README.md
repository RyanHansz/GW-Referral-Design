# Goodwill Referral Tool

An AI-powered resource referral system built for Goodwill Central Texas to help case managers connect clients with relevant resources, programs, and services.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/itnavapbccoms-projects/v0-goodwill-referral)

## Overview

This application helps Goodwill Central Texas case managers generate personalized resource referrals for clients in the Workforce Advancement Program. It uses AI to match client needs with relevant resources including:

- **Goodwill Resources & Programs**: Job postings, Digital Navigator, retail stores
- **GCTA Trainings**: IT certifications, healthcare training, manufacturing programs
- **CAT Trainings**: Advanced skill development and professional certifications
- **Local Community Resources**: Food banks, shelters, transportation assistance
- **Government Benefits**: SNAP, Medicaid, housing assistance, TANF, WIC
- **Job Postings**: Current employment opportunities in Central Texas

## Features

- **AI-Powered Matching**: Uses GPT-5 with web search to find current, specific resources
- **Conversational Interface**: Natural language interaction with follow-up questions
- **Action Plans**: Generate step-by-step guides for accessing resources
- **Multi-Language Support**: Generate referrals in multiple languages
- **Resource Filtering**: Filter results by resource type
- **Streaming Results**: Real-time progressive display of resources

## Tech Stack

- **Framework**: Next.js 14 (React 18)
- **AI**: OpenAI GPT-5 with web search capabilities via Vercel AI SDK
- **UI Components**: Radix UI + Tailwind CSS
- **Styling**: Tailwind CSS 4
- **TypeScript**: Full type safety
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/RyanHansz/GW-Referral-Design.git
cd GW-Referral-Design
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env.local file
OPENAI_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Project Structure

```
├── app/
│   ├── api/
│   │   ├── generate-referrals/    # Main referral generation endpoint
│   │   └── generate-action-plan/  # Action plan generation endpoint
│   ├── page.tsx                   # Main application page
│   └── layout.tsx                 # Root layout
├── components/                    # React components
├── lib/                          # Utility functions
└── public/                       # Static assets
```

## Deployment

This project is deployed on Vercel:

**[https://vercel.com/itnavapbccoms-projects/v0-goodwill-referral](https://vercel.com/itnavapbccoms-projects/v0-goodwill-referral)**

## Key Features Explained

### Web Search Integration
All resource URLs and contact information are verified through web search to ensure accuracy and prevent hallucinated links.

### Streaming Architecture
Resources are displayed progressively as they're generated, providing a responsive user experience.

### Context-Aware Responses
The system maintains conversation history to provide relevant follow-up answers and suggestions.

## License

Private - Goodwill Central Texas

## Support

For issues or questions, please contact the development team.
