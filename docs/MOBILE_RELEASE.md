# Shipping the mobile apps (Google Play + App Store) via GitHub Actions

The `Mobile release (Play + TestFlight)` workflow (`.github/workflows/mobile-release.yml`)
builds the Capacitor native apps, **signs** them, and uploads to **Google Play
(internal track)** and **TestFlight**. It runs manually (Actions tab → Run
workflow) and needs no Mac on your side — the iOS job runs on a macOS runner.

The app id is **`com.learnnoelia.app`** (from `capacitor.config.ts`). It **must
match** the apps you created in Play Console and App Store Connect. If you
registered a different id, tell me and I'll update the config + workflow.

Each job skips cleanly until its secrets are present, so you can wire Android
first and iOS later. Add these under **Settings → Secrets and variables →
Actions → New repository secret**.

## Android secrets

| Secret | What it is / how to get it |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | Your **upload key**. Create once: `keytool -genkey -v -keystore upload.jks -keyalg RSA -keysize 2048 -validity 9125 -alias upload`. Then `base64 -w0 upload.jks` and paste the output. Keep `upload.jks` safe — it's how you sign every update. |
| `ANDROID_KEYSTORE_PASSWORD` | The keystore password you set above. |
| `ANDROID_KEY_ALIAS` | `upload` (the alias above). |
| `ANDROID_KEY_PASSWORD` | The key password (often same as the keystore password). |
| `PLAY_SERVICE_ACCOUNT_JSON` | Play Console → **Setup → API access** → create/link a Google Cloud **service account**, grant it "Release to testing tracks", download its **JSON key**, paste the whole JSON. |

Also: in Play Console, do the **first** upload of any `.aab` manually once (so
the app exists on the internal track and app signing is enabled), or ensure the
service account has permission to create releases. Google Play App Signing holds
the real signing key; your upload key just authorizes uploads.

## iOS secrets

| Secret | What it is / how to get it |
|---|---|
| `IOS_DIST_CERT_P12_BASE64` | An **Apple Distribution** certificate exported from Keychain as `.p12` (or created in the Apple Developer portal), then `base64 -w0 cert.p12`. |
| `IOS_DIST_CERT_PASSWORD` | The password you set when exporting the `.p12`. |
| `IOS_PROVISIONING_PROFILE_BASE64` | An **App Store** provisioning profile for `com.learnnoelia.app`, created in the Developer portal, `base64 -w0 profile.mobileprovision`. |
| `APPSTORE_TEAM_ID` | Your 10-char Apple Team ID (Developer portal → Membership). |
| `APPSTORE_API_KEY_ID` | App Store Connect → **Users and Access → Integrations → App Store Connect API** → create a key (App Manager role). This is the Key ID. |
| `APPSTORE_API_ISSUER_ID` | Shown on that same API Keys page (one per team). |
| `APPSTORE_API_PRIVATE_KEY` | The `.p8` file downloaded when you created the API key (one-time download), `base64 -w0 AuthKey_XXXX.p8`. |

## Running it

Actions tab → **Mobile release (Play + TestFlight)** → **Run workflow** →
pick `both`, `android`, or `ios`. Each run auto-bumps the build number from the
run number. Signed artifacts (`.aab` / `.ipa`) are also attached to the run.

## Notes / risks
- **First submission** on each store still needs the one-time store setup you've
  started (app record, listing, data-safety/privacy forms, screenshots). CI
  pushes the binary to the **internal/TestFlight** track; you promote to review
  from the console.
- **Apple review guideline 4.2** ("minimum functionality"): the app is a signed
  shell around learnnoelia.com. Pure web wrappers are sometimes rejected; adding
  native touches (push, offline, share) strengthens the case. Flag if review
  pushes back and we'll harden it.
- Nothing secret is committed — all credentials live in GitHub Actions secrets.
