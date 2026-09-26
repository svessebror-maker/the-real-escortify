# Letsseeeify: Tinder-Like UX and Matching Build Plan

## Direct build target

Build Letsseeeify as a mobile-first academic collaboration app with a Tinder-like interaction loop: show one relevant academic profile or project, let the user pass, express interest, or save it, create a match after mutual interest, then unlock chat, meeting scheduling, file sharing, and project collaboration.

The interaction can borrow proven product patterns without copying Tinder’s brand, assets, wording, or proprietary algorithm. Tinder’s documented flow uses preferences, left/right decisions, mutual likes before chat, profile intents, optional preference exceptions, verification, and block/report/unmatch controls.[^1][^2][^3][^4]

## Target stack

Use this stack unless the existing repository already has an equivalent implementation:

- Next.js 16 with App Router. Its conventions differ from older versions, so read the guides in `node_modules/next/dist/docs/` before coding.
- TypeScript in strict mode
- Tailwind CSS and shadcn/ui
- Framer Motion for the card interaction
- Stytch for authentication and sessions
- Supabase Postgres for application data
- Supabase Realtime for matches, messages, and presence
- Supabase Storage for app-native profile media
- Zod for request validation
- React Hook Form for profile and preference forms
- Vitest and React Testing Library for unit/component tests
- Playwright for end-to-end tests

Every exposed Supabase table must use grants and Row Level Security. Supabase recommends enabling RLS on every exposed table, writing operation-specific policies, and testing both allowed and denied access; secret and service-role keys must remain server-side because they bypass RLS.[^5][^6][^7]

## Master coding prompt

Paste this into the coding app before implementation:

```text
Act as the lead engineer for Letsseeeify, a mobile-first academic discovery and collaboration platform.

The product should feel as fast and intuitive as a swipe-based matching app, but it must use an original Letsseeeify design and serve students, researchers, educators, mentors, founders, labs, projects, and academic opportunities.

Primary user journey:
1. Authenticate with Stytch.
2. Complete a structured academic profile.
3. Choose collaboration goals and discovery preferences.
4. Browse one recommendation card at a time.
5. Swipe left to pass, right to express interest, and up to save.
6. Open the full profile by tapping the card.
7. Create a match only after mutual interest between two people.
8. Unlock chat after a match.
9. Let matched users propose times, create a Google Calendar event, link Google Drive files, connect GitHub repositories and Figma files, and create Asana tasks.

Technical stack:
- Next.js App Router, TypeScript strict mode
- Tailwind CSS, shadcn/ui, Framer Motion
- Stytch authentication
- Supabase Postgres, Realtime, Storage, RLS
- Zod, React Hook Form
- Vitest, React Testing Library, Playwright

Implementation rules:
- Inspect the repository before changing code.
- Create a short implementation plan before each phase.
- Make small, reviewable changes.
- Never expose secrets or service-role credentials to the browser.
- Validate authentication and authorization on the server.
- Add RLS to every exposed table.
- Add database tests for every RLS policy.
- Add loading, empty, error, offline, and retry states.
- Keep gestures optional; every action must also work with buttons and keyboard.
- Use idempotency keys for reactions, matches, messages, calendar events, and webhook processing.
- Run typecheck, lint, unit tests, database tests, and Playwright tests after every phase.
- Do not claim completion unless the tests pass.
- Stop after each phase and report changed files, migration names, commands run, results, and remaining risks.

Do not build all integrations first. Implement in this order:
1. Repository assessment and setup
2. Authentication
3. Database and RLS
4. Profile onboarding
5. Discovery API
6. Card and swipe UX
7. Reactions and undo
8. Matching transaction
9. Realtime chat
10. Safety and moderation
11. Google Calendar and Drive
12. GitHub, Figma, and Asana
13. Analytics and ranking improvements
14. Performance, accessibility, security, and deployment

Start by inspecting the existing repository. Return the current file tree, package manager, framework version, existing environment variables by name only, existing database files, authentication implementation, tests, and security risks. Do not write code until the assessment is complete.
```

## Step 1: Inspect project

Run these commands first:

```bash
pwd
find . -maxdepth 3 -type f | sort | sed -n '1,240p'
cat package.json
find . -maxdepth 3 \( -name '*.sql' -o -name 'schema.prisma' -o -name 'drizzle.config.*' \) -print
find . -maxdepth 3 \( -name '.env*' -o -name 'vercel.json' -o -name 'docker-compose*.yml' \) -print
```

Do not print secret values. Produce an assessment containing:

- Current framework, package manager, and Node version
- Existing routes and components
- Existing Stytch and Supabase code
- Existing schema and migrations
- Test coverage
- Missing environment-variable names
- Security concerns
- Files to preserve, replace, and add

Acceptance gate: no application code changes before this assessment is returned.

## Step 2: Create branch

Create an isolated branch and establish a clean baseline:

```bash
git status
git switch -c feat/academic-discovery-mvp
npm install
npm run typecheck
npm run lint
npm test -- --run
```

If the repository uses `pnpm` or `yarn`, use the existing package manager rather than introducing another lockfile. Record existing failures separately so new work is not blamed for pre-existing defects.

## Step 3: Install packages

Install only packages missing from the project:

```bash
npm install @supabase/supabase-js zod react-hook-form @hookform/resolvers framer-motion
npm install @stytch/nextjs
npm install -D vitest @testing-library/react @testing-library/jest-dom @playwright/test
```

Import Stytch client APIs from `@stytch/nextjs` only. Since version 22, `@stytch/vanilla-js` is no longer required. At the start of the auth phase, add Stytch's server-side Node SDK (`stytch`) for session validation, and use it only from `server-only` modules.

Suggested structure:

```text
src/
  app/
    (auth)/
    onboarding/
    discover/
    matches/
    chat/[conversationId]/
    settings/
    api/
      discovery/route.ts
      reactions/route.ts
      reactions/undo/route.ts
      matches/route.ts
      conversations/route.ts
      conversations/[id]/messages/route.ts
      blocks/route.ts
      reports/route.ts
      webhooks/
  components/
    discovery/
      CardDeck.tsx
      DiscoveryCard.tsx
      ActionBar.tsx
      MatchDialog.tsx
      FilterSheet.tsx
    profile/
    chat/
    safety/
  lib/
    auth/
    db/
    matching/
      eligibility.ts
      score.ts
      reasons.ts
      diversity.ts
    integrations/
    validation/
  types/
supabase/
  migrations/
  tests/
e2e/
```

## Step 4: Configure environment

Add names only to `.env.example`:

```dotenv
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SIGNING_KEY=
STYTCH_PROJECT_ID=
STYTCH_SECRET=
NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN=
STYTCH_WEBHOOK_SECRET=
TOKEN_ENCRYPTION_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
FIGMA_CLIENT_ID=
FIGMA_CLIENT_SECRET=
ASANA_CLIENT_ID=
ASANA_CLIENT_SECRET=
```

Rules:

- Only `NEXT_PUBLIC_*` values may enter the browser bundle.
- `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SIGNING_KEY`, Stytch secret, OAuth client secrets, encryption key, refresh tokens, and webhook secrets remain server-only.
- Validate required variables at server startup with Zod.
- Never log token values.

## Step 5: Implement auth

Implement Stytch email OTP or magic link plus Google sign-in.

Verify the Stytch session in a server-only Data Access Layer: `src/lib/auth/dal.ts` starts with `import "server-only"` and exports `verifySession`, wrapped in React `cache`. Call it from every protected page, Route Handler, and Server Action. Never rely on layouts for authentication, because layouts do not re-run on navigation and do not protect Server Actions.

Optionally add `src/proxy.ts` for fast redirects based on cookie presence only. Next.js 16 renamed `middleware.ts` to `proxy.ts` and the exported function to `proxy`. The proxy must not call Stytch or the database, must not export `runtime`, and is never the only authorization check: Server Functions on paths its matcher excludes skip it entirely.

Client code reads browser-visible configuration from `src/lib/env/public.ts`. That module references each `process.env.NEXT_PUBLIC_*` variable literally, so Next.js can inline it at build time, and uses no `Buffer` and no `server-only`. Derive the server schema from it with `.extend`. `NEXT_PUBLIC_*` values are frozen at `next build`, so validate them during the build once they become required.

Create:

```text
src/lib/auth/server.ts
src/lib/auth/client.ts
src/lib/auth/dal.ts
src/proxy.ts (optional)
src/lib/env/public.ts
src/app/(auth)/login/page.tsx
src/app/(auth)/callback/route.ts
src/lib/auth/supabase-token.ts
src/app/api/auth/supabase-token/route.ts
```

After successful login:

1. Validate the Stytch session on the server.
2. Read the Stytch `user_id`.
3. Upsert one internal profile row using `auth_user_id = stytch_user_id`.
4. Mint a short-lived Supabase access token for that profile, as defined in the Step 7 identity contract.
5. Redirect incomplete profiles to `/onboarding`.
6. Redirect completed profiles to `/discover`.

Acceptance tests:

- Unauthenticated users cannot open protected routes.
- Expired sessions redirect safely.
- Repeated callbacks do not create duplicate profiles.
- Server routes reject missing or invalid sessions.
- Server Actions and Route Handlers reject a missing or invalid session even when the proxy matcher does not cover their path.
- The token route returns no Supabase token without a valid Stytch session.

## Step 6: Create schema

Create the initial migration with these minimum tables:

```sql
create type reaction_type as enum ('pass', 'interest', 'save');
create type match_status as enum ('active', 'unmatched', 'blocked');

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id text not null unique,
  display_name text,
  headline text,
  bio text,
  profile_type text,
  institution text,
  city text,
  country_code text,
  collaboration_mode text,
  availability_hours smallint,
  is_discoverable boolean not null default true,
  is_verified boolean not null default false,
  profile_completion smallint not null default 0 check (profile_completion between 0 and 100),
  last_active_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.topics (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null
);

create table public.skills (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null
);

create table public.profile_topics (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  topic_id bigint not null references public.topics(id) on delete cascade,
  weight smallint not null default 1 check (weight between 1 and 5),
  primary key (profile_id, topic_id)
);

create table public.profile_skills (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  skill_id bigint not null references public.skills(id) on delete cascade,
  skill_type text not null check (skill_type in ('offer', 'need')),
  level smallint check (level between 1 and 5),
  primary key (profile_id, skill_id, skill_type)
);

create table public.discovery_preferences (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  goals text[] not null default '{}',
  modes text[] not null default '{people}',
  countries text[] not null default '{}',
  languages text[] not null default '{}',
  min_availability_hours smallint,
  verified_only boolean not null default false,
  strict_topics boolean not null default false,
  strict_location boolean not null default false,
  strict_availability boolean not null default false,
  updated_at timestamptz not null default now()
);

create table public.recommendation_impressions (
  id uuid primary key default gen_random_uuid(),
  viewer_id uuid not null references public.profiles(id) on delete cascade,
  target_id uuid not null references public.profiles(id) on delete cascade,
  score numeric(5,2) not null,
  reasons jsonb not null default '[]',
  position integer not null,
  shown_at timestamptz not null default now()
);

create table public.reactions (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles(id) on delete cascade,
  target_id uuid not null references public.profiles(id) on delete cascade,
  reaction reaction_type not null,
  recommendation_id uuid references public.recommendation_impressions(id),
  idempotency_key uuid not null,
  created_at timestamptz not null default now(),
  undone_at timestamptz,
  check (actor_id <> target_id),
  unique (actor_id, idempotency_key)
);

create unique index one_active_reaction_per_pair
on public.reactions(actor_id, target_id)
where undone_at is null;

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  member_low uuid not null references public.profiles(id) on delete cascade,
  member_high uuid not null references public.profiles(id) on delete cascade,
  status match_status not null default 'active',
  matched_at timestamptz not null default now(),
  check (member_low < member_high),
  unique (member_low, member_high)
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null unique references public.matches(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  client_message_id uuid not null,
  created_at timestamptz not null default now(),
  unique (sender_id, client_message_id)
);

create table public.blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id),
  reported_id uuid not null references public.profiles(id),
  reason text not null,
  details text,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  check (reporter_id <> reported_id)
);
```

Add indexes for:

- `profiles(is_discoverable, last_active_at)`
- `profile_topics(topic_id, profile_id)`
- `profile_skills(skill_id, skill_type, profile_id)`
- `reactions(target_id, reaction, undone_at)`
- `recommendation_impressions(viewer_id, shown_at desc)`
- `messages(conversation_id, created_at desc)`
- Both directions of block lookup

## Step 7: Add RLS

### Identity contract: Stytch to Supabase

Supabase does not verify Stytch sessions. Its third-party auth integrations cover Clerk, Firebase Auth, Auth0, AWS Cognito, and WorkOS, but not Stytch.[^14] The caller's identity therefore reaches Postgres through a short-lived token that the Letsseeeify server mints after it validates the Stytch session:

1. The server validates the Stytch session and resolves the internal profile where `auth_user_id = stytch_user_id` (Step 5).
2. The server mints a Supabase access token signed with an ES256 (P-256) private key that has been imported into the Supabase project as a JWT signing key.[^15] The `kid` header must match the imported key. The payload contains:
   - `sub`: the internal `profiles.id` (a UUID), so `auth.uid()` returns the caller's profile ID
   - `role`: `authenticated`
   - `iat` and `exp`: the token expires within 15 minutes
3. The signing key (`SUPABASE_JWT_SIGNING_KEY`) stays server-only. The browser receives only minted tokens. It refreshes them through a server route that re-validates the Stytch session on every request, so a revoked session stops receiving tokens and loses database access once its current token expires.
4. Supabase clients send the minted token through the `accessToken` option, and Realtime receives it through `realtime.setAuth`.[^16][^9] The `apikey` header always carries the publishable key. It never carries the minted token or the service-role key.
5. Policies identify the caller by comparing `profiles.id`, or a foreign key to it, with `(select auth.uid())`. Wrapping `auth.uid()` in `select` lets Postgres evaluate it once per statement instead of once per row.[^13]
6. The service-role client is reserved for server-only modules that do work RLS cannot express, such as webhook processing and moderation tools. The service role bypasses RLS, so each such operation must authorize itself before touching data:
   - User-initiated operations validate the Stytch session, resolve the caller's profile, and check ownership or membership in code.
   - Provider webhooks have no signed-in caller. They verify the provider's signature, map the event to its linked integration, and process each delivery idempotently.

   Use a client authenticated with the minted token wherever possible.

Tests for this contract:

- Unit tests for token minting check the claims, the `kid` header, and the expiry. They also check that missing, expired, or revoked Stytch sessions receive no token.
- Every `*_rls.test.sql` file runs as `anon`, as `authenticated` with `sub` set to an owning or member profile, and as `authenticated` with a non-owning profile. It covers allowed and denied `select`, `insert`, `update`, and `delete`.
- Route tests prove that each user-initiated service-role path rejects a signed-in user who is not the owner or member before any service-role query runs.
- Webhook tests prove that deliveries with a missing or invalid signature, or for an unknown integration, are rejected before any service-role query runs, and that a replayed delivery is processed only once.
- An integration test confirms that Supabase rejects tokens that are expired or signed with a different key.

Policies should follow these rules:

- Users may update only their own profile.
- Users may read discoverable profiles unless either side has blocked the other.
- Users may read and update only their own preferences.
- Users may insert only reactions where `actor_id` is their own profile.
- Match members may read their match.
- Conversation members may read messages in that conversation.
- Only a conversation member may send a message, and `sender_id` must be their profile.
- Reporters may create reports but cannot read moderation-only fields.
- Provider tokens must not be exposed through client-accessible schemas.

Create allow-and-deny database tests for `select`, `insert`, `update`, and `delete`. Supabase explicitly recommends testing each protected table as anonymous and authenticated roles before relying on the policies.[^5]

## Step 8: Build onboarding

Create a five-step onboarding wizard:

1. Identity: name, role, institution, city, profile image
2. Academic profile: headline, biography, topics, methods
3. Skills: skills offered and skills needed
4. Intent: collaboration goals and availability
5. Discovery: modes, preferred topics, location, languages, and strict toggles

UX rules:

- Save after every step.
- Show progress and allow back navigation.
- Validate each step with Zod.
- Do not permit discovery until the required completion threshold is met.
- Preview the discovery card before finishing.
- Ask the user to confirm visible profile data.

Use explicit collaboration intents such as coauthor, mentor, mentee, study partner, research assistant, internship, hackathon team, grant partner, and startup collaborator. Intent badges are useful because Tinder’s Relationship Goals expose what a member is seeking before the decision, reducing ambiguity in the initial interaction.[^3][^8]

## Step 9: Build eligibility

Create `src/lib/matching/eligibility.ts` as a pure, testable function. A candidate is eligible only when all conditions pass:

```ts
type EligibilityContext = {
  viewerId: string
  candidateId: string
  candidateDiscoverable: boolean
  candidateModerationStatus: 'active' | 'restricted' | 'suspended'
  blockedEitherDirection: boolean
  hasActiveReaction: boolean
  satisfiesStrictTopics: boolean
  satisfiesStrictLocation: boolean
  satisfiesStrictAvailability: boolean
}

export function isEligible(ctx: EligibilityContext): boolean {
  return (
    ctx.viewerId !== ctx.candidateId &&
    ctx.candidateDiscoverable &&
    ctx.candidateModerationStatus === 'active' &&
    !ctx.blockedEitherDirection &&
    !ctx.hasActiveReaction &&
    ctx.satisfiesStrictTopics &&
    ctx.satisfiesStrictLocation &&
    ctx.satisfiesStrictAvailability
  )
}
```

Do not rank before eligibility filtering. Hard preferences must never be relaxed. Tinder distinguishes ordinary preferences from user-controlled dealbreakers and may broaden non-dealbreaker ranges after exhausting recommendations; Letsseeeify should make any such broadening explicit rather than silently changing criteria.[^4]

## Step 10: Build score

Use a transparent v1 score from 0 to 100:

```text
score =
  goal compatibility       × 0.30 +
  topic similarity         × 0.25 +
  complementary skills     × 0.20 +
  availability overlap     × 0.10 +
  collaboration mode       × 0.05 +
  activity freshness       × 0.05 +
  profile trust/completion × 0.05
```

Each component is normalized to 0–100.

### Goal compatibility

Use a configurable matrix instead of exact string matching:

| Viewer goal | Candidate goal | Component |
|---|---|---:|
| mentor | mentee | 100 |
| mentee | mentor | 100 |
| coauthor | coauthor | 100 |
| skill needed | corresponding skill offered | 100 |
| study partner | study partner | 90 |
| research assistant | project recruiting assistant | 100 |
| unrelated goals | unrelated goals | 0–30 |

### Topic similarity

Use weighted Jaccard similarity for v1:

```ts
similarity = sharedWeight / unionWeight
component = Math.round(similarity * 100)
```

Do not add embeddings until real search and reaction data show that taxonomy matching is insufficient.

### Complementary skills

Calculate both directions:

- Viewer needs matched by candidate offers
- Candidate needs matched by viewer offers

Use the higher of the two for project-oriented discovery, or average them for peer collaboration.

### Availability

```text
100: requested commitment fully fits
70: candidate provides at least 75%
40: candidate provides at least 50%
0: candidate provides less than 50%
```

### Activity freshness

Use bounded decay rather than permanent popularity:

```text
100: active within 3 days
80: active within 7 days
60: active within 14 days
30: active within 30 days
10: older than 30 days
```

### Trust

Do not use verification as a large ranking advantage. Use at most five score points so new or unverified users are not buried permanently.

## Step 11: Add ranking safeguards

After calculating relevance, apply controlled reranking:

1. Remove ineligible candidates.
2. Calculate transparent relevance.
3. Group near-equal scores into small bands.
4. Within each band, boost underexposed eligible profiles.
5. Limit repeated institutions, topics, and profile types in consecutive cards.
6. Reserve about 10% of positions for exploration among still-relevant candidates.
7. Never use protected or inferred sensitive traits.
8. Never let payment override strict relevance or safety rules.

Store `score`, component values, and 2–3 user-readable reasons:

```json
{
  "score": 86,
  "components": {
    "goals": 100,
    "topics": 78,
    "skills": 92,
    "availability": 70,
    "mode": 100,
    "freshness": 80,
    "trust": 60
  },
  "reasons": [
    "You are both looking for a coauthor",
    "3 shared machine-learning topics",
    "They offer Python and statistics, which you need"
  ]
}
```

## Step 12: Discovery API

Implement:

```http
GET /api/discovery?mode=people&cursor=<opaque>&limit=20
```

Response:

```json
{
  "items": [
    {
      "recommendationId": "uuid",
      "profile": {},
      "score": 86,
      "reasons": [],
      "isExpandedRecommendation": false
    }
  ],
  "nextCursor": "opaque-or-null"
}
```

Rules:

- Maximum 20 cards.
- Cursor contains the final score, tie-breaker, and query version; sign it server-side.
- Return card fields only, not the complete profile.
- Create an impression only when the client confirms the card became visible.
- Keep full-profile loading separate.
- Cache stable taxonomy data, not personalized queues.
- Use deterministic ordering for refresh recovery.

## Step 13: Build card deck

Create `DiscoveryCard`, `CardDeck`, and `ActionBar`.

Card content order:

1. Cover or profile image
2. Name, role, and verification state
3. Institution and approximate location
4. Collaboration goal badge
5. Top topics
6. Skills offered and needed
7. Two matching reasons
8. Availability and remote/hybrid/in-person mode

Gesture behavior:

- Drag left beyond 28% of card width: pass
- Drag right beyond 28%: interest
- Drag upward beyond 22% of card height: save
- Below threshold: spring back
- While dragging: rotate no more than 8 degrees
- Show `PASS`, `INTERESTED`, or `SAVE` overlay based on direction
- Animate committed cards in 180–260ms
- Transform and opacity only during dragging
- Disable another action until the previous mutation has an idempotency key

Buttons and keyboard:

| Action | Button | Keyboard |
|---|---|---|
| Pass | X | Left Arrow |
| Open profile | Profile | Enter |
| Save | Bookmark | Up Arrow |
| Interest | Heart | Right Arrow |
| Undo | Undo | Z |

Gesture-only controls are not acceptable. Add visible focus states, screen-reader labels, announcements such as “Passed Alex’s profile,” reduced-motion support, and minimum 44px touch targets.

Only mount the active card and next two cards. Preload the next two primary images, but do not load all galleries.

## Step 14: Reactions

Implement:

```http
POST /api/reactions
Content-Type: application/json
Idempotency-Key: <uuid>

{
  "recommendationId": "uuid",
  "targetId": "uuid",
  "reaction": "pass | interest | save"
}
```

Server transaction:

1. Authenticate session.
2. Resolve internal profile.
3. Validate the request with Zod.
4. Verify recommendation belongs to the viewer.
5. Recheck block and moderation rules.
6. Insert reaction with idempotency key.
7. If reaction is `interest`, check reciprocal active interest.
8. If reciprocal interest exists, create the canonical member pair.
9. Upsert exactly one match.
10. Upsert exactly one conversation.
11. Commit transaction.
12. Return reaction and optional match.

Two mutual right-swipes are the basic proven consent model used by Tinder before chat begins.[^1]

## Step 15: Undo

Implement one-level undo first:

```http
POST /api/reactions/undo
{
  "reactionId": "uuid"
}
```

Rules:

- Only the actor can undo.
- Permit undo during a short configurable period, such as five minutes.
- Do not undo after a conversation contains messages.
- Mark `undone_at`; preserve the event for analytics and abuse investigation.
- Put the card back at the top with the same recommendation ID.
- If undo dissolves an unused match, update the match and conversation transactionally.

## Step 16: Match moment

When a mutual match is created:

- Pause the deck.
- Show both profile images and an original Letsseeeify message such as “You both want to collaborate.”
- Show `Send a message` and `Keep exploring` actions.
- Suggest openers based on shared topics, but never send automatically.
- Avoid confetti or motion when reduced motion is active.

Do not copy Tinder’s exact match screen, phrases, gradients, animations, or iconography.

## Step 17: Realtime chat

Create private channels named from opaque conversation IDs. Supabase Realtime can authorize Broadcast and Presence with RLS policies on `realtime.messages`; private channels must disable public access and connect with `private: true`.[^9][^10] Clients authenticate Realtime with the minted Supabase token from the Step 7 identity contract and refresh it before it expires. Policies on `realtime.messages` allow access only when `(select auth.uid())` is a member of the conversation named by `realtime.topic()`.

Message flow:

1. Create a client message UUID.
2. Render optimistically as `sending`.
3. POST to the server.
4. Server authenticates membership and stores the message.
5. Realtime broadcasts the committed message.
6. Client reconciles by `client_message_id`.
7. On failure, show `failed` with retry.

Test:

- Non-members cannot subscribe.
- Blocked users cannot send.
- Duplicate client IDs do not create duplicate messages.
- Reconnect does not duplicate the timeline.
- Message order remains stable when timestamps tie.

## Step 18: Safety controls

Add `Block`, `Report`, and `End collaboration` to every full profile and conversation menu. Tinder places verification, block, report, and unmatch controls close to matching and chat; Letsseeeify should apply the same principle to academic collaboration safety.[^2][^11]

Block transaction:

1. Insert the block.
2. Hide both users from discovery.
3. Stop future reactions.
4. Disable active match and conversation.
5. Remove Realtime access.
6. Preserve report evidence according to retention policy.

Report flow:

- Category
- Optional details
- Related profile, match, conversation, and selected message IDs
- Confirmation and safety guidance
- Moderator-only queue and audit trail

## Step 19: Discovery settings

Create a filter sheet with:

- Discovery mode
- Collaboration goal
- Topics
- Skills offered/needed
- Institution
- Country/city
- Language
- Availability
- Remote/hybrid/in-person
- Verified only
- Strict toggles
- Pause discovery

“Pause discovery” must remove the profile from new queues while preserving existing matches and chat. This mirrors Tinder’s documented ability to hide from the card stack while retaining existing conversations.[^12][^4]

If no candidates satisfy soft preferences:

1. Keep hard constraints.
2. Show an empty-state explanation.
3. Offer manual expansion choices.
4. Label any expanded recommendation.
5. Never silently alter settings.

## Step 20: Analytics

Track these server-validated events:

```text
onboarding_started
onboarding_completed
profile_completed
queue_requested
recommendation_impression
profile_opened
reaction_pass
reaction_interest
reaction_save
reaction_undo
match_created
first_message_sent
reply_received
meeting_proposed
meeting_created
collaboration_created
collaboration_completed
block_created
report_submitted
```

Core metrics:

- Onboarding completion rate
- Eligible queue success rate
- Profile-open rate
- Interest rate
- Mutual-match rate
- First-message rate
- Reply rate
- Meeting-proposal rate
- Meeting-created rate
- Collaboration-completion rate
- Reports per 1,000 matches
- Exposure concentration across profiles

Do not optimize primarily for swipe count, session length, or daily time spent. The product target is meaningful academic collaboration.

## Step 21: Integrations

Only start integrations after discovery, matching, safety, and chat pass end-to-end tests.

### Google Calendar

- Connect through a separate consent flow.
- Request free/busy access before broader event access.
- Let the user select proposed slots.
- Show a final confirmation screen.
- Create the event idempotently.
- Store provider event ID, calendar ID, organizer, and sync status.

### Google Drive

- Prefer access to files created or explicitly selected in Letsseeeify.
- Add file picker, link, copy, and share actions.
- Display owner and current permission before sharing.
- Never expose refresh tokens to the browser.

### GitHub

- Import only selected repositories.
- Display repository topics, languages, README summary, and recent activity.
- Allow a match or project to link a repository.
- Optionally create a GitHub issue from an accepted collaboration task.

### Figma

- Link selected files and prototypes.
- Verify webhook passcodes.
- Turn relevant file/version updates into project notifications.

### Asana

- Convert a collaboration into a task or project after confirmation.
- Store Asana GIDs and deep links.
- Verify webhook handshake and signatures.
- Process webhook deliveries idempotently.

## Step 22: Tests

Required unit tests:

```text
eligibility.test.ts
score.test.ts
reasons.test.ts
diversity.test.ts
reaction-schema.test.ts
cursor.test.ts
supabase-token.test.ts
```

Required database tests, each run as `anon`, as an owning or member profile, and as a non-owning profile (see the Step 7 identity contract):

```text
profiles_rls.test.sql
preferences_rls.test.sql
reactions_rls.test.sql
matches_rls.test.sql
messages_rls.test.sql
blocks_rls.test.sql
reports_rls.test.sql
realtime_messages_rls.test.sql
```

Required Playwright paths:

1. Sign in and finish onboarding.
2. Discover and pass a profile.
3. Discover and express interest.
4. Create mutual match with two test users.
5. Send and receive a message.
6. Undo the latest unused reaction.
7. Block a match and verify chat access disappears.
8. Submit a report.
9. Pause discovery and retain existing chat.
10. Use the full flow with keyboard only.
11. Use reduced-motion mode.
12. Recover from a failed reaction request.
13. Verify that a signed-in user cannot read or subscribe to a conversation they are not a member of.

Run:

```bash
npm run typecheck
npm run lint
npm test -- --run
supabase test db
npx playwright test
npm run build
```

## Step 23: Performance

Acceptance targets:

- One active card plus two buffered cards
- No duplicate cards during pagination or refresh
- No layout-property animation during drag
- Optimistic reaction feedback with rollback
- Initial queue response limited to lightweight fields
- Responsive images and lazy-loaded galleries
- Indexed RLS lookup columns
- No N+1 profile/topic/skill queries
- Background processing for integration sync and analytics

RLS filters should use indexed columns, specify roles, and avoid unnecessary joins; Supabase recommends measuring policy cost and indexing policy filter columns.[^13]

## Step 24: Final gate

The MVP is complete only when:

- Authentication works with valid server-side session checks.
- Supabase access tokens are minted only after server-side Stytch validation, expire within 15 minutes, and carry the profile ID as `sub`.
- Onboarding produces a usable academic profile.
- Strict preferences never broaden.
- Swipe, buttons, and keyboard perform identical actions.
- Mutual interest creates one match and one conversation.
- Duplicate requests remain idempotent.
- Block immediately removes discovery and chat access.
- Realtime channels are private and authorized.
- Every exposed table has tested RLS.
- Service credentials never enter the client bundle.
- Loading, empty, offline, failure, retry, and reduced-motion states work.
- Typecheck, lint, unit, database, end-to-end tests, and production build pass.

## Coding-app response format

Require the coding app to finish each phase with exactly this structure:

```text
PHASE COMPLETED

Changed files:
- path/to/file: reason

Database changes:
- migration name
- tables/indexes/policies changed

Commands run:
- command: PASS/FAIL

Tests added:
- test name and covered behavior

Manual verification:
- exact steps

Security checks:
- authentication
- authorization
- secrets
- input validation
- idempotency

Remaining issues:
- concrete issue or “None”

Next phase:
- one proposed phase only
```

This prevents the coding app from making broad unverified changes and keeps implementation reviewable.

---

## References

[^1]: [Frequently Asked Questions - Tinder](https://tinder.com/en-GB/faq/) - Is Tinder free? Is Tinder safe? How much does Tinder cost? Who uses Tinder? Everything you ever want...

[^2]: [Safety Tips | Tinder](https://tinder.com/safety-tips) - Learn how to stay safe on Tinder. Get tips for online safety, meeting in person, and protecting your...

[^3]: [Relationship Goals](https://se.tinderpressroom.com/RelationshipGoals) - Dating Sunday är en av de mest hektiska dagarna under året när det kommer till dejting med 10 procen...

[^4]: [Discovery-Einstellungen](https://www.help.tinder.com/hc/de/articles/115003340963-Discovery-Einstellungen) - Aktualisiere deine Discovery-Einstellungen Discovery ist der Teil von Tinder, in dem du die Profile ...

[^5]: [Row Level Security | Supabase Docs](https://supabase.com/docs/guides/database/postgres/row-level-security) - Secure your data using Postgres Row Level Security.

[^6]: [Securing your data | Supabase Docs](https://supabase.com/docs/guides/database/secure-data)

[^7]: [Securing your API](https://supabase.com/docs/guides/api/securing-your-api) - Secure your Data API with explicit grants and Postgres Row Level Security.

[^8]: [Relationship Goals - Tinder Newsroom](https://www.tinderpressroom.com/2022-12-14-Tinder-Introduces-Relationship-Goals,-Because-Sharing-What-You-Want-Is-Sexy) - LOS ANGELES - DECEMBER 14, 2022 - Today, Tinder is rolling out Relationship Goals, a new profile fea...

[^9]: [Realtime Authorization | Supabase Docs](https://supabase.com/docs/guides/realtime/authorization) - Authorization for Supabase Realtime

[^10]: [Getting Started with Realtime | Supabase Docs](https://supabase.com/docs/guides/realtime/getting_started) - Learn how to build real-time applications with Supabase Realtime

[^11]: [Tinder | Dating, Make Friends & Meet New People](https://tinder.com/safety/) - With 55 billion matches to date, Tinder® is the world’s most popular dating app, making it the place...

[^12]: [Privacy settings | Tinder | Match. Chat. Meet. Modern Dating.](https://policies.tinder.com/safety-center/tools/privacy/intl/en/) - With 43 billion matches to date, Tinder® is the world’s most popular dating app, making it the place...

[^13]: [Row Level Security performance | Supabase Docs](https://supabase.com/docs/guides/database/postgres/row-level-security-performance) - Measure and tune Postgres Row Level Security policies.

[^14]: [Third-party auth | Supabase Docs](https://supabase.com/docs/guides/auth/third-party/overview) - Supported external auth providers whose JWTs Supabase can verify.

[^15]: [JWT signing keys | Supabase Docs](https://supabase.com/docs/guides/auth/signing-keys) - Importing a private key and minting JWTs with `sub`, `role`, and `exp` claims.

[^16]: [JSON Web Tokens | Supabase Docs](https://supabase.com/docs/guides/auth/jwts) - Passing custom or third-party JWTs to Supabase clients with the `accessToken` option.

