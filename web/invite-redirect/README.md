# Invite redirect landing page

`index.html` is a single static file with no build step. It's what someone
lands on when they tap a SafeWord invite link (`?token=<token>`) and don't
have the app installed: it tries to open `safeword://invite/<token>` right
away, and if nothing happens after ~1.5 seconds it shows a short explainer
plus "Get it on Google Play" / "Download on the App Store" links.

## Deploying

Any static host works — no server, no build:

- **GitHub Pages**: enable Pages for this repo (or a dedicated repo) pointed
  at this folder, or copy `index.html` into a `gh-pages` branch.
- **Vercel** / **Netlify**: point either at this directory as the project
  root (or set it as the "publish directory") with no build command.

Whichever host you use, once deployed set its URL as
`EXPO_PUBLIC_INVITE_LANDING_URL` (see `.env.example`) so
`buildInviteUrl()` in `src/lib/invite.ts` shares this page instead of the
bare `safeword://` deep link. Leaving that env var unset keeps today's
behavior — no hosting required to keep the app working.

## Known placeholder

The Apple App Store link is `href="#"` — there's no App Store listing yet.
Replace it with the real `https://apps.apple.com/app/id<ID>` URL once the
app has been submitted and has an App Store id.
