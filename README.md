# PHP htdocs to React Migration

This project is set up to help migrate a classic PHP (htdocs) app into React step by step.

## Run

```bash
npm install
npm run dev
```

## Current Structure

- Routing: React Router (already configured)
- Shared layout: src/layouts/MainLayout.jsx
- Starter pages:
	- src/pages/HomePage.jsx
	- src/pages/MigrationChecklistPage.jsx
	- src/pages/NotFoundPage.jsx

## How to Migrate from PHP

1. Pick one PHP page at a time (start with index.php).
2. Move static HTML into a React component page.
3. Replace PHP includes (header.php/footer.php) with React components.
4. Move assets (images/css/js) into src/assets or public.
5. Convert form handling and server calls to fetch/axios API calls.
6. Add a route for each converted page.

## Typical Mapping

- index.php -> src/pages/HomePage.jsx
- about.php -> src/pages/AboutPage.jsx
- includes/header.php -> src/components/Header.jsx
- includes/footer.php -> src/components/Footer.jsx

## Notes

- Keep backend PHP APIs if needed; React can consume them via HTTP.
- Do not try to migrate everything at once. Convert and test page by page.
