# Build from Android using GitHub Actions

1. Deploy the `server/` folder to an HTTPS Node web service first.
2. In `app/src/main/res/values/strings.xml`, replace `https://YOUR-SERVER.onrender.com` with your actual hosted HTTPS URL.
3. Upload all project files, including the hidden `.github/workflows/build-apk.yml`, to the root of a GitHub repository on the `main` branch. The `.github` folder is hidden in some Android file managers; enable Show hidden files.
4. In GitHub, open Actions > Build Android APK > Run workflow. If Actions are disabled, enable them for the repository.
5. Once the build succeeds, open the run and download `what-we-doin-debug-apk` under Artifacts. Extract the artifact ZIP, then tap `app-debug.apk` to install.
6. Android may ask to allow installs from Chrome or Files. Only install APKs you built and trust.

The debug APK is for personal testing/sharing, not Play Store distribution. The multiplayer server must remain online. Do not put secrets in this project.
