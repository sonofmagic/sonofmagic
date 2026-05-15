# Terminal Profile

My profile in Chinese and English, right in the terminal.

Node.js requirement: `^20.19.0 || >=22.12.0`.

Run it with:

```bash
npx @icebreakers/profile@latest
# or
npx @icebreakers/profile@latest --ignore-existing
```

That opens the interactive profile.

Commands that print and exit:

```bash
# Show a short intro and exit
npx @icebreakers/profile@latest summary --lang en

# Show all public links and exit
npx @icebreakers/profile@latest links
npx @icebreakers/profile@latest contact

# Show one target link and exit
npx @icebreakers/profile@latest url github
npx @icebreakers/profile@latest url gh
```

Supported URL targets:

```text
github, website, repositories, juejin, blog, x
aliases: gh, repo, repos, repository, site, web
```

[See More](https://github.com/sonofmagic)
