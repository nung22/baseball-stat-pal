# Fantasy Baseball Stats App

This project connects pybaseball data to a Next.js frontend with TypeScript through a Flask backend API. It's perfect for fantasy baseball analysis and tracking player stats.

## Project Structure

```
fantasy-baseball-stats/
├── backend/                # Flask API
│   ├── app.py              # Main Flask application
│   └── requirements.txt
└── frontend/               # Next.js application with TypeScript
    ├── app/                # Next.js App Router
    │   ├── layout.tsx      # Root layout
    │   └── page.tsx        # Home page
    ├── components/         # React components
    │   ├── PlayerSearch.tsx
    │   └── PlayerStats.tsx
    ├── lib/                # Utility functions
    │   └── api.ts          # API service
    ├── types/              # TypeScript type definitions
    │   └── index.ts
    └── tsconfig.json       # TypeScript configuration
```

## Backend Setup

The backend is a Flask API that serves pybaseball data.

1. Create a virtual environment:
   ```
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Run the Flask app:
   ```
   python app.py
   ```

The backend will run on http://localhost:5000.

## Frontend Setup

The frontend is a Next.js application that displays baseball stats.

1. Install dependencies:
   ```
   cd frontend
   npm install
   ```

2. Create a `.env.local` file:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

3. Install TypeScript dependencies:
   ```
   npm install --save-dev typescript @types/react @types/node
   ```

4. Run the Next.js app:
   ```
   npm run dev
   ```

The frontend will run on http://localhost:3000.

## Features

- **Player Search:** Search for MLB players by name
- **Player Stats:** View detailed batting and pitching stats
- **Time Filters:** Choose between 7-day, 30-day, and season stats
- **Responsive Design:** Works on desktop and mobile devices

## Deployment

### Backend Deployment

You can deploy the Flask backend to services like:
- Heroku
- AWS Elastic Beanstalk
- Google Cloud Run
- DigitalOcean App Platform

Make sure to set the appropriate environment variables for production.

### Frontend Deployment

You can deploy the Next.js frontend to:
- Vercel (recommended)
- Netlify
- AWS Amplify
- GitHub Pages

Configure the `NEXT_PUBLIC_API_URL` environment variable to point to your deployed backend.

## Extending the App

Here are some ideas to extend the app:
- Add user authentication for saving favorite players
- Create custom dashboards for different fantasy baseball formats
- Add player comparison features
- Implement statistical projections using machine learning
- Create data visualizations for player performance trends

## Notes on Data Usage

When using pybaseball data, be mindful of the data sources' terms of service:
- Baseball-Reference
- FanGraphs
- Baseball Savant (MLB Statcast)

The data provided by this app is for personal use and fantasy baseball analysis only.