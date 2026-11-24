# What We Doin'? — Website edition

This is a complete multiplayer website (not just a mockup). It includes shared rooms, live synchronized spins, yes/no majority voting with automatic respins, and owner-controlled activity chance sliders.

## Publish to the web using Render

1. Unzip this folder and upload its files to a new GitHub repository (keep `server.js`, `package.json`, `public/`, and `render.yaml` at the repository root).
2. Sign in to Render and create a new **Web Service** connected to that repository. Select **Node**, build command `npm install`, start command `npm start`. (The included `render.yaml` can also be used for a Render Blueprint.)
3. Wait for deployment, then open the HTTPS URL Render gives you.
4. Click **Create a room** and share the invite link. Friends can open the same website on Android, iPhone, or desktop.

Note: This app requires a Node.js server with WebSocket support. It cannot be hosted as a static-only GitHub Pages website. Room information is stored in server memory and is lost when the server restarts. Free hosting may sleep, disconnecting active rooms. No public URL is included because it has not yet been deployed.

## Run on your computer

Install Node.js 18+, then run `npm install` and `npm start` inside this folder. Visit http://localhost:3000.
