# Common Ground

A Progressive Web App where a community shares member contact info, organizes **issues** (events and projects), claims **tasks**, and **comments** on tasks.

Static front end on GitHub Pages, with Supabase (Postgres + Auth) as the backend.

## Features

- **Accounts:** sign up and log in with email and password. Emails are unique (enforced by Supabase Auth).
- **Members:** a directory of every member's name, email, phone and bio. You can edit only your own profile.
- **Issues:** events or projects with a date, location and description. Only the organizer can edit an issue. Issues are never deleted. The organizer switches them to **Closed** when they're over, and closed issues stop accepting new tasks.
- **Tasks:** each task belongs to the member who added it (e.g. *"I'll bring the chips"*). Only that member can edit it, check it off or delete it.
- **Comments:** comments exist on tasks only. Only the author can edit or delete a comment.
- **PWA:** the app is installable, has an offline app shell via a service worker, and works on phones in light or dark mode.

## Security model

Every rule is enforced in the database with Row Level Security and column-level grants, so the rules hold even if someone calls the API directly with the public key. See [`supabase/schema.sql`](supabase/schema.sql).

| Data     | Read            | Create         | Update       | Delete |
|----------|-----------------|----------------|--------------|--------|
| Profile  | signed-in users | on sign-up     | self only    | not allowed |
| Issue    | signed-in users | any member     | owner only   | **never** (close instead) |
| Task     | signed-in users | any member, on open issues | owner only | owner only, if nobody else commented |
| Comment  | signed-in users | any member     | author only  | author only |

`owner_id` and `author_id` are set by the database from the logged-in user and can't be written by clients.

## Demo accounts

All demo accounts use the password `community123`:
`jane@example.com`, `john@example.com`, `priya@example.com`, `marcus@example.com`, `sofia@example.com`, `ben@example.com`, `aisha@example.com`, `tom@example.com`.

## Setup

```bash
supabase login                                   # once
node scripts/provision.mjs --site https://<user>.github.io/common-ground/
python3 -m http.server 8080                      # local preview at http://localhost:8080
```

The provision script does all of the following:

1. Creates the Supabase project.
2. Applies the schema and its access policies.
3. Turns on email/password auth.
4. Creates the demo members.
5. Seeds the demo data.
6. Writes `config.js`.

The anon key in `config.js` is meant to be public.

Deploy by pushing to GitHub and enabling Pages on the `main` branch, root folder.
