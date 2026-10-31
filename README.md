# myBucket

A unified bucket for everything you save across social platforms — Twitter/X, Instagram, and LinkedIn.

## Idea

Saved reels, tweets, and LinkedIn posts from all your platforms get pulled into one place ("the bucket"). Instead of predefined categories, the OpenAI API analyzes each saved item and sorts it into categories that emerge organically from the content you actually save — categories are discovered, not predefined.

## Planned components

- **Platform integrations** — fetch saved/liked content from Twitter, Instagram, and LinkedIn
- **Bucket storage** — a unified store for saved items regardless of source platform
- **AI categorization** — uses the OpenAI API to classify each item, creating new category buckets as needed based on the content it sees

## Status

Early scaffold — project structure only, integrations not yet implemented.

## Web dashboard

The Next.js dashboard UI lives in [`web/`](web/README.md). It runs on mock data until the API exists: `cd web && npm install && npm run dev`.

## Setup

```bash
npm install
cp .env.example .env   # fill in your API keys
npm run dev
```
