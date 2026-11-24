# What We Doin'? 🎡

A real-time multiplayer activity wheel. Friends join the same room from separate devices, add activities, and see the same synchronized spin and winner.

## Run locally

Install Node.js 18+, then run:

```bash
npm install
npm start
```

Open http://localhost:3000.

## Make it accessible to friends

Deploy this folder as a **Node.js web service** (for example, on Render or Railway). Build command: `npm install`. Start command: `npm start`. Share your deployed URL. Everyone needs to visit the same deployed server; localhost only works on your own machine.

## Notes

Rooms and ideas live in server memory. They survive browser refreshes but **not server restarts or service redeploys**. Empty rooms are removed after 24 hours. Room codes are not passwords: anyone with the code can join and change ideas. This is designed for casual friend groups, not sensitive data. On free hosting plans, sleeping instances can temporarily disconnect users.

## Install on Android (PWA)

1. Deploy this Node.js project to an HTTPS host that supports WebSockets (e.g. Render or Railway). Use `npm install` as build command and `npm start` as start command.
2. Open the deployed HTTPS URL in **Chrome on Android**.
3. Tap Chrome's three-dot menu → **Install app** or **Add to Home screen** (label varies by device).
4. Open the new home-screen icon. Share the room invite URL with friends.

The app shell may appear offline, but joining rooms, adding activities, and spinning all require an active connection to the server. This is an installable web app, not an Android APK or Play Store listing.

## Group voting

After each synchronized spin, every connected player who was in the room when voting began gets one Yes/No vote. The votes and totals update live on every device. Strictly more than half of eligible players must vote Yes. If everyone votes and there is no majority Yes, the server automatically respins, temporarily excluding rejected activities so it cannot keep picking the same one. If all ideas are rejected, the round ends without a winner; add new ideas or start another round. A disconnected voter is removed from the electorate. New joiners can watch but vote in the next round. All voting and spin decisions happen on the server.

## Adjustable activity chances

Each idea starts with weight 100 (equal odds). Its creator can lower its weight from 100 to 0 in increments of 5 using the slider. The actual chance displayed is its weight divided by the sum of all current weights; lowering one idea makes the other ideas proportionally more likely. Players cannot raise an idea above its default weight. The server chooses winners using these weights and the wheel draws matching slice sizes. During automatic respins, rejected ideas are excluded from both the draw and selection. At least one eligible idea must have positive weight.

Ownership is tied to the current socket connection, so disconnecting and reconnecting may prevent editing previously added ideas. Room data is in memory and resets on server restart.
