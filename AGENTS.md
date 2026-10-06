<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep shared site chrome in `src/components/site.tsx`; all public business content lives on the single scrolling home route because the site is intentionally one page.
- Keep yard-photo analysis behind the `/api/yard-plan` server route, stream Gateway output, and never persist customer uploads because photos may contain private property details.
