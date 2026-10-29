# Decisions

Non-obvious choices, newest first. One entry per decision: what, why, and what it rules out.

## 2026-10-29 · Structured data on Services, Work and Contact

- **/services** lists the three services as schema.org `Service` nodes (from `src/lib/services.ts`), each with its on-page anchor and Dawid as provider, plus breadcrumbs.
- **/work** is a `CollectionPage` whose `ItemList` holds only public case studies; locked ones are noindex, so listing them would point Google at pages it can't index.
- **/contact** is a `ContactPage` about the Person node, plus breadcrumbs.
- **`jobTitle` stays "Senior Product Designer".** Dawid positions himself as a senior or lead product designer for hire, not as a freelancer, so the data says the role, not the contract type.

## 2026-10-29 · Contact page; every call to action leads to it

- **New `/contact` page** at Dawid's request: "Got a project in mind? Let's talk." and the email as a link at a new display size (`--text-display`, 56 → 128, with `--leading-display` and `--tracking-display`; add them to the Figma Foundations file too), then the case-study carousel. It breaks after the @ on narrow screens rather than shrinking the email below h1. Round 2 (Dawid's mock-up): the services list, the Write/Copy buttons and the carousel caption were removed; the title and lead are narrower.
- **Round 3: one screen, no footer.** `/contact` uses SiteLayout `fit`: no footer or back-to-top, and the page is exactly the viewport tall, so there is nothing to scroll. The case-study row takes the room left under the email and its covers are sized so about two thirds of each shows, the rest running off the bottom edge (container query units). A hard scroll lock was ruled out: on very short screens (around 1440×700) the page scrolls a little instead of hiding content.
- **Round 4: a simpler hover and a one-line email.** The magnet pull and the "View project" pill are gone. A hovered cover stops the row and rises until nine tenths of it shows (`--work-marquee-lift`, CSS only, so motion.ts has nothing for it); the covers are sized so the lifted one still fits under the email. `--text-display` is the one exception to the type scale: sized to the content width (the email is about 8.6em wide) so it always sits on one line, at most 128px and at most 14svh.
- **`WorkMarquee` (new block):** case-study covers drifting sideways, all cropped 4:3 like the work cards, no captions (round 2), after alexandre-araujo.com/contact. Built like the ClientLogos marquee; pauses on hover and focus; reduced motion gives a still row that scrolls sideways.
- **Every email CTA goes to `/contact`:** the Home hero, the footer ("Get in touch"), Services' "Start a conversation". The footer's closing line and button are hidden on `/contact` itself (`footerCta={false}`). Mailto links stay where the email is information rather than a CTA: the privacy page and the locked case-study panel (which pre-fills a subject).
- **Social links:** Behance and Instagram added (footer, structured data). The open menu shows LinkedIn, Dribbble and Instagram in place of the email button, in the footer's link style, and Contact is the last menu link. The open panel's inset went from 4 to 8px. The footer's Privacy link reads "Privacy policy" in the same style as the social links.

## 2026-10-29 · One share image for every page

- **Every page shares `public/og.jpg`,** Dawid's new card ("Transforming AI capability into products people actually trust."). Case studies and locked case studies no longer use a crop of their cover, at Dawid's request, so every link from the site previews the same way. The cover crop stays as the `image` in case-study structured data.
- **JPEG, not PNG.** The supplied PNG is 467 KB; the JPEG is 89 KB and looks the same. WhatsApp and some chat apps skip previews over about 300 KB.
- `SITE.ogImage.alt` now describes the new card. Change both together.

## 2026-10-29 · Figure `diagram` variant for line drawings

`<Figure variant="diagram" width="content">` shows a transparent line drawing at the text width with no card, corners or background, so it reads as part of the text. Diagrams are drawn in dark ink and inverted in the dark theme (`invert(1) hue-rotate(180deg)`), so one file works in both. Trim transparent padding from the source so the spacing comes from the page. First used for the Anvil UI levels.

## 2026-10-29 · Several demo clips share one frame (VideoTabs)

To show more of a product without making the page longer, `VideoTabs` (content, available in MDX) puts several clips in one frame with a tab per clip. Each clip is a regular `Video`, so loading, autoplay and reduced motion behave the same; only the chosen clip shows, and switching starts it from the beginning. Without JS every clip shows in turn, captioned with its tab name, so nothing is lost. Used for the three Anvil Showroom flows, which replace the stand-in clip.

## 2026-10-28 · Case study images are AVIF

Every image in `src/content/work/` is stored as AVIF (sharp, quality 80, 4:4:4 chroma so UI text and thin lines stay crisp), and `Figure`, `WorkCard`, `NextUp`, the case-study cover and the `Video` poster render AVIF instead of Astro's default WebP. Sources went from 22.5 MB to 12.4 MB, including the new Pantheon and Anvil images. The share image stays JPEG because social previews don't read AVIF. Add new case-study images as AVIF too.

## 2026-10-28 · Zazmic Anvil UI case study goes live

`draft: false` on Dawid's go-ahead. The image slots are still `Figure` placeholders, so production shows the text, the stand-in cover and the stand-in Showroom clip without them until the real images arrive. The invented Anthony Marin quote is taken out before going live, because a made-up quote under a real name shouldn't be public. An MDX comment marks where the real one goes.

## 2026-10-28 · Video: looping clips that play in view

- **New `Video` (ui), available in MDX without an import** like `Figure`. Muted, looping, inline, `preload="none"` with a poster (first frame, served as WebP up to 2560px) that also sets the size, so nothing downloads until the clip is needed and there's no layout shift. Two sources: AV1 MP4 first (smallest and sharpest), H.264 MP4 as the fallback every browser plays. No `src` gives a "Video to come" placeholder on previews, like `Figure`.
- **Plays only while half of it is on screen** (IntersectionObserver in the component script, not `motion.ts`: it isn't an animation and needs no GSAP). Off screen it pauses.
- **A pause/play button sits in the corner** (WCAG 2.2.2 needs a way to stop moving content). A pause by hand sticks when the clip scrolls back in. If the browser refuses autoplay (data saver, low power mode), the native controls come back.
- **Without JS, or with reduced motion**, the native controls stay and nothing autoplays.
- **Clips are 2x, for Retina.** A wide video shows up to 1280 CSS px (80rem), so it needs 2560 real pixels: record at 2x and export 2560×1440 for 16:9; any other width is also 2x its displayed width. Never upscale a 1x recording; it stays soft. UI loops compress so well that 2x costs little (the stand-in is 360 KB AV1, 480 KB H.264 for 12 s).
- **Encoding for new clips**: 30fps, no audio. `ffmpeg -c:v libsvtav1 -crf 30 -preset 5` for AV1 and `-c:v libx264 -preset slow -crf 20 -tune animation` for H.264, both with `-movflags +faststart -an`. Files sit next to the MDX (Cloudflare Pages caps a file at 25 MB).
- **The Zazmic Showroom clip is a stand-in** recorded from the public Storybook (2560×1440, 12 s, frame-stepped with a fake clock so it is a smooth 30fps) until Dawid sends the real recordings. The styleguide uses a 5 s cut of it in `src/assets/placeholders/`.

## 2026-10-28 · Zazmic Anvil UI case study

- **New draft case study, `zazmic-anvil-ui`**, first in `order` (0.5) as the most recent and most AI-focused work. It stays `draft: true` until Dawid has reviewed it and sent the images; every image is a `Figure` placeholder for now.
- **The cover is a stand-in**: a screenshot of the live Showroom booking flow from the public Storybook, until Dawid sends the final one.
- **The time savings are estimates Dawid asked for**, not measurements (about six weeks down to a week and a half of interface work, about 350 hours per project), labelled "(estimate)" in the highlights. Every other number comes from the Anvil repository.
- **The Anthony Marin quote is a placeholder** written for the draft, at Dawid's request, until Dawid sends the real one.
- **Small grammar slips on purpose.** At Dawid's request the body carries about 25 minor non-native slips (missing articles, prepositions, tense), roughly 2% of its words, so it reads like Dawid's own writing. Title, description, lead, headings, highlights, alt text and the quote stay clean. An MDX comment warns against proofreading them away.
- **`Figure` grid track is `minmax(0, 1fr)`** so a long placeholder label can't push the figure 1px past a 375px viewport.

## 2026-10-28 · Client logos between the hero and About, no caption

- **The marquee moves up**, out of the About statement, to sit right under the hero, and the "Trusted by teams at" caption is gone (Dawid's call: the logos speak for themselves). The list keeps its accessible name ("Companies I have worked with").
- It has `--space-section-md` above it; About keeps its own `--space-section-lg` above and `--space-section-md` below, so it still stands apart from the logos and the work. `StoryIntro` loses the slot it gained for the marquee.

## 2026-10-28 · Client logos move into the About statement on Home

- **The marquee now sits inside the About statement**, under the text, instead of in its own section above the footer. `StoryIntro` gained a default slot that renders after the statement at full width (the statement keeps the container width), so the marquee still runs edge to edge. "Trusted by teams at" stays as its caption.
- **More room around About.** It now has `--space-section-lg` above (was `--space-section-sm`) and `--space-section-md` below (was none), with `--space-section-md` between the statement and the logos. The work section's own `--space-section-lg` stacks on top of the bottom space, so About reads as its own band between the hero and the work.

## 2026-10-28 · Case study pages: cover, client logo, Next up, contents mini map

- **The cover runs edge to edge** at every size, with no radius. Phones get a 3:2 crop. From 48em the frame is 2:1 and holds the cover at 16:9, centred; with the motion layer the image drifts from its top edge to its bottom edge while the frame scrolls past (`[data-parallax]`, GSAP ScrollTrigger in `motion.ts`, so it stays in step with Lenis). The drift is exactly the overhang, so no edge ever shows; without motion it stays centred. `sizes="100vw"`, up to the 3200px rendition.
- **The facts are My role, Industry, Business and Date**, in two columns at the text width (a narrow Container). Date is a new optional `date` string, written as Dawid gives it ("2021", "2016–2025"), falling back to `year`; it only shows when set, so a case study without one has three facts. Company is gone (the logo carries it), and so is the project link ("See it live"): the `link` field is removed from the schema and from every case study.
- **The client logo is back above the title**, in place of the "Case study · Company" line. New optional `client` field in the schema (a key of `CLIENTS`), and a new `ClientLogo` (ui) that inlines one logo in the text colour; `ClientLogos` now renders through it. Its accessible name is "Case study for <company>". Every case study now has one (NerdWallet and CSS Peeper added from Dawid's files; CSS Peeper's gradient mark runs from the text colour to 60% of it, so it works in both themes). The text line is the fallback for a case study without one. Logo lists (`ClientLogos`, the Home marquee) use `WORKED_WITH`, which is every client but CSS Peeper, Dawid's own product; NerdWallet joins the marquee.
- **"Next up" replaces "Next case study".** Dawid picked the ruled index from a six-option navigation playground (Split, Pull through, Index, Filmstrip, Remote, Stories; removed once chosen). `NextUp` lists up to three case studies: the curated `next` first when it has a page, then the ones after this case study in `order`, wrapping round. Rows dim the others on hover; with a fine pointer and the motion layer, the hovered row's cover floats beside the pointer (`coverFollow` in `motion.ts`). Without hover, each row carries a small cover thumbnail instead. `NextProject` is gone.
- **Contents mini map** (`CaseStudyToc`), fixed at the right edge from 62em while the case-study body is on screen: one short line per h2. Compact at rest, its right edge in line with Back to top (`--space-8`). Lines are `--space-4` (the current one `--space-6`). Hovering it opens the rows up a little, and only the hovered or focused row shows its title, one at a time: its line shrinks to half and the title sits to the left of where the full line was, so the pointer never covers it, arriving with the "signal settle" from the link playground: letters come in as noise and lock in from the left over 420 ms (the row tear was tried first and didn't read on such small text), with no panel behind (Dawid's feedback on a first version that opened every title on a glass panel). Each row is an anchor (Lenis smooths the jump). Each line fills as its section is read and the current one is longer and in the text colour (`aria-current="location"`). A small component script measures the headings on scroll; without it the map stays hidden. h3s are left out to keep the map short. Also on `/styleguide`, over its own sections.
- **No glitch on case-study card hovers.** On Dawid's call the torn-rows flash is gone from `WorkCard`; the cover keeps its slow zoom. `--duration-glitch` is removed (remove it from Figma too).
- **Dates from Dawid**, as `date`: Newsweek 2025–2026, NerdWallet 2022–2023, Pantheon 2021–2022, BeatStars 2020–2021 (both), Google 2021–2022, XWP 2021–2024, CSS Peeper 2025.
- **Card eyebrows read "Role · Company"** (Work and Home), as on Webflow, from the `role` and `company` fields ("Draft" still added on previews). The year is no longer on the card.
- **The name in the nav no longer tears** on hover; the M mark still does (`data-tear-self` on the home link: motion.ts only flags `[data-tearing]` and Nav's CSS tears the mark).

## 2026-10-28 · Password-protected case studies, locked on the server

`protected: true` now locks a case study on every build, production included. NerdWallet is the first one (Dawid's pick). This replaces "protected drafts get no page on previews" and removes `SHOW_PROTECTED_DRAFTS`.

- **The content never ships as a static file.** Astro builds the full page and a locked page (`/work/<slug>/locked`). After the build, `tooling/protected-work.mjs` moves the full page's HTML into a generated module (`.generated/protected-pages.js`, git-ignored) and puts the locked page at `/work/<slug>`. Cloudflare Pages bundles that module into the Pages Function `functions/work/_middleware.ts`, which is the only place the content exists. A client-side lock (blur, JS check, encrypted HTML) was ruled out: the text would still be in the download.
- **The gate.** The form posts the password to `/work/<slug>`. The function compares it in constant time with `CASE_STUDY_PASSWORD` (a Pages secret, set per environment), then sets an HttpOnly, Secure, SameSite=Lax cookie for 30 days and redirects back. The cookie is the expiry signed (HMAC-SHA256) with the password, so there is no second secret, and changing the password locks everyone out. One password opens every protected case study. Unlocked responses are `private, no-store` and `noindex`. Without the secret nothing unlocks.
- **Wrong password:** the function serves the locked page with a 401 and the form switched to its error state, so it works without JS. The field takes a heavier red ring, a faint red tint and a red warning sign, the message shows under it in red, left-aligned with the field, and the field skips sideways once. Typing again clears it.
- **Locked state:** `LockPanel` centred on the first screen over the hero grain (`HeroBackdrop`), as on other heroes: padlock, "This case study is password protected", password field with a plain Unlock button, and a full-width line inviting people to email for access. A blurred stand-in of the page behind it was tried first; Dawid preferred the plain grain. Cards of protected work show a padlock on the cover (see 2026-10-29).
- **Not covered:** images used only inside a protected case study are still files in `/_astro/` under hashed names. Nothing public links to them, but they are not behind the password. Brute force is not rate limited by the function; a Cloudflare rate-limiting rule on `POST /work/*` covers that if needed.
- **New tokens:** `--shadow-panel`, and the site's only colour, for errors: `--red-600` / `--red-400` primitives, `--color-danger` (5.9:1 on white, 7.1:1 on the dark background, AA) and `--color-danger-bg` (add to Figma).

## 2026-10-28 · Scroll budget: idle loops yield to scrolling

Profiled scrolling on every page (Chromium, 1440 desktop and 375 mobile with 4× CPU throttling). Only two pages spend frames on things the visitor isn't looking at, so those are the fixes; the motion itself is unchanged.

- **Home portrait.** The glitch drew every frame while the hero was on screen, including while the page scrolled past it. At rest it now draws at about 30 fps (the bands roll slowly and jitter at 14 fps, so it looks the same) and holds still while the page is scrolling, picking up 160 ms after the last scroll event. Pointing and touch still run every frame.
- **About hero (Mindblown).** Its idle loops (bobbing, floating cards, brows, the card tails' per-frame layout reads, the CSS boil, blink and belt) never stopped. They now pause while the hero is off screen and resume where they were. Tweens the script had paused itself stay paused.
- **Lenis `lerp` 0.1 → 0.16.** The default trails the wheel by a long glide; 0.16 keeps the smoothing but settles in about half the time, which reads as snappier. Touch scrolling was and stays native.
- **Fade reveals 1.2 s / 48 px → 0.8 s / 24 px.** On a quick scroll, cards were still drifting in after the reader had arrived. Heading line reveals are unchanged.

## 2026-10-28 · Portrait reveal: glitch only

With glitch picked, the liquid and pixels styles are gone, and the component is renamed for what it is: `LiquidReveal` → `PortraitReveal` (`<portrait-reveal>`, `portrait-reveal.ts`, `.portrait-reveal` classes). It has no `reveal` prop or `data-style` any more, and the liquid's tuning props (size, soft, pull, wobble, fade, orbit) went with it. `portrait-reveal.ts` now only hosts the glitch: canvas, layer textures, loading, theme, pointer and the frame loop. The liquid's trail mask and composite shaders, its motion model and `reveal-pixels.ts` are deleted, so the hero script is about 12 KB instead of 26 KB. The glitch engine is unchanged; its row texture moved from unit 6 to the now free unit 5. Without WebGL, or if the glitch shader fails, the static photo stays (there is no liquid to fall back to). The "Liquid (current)" tile left the reveal playground.

## 2026-10-28 · About hand-off: Flow

Dawid asked for alternatives to the inverse panel that grew over the held hero, so the About statement reads as a continuation of the hero rather than a separate block, with mobile first. Six were built on a preview with a switcher (Flow, Ink, Split, Sheet, Bridge, Avatar); Dawid shortlisted Flow and Split and picked **Flow**.

- **Same surface as the hero, nothing pinned.** The statement sits on the page background right after the hero; its words light up in reading order as it scrolls through the screen (scrubbed, `motion.ts`). The hero no longer holds or eases back, so `data-hero` and the 260svh pinned track are gone, and on mobile the hero keeps the whole first screen.
- **No separator.** A hairline that drew in above the label was tried and dropped (Dawid: redundant).
- **No bottom padding** on the section: the Selected work section brings its own space above it.
- **Complete without the motion layer**: all words fully lit.

## 2026-10-28 · Case study cards

**Home keeps the staggered grid; Work becomes a ruled index.** Picked from seven layouts in a card playground (PR #20, removed once chosen). `WorkCard` has two layouts, `tile` (Home) and `row` (Work: cover left, text right, hairlines between rows); `WorkGrid` picks one with `layout="grid" | "index"`.

**Titles go from h4 to h3 size** on both, so the quiet links read as the main thing on the card.

**Cards show the first three tags as pills, then "+N more".** The case study page still lists every tag. Which three show is the order in the frontmatter, so put the main ones first.

**Cover hover is a short glitch, CSS only.** Two hidden copies of the cover flash in as torn rows that jump sideways for about 400 ms (`--duration-glitch`, new token: mirror it in Figma), then the cover snaps back clean and zooms as before. Same language as the hero's glitch reveal and the link row tear, without WebGL or JS on a list of eight images. The copies use the cover's own srcset, so the browser reuses the file. Reduced motion: no glitch, no zoom.

**Work rows carry the card summary (`description`), cut to four lines** with a CSS line clamp (the browser adds the ellipsis). The page intro (`lead`) often describes the company rather than Dawid's part, so cards use the summary. Home tiles have no summary.

## 2026-10-28 · Buttons: one family, the row tear

Dawid picked **row tear** from the button playground (`/playground/buttons`), with icon buttons excluded. `Button` is now the only button on the site.

- **Text buttons tear into their hover colours.** The button stacks its face and two aria-hidden copies in the hover colours in one grid cell. On hover or keyboard focus the copies arrive as three rows that jolt sideways for `--duration-tear`, then lock together. Primary (inverse fill) lands as an outline. Secondary keeps its outline style (Dawid: it shouldn't turn into a primary): a subtle `--color-border-muted` ring at rest, a black ring after the tear, never filled. The face hides while hovered so the transparent copies don't double the label. CSS only, unlike the links: a button never wraps, so fixed rows work, and no JS has to run first. After the tear the middle copy hides and the top copy shows whole, so no seams are left at the row edges.
- **Icon buttons don't tear.** They share the colours and the swap (a secondary icon button only darkens its ring), and the icon moves where it points: it leaves through that edge and comes back in from the opposite one (Back to top goes up, an arrow goes right). Icon-only is `icon` + `label` (the accessible name).
- **New `size="lg"` and `icon` prop.** The footer email is `lg` with an arrow, the menu contact is `sm`, Back to top is a secondary icon button that keeps its glass background and scroll-driven fade from `SiteLayout`. The hand-made pills and their CSS are gone.
- **Home hero calls to action are buttons**: About me (primary) and Contact (secondary), both with the arrow. Primary follows the original order.
- **The theme switch and the menu button stay nav chrome** with their grey hover; they are not `Button`.

## 2026-10-28 · Links: one hover, the row tear

Dawid picked **row tear** from the link playground, with one change: the underline never thickens. Every text, action and quiet link now keeps its hairline and, on hover or keyboard focus, tears into three rows that jolt sideways for 260 ms (`--duration-tear`, needs mirroring in Figma), then snaps back.

- **Built in `motion.ts`, styled in `base.css`.** On first hover the label (everything before the link's icon) is wrapped in `.link-tear`; each run lays two aria-hidden copies over every rendered line, so wrapped links (card titles, long links in case studies) tear line by line, and removes them afterwards. The real text stays in the DOM, so the accessible name never changes. Pseudo-elements were ruled out because card titles, Next project and the menu's current-page dot already use `::after`.
- **Opt-out with `[data-no-tear]`:** buttons, the footer email and menu contact pills, Back to top and the skip link keep their own hovers.
- **Quiet links don't tear** (Dawid: too much motion). Menu links, work card titles and Next project only draw the hairline in on hover. The menu's current-page dot is gone.
- **Quiet links sit their line nearer the baseline** (`--underline-offset`, token `--underline-offset-quiet` 0.14em, needs mirroring in Figma). Text links keep the line at the bottom of the text box.
- **The logo tears instead of rolling.** The M tears with two copies of its SVG (styled in `Nav`, same keyframes); the name is named as the label with `[data-tear-label]`. No underline on the logo.
- **Reduced motion and no JS:** no tear, just the hairline. That is the complete state; the tear is decoration.
- Not done yet from the audit: turning the pills into Buttons and the other role clean-ups (footer social quiet, consistent card-title motion, ↗ on external links in MDX).

## 2026-10-28 · Link playground (audit + six hovers)

- **Audit first.** The site has twelve hover behaviours across links, pills and buttons (listed on the page). Proposal: three link roles (text, action with arrow, quiet) sharing one hover; pills become Buttons; the logo roll stays as the one exception.
- **Six options from the glitch reveal**, each shown in every role on light, dark and the inverse surface: tracking band, row tear, colour split, signal settle, rows open, torn underline. Black and white only, so the glitch's colour split becomes grey ghosts (no new tokens).
- **`backdrop-filter: invert(1)` for the band and the rows.** Inverting what is underneath gives the inverse surface in both themes and on the inverse panel without knowing the colours.
- **Rows use whole-pixel scan lines (3px)** with complementary masks, so odd and even rows meet without hairline seams when closed.
- **Isolated** under `src/experiments/links/`, page `/playground/links` (private: noindex, out of the sitemap via the existing `/playground` prefix). Not production code; the picked option gets rebuilt in `base.css` / `Link`.

## 2026-10-28 · One navigation for every screen size

- **One bar that grows into the menu, at every size.** Studied on thedesignsociety.fr and anthracitestudio.be: a compact floating bar (mark, name, theme, menu) that is the same on desktop and mobile and opens in place instead of covering the screen. Round 2, after Dawid's feedback: the drop-down content (big links, email) with the two-step motion. First the bar makes room (on desktop it widens from 22 to 28rem and its surface grows a few pixels past the content; on phones the surface grows out to the screen edges and the top), then it drops open. Social links left out. Tried on a preview switcher against the old nav; Dawid approved it, so it replaced the desktop pill and the full-screen mobile sheet in `Nav` (the switcher is gone).
- **Frosted glass, not a solid panel.** Like Anthracite, the open menu is translucent (`--color-glass`) with a backdrop blur (`--blur-menu`), so the page shows through softly. The page behind gets only a light dim (`--color-scrim`).
- **The nav is named for page transitions only while one runs.** An element with a `view-transition-name` is a backdrop root, so nothing inside it could blur the page behind (this also affected the current pill's blur). BaseLayout sets `html[data-vt]` on `pageswap`/`pagereveal` when a transition runs, and only then does the nav take `view-transition-name: nav`, so it still stays put between pages.
- **A link in the open menu collapses it during the page transition.** The page changes right away, with no wait. The new page starts with the menu open, exactly as the last one left it (a sessionStorage note read by an inline script before first paint), and closes it there with the usual motion while the page rises in. During that transition the nav shows only the new page's live image (`html[data-nav-collapse]` in base.css), so the collapse plays through the transition. A link to the current page only closes the menu; new-tab clicks and mailto links are untouched. With reduced motion there is no transition and the new page starts closed.
- **Menu and theme icons share one grid.** The menu icon is an SVG on the same 24-unit grid, box (1.125em) and stroke (1.75) as the theme icon, so the two read as a pair; its lines meet and turn into the cross.
- **New tokens** `--color-scrim`, `--color-glass`, `--blur-menu`, `--duration-menu`. Need mirroring in Figma.

## 2026-10-27 · Portrait reveal styles: liquid, pixels, glitch

From the playground Dawid kept the liquid, pixel dither and glitch slices, with two notes: the resting animation suits only the liquid, pixels switched layers too abruptly, and glitch needs calm moments to show what it revealed. A first pass made pixels and glitch hover-only readings of the liquid; Dawid then asked for resting animations and hover behaviour that follow each style's own physics. All three live in `LiquidReveal` (`reveal` prop / `data-style`) on one canvas with the same layers; pixels and glitch are separate engines (`src/scripts/reveal-pixels.ts`, `reveal-glitch.ts`, shared GL helpers in `reveal-gl.ts`), not the liquid's trail.

- **Liquid** is unchanged: orbiting head, roaming drops, pours. The composite favours the head's current layer where layers overlap, so a new pick shows straight away.
- **Pixels are a living colony.** 8 px cells run a Game-of-Life style automaton on the GPU, 10 ticks a second (survive with 2–3 neighbours, born with 3, die of age after ~4.5 s, only on the figure). A newborn takes the layer most of its neighbours carry, so where colonies of different layers meet they compete cell by cell and the layers weave instead of switching. At rest a small seed lands on the face every 0.3–0.7 s and grows or dies by the rules; about 1.5 single cells a second twinkle to a layer for one tick. The pointer feeds the colonies: births need only 2 neighbours near it, cells age slower and new cells appear outright, so holding still blooms a dense patch and moving leaves a dotted trail that breaks up by the same rules. Age keeps the density bounded without any global clean-up.
- **Glitch is a weak video signal** in 6 px rows. At rest two tracking bands roll slowly down (VHS mistracking), each showing another layer (by weight) with a light shimmer and picking a new one each time it wraps. A wrapped band comes back in after a random gap, so the distance between the two keeps changing; every 6–8 s a hiccup tears a few rows elsewhere for 150 ms. (Tried and dropped: a single band (Dawid asked for a second one) and two fast streaks at random heights, which read as too random.) The pointer is interference: the band snaps to its height, widens and opens a span around it with ragged row ends; speed drives the tearing and colour split, holding still settles into a clean view, and rows left behind hold for 0.1–0.7 s before closing one by one. Layer switches (arrival, tap, every 3.2–5 s) are bursts with a 1.4 s cooldown, so the reveal is readable most of the time. Row state lives in JS and is uploaded as a tiny texture each frame.
- **Bands pair up, layers weigh the same.** Dawid found the iridescent layer too rare (weight 0.3) and asked that two bands running together are always one marble and one iridescent. Both layers now weigh 1. A wrapping band still picks at random; when that matches the other band, the other one switches with a small tear, so neither band is stuck on one layer. On hover, taps and timed switches always change the layer (the arrival pick stays random).
- **Reduced motion:** no automaton, band roll, hiccups or tearing. Pixels show a still patch of cells under the pointer, glitch a clean band at the pointer.
- **Cost:** pixels redraw only on ticks (one small grid pass plus the composite); glitch uploads a rows × 2 texture (~1 KB) per frame. Both keep running at rest, like the liquid, and pause off screen the same way.
- **Preview switcher.** `RevealPicker` (bottom right, previews only, never on production) sets the style on the home hero; remembered in localStorage, `?reveal=pixels|glitch|liquid` also works. Without a stored choice it shows the hero's own style. Dawid chose **glitch**: the home hero sets `reveal="glitch"`, so production shows glitch; liquid and pixels stay available as options. _Update 2026-10-28:_ the switcher was still on previews after the pick; removed from the home hero, so previews show glitch too.

## 2026-10-27 · Multi-layer liquid portrait and a reveal playground

Dawid wanted the hero liquid to reveal 3–4 layers at random, with the real photo as the default, the iridescent sculpture as the rarest, and themed versions of the clay and marble. After trying it, Dawid dropped the clay, so two layers remain.

- **Photo on top, layers below.** `LiquidReveal` now takes `top` and `layers` (1–4, each `{ light, dark?, weight? }`) instead of photo/clay/clayDark. Home: marble (white in light, black and gold in dark) and iridescent (both themes, weight 0.3, later 1, see the glitch notes). The set lives in `src/lib/portrait.ts`. The clay pair (black in light, white in dark) was tried and removed.
- **One mask channel per layer.** The trail mask was RGBA but used only red; each layer now has its own channel, so four layers cost the same mask pass as one. Every blob carries a layer; the composite merges each layer's blobs with its trail, masks the photo with the union and fills each pixel with the deepest (freshest) layer. Hard cap of 4 layers (channels), which also fits WebGL 1's 8 guaranteed texture units (we use 6).
- **Picking.** Weighted random over all loaded layers, the current one included (a pick of the current layer changes nothing). Excluding it would make a rare layer come up every other time with only two layers. The head picks a new layer when the pointer arrives, on a tap and every 1.6–3.2 s on hover (3.5–6 s at rest). The old head is left behind as trail in its own layer and the new one wells up inside it over 0.5 s, so a switch reads as a pour, not a cut. Each roaming drop picks a new layer whenever it has dried up. Reduced motion: a new layer per hover only.
- **Memory.** Images used to be painted into 2D canvases that stayed allocated next to their textures. Now each is painted into one scratch canvas, uploaded, and the scratch is released. At 1440 (2x) the photo plus three layers use about 52 MB including the drawing buffer, the same as the old two-layer version; at 375 about 16 MB. Layer textures are capped at 64 MB in total, so huge retina screens draw them slightly below device resolution.
- **Lazy layers.** The canvas starts with the photo and the first layer (marble); the rest follow one at a time at low fetch priority, each uploaded in its own idle slot, and join the picks once ready. Skipped on Save-Data or 2G/3G. A theme switch reloads only the variants already in use.
- **AVIF.** Dawid's 2400 × 1792 PNGs (12 MB) are committed as AVIF masters at quality 80 with 4:4:4 chroma (770 KB without the clay). Astro serves the photo at quality 65 (161 KB at 2400, 89 KB at 1600) and the layers at 55, which is visually identical at 100% on the hair and marble veins and about half the bytes. Extras at 1440 (marble and iridescent): about 100 KB (light) to 125 KB (dark); at 375 about 45 KB. No WebP fallback: browsers without AVIF keep the static photo (`<img>` is AVIF-only, as before).
- **Reveal playground** (`/playground`, noindex, not linked): the same layers through seven alternatives next to the real liquid: glass lens, ink burn, pixel dither, halftone, Voronoi shards, glitch slices and a full-portrait shockwave. Isolated under `src/experiments/reveals/`; one small WebGL canvas per tile (capped at 1.5x), paused off screen. It is for choosing a direction, not production code.

## 2026-10-27 · SEO groundwork before the domain moves

- **www.mlynarz.com is the canonical host.** Webflow redirected the apex to `www`, so that is the host Google has indexed. `site` in `astro.config.mjs` now uses it; at cutover the apex 301s to `www` in Cloudflare (a redirect rule, not `_redirects`, which can't match on hostname).
- **`/401` redirects to `/`.** It was Webflow's password page and is reachable on the old site.
- **`seoDescription`** joins `seoTitle` in the case-study schema, so the card summary and lead can stay long while search gets a ~155-character version. The build warns (`[seo]` lines) when an indexable page's title runs past 60 characters or its description past 160. Warnings, not errors, so copy edits never block a deploy.
- **Structured data shares one Person.** `src/lib/schema.ts` builds the Person (with `@id` `/#person`, the headshot, `alternateName` without the ł, country and `knowsAbout`) and WebSite (`/#website`). Home carries both; About is a `ProfilePage` with the Person as `mainEntity`; case studies point their `author` at the `@id` and add a `BreadcrumbList`.
- **Analytics: Cloudflare Web Analytics**, cookieless, so no consent banner. The beacon is added only on production builds with `CF_WEB_ANALYTICS_TOKEN` set. Turning on Pages' automatic injection instead would also count preview traffic.
- **Search phrases: AI-ready design systems, agentic UX and freelance product designer** (Dawid's pick; product strategy stays a service but isn't a search target). Every indexable page now has a title of 60 characters or fewer and a description of 160 or fewer, written around those phrases. Case studies keep their long headline and summary on the page and use `seoTitle`/`seoDescription` for search. Revisit with real Search Console queries 4 to 6 weeks after launch.
- **The share image (`public/og.png`) still showed the old tagline** at the time; replaced on 2026-10-29 (see "One share image for every page").
- **Refreshed on 2026-10-29** onto the current site: `SHOW_PROTECTED_DRAFTS` stays removed (server-side protection replaced it), and Zazmic Anvil UI gets its own `seoTitle`/`seoDescription`. Locked case studies stay `noindex` and out of the sitemap.

## 2026-10-27 · Soft rise page transition

- **"Soft rise" replaces the sheet.** Dawid compared four variants live on a preview (curtain, soft rise, columns, spread from the clicked link) and picked soft rise: the old page fades, blurs and lifts away (320 ms), then the new one settles up into focus from 6vh below with a long ease-out (1 s, starting at 200 ms). The backdrop is the page background, so no ink flashes between pages in either theme. The nav is still the only named element and stays put. Timings and distances are tokens (`--duration-page-out`, `--duration-page-in`, `--delay-page-in`, `--shift-page-*`, `--blur-page`); `--duration-page` stays for the ink spread.
- **Back reverses the motion.** On a history traversal backwards, BaseLayout adds the `back` view-transition type (Navigation API), and both pages move the other way. Browsers without the Navigation API play the forward motion.
- **The opt-in is inline in `<head>`.** With `@view-transition` in the shared stylesheet, Chrome sometimes resolved the new page's opt-in before that stylesheet applied and skipped the transition ("ViewTransition opt-in disabled"), so some navigations just loaded the page. Measured in Chromium: about 1 in 2 navigations into About and case studies failed; with the rule inline, 32 of 32 played. Reduced motion still opts out through the same media query.

## 2026-10-27 · Smoother liquid portrait

Dawid found the hero reveal jarring and laggy (references: Framer's "Liquid Mouse Reveal" and framer.university's hover mask reveal: a heavy, lerped follow and a gooey trail that shrinks back). Frame cost was already low after the WebGL pass, so the problem was the motion and the low-res mask, not the frame rate.

- **Critically damped follow.** The head used to chase an already-smoothed cursor through an underdamped spring (overshoot, a second of ramp-in before it reached the pointer). It now follows the pointer directly with an exact critically damped step: heavy, never overshoots, and frame-rate independent (the old 33 ms clamp slowed motion down on dropped frames). The hover blend arrives in ~0.4 s and lets go slowly.
- **The trail recedes instead of fading.** It lives in a small GPU texture that stores a distance ramp; each frame lowers it by a fixed step and stamps the head's path as a capsule. Lowering a distance field moves the edge inwards, so old trail shrinks and tapers like liquid rather than turning into a translucent ghost, and fast moves leave no gaps. Bilinear sampling of a ramp is exact, so the edge stays sharp at full resolution. The step is paid in whole 8-bit units with the remainder carried over, so the heal time is exact at any refresh rate.
- **Head and lobes are analytic** (stretched along velocity, smooth-merged with the trail), drawn per pixel in the composite pass. Droplets and the tendril are gone: they added randomness that read as jitter.
- **No 2D fallback any more.** Without WebGL the static portrait stays; WebGL 1 is universal on the browsers we target and the second renderer was ~200 lines of a different motion model.
- Props (`size`, `soft`, `pull`, `wobble`, `fade`, `orbit`) keep their names and defaults; `pull` now sets how tightly the head follows.
- **Auto mode is livelier** (Dawid: "more fade, some randomness but very smooth, bigger, multiple blobs merging"). At rest the head is ~25% bigger and breathes, its orbit drifts on smooth random curves (three slow sines with random rates and phases, so no two visits look the same and nothing ever jumps), the edge is feathered and the trail lingers 1.6× longer. Three drops roam the face on their own random paths, grow from nothing, swell and dry up, and merge with the head and each other through the same smooth union. On hover they swirl in around the pointer and merge into one blob; the edge sharpens. Reduced motion has no drops.
- **Fragile liquid** (Dawid: "sharper edges, a little ripple, blobs that generate trails of smaller blobs"). The edge is crisp again (about 1.5 px instead of the rest-mode feather) with a fine, travelling ripple whose height grows with speed. Trails are stamped beaded (the radius swells and pinches along the path length), so as a trail heals its necks dry first and it breaks into a string of droplets, like a liquid thread. Fast-moving blobs also shed small droplets (up to 8 at a time) that drift, slow down and dry up. Shedding is the one place with frame-to-frame randomness; everything else stays on smooth curves. Reduced motion: no ripple, beads or droplets.

## 2026-10-27 · Performance pass

Measured with Lighthouse (mobile and desktop presets) on home, About, a case study and Services. Case studies and Services already scored ~100; the two heroes were the problem.

- **The liquid portrait renders with WebGL.** The 2D canvas version cost ~25ms per frame on a desktop and ~170ms on a throttled phone (CPU threshold, `getImageData`, five full-size blend-mode draws), so the home page never went idle. One fragment shader now does the threshold, edge wobble and mix per pixel, with the field still splatted on a small 2D canvas and uploaded as a texture: ~2ms per frame on desktop, ~6ms throttled. The motion model is unchanged; the edge is thresholded at full resolution instead of upscaled, so it is marginally crisper. The 2D path stays as the fallback when WebGL is unavailable. Noise phases are wrapped on the CPU so the clock never outgrows `mediump` floats on phones.
- **The canvas starts after `load` + idle**, decodes its images off the main thread, and reuses the static clay image's file when it is big enough, so the hero no longer downloads the clay twice.
- **The home portrait is the LCP, so it loads eagerly and fades in from its own `onload`** instead of waiting for the module scripts. In the dark theme the (hidden) light clay is still fetched; the light theme is the default, so that trade favours most visitors. Its `sizes` now asks for the drawn width (the image covers a box taller than its ratio), which also made the static image sharper.
- **About head pieces are AVIF at the rendered width** (`srcset` 480/720/963) instead of the 963px WebP originals, and only the resting face and lid load at high priority; the other states load at low priority. About: 670KB → 447KB, mobile Lighthouse 77 → 100.
- **Known lab artefact:** Lighthouse still reports multi-second TBT on the home page at mobile settings. Headless Chrome composites in software and reads the WebGL canvas back on every frame of the always-on orbit; phones and desktops with GPU compositing don't. Options if the lab score matters: start the orbit on first interaction, or cap the canvas at 1.5× pixel density.

## 2026-10-26 · Dotted hero backdrop by default

The About hero's faint dot grid is now the default hero background: `--bg-hero` in `tokens.css` (dots in the new `--color-pattern` over `--color-bg`), used by `HomeHero`, `Hero` (404, styleguide) and the mindblown stage. To let the dots run behind the home portrait, `LiquidReveal` no longer flattens its cutouts onto `--color-bg`: the canvas stays transparent and the liquid masks both layers, so soft edges never let the photo bleed through the clay. `--color-pattern` and the pattern tokens are new; mirror them in Figma Foundations.

## 2026-10-26 · About hero: the "mindblown" experiment

The About page opens with Dawid's approved HTML prototype, ported 1:1 as an isolated experiment in `src/experiments/mindblown/` (component, scoped CSS, `init(root)`/`destroy()` script, card copy in `content.ts`). The centred "Get to know me" intro sits on the same dotted backdrop above the stage, so the old intro paragraph is gone; everything else on the page follows the stripe unchanged.

- Theme colours map by role to semantic tokens (ink → `--color-text`, paper → `--color-bg`, mute → `--color-text-muted`, dots → `--color-border-subtle` mixed into the background, stripe → inverse surface), so the section follows light/dark. The portrait is a sticker: its white outline and the brain, scissors and hole art keep fixed local colours in both themes. Confetti colours are local.
- Type uses the site face and type tokens by role (labels `--text-small`, tags/kicker `--text-caption`, popover title and stripe `--text-h3`, body `--text-body`). Gochi Hand (self-hosted via Fontsource, loaded only on this page), the handwritten sizes and the big stat number stay local.
- Stylelint relaxes hex, `rgb()` and raw lengths for `src/experiments/**` only; layers, BEM and the primitive ban still apply. Everything is under `.mindblown`, so nothing leaks into the site.
- Uses the site's GSAP 3.15 instead of the prototype's 3.12.5. The popover panel has `data-lenis-prevent` so it scrolls natively under Lenis.
- Not on `/styleguide`: it is a one-off page section, not a reusable component.
- Review round 1: the intro now sits inside the stage and fades out when the head opens; the stage is only as tall as intro plus head. Thoughts no longer use fixed slots: on every open they scatter at random in a band around the head (widening only if they don't fit), clear of the face, lid and notes. Phones (stage under 720px) show 6 random thoughts in a 3-column grid. Above 1000px the pills and their dots are 50% bigger.
- Review round 2: 10 random thoughts on desktop, 4 on phones (also scattered at random, at the desktop size); both hand-written hints sit right of the head above the shoulder; the hole spans the full cut; stars sit between ribbon items with equal space; the popover close is a plain X; client logos are off the About page.
- Review round 3: thoughts take the best of a few random free spots (farthest from those already placed), so they spread evenly above and around the head and may cover the flying lid. The brain lives outside the head's filter: white outline, no hard shadow. The portrait's offset shadow is black in both themes.
- Brain click ("new thoughts"): once the head is open, the brain is its own button. It sucks every thought back in with a new pained face while the brain strains, then the super-shocked face and the original explosion throw a new batch. Pinned cards only come out in the first batch of each open; later batches take thoughts that weren't just shown and top up at random when too few are left. `pain-*.webp` was aligned to the other expressions (cropped 21px from the left of Dawid's 1007px export) and split at the same y = 309 cut.
- Experiment (branch `claude/mindblown-peek`): a real photo with an illustrated, slightly surreal layer. No scissors, cut line, snip, shadow or outline. The brain (a flat cartoon) sits inside the head under the lid. The cut is an ellipse seen from slightly above (`--mb-cut`): a flat hole (light pink rim, a dark-to-light pink well) trimmed to the head's outline by `silhouette.webp` (all expressions' alpha), the face strip inside its front half rides on the lid so the lid's edge curves like the rim, and the face below is masked to match while `--cut` is on (closed, the face is whole and the hole hidden, so no seam shows; the face images carry 16 rows above the cut for the same reason). The brain, its three faces (rest, sucking, exploding), the rim, the well's gradient and the brain's shadow come from Dawid's Figma frames (Foundations, brain-sprite), with their colours and proportions in Figma units of the 288-wide ring. Each eye's white glint slides to the side the brain is looking. Open, the brain floats up and down over its shadow. The brain's face is driven by the script, separate from the photo: exploding for a moment on every burst and while the pointer (or focus) is on the risen brain, sucking while thoughts go back in, otherwise the default face; swaps are instant (cross-fades looked odd), and the brows lift now and then. Open, Dawid's super-shocked photo looks up, left or right towards a mouse pointer (look-*-face.webp, aligned to super-face by image registration: +25, +8 px from his 1007 x 896 exports); touch keeps the straight face. While the lid hovers, its shadow falls on the top of the brain (under the lid, clipped to the brain). Hover or keyboard focus lifts the lid and the brain peeks out; the lid leans towards the pointer. No hover effects beyond that. Opening the head throws energy beams, dots and four-point sparkles (purple, pink, lilac, orange) on a canvas with the thoughts, instead of confetti. The cut sits a little higher on the forehead (`--mb-cut-y: 33.3%`) so the rim reads as part of the head. Chrome drops a mask whose ellipse size mixes % and px, so the rim width scales with `--hw` and the masks are plain percentages.
- The prototype relied on content-box sizing, so the stage keeps it. No CSS `translate` next to `transform` in this file: the production minifier drops it (that is what moved the hole and made the brain sit low).

## 2026-10-26 · Work tiles cropped to 4:3

Every case-study cover in the work grid is cropped to 4:3 (`object-fit: cover`, centred), so tiles of different widths read as one set. This replaces "covers keep their original ratio" from v2 revision 2. The case-study page still shows the cover uncropped. If a cover crops badly, set a per-entry focal point (an `object-position` field in the schema) rather than changing the ratio.

## 2026-10-26 · Client logos as an endless marquee

Above the footer on Home, the logos loop endlessly, full width, at every screen size (`ClientLogos marquee`).

- **How it loops:** pure CSS. The list renders twice (the copy is `aria-hidden`, with its own SVG ids) and slides left by one copy over `--duration-marquee` (40s). Each copy ends with the same gap it has between logos (`--space-24`, or `--space-16` below 48em), so the seam is invisible.
- **Polish:** the edges fade into the page with a mask, and hovering pauses it.
- **Reduced motion:** one static, centred, wrapping row.

## 2026-10-26 · Logos back above the footer

On Dawid's call, the About story is back to its original form: the panel grows, the statement lights up word by word, and nothing else is in it (260svh track, no "More about me"). The client logos are a "Trusted by teams at" section again, the last one on Home before the footer, spread across the width in the text colour. `ClientLogos` lost its strip variant and `StoryIntro` its `after` slot, since nothing uses them now.

## 2026-10-26 · v2 revision 2: logo highlight, mobile bar, fade, SEO

- **Logos light up one by one** (superseded: see "Logos back above the footer") in the About story after the statement, using the same dim-to-bright treatment as the words. The repeated, sliding strip is gone. From 62em the ten logos fit the width (32px tall, 40px from 80em). Below that, the one finite line slides along as the logos light up (or swipes, without motion). `.story__inner` uses `minmax(0, 1fr)`, so the wide line can't widen the text column.
- **Mobile nav is a full-width bar**: the M on the left and a two-line menu button on the right. The menu opens with the theme switch's "ink spread", now shared as `src/scripts/spread.ts`. It grows from the button and closes by shrinking back into it. The sheet repeats the bar, so the close button replaces the menu button in place. Without JS it is still a native popover.
- **Content changes:**
  - "More about me" is removed from the story.
  - The hero label reads "Agentic UX • AI-ready design systems • Product strategy".
  - Services are now Product Strategy, Design Systems (AI-ready in the copy) and Agentic UX.
- **Covers keep their original aspect ratio.** The grid only varies tile width and offset.
- **Portrait on load:** the liquid intro is replaced by a plain opacity fade (0 → 100%, `--duration-fade`), triggered when the static image has decoded, with a 3s failsafe.
- **SEO:**
  - The default description now leads with the three services.
  - Open Graph and Twitter tags include image, size, type, alt and locale. The site-wide image is Dawid's `og.png`. Case studies use `og:type` article and a 1200×630 crop of their cover.
  - JSON-LD: WebSite + Person on Home, CreativeWork on case studies.
  - New favicon set from the M mark: `favicon.svg`, `favicon.ico` (16/32), `apple-touch-icon.png`, 192/512 icons and `site.webmanifest`, plus `theme-color`.

## 2026-10-26 · Logo strip in the story, liquid load reveal, nav pill polish

- **New client logos.** There are ten, from Dawid's set, on a shared 48px artboard: Newsweek, Google, Twitch, Pearson, HolidayCheck, Pantheon, BeatStars, XWP, X-Team and Zazmic. Passion is gone. Only black is recoloured to `currentColor`, because white appears solely inside their masks and clip paths. Mask and clip ids get a per-copy suffix so repeated logos stay valid.
- **The logos live in the About story on Home** (`ClientLogos strip` in the `after` slot of `StoryIntro`). The strip is three copies on one line, and once the words have lit up the motion layer slides it left to right by one copy's width. The story track is now 380svh to give it room. The standalone "Trusted by teams at" section was removed. Without motion the strip is a plain row.
- **Liquid load reveal.** On load, the portrait pours in from the face: a liquid blob with drifting lobes grows over two seconds (ease in-out), using the same iso-surface and wobble as the hover liquid. The orbiting liquid then fades in. The static image waits hidden under the motion layer, and a 3s failsafe shows it if the script never gets ready. Reduced motion skips the intro.
- **Descenders in line reveals.** SplitText's line masks were exactly one line tall and cut the "g" in "Transforming" at 0.98 leading. The masks now bleed `--line-mask-bleed` (0.16em) below, with a matching negative margin, so spacing is unchanged.
- **Nav pill.** Every item is `--nav-item-size` (40px) tall, with an even `--space-1` inset all round. The theme switch matches the M circle. On hover the M no longer scales; it rolls up out of the circle while its twin rolls in from below.

## 2026-10-26 · Theme: light by default, switched only by the visitor

- **Two states, no system mode.** The toggle switches between light and dark, and the OS preference is ignored. `:root` is `color-scheme: light` and only `data-theme="dark"` turns dark, so `light-dark()` tokens keep working. The choice is saved in `localStorage` and applied before first paint. The toggle is an `aria-pressed` "Dark mode" button, and its sun and moon icons turn into each other.
- **Transition: "ink spread".** The new theme grows as a circle from the toggle over the old one (a same-document View Transition, `theme-spread` in base.css, `--duration-page`). Named transition elements are flattened for this transition so everything switches together. `themechange` carries `waitUntil` so the liquid portrait can repaint with the right clay before the new state is captured (capped at 400 ms). With reduced motion, or no View Transitions, the switch is instant.
- **Light clay updated** to Dawid's latest `clay.avif` from Webflow (same framing).
- **Fix:** the mobile menu sheet inherited `pointer-events: none` from the floating nav wrapper, so its links, Close and theme toggle could not be tapped. It now takes pointer input like the pill.

## 2026-10-26 · Black clay for the dark theme

`LiquidReveal` takes an optional `clayDark` image (`portrait-clay-dark.avif`, Dawid's `clay-black.avif` from Webflow, same 2400×1792 framing). It blends into the black page where the white clay looked cut out.

- **Static image:** both clays are rendered, and CSS shows the one for the current theme. Both are `loading="lazy"` with high fetch priority, so the hidden one is never fetched.
- **Canvas:** it loads only the clay its theme needs and swaps on `themechange` or an OS scheme flip, fetching the other variant the first time it is needed.

## 2026-10-26 · Portrait sources: 2400px AVIF from Webflow

The liquid reveal now uses the higher-quality pair Dawid uploaded to Webflow (`realphoto.avif`, `clay.avif`). They are 2400×1792 with transparency and use the same framing as the old 1200px PNGs (the alpha masks match), so the face crop is unchanged. Both layers are now served as AVIF at quality 70 rather than WebP, since WebP re-encodes of the new sources were larger. The largest photo variant is 140 KB.

## 2026-10-26 · v2 revision 1: black and white, simpler work, Services page

Changes from Dawid's review of the first v2 pass:

- **No colour.** The palette is true neutral greys from white to near-black. `--color-brand*` now resolve to the ink. The cobalt tokens became an inverse surface: `--color-inverse-bg`, `--color-on-inverse` and `--color-on-inverse-muted` (black in light mode, white in dark), used by the story panel, the mobile menu, buttons and text selection.
- **Case studies are simple tiles on a creative grid** (`WorkGrid` + `WorkCard`). Each tile has a cover, a "Company · Year" line and the outcome title, with no tags or summary. Desktop repeats a four-tile rhythm: wide 4:3, a narrow square set lower, a narrow square indented, then a wide 4:3 set lower. Home shows four tiles and a "View all work" button. Work shows all of them.
- **Removed:**
  - the follow-the-mouse "View case" cursor;
  - the work counter;
  - the numbers section on Home (`Metrics` stays for case studies);
  - the hover colour on services;
  - the Dribbble shots section, along with `ShotsMarquee` and its images;
  - Contact from the main nav.
- **Contact** now sits in the hero after LinkedIn and Dribbble (same link style), in the mobile menu's footer row, and in the sign-off.
- **A dedicated `/services` page.** Data lives in `src/lib/services.ts`, shared with Home. `Services` gained a `detailed` variant that lists deliverables. The page closes with three ways of working together (project, embedded, full-time role), which serves both clients and employers. Services sits in the nav between Work and About.
- **Link hover.** The underline no longer disappears; the hairline thickens to three times its width with an ease-out. Components that hide the line at rest still draw it in on hover.
- **Client logos** are larger (`--space-12` tall) and use the text colour (black, or white in dark mode).

## 2026-10-26 · v2 redesign, first pass (branch `v2`)

Built on `v2` so `main` stays live until the redesign is ready to swap in. The direction comes from the reference synthesis ("calm precision, one loud moment").

- **Audience and offers.** The site speaks to clients and employers. It has three offers: Product Design, Design Systems, and AI and Agentic UX.
- **Type: Geist and Geist Mono** (free, self-hosted with fontsource). Headings use weight 500; the boldness comes from size. h1 is now 40 → 88px and h2 is 30 → 56px. Captions use the mono face. Metric-matched fallbacks keep the font swap shift-free.
- **Colour: cool green-tinted neutrals and cobalt** (`--blue-600` #234AE8). New semantic tokens `--color-brand-bg`, `--color-on-brand` and `--color-on-brand-muted` cover the cobalt surfaces. Figma `mlynarz.com — Foundations` still needs these values.
- **Navigation is a floating top pill.** It holds the M mark, Work, About, a cobalt Contact chip and the theme toggle. The name moved out of the nav into the story. On mobile the pill shows the mark and a Menu button, which opens a full-screen cobalt sheet (a native popover). Close sits where Menu was.
- **Home tells a story.** The order is:
  1. A two-tone hero with the liquid portrait.
  2. A cobalt "About" panel that grows over the held hero, where the about-me statement (with the name) lights up word by word.
  3. Numbers. Two are placeholders (`XX`) until real figures arrive.
  4. Services, each linked to the case studies that prove it.
  5. Work told by outcomes, with a "View case" cursor.
  6. Clients.
  7. Explorations.
  8. A sign-off whose last words cycle.
- **Motion layer replaces "zero JS by default".** One module (`src/scripts/motion.ts`) runs Lenis, GSAP, ScrollTrigger and SplitText on every page, about 50 KB gzipped. It runs only when `html.motion` is set, which happens before first paint unless the visitor prefers reduced motion. Elements marked `[data-reveal]` wait hidden until the script sets them up, and a 3s CSS failsafe shows them if it never does.
- **Page transitions use native cross-document View Transitions.** The old page sinks back and dims, the new one rises as a sheet. The nav stays put. Every page uses the same transition: opening a case study used to morph the work cover into the case-study cover, but it read as a different transition from the rest of the site and was dropped. Browsers without support, and reduced motion, get a normal page load. (The motion is superseded by "Soft rise page transition".)
- **Left for the next passes:** the case-study template (Astapable-style opening), the About story, the "How I work" section, and real numbers.

## 2026-10-26 · Mobile nav is a hamburger menu

Below 48em the bar shows the M mark, the name and a menu button. Work, About, Contact and the theme toggle open in a sheet under the bar. The sheet is a native `popover`, so it needs no JS: Esc and outside clicks close it, and the button exposes its expanded state. The bar now has a fixed height (`--nav-block-size`), so the sheet can sit right below it. Browsers without popover support hide the button and keep the inline menu, which wraps. This replaces the earlier "nav wraps below 375px" behaviour.

## 2026-10-26 · Homepage brought in line with the original site

Compared against the Webflow homepage. The structure is matched and the markup is still written from scratch:

- the split hero, with the portrait bleeding to the right edge
- client logos spread across the row
- the case studies as a one-column list: the text first, then a 3:2 cover that zooms on hover, plus Industry and Business/Model tags
- the "Selected work" shot marquee
- the large email under "Contact me"
- the M logo mark and an email pill in the nav
- a floating back-to-top button

XWP is listed with no page (the new `page: false` field), as on Webflow. These were left out on purpose:

- the "Home" nav link (the logo links home)
- the Resume link (it pointed to `#`)
- the padlocks (the work is public now)
- the hidden profile photo
- the serif heading font (fonts are placeholders)

The clay portrait is now on top, and the liquid reveals the photo.

**Hero photo nudge.** The canvas crop now matches the `<img>` exactly: cover, positioned at the face centre, unrounded box size. There is also a metric-matched fallback for DM Sans and a font preload, so the swap no longer shifts the layout (CLS was 0.22 at 1440px, now 0).

## 2026-10-26 · No display role: the type scale starts at h1

`--text-display`, `--leading-display`, `--tracking-display` and the `.text-display` class are removed. The largest size is now `--text-h1` (34 → 64px); the Home and generic Hero headlines are plain `h1`s. Figma: remove the display style/variables from `mlynarz.com — Foundations` to keep both sides in sync.

## 2026-10-26 · All case studies published; UI Design Showcase dropped

Dawid published the remaining drafts (BeatStars Product Design, BeatStars Design System, CSS Peeper) and chose to skip UI Design Showcase entirely: its content and images were removed. Its old Webflow URL redirects to `/work` (301, `public/_redirects`) so existing links don't 404. Drafts, `protected` and `SHOW_PROTECTED_DRAFTS` remain for future work.

## 2026-10-26 · Formerly protected case studies made public

Dawid chose to publish Newsweek Design System, NerdWallet, Google Material Design and Pantheon, which were password-protected on Webflow. `protected` was removed and `draft: false` set. Pantheon has facts and cover only (its Webflow page was a placeholder). The `protected` flag and `SHOW_PROTECTED_DRAFTS` stay available for future private work.

## 2026-10-23 · Phase C (batch)

**All case studies migrated as drafts.** Newsweek Design System, NerdWallet, BeatStars Product Design, Google Material Design for WordPress, BeatStars Design System and CSS Peeper have their full Webflow text and every original image (50, full resolution). Pantheon's Webflow page was a "Work in Progress" placeholder, so it has card data and facts only; CSS Peeper keeps the part before its "Work in Progress" block. `UI Design Showcase` is migrated too, to keep its URL, but stays a draft: it ends with a confidentiality notice saying it was prepared for a job application under NDA.

**Converted by script, reviewed by hand.** Webflow nodes were converted to MDX (headings, lists, bold/italic, links, images with captions), then each page was read through. Fixes are limited to source glitches: misplaced bold markers, a duplicated closing paragraph, `#` placeholder links unlinked, one link with a stray `#`, a duplicated "Background" heading, Pantheon's tags copied onto CSS Peeper, and typos ("Simultaneousely", "the Newsweek"). Bold label paragraphs ("Key achievements", "Objectives"…) became `###` subheadings.

**Alt text written for every image** from the images themselves (Webflow had none). Captions come from the showcase's "👆" lines.

**Drafts get pages on previews; protected drafts don't.** Preview builds now build and link drafts so they can be reviewed at their real URL (still `noindex`). Case studies that were password-protected on Webflow carry `protected: true` and stay unlinked cards on previews, because preview URLs are publicly reachable. Setting `SHOW_PROTECTED_DRAFTS=true` (only for a preview environment behind Cloudflare Access) builds them too. Production never builds drafts.

**`lead` field.** The page intro under the headline differs from the card summary on most Webflow pages, so case studies have an optional `lead`.

**Card tags vs page tags.** Pages use the tags from their own Webflow header; CSS Peeper keeps its card tags because its header carried Pantheon's.

## 2026-10-23 · Phase C (pilot)

**Content comes from Webflow, read-only, through its API.** Page text was read with the Webflow connector; images were downloaded from the originals on `s3.amazonaws.com/webflow-prod-assets` (full resolution, up to 3840px). Webflow's CDN (`cdn.prod.website-files.com`) and the live site are blocked by this environment's network policy, so the published HTML was not used. Nothing in Webflow was changed.

**One folder per case study.** `src/content/work/<slug>/index.mdx` with its images beside it; the folder name is the slug, so URLs stay `/work/<slug>`. The schema lives in `src/content.config.ts` (cover alt text is required).

**Drafts carry card data only (superseded by the batch below).** The XWP design-ops card has no case-study page on Webflow and is not migrated.

**MDX components need no imports.** `Figure`, `ImageGrid`, `Metrics`, `Callout` and `Quote` are passed to every case study by `src/pages/work/[slug].astro`; MDX files only import their own images. `BeforeAfter` and `Process` from the plan are deferred until a case study needs them.

**Prose breakout grid.** Text sits at `--measure`; `data-width="wide" | "full"` children (figures, image grids, metrics) break out to the page width or the viewport edge.

**Newsweek AI pilot: AI sections only.** The Webflow page repeats the Newsweek Design System story from "Objectives" onward (and duplicates a paragraph); Dawid chose to migrate only the AI-specific sections. Its two images are from the redesign, not the AI product. Copy is otherwise verbatim except "a century" / "an AI-native" in the headline.

**Home hero bleeds right.** Matching the Webflow hero: headline left, portrait on the right running to the viewport edge (60% of the width, full hero height) on desktop; full-bleed square below the text on mobile. `LiquidReveal fit="fill"` with face-aware framing handles any box.

**Client logos are inlined and recoloured.** Black fills become `currentColor` (muted text), white knock-outs become the page background, so they work in dark mode. The Pearson "P" was an embedded black PNG; it is now used as an alpha mask over a `currentColor` rect.

**Stylelint: allow `:global()`, drop `no-descending-specificity`.** `:global()` is how scoped styles reach MDX content; the specificity-order rule fights BEM modifiers, and cascade layers already set precedence.

**Unresolved, for Dawid:** the Webflow "Resume" link pointed to `#` and is left out; "INTJ" was styled as a link without a target.

## 2026-10-23 · Liquid portrait reveal

**Rebuilt from the original Webflow embed, same motion model.** `src/scripts/liquid-reveal.ts` is a faithful TypeScript port of `liquid-reveal.js` (Oct 19, 2026): sprung head orbiting the face at rest, magnet + tendril towards the pointer, healing trail, droplets, drifting lobes, wobbling iso-surface edge, face-aware framing. Defaults are unchanged (size 22, soft 30, pull 55, wobble 55, heal 1.8 s, orbit 40) and exposed as typed props. Replaces the Phase B placeholder metaball effect.

What changed versus the embed, and why:

- **A real `<img>` underneath.** The embed rendered only a canvas, so the hero image was invisible without JS and late for LCP. Now the top image is a responsive `astro:assets` image (alt text, `fetchpriority` when eager); the canvas fades in over it once both images decode.
- **Theme-aware.** The embed flattened onto a hard-coded `#ffffff`. Both cutouts are now flattened onto the resolved `--color-bg` and re-flattened on `themechange` or an OS scheme change. In dark mode the black T-shirt dissolves into the background, which reads as intentional.
- **Smaller images.** 1.1 MB of PNG becomes ~126 KB of WebP with alpha at full size (1200px), smaller on phones. The canvas loads the photo/clay pair at the width actually drawn.
- **Clean-up.** Window listeners are tied to an `AbortController` and removed when the element leaves the page. The loop still pauses off screen and in hidden tabs.
- **Square on narrow screens.** Below 48em the box is 1:1 instead of the photo's 4:3, so the face reads ~35% larger; the framing keeps the face in frame at any ratio.
- **Reduced motion follows the original design**: no orbit, wobble or droplets; the liquid appears only while pointing (user-initiated) and snaps to the cursor. Supersedes the Phase B "does nothing" behaviour.

**New token `--duration-reveal` (600ms).** Canvas fade-in. Needs mirroring in Figma.

**Source images are 1200px.** Fine up to ~600 CSS px on retina; the hero column at 1440 is ~620px, so it is at the edge. 2400px versions of both cutouts (same framing) would make it crisp on large retina screens.

## 2026-10-23 · Phase B

**Components are proposed, not ported.** Nav, Hero and LiquidReveal are new designs built from the tokens (Dawid's call: "you propose"). Fonts and brand colors stay placeholders; components read tokens only, so swapping them later touches `tokens.css` alone.

**Class-based style scoping (`scopedStyleStrategy: "class"`).** With Astro's default attribute scoping, a parent's scoped rule (e.g. `.nav__inner` set on `<Container class="nav__inner">`) never reaches the child's root element. Class scoping passes the scope through `class`. This broke the Nav and Hero layouts until switched.

**BEM class names, enforced.** `block`, `block__element`, `block--modifier`, kebab-case parts (Stylelint `selector-class-pattern`). Scoping already prevents collisions; BEM keeps the markup readable.

**Link underline is a background, tuned by custom properties.** Every `a` gets the animated underline from `base.css`; components change `--underline-size` / `--underline-origin` (nav and quiet links: hidden at rest, grow on hover) instead of re-implementing it.

**Buttons use `--color-bg` as the text color on brand.** It gives white on blue in light and near-black on light blue in dark, both high contrast, without adding an `--color-on-brand` token to Figma. Add that token if the brand color ever stops contrasting with the background.

**New token `--blur-nav` (12px).** The nav's backdrop blur. Needs mirroring in Figma (Effects).

**Nav elevation without JS.** A scroll-driven animation (`animation-timeline: scroll(root)`) adds the border and shadow after the first `--space-16` of scroll. Browsers without support get the border always on. The timeline sits in a separate rule because the CSS minifier otherwise folds it into an `animation` shorthand containing `scroll()`, which browsers reject.

**Theme toggle cycles system → light → dark.** One button keeps the nav fitting at 375px; the accessible label states the current and next mode. Hidden without JS (the OS theme still applies). Fires a `themechange` event for theme-aware components.

**Nav wraps below 375px.** Name, three links and the toggle fit on one line from 375px; narrower screens (320px) wrap the menu under the name instead of overflowing.

**Placeholder images live in `src/assets/placeholders/`.** Generated abstract images for the styleguide; real images arrive in Phase C. The portrait is real (see below).

## 2026-10-23 · Phase A

**Repo is `dawidmlynarz/portfolio`, not `mlynarz-site`.** The session was already attached to it; the name has no effect on the site. The npm package name stays `mlynarz-site`.

**Clean build, no Webflow parity.** The site is built from best front-end practice, not reverse-engineered from Webflow. No Webflow inventory or export is required to proceed; if an export is ever added it lives in `/reference` (git-ignored) as loose reference only. URLs keep the `/work/<slug>` pattern so the domain keeps its search history; the redirect map in Phase E covers anything that changes.

**Unpublished Webflow navbar/typography changes: reverted.** The live site is the fallback during cutover, so it stays as published.

**Extensionless URLs, no trailing slash.** `build.format: "file"` + `trailingSlash: "never"` produces `/about.html`, which Cloudflare Pages serves at `/about`. Canonical URLs strip `.html` (see `BaseLayout.astro`).

**Indexing is opt-in per environment.** Only a build where `CF_PAGES_BRANCH === "main"` is indexable (`src/lib/site.ts`). Every other build emits `noindex` meta and a `Disallow: /` robots.txt. `public/_headers` also sends `X-Robots-Tag: noindex` on every `*.pages.dev` hostname, so even the production alias stays out of search; only `www.mlynarz.com` is indexed.

**Cascade layer order is pinned inline in `<head>`.** Layer order is decided by first appearance; bundle order is not guaranteed once pages get their own CSS chunks. A one-line inline `@layer` statement before any stylesheet removes that risk.

**Astro scoped styles must be wrapped in `@layer components`.** Unlayered CSS beats every layer, so a bare scoped `<style>` would silently override utilities. Enforced by `tooling/stylelint-require-layer.mjs`.

**"Tokens only" is enforced by Stylelint, not by review.** Outside `tokens.css`: no hex/named/`rgb()`/`hsl()`/`oklch()` colors, no raw px/rem/em on spacing, inset, radius or font-size, and no primitive tokens (`--neutral-*`, `--blue-*`). `calc()` on tokens and unitless `0` stay allowed.

**Only DM Sans is installed.** The plan listed Playfair Display, but `tokens.css` has no serif role and the type faces are placeholders until the new ones are chosen. Swap by installing a fontsource package, importing it in `global.css`, and changing `--font-heading` / `--font-body`.

**TypeScript 6, not 7.** `@astrojs/check` peers on the TS 6 JS API; npm resolved 6.0.x. Revisit when the Astro language server supports TS 7.

**Newsweek AI case study dropped.** It won't be written, so the entry is deleted rather than kept as a draft, and `/work/newsweek-ai-experience` redirects to `/work` (`public/_redirects`). The Agentic UX service has no proof link until a new case study exists.

**Hero actions are site links, not social.** The hero shows About me and Contact with the forward arrow (`Link icon="arrow"`); LinkedIn and Dribbble stay in the footer and in the JSON-LD `sameAs`.

**Pantheon case study written from Dawid's side.** The Webflow page was a placeholder, so the body is new. It follows the live case-study structure (My role, Key achievements, Project Background, Objectives, The Challenge, topic sections, Key Takeaways) and tells only Dawid's side: as Design Systems Designer he established the foundations, sold the system to stakeholders, got a design system team formed at Pantheon and passed the know-how on to it, with the marketing site design system as the pilot, scaled into a full product design system, and documentation for both built in-house. The docs-site release note was dropped as irrelevant, along with the year and header link it supplied. System facts (grid, type and spacing scales, training topics) come from the shared project; no metrics are claimed until Dawid supplies them. Title, description and role keep his original Webflow wording. Keep MDX comments on one line: Prettier rewrites a multi-line `{/* */}` into `{/_ _/}`, which breaks the build. The page stays `draft: false` because it was already public with an empty body; there is no header link because the old Storybook URL no longer resolves.

**Figure placeholders.** `<Figure alt="…" />` without `src` renders a dashed "Image to come" box labelled with the alt text, so a case study can be laid out before its images exist. It is a Figure variant rather than a new component. Placeholders render on previews only; production skips them, so a merged page never shows empty boxes. Pantheon shows three highlights (50+ components, 5 designers, 3 training tracks, confirmed by Dawid) in the body right after Key achievements, not in the header.

**XWP gets a full case study.** Dawid answered the brief on 2026-10-27, so `page: false` is gone and the card links to `/work/xwp`. The body follows the Pantheon structure and his answers: half Principal Product Designer, half Design Lead, reporting to the CDO, five designers at the peak, hiring adapted from engineering, Double Diamond process docs with an onboarding buddy, rituals and reviews, Astro Kit growing into Launchpad, and a framework for every client. The 30% is his figure for team velocity. Two numbers are estimates he asked for (40% faster kick-off with Launchpad, +60 eNPS); they are labelled "(estimate)" on the page and noted in an MDX comment until he replaces them. No year, because none was given. A teammate quote is still to come. Image slots are Figure placeholders (hidden in production). Pantheon's next link now points to XWP, which follows it in the order.

**Metrics: three at most, top-aligned, content width.** Dawid's call: the highlights row holds one to three numbers (the build fails on more), lines values up at the top whatever the label length, and defaults to the reading measure like the text around it. At that width the value uses `--text-h2`, one step below the old `--text-h1`; `width="wide"` keeps h1. XWP drops "5 designers" from its row (it is in My role).

**Case study voice.** Dawid wants every case study to read as written by a person and pass AI checkers. No tool can guarantee that, so the rules in `CLAUDE.md` ("Writing case studies") list the tells to avoid. XWP and Pantheon were rewritten to them, same facts.

**CSS Peeper as a 0 to 1 product design story.** Dawid chose a product design case study with a light monetisation chapter over a founder story, and no revenue figures. The page keeps his original Background wording, adds the 2016 launch (16,000 users in two weeks, the redesign at 30,000, from the Medium posts), the quiet years, the 2025 relaunch with Kamil (evenings and weekends, six months, from the csspeeper.com blog) and the freemium switch. Numbers shown: 500K+ users, 4.6 from 350+ reviews (landing page), ~35% trial to paid (Dawid). Churn (~10%) and MRR stay off the page. The quote is Zander Whitehurst’s public LinkedIn post, used on the CSS Peeper site. Card model is now "Freemium Chrome Extension". Image slots are placeholders until Dawid sends screenshots.

## 2026-10-28 · Hero grain

**Grain fade replaces the dot grid.** Dawid compared six options on a preview (grain, grain fade, grainy glow, scanlines, pixel grain, bands) and picked grain fade: fine noise at the top of the page that fades out over the first screen. It is on every hero: Home, About, Services, Work, case studies and the 404. `--bg-hero`, `--pattern-dots` and `--color-pattern` are gone.

**One component, grain only.** `HeroBackdrop` is an absolutely positioned layer at the top of each hero, with the SVG noise (`--texture-grain`, a few hundred bytes, drawn once and tiled) and a mask that fades it out. It has no fill, so the page background shows through. On pages under the floating nav it reaches up under it (`--nav-clearance`, new token, also used by SiteLayout); Home and About use `flush`. Images can't use `light-dark()`, so the dark theme swaps the texture token.

**The grain holds still during page transitions.** While a transition runs it gets `view-transition-name: hero-backdrop`, which takes it out of the page images that fade, blur and rise, and base.css turns its animation off, so the new page's grain is in place from the first frame. It sits above the page images for that second, which doesn't show since it is only grain. A transition name must be unique, so there is one HeroBackdrop per page (the styleguide shows it inside the Hero).

**`will-change: transform` on the grain.** Without its own layer, the Home hero's scroll scale made the browser re-raster the masked grain every frame (about a third more raster work on Home). With it, the grain costs next to nothing: no change to FCP, LCP or main-thread paint, raster within a few percent.

## 2026-10-28 · Work link on case studies

**Section links say `aria-current="true"`, not `"page"`.** The nav marked Work as the current page on every `/work/<slug>`, and the menu's click handler turns a link to the current page into "just close the menu", so Work did nothing on case studies. Now the nav uses `"page"` only on the page itself and `"true"` inside its section: Work still looks current on a case study, and the handler only swallows clicks on `"page"`.

## 2026-10-29 · BeforeAfter comparison

**Pointer drag on the frame, a hidden range input for keyboards.** Dragging anywhere on the image moves the handle (pointer capture, so it keeps tracking outside the frame), and `touch-action: pan-y` lets vertical swipes on a phone still scroll the page. A native range input sits under it, invisible and out of pointer reach, so arrow keys and screen readers get a real slider; focus shows on the grip. Without JS the handle stays at `start`, so both images are still half visible. It's a plain inline script, not a framework island.

## 2026-10-29 · Home Work cards

**Home tiles drop the role and company line.** Dawid asked for it: on Home the outcome title and tags carry the card. The Work index keeps "Role · Company" in its rows. A tile still shows the caption line when it has something else to say: "Draft" on previews, or the padlock on a protected case study. Home and Work already share one order (`order` in the frontmatter, via `getListedWork`), so Home shows the first four of the Work list.

**XWP client work behind the password.** Pantheon and Google Material Design join NerdWallet as `protected: true`; all three came through XWP, so they stay behind the shared password.

**The padlock moves onto the cover.** Cards of protected work no longer show a padlock after the company. It sits in a frosted circle in the top right corner of the cover (`--color-overlay` with the nav's blur), like the Webflow cards had. It is outside the zooming frame, so it stays still on hover.

## 2026-10-29 · Privacy page, no cookie banner

**No consent banner.** Audit of the build: no third-party requests (fonts self-hosted, embeds are plain links), and everything stored is strictly necessary or user-requested, so ePrivacy consent isn't needed: `case_study_access` (signed unlock cookie, only after entering the password, 30 days, HttpOnly), `theme` in localStorage (set by the toggle), `nav-collapse` in sessionStorage (removed on the next page), and Cloudflare's own `__cf_bm`/`_cfuvid` security cookies. Analytics is Cloudflare Web Analytics, enabled in the Pages dashboard (auto-injected beacon, cookieless, nothing on the device). Any analytics or embed that sets cookies or fingerprints would need a consent banner, so pick cookieless tools.

**`/privacy` page.** GDPR transparency still applies (Cloudflare processes IPs), so a short first-person notice lives at `/privacy`, linked from the footer. It reuses `Hero` and the case-study `Prose` column. Update its list and date when anything stored or loaded changes.

## 2026-10-29 · Gooey strands in the Mindblown head

**Beads plus a goo filter, not drawn paths.** Each strand between the lifted lid and the hole's front rim is a row of circles that an SVG filter (blur, then an alpha threshold) melts into one tube (`src/experiments/mindblown/goo.ts`). The beads get smaller towards the middle as the lid rises, so a hover peek leaves them just holding on; past a strand's own snapping distance it tears, the top half goes with the lid and the bottom half drips back into the rim. Tearing comes almost for free from the filter, which a hand-built path would have to fake. A ticker reads the lid's GSAP transform each frame, only while the hole is cut. Both ends stay tucked in: the top under the lid's edge, the bottom inside the hole, clipped by the cut ellipse so it disappears behind the face's front edge, and the whole layer is masked to the head's outline so a tilted lid never shows goo past the head. With reduced motion the strands stretch with the lid but don't wave; without JS the head never opens, so there's nothing to show.

**The lifted lid can be dragged (experiment branch).** On a hover peek, pressing on the lid picks it up instead of popping the head; only the face below the cut and the brain open it. The drag lives on the lid's CSS `translate` and `rotate`, which stack on top of GSAP's transform, so it never fights the lean's `quickTo` tweens. Offsets get a rubber-band falloff (more give the further it goes), the lid tips with the pointer's speed, and on release an elastic tween pulls it home. While held, the strands never tear, add beads as they stretch, sag a little and drop the head-outline mask so they can follow the lid off the head; the face still hides them below the cut (an SVG mask built from the silhouette). They get a darker outline from the goo filter so they read against the page.

## 2026-10-29 · Productised plans on /services

**Three plans, priced from one hidden rate.** Design audit ($5,800, fixed, 2 weeks), Embedded lead ($8,300 a month, 2 days a week, 3-month minimum) and Custom (quoted per project). Prices are calculated in `src/lib/plans.ts` from an internal $120/hour rate (8-hour days, rounded to $100) that never appears on the site; change the rate or the hours and the prices follow. USD, because Dawid works with clients worldwide. Rate research and the reasoning live in the "Productised services and rates" doc.

**Plans replace "Three ways to work with me".** The old Project / Embedded / Full-time list is gone. The plans sit straight under the hero, so prices show early; the three services follow as "what every plan covers". The full-time role is one line above the final button, not a plan.

**One booking link.** Every "Book a call" uses `BOOKING_HREF` (`src/lib/site.ts`): `SITE.bookingUrl` once Dawid sets up a scheduling page, `/contact` until then.

**No "freelance".** Home title, default description, About and Services descriptions now say senior product designer. Plans are also in structured data as an `OfferCatalog` with USD `UnitPriceSpecification`s (monthly for the embedded plan).

**Round 2: services first, then plans, then quotes.** Dawid asked for the services to lead and the plans to follow, with the full-time line right under the plans (no button of its own). Copy speaks as one person: no "we".

**Quotes carousel (`Testimonials`).** Five LinkedIn recommendations, trimmed to the lines about the services. Wording stays the recommender's own (cuts only), so nothing is put in anyone's mouth. Picked for recency and relevance: George Yoon, Chris Beaumont, Anthony A. Marin (Newsweek, 2026), Scott Batchelor (2024), Rohan Mohana (2023). Roles are current LinkedIn headlines. The carousel is a CSS scroll-snap row (one slide on phones, two from 48em) with a small script for the back and next buttons; without JS the buttons stay hidden and the row still swipes and scrolls. Button gained an `arrow-left` icon for it.

**Round 3: a page with a story.** Order is Hero, Services, Working together (Process), Approach (Beliefs), Plans, Quotes, then the site footer. Hero copy is Dawid's headline with a proposed subhead and a "See how I can help" scroll prompt (Button gained `arrow-down`, which bobs gently at rest; reduced motion stills it). SectionIntro gained an optional `lead`.

**Process line.** One segment per step, node to node, so the line always meets the last node whatever the text height. The motion layer (`processLine` in motion.ts) scrubs the segments in sequence as the list passes 65% of the screen and settles each node (scale and fade, expo out, no bounce) with its text as the line arrives. Without JS or with reduced motion the line and nodes are simply drawn.

**Approach as two-tone statements.** Each belief is one sentence, claim in ink and reason muted, the same two-tone voice as the site's headings, numbered in two columns from 62em. A list of cards or icons would have made them read like features.

**Quotes, one at a time.** The carousel shows one large quote (`Quote size="lg"`) on a `--color-bg-subtle` panel under an oversized quote mark, with a bar per quote (click to jump, current one filled), a counter and ghost arrows. It is still a native scroll-snap row, so swipe, trackpad and arrow keys work, and without JS it stays a swipeable row.

**Round 4: calmer page, one measure for headlines.** The services hero now matches Work exactly (same section spacing and head gap, so the headline starts at the same height) and goes straight into the service rows; the scroll prompt and the `arrow-down` button icon are gone. The quotes lost the panel, quote mark and progress bars: a "Kind words" caption, one large quote, two ghost arrows aligned to the text edge.

**Line-length tokens.** `--measure-h1` (12em, about 24 characters), `--measure-h2` (16em, about 32), `--measure-lead` (50ch) and the existing `--measure` (65ch, body). They are in units of the text's own size, so one value holds at every breakpoint. base.css applies them to every h1, h2 and `.text-lead`, replacing the one-off widths on Contact (10em), case-study titles (22ch), SectionIntro (18em) and the hero leads. Add the three new tokens to the Figma Foundations file under the same names.
