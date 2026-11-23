# What We Doin'? — Android APK project

This is a **native Android WebView shell** for the existing real-time multiplayer app, not an APK yet.

## Before building
1. Host the included `server/` Node.js project on a public HTTPS host (such as Render Web Service). Set build command `npm install`, start command `npm start`.
2. Edit `app/src/main/res/values/strings.xml`: replace `https://YOUR-SERVER.onrender.com` with your actual HTTPS server URL.
3. Open this folder in **Android Studio** on a computer. Install the Android SDK if prompted, wait for Gradle sync, then choose **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
4. Find the debug APK at `app/build/outputs/apk/debug/app-debug.apk` and share it with friends. Android may ask each person to allow installation from the source app.

The Android app opens your hosted game inside an app window, with JavaScript and WebSockets enabled. The game server must remain reachable for synchronized spinning, voting, and activity changes. The debug APK is suitable for private testing, not Play Store publication. Do not put secrets in the server or client files. For a polished production release, use a signed release APK and add an app icon.

Note: The server keeps rooms in memory; a restart can clear them. An online server is required even though the Android app is installed locally.
