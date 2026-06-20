# Publishing kp2kp.eth

This site is a static Next.js export served from IPFS at kp2kp.eth via an
IPNS name. After the one time
ENS setup, every change is just a git push. No gas. No onchain action.

## How it flows

```
git push to main
   -> GitHub Action builds the static site (out/)
   -> pins out/ to IPFS via Pinata  (new root CID)
   -> updates the IPNS name to that CID via w3name (signed in CI)
   -> kp2kp.eth resolves the new content within minutes
```

The ENS Content Hash on kp2kp.eth points at one fixed IPNS name and never
needs to change again.

## Write a new article

1. Create a markdown file in `content/posts/`, for example
   `content/posts/my-week-in-base.md`.
2. Add frontmatter at the top:

   ```md
   ---
   title: "My week in Base"
   date: "2026-06-20"
   excerpt: "One or two lines that show on the articles list."
   tags: ["base", "notes"]
   ---

   Write the article body in plain markdown below.
   ```

3. Commit and push to `main`.

That is it. The article appears at `/articles/<filename>/` and on the
`/articles/` index, and kp2kp.eth updates itself.

## Edit the site

Edit any page or copy, push to `main`. Same pipeline runs.

## Local preview

```sh
npm run dev      # live dev server at http://localhost:3000
npm run build    # produce the static export in out/
```

## Manual publish (rarely needed)

If you ever want to pin and publish from your laptop instead of CI:

```sh
npm run build
PINATA_JWT=xxxxx npm run pin                 # prints CID=...
IPNS_SIGNING_KEY_B64=xxxxx npm run publish:ipns <CID>
```
