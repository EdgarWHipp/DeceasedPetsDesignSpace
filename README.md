# Deceased Pets Design Space

Interactive explorer for the design space of XR and technology-mediated representations of deceased companion animals, developed in a Master's thesis at Karlsruhe Institute of Technology (KIT). Pick one position per dimension and a new version of the pet spawns reflecting every choice — nine dimensions, 5184 possible configurations.

## Development

```bash
bun install
bun run dev     # http://localhost:3000
bun run build   # static production build
```

## Deployment

Deployed on [Vercel](https://vercel.com): import this repository as a new project — the Next.js framework is auto-detected, no environment variables are needed.

Kiosk setup for conventions: open `/?kiosk=1` (attract mode, nav hidden). `/?idle=<seconds>` overrides the 75 s idle timeout.
