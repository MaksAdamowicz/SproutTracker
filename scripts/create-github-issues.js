const { execSync } = require('child_process');

const issues = [
  {
    title: '[M1] Auth: Set up Supabase Authentication & User Profiles',
    body: `### **[M1] Auth: Set up Supabase Authentication & User Profiles**
**Description:** Implement user registration, login, and profile creation using Supabase Auth.
**Technical Implementation Notes (Supabase Specific):** 
- Enable Email/Password auth in Supabase dashboard.
- Create \`profiles\` table: \`id\` (uuid, PK, references \`auth.users\`), \`username\` (text, unique), \`avatar_url\` (text), \`bio\` (text), \`created_at\` (timestamp).
- Enable RLS on \`profiles\`: Users can read all profiles but only update their own.
- Create a Postgres trigger to automatically insert a row into \`profiles\` when a new user signs up in \`auth.users\`.
**Tasks:**
- [ ] Initialize Next.js project with Tailwind CSS.
- [ ] Install Supabase JS client and set up environment variables.
- [ ] Create signup and login pages with form validation.
- [ ] Create Supabase migration for the \`profiles\` table and the auth trigger.
- [ ] Implement profile setup page (username, bio, avatar upload placeholder).
**Acceptance Criteria:**
- [ ] User can sign up with email/password and see a success state.
- [ ] User can log in and out.
- [ ] A \`profiles\` row is automatically created upon signup.
**Labels:** auth, backend, database, frontend`
  },
  {
    title: '[M2] Plants: Create Plant Management System',
    body: `### **[M2] Plants: Create Plant Management System**
**Description:** Allow users to add, edit, and view the plants they are currently growing.
**Technical Implementation Notes (Supabase Specific):** 
- Create \`plants\` table: \`id\` (uuid, PK), \`user_id\` (uuid, references \`profiles\`), \`name\` (text), \`species\` (text), \`date_planted\` (date), \`status\` (text: 'seedling', 'growing', 'blooming', 'harvested', 'dead').
- RLS on \`plants\`: Users can read all plants (for social features later) but only insert/update/delete their own.
**Tasks:**
- [ ] Create \`plants\` table migration and configure RLS.
- [ ] Build "Add Plant" form UI (name, species, date planted).
- [ ] Build "My Garden" view displaying a list/grid of user's plants.
- [ ] Build "Plant Detail" view to show specific plant info and status.
**Acceptance Criteria:**
- [ ] User can add a new plant to their garden.
- [ ] User can view a list of their plants.
- [ ] User can edit a plant's details or change its status.
**Labels:** frontend, database, enhancement`
  },
  {
    title: '[M3] Logs: Implement Growth Activities/Logs',
    body: `### **[M3] Logs: Implement Growth Activities/Logs**
**Description:** Enable users to log activities for their plants (watering, growth tracking, notes), acting as the "workout" equivalent.
**Technical Implementation Notes (Supabase Specific):** 
- Create \`growth_logs\` table: \`id\` (uuid, PK), \`plant_id\` (uuid, references \`plants\`), \`user_id\` (uuid, references \`profiles\`), \`activity_type\` (text: 'water', 'fertilize', 'measure', 'note'), \`measurement_cm\` (numeric, optional), \`notes\` (text), \`image_url\` (text), \`created_at\` (timestamp).
- Set up Supabase Storage bucket \`log-images\` for progress photos.
- RLS on \`growth_logs\`: Public read, owner-only insert/update/delete.
- RLS on \`log-images\` storage: Public read, authenticated users can upload.
**Tasks:**
- [ ] Create \`growth_logs\` table migration and configure RLS.
- [ ] Create \`log-images\` Storage bucket and define access policies.
- [ ] Build "Log Activity" UI flow from the Plant Detail page.
- [ ] Implement image upload to Supabase Storage and store the public URL in the log record.
- [ ] Display a timeline of logs on the Plant Detail page.
**Acceptance Criteria:**
- [ ] User can create a log with an activity type and optional notes.
- [ ] User can successfully upload a photo attached to the log.
- [ ] The plant's detail page shows a chronological history of logs.
**Labels:** frontend, backend, database, storage`
  },
  {
    title: '[M4] Social: Implement Follower/Following Graph',
    body: `### **[M4] Social: Implement Follower/Following Graph**
**Description:** Create the social graph allowing users to follow each other's plant journeys.
**Technical Implementation Notes (Supabase Specific):** 
- Create \`follows\` table: \`follower_id\` (uuid, references \`profiles\`), \`following_id\` (uuid, references \`profiles\`), \`created_at\` (timestamp). Primary key is composite \`(follower_id, following_id)\`.
- RLS on \`follows\`: Public read, authenticated users can insert/delete where \`follower_id\` equals their own ID.
**Tasks:**
- [ ] Create \`follows\` table migration and RLS policies.
- [ ] Build API endpoints/Supabase queries to fetch followers and following lists.
- [ ] Add "Follow/Unfollow" button on User Profile pages.
- [ ] Display follower/following counts on User Profile pages.
**Acceptance Criteria:**
- [ ] User can follow and unfollow another user.
- [ ] Follower counts update accurately.
- [ ] Users cannot follow themselves.
**Labels:** database, frontend, social`
  },
  {
    title: '[M5] Feed: Build the Chronological Social Feed',
    body: `### **[M5] Feed: Build the Chronological Social Feed**
**Description:** Develop the main feed where users see the latest \`growth_logs\` from people they follow.
**Technical Implementation Notes (Supabase Specific):** 
- Create a database view or an RPC (Remote Procedure Call) \`get_feed_logs(user_id)\` that joins \`growth_logs\`, \`plants\`, and \`profiles\`, filtering by \`user_id\` in the \`follows\` table.
- Index \`created_at\` on \`growth_logs\` for performance.
**Tasks:**
- [ ] Write SQL migration for the feed query (RPC or View) to fetch logs of followed users.
- [ ] Build the Feed UI (Main Dashboard) displaying log cards (User info, Plant info, Activity, Photo, Timestamp).
- [ ] Implement pagination or infinite scrolling for the feed.
**Acceptance Criteria:**
- [ ] Feed displays logs exclusively from followed users (and perhaps own logs).
- [ ] Logs are sorted chronologically, newest first.
- [ ] Feed loads additional logs seamlessly upon scrolling.
**Labels:** frontend, backend, database, social`
  },
  {
    title: '[M6] Interactions: Add Leaves (Kudos) to Logs',
    body: `### **[M6] Interactions: Add 'Leaves' (Kudos) to Logs**
**Description:** Allow users to give 'Leaves' (likes/kudos) to growth logs on the feed.
**Technical Implementation Notes (Supabase Specific):** 
- Create \`leaves\` table: \`log_id\` (uuid, references \`growth_logs\`), \`user_id\` (uuid, references \`profiles\`), \`created_at\` (timestamp). PK is composite \`(log_id, user_id)\`.
- RLS: Public read, owner-only insert/delete.
**Tasks:**
- [ ] Create \`leaves\` table migration and RLS policies.
- [ ] Add Leaf button to feed cards and log detail pages.
- [ ] Implement optimistic UI updates for toggling a Leaf.
- [ ] Display total leaf count and who left them.
**Acceptance Criteria:**
- [ ] User can toggle a Leaf on a log.
- [ ] Total Leaf count updates immediately on the UI.
- [ ] A user can only leave one Leaf per log.
**Labels:** frontend, database, social`
  },
  {
    title: '[M7] Interactions: Comments on Logs',
    body: `### **[M7] Interactions: Comments on Logs**
**Description:** Enable users to comment on growth logs to foster community interaction.
**Technical Implementation Notes (Supabase Specific):** 
- Create \`comments\` table: \`id\` (uuid, PK), \`log_id\` (uuid, references \`growth_logs\`), \`user_id\` (uuid, references \`profiles\`), \`content\` (text), \`created_at\` (timestamp).
- RLS: Public read, owner-only insert/update/delete.
- Set up Supabase Realtime on \`comments\` for live updates.
**Tasks:**
- [ ] Create \`comments\` table migration and RLS policies.
- [ ] Enable Realtime for the \`comments\` table.
- [ ] Build comment section UI under a log.
- [ ] Implement live comment rendering using Supabase Realtime subscriptions.
**Acceptance Criteria:**
- [ ] User can post a comment on a log.
- [ ] Comments are visible to everyone.
- [ ] New comments appear in real-time without refreshing the page.
**Labels:** frontend, database, realtime`
  },
  {
    title: '[M8] Gamification: Achievements & Badges',
    body: `### **[M8] Gamification: Achievements & Badges**
**Description:** Introduce an achievement system to reward users for milestones (e.g., "First Harvest", "30-Day Streak").
**Technical Implementation Notes (Supabase Specific):** 
- Create \`badges\` table (dictionary of available badges): \`id\` (text, PK), \`name\` (text), \`description\` (text), \`icon_url\` (text).
- Create \`user_badges\` table: \`user_id\` (uuid, references \`profiles\`), \`badge_id\` (text, references \`badges\`), \`earned_at\` (timestamp).
- Implementation logic for streaks can run via Supabase Edge Functions on cron schedules, or triggered via RPC during log creation.
**Tasks:**
- [ ] Create tables for \`badges\` and \`user_badges\`.
- [ ] Seed initial badges ("First Sprout", "Social Butterfly", "Weekly Waterer").
- [ ] Implement logic to check and award badges when activities are logged (e.g., checking for the first log).
- [ ] Build a "Trophy Case" section on the User Profile.
**Acceptance Criteria:**
- [ ] Badges are correctly awarded when conditions are met.
- [ ] Users can view their earned badges on their profile.
**Labels:** backend, frontend, database, gamification`
  }
];

// Helper to escape quotes for bash
const escapeQuote = (str) => str.replace(/"/g, '\\"');

for (const issue of issues) {
  console.log("Creating issue: " + issue.title);
  const cmd = 'gh issue create --title "' + escapeQuote(issue.title) + '" --body "' + escapeQuote(issue.body) + '"';
  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log("✅ Successfully created: " + issue.title + "\\n");
  } catch (err) {
    console.error("❌ Failed to create: " + issue.title);
    console.error(err);
  }
}
