# I.N.S.P.I.R.E - AI-Powered B2B Intelligence Platform

**Intelligent Network System for Partnerships, Insights, Research & Expansion**

INSPIRE is an AI-powered B2B intelligence platform designed to help Rwandan MSMEs (Micro, Small & Medium Enterprises) discover strategic partnership opportunities, analyze market trends, and make data-driven business decisions.

## Features

- **AI-Powered Partnership Discovery**: 95.2% accuracy in identifying relevant business opportunities
- **Company Intelligence Extraction**: Comprehensive profiles with strengths, weaknesses, and opportunities
- **Smart Summarization**: Condense lengthy articles into actionable 3-sentence summaries
- **7 AI/ML Systems**: Classification, intelligence extraction, summarization, and more
- **Modern UI Design**: Clean and intuitive interface built with React and Material-UI
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Technologies Used

### Frontend
- React 18 with TypeScript
- Material-UI (MUI)
- Chart.js for analytics visualization
- React Router for navigation
- Framer Motion for animations
- Vite for fast development

### Backend
- Python FastAPI
- 7 AI/ML systems with 95.2% accuracy
- SentenceTransformers for embeddings
- Weak supervision framework (no training data required)

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm 6.x or higher

### Installation

1. Clone the repository
```bash
git clone https://github.com/Samenergy/INSPIRE.git
cd INSPIRE/Frontend
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to http://localhost:5173 (Vite default port)

## Project Structure

```
Frontend/
├── src/
│   ├── components/
│   │   ├── auth/          # Landing page, login, signup
│   │   ├── dashboard/     # Analytics and charts
│   │   ├── accounts/      # Account management
│   │   ├── campaigns/     # Campaign management
│   │   ├── layout/        # Sidebar and navigation
│   │   ├── notifications/ # Notification system
│   │   └── ui/           # Reusable UI components
│   ├── context/          # React context (Auth, Theme)
│   ├── services/         # API services
│   └── App.tsx           # Main app component
├── public/
│   └── images/           # Static images and icons
└── package.json
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Backend API

The frontend connects to the INSPIRE backend API:
- **Production**: https://inspire-4.onrender.com
- **API Docs**: https://inspire-4.onrender.com/docs
- **GitHub**: https://github.com/Samenergy/INSPIRE.git

## Impact

INSPIRE addresses a critical challenge for Rwandan MSMEs:
- 🔍 **Discover Potential Partners**: AI identifies companies aligned with your objectives
- 📈 **Spot Market Trends**: Track emerging opportunities in your industry
- 💡 **Make Data-Driven Decisions**: Access curated, relevant business intelligence
- 🚀 **Scale Sustainably**: Build strategic partnerships for growth

## License

This project is licensed under the MIT License.
