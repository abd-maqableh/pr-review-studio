# PR Review Studio

An independent portfolio concept by **Abdallah**, a senior frontend engineer, exploring how a thoughtful interface can keep people in control of AI-assisted public-relations work.

The main experience is a complete press-release review workspace: edit a draft, try a simulated rewrite, compare versions, leave feedback, and make an explicit approval decision. All products, people, outlets, articles, and agent activity are fictional. This is not an official Aligator product and does not claim affiliation.

## Run locally

Use Node.js 22 and Yarn 4.17.0, as declared in `package.json`. Enable Corepack if your Node installation has not already enabled it.

```sh
corepack enable
yarn install --immutable
yarn dev
```

Open [localhost:3000](http://localhost:3000). The app opens directly into the seeded Noura review workspace. No environment variables, credentials, paid services, API keys, database, or authentication are required.

```sh
yarn typecheck
yarn test
yarn build
yarn start
```

`yarn start` serves the production output after `yarn build`.

## What to try

- **Review a story:** select a paragraph, choose Make concise, Make formal, or Simplify, then preview the progressively displayed suggestion. Explicitly apply or discard it; generation can be canceled.
- **Keep editorial control:** edit the title and paragraphs, save a new version, compare actual word-level additions and deletions, browse immutable snapshots, and comment on the document or a paragraph.
- **Complete the workflow:** Draft → In review → Approved or Changes requested. Requesting changes requires feedback. Editing a reviewed or approved document immediately returns it to Draft and invalidates approval; saving creates a new version.
- **Create a campaign:** validated name, brief, target market, and content language produce an editable starter draft. Search campaigns, filter by status, and inspect their briefs.
- **Explore the workspace:** overview metrics derive from the current state and link to matching screens. Pause or resume three simulated agents, run sample media research, and scan the existing sample coverage.
- **Browse coverage:** search fictional articles, filter sentiment, inspect excerpts, and export the current view as CSV. The exporter quotes delimiters and line breaks, preserves Arabic, and neutralizes spreadsheet formula prefixes.
- **Switch languages:** English is the default; Arabic changes UI language and layout direction. Document language remains independent of UI language, with explicit direction for Arabic releases and mixed-direction labels.

## Simulation boundaries

There is no AI model or network service behind the writing assistant. `lib/simulation.ts` looks up exact supported sample paragraphs in a finite set of original English and Arabic rewrites. It reveals the selected result over approximately 2.4 seconds using a cancelable timer.

Custom text receives an explanation of this limit instead of an invented response. New campaigns use a fixed template: their brief and market remain editable custom text, and the shared middle paragraph supports the sample rewrites. Applying a suggestion checks that its original paragraph still matches, so it cannot overwrite newer edits or unrelated unsaved work.

The researcher returns a fixed fictional shortlist. The monitor summarizes the existing sample dataset; it does not search the web. Paused agents cannot run their applicable simulated actions. Nothing publishes, sends messages, contacts journalists, or tracks real coverage.

## Architecture

| Area | Responsibility |
| --- | --- |
| `app/` | Next.js App Router routes, metadata, local font imports, and application styling |
| `components/review-studio.tsx` | Review interactions, editor state, proposal previews, comments, and approval controls |
| `components/review-versions.tsx` | Word-level diffs and read-only version history |
| `components/app-shell.tsx` | Desktop/mobile navigation, language switch, persistence notices, and reset confirmation |
| `components/ui/` | Accessible shadcn-style Button, Dialog, and Tabs primitives built on Radix UI |
| `lib/domain.ts` | Pure reducer, workflow guards, immutable version creation, and proposal application |
| `lib/store.tsx` / `lib/persistence.ts` | Shared demo state, versioned storage, validation, restoration, and reset |
| `lib/drafts.tsx` | In-memory unsaved document buffers across in-app navigation |
| `lib/seed.ts` / `lib/simulation.ts` | Original fictional content and deterministic mock services |
| `lib/csv.ts` | Safe CSV serialization |
| `tests/domain.test.ts` | Focused domain and service tests using Node's test runner through `tsx` |

The stack uses Next.js 16, React 19, strict TypeScript, Tailwind CSS 4, Lucide icons, Radix UI, React Hook Form, Zod, and the `diff` package. Fonts are bundled locally. TypeScript is pinned to **6.0.2** because Yarn 4.17.0's TypeScript compatibility patch did not support TypeScript 7 during setup.

## Persistence and privacy

Saved campaigns, versions, approvals, comments, agent state, coverage, and UI language live in this browser's `localStorage` under `pr-review-studio:state:v1`. Nested data is validated before restoration; corrupted or incompatible data loads a fresh seed with a warning. Storage is read after hydration, and failed reads or writes produce a visible persistence warning.

Unsaved document buffers survive navigation within the app, but **not a page reload or closed tab**. Save a version to persist them. The app requests a browser leave-page warning when buffers exist; browser behavior can vary. Reset demo asks for confirmation, clears working buffers, and restores the original fictional workspace.

There is no account, cloud backup, cross-device sync, or live cross-tab synchronization. Clearing site data removes saved work, and unavailable or full browser storage prevents persistence. Store no sensitive information. This demo is an editorial prototype, not a production approval or records system.

## Verification

Run `yarn typecheck`, `yarn test`, and `yarn build` before a handoff or deployment. The focused tests cover approval invalidation, workflow guards, applying/discarding and rejecting stale proposals, validated state restoration and reset, new-campaign review, deterministic rewrites, paused agents, CSV safety, and generation cancellation.

Manual browser verification should include:

1. Create a campaign → edit → save → request review → approve.
2. Edit an approved document and confirm its approval is invalidated.
3. Start and cancel a rewrite; navigate away during generation and check that the draft is preserved.
4. Apply and discard suggestions, compare versions, and submit review feedback.
5. Switch English/Arabic, including mixed-language content, and use the mobile menu with a keyboard.
6. Reload saved work, exercise reset, and inspect the storage-unavailable warning when browser storage is blocked.

Check results and any browser screenshots are reported in the implementation handoff; the commands above are instructions, not a claim that they have passed.

## Deploy to Vercel when ready

No repository or deployment is created by this project setup. For a later manual deployment:

1. Run the verification commands above and commit the source, `yarn.lock`, and `.yarnrc.yml` to a repository you control.
2. Import that repository into Vercel and choose the **Next.js** framework preset and Node.js 22.
3. Use `yarn install --immutable` for installation and `yarn build` for the build. Keep the framework's default output directory. No environment variables are needed.
4. Deploy, then repeat the review and mobile/RTL smoke checks on the preview URL before promoting it.

Each deployment origin has its own browser storage. The deployed app remains a local-data simulation with no backend services.
