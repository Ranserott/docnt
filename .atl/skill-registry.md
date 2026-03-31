# Skill Registry - docnt

## Project Standards

- **Framework**: Next.js 16 App Router
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Validation**: Zod schemas for all forms
- **Server Actions**: Use for all mutations
- **TypeScript**: Strict mode, no `any`
- **Timezone**: Chile (UTC-3) - hardcoded in date handling

## User Skills (Auto-loaded by Context)

| Context | Skill |
|---------|-------|
| React/Next.js | next-best-practices |
| Angular | (not used) |
| Go testing | go-testing |
| Skill creation | skill-creator |

## Project Structure

```
src/
├── app/dashboard/     # Protected routes (requires auth)
├── lib/actions/       # Server Actions (only calendar + course exported in index.ts)
├── components/        # React components
└── types/            # TypeScript definitions
```

## Tech Stack Detected

- next: 16.1.6
- react: 19.2.3
- prisma: 6.19.2
- next-auth: 5.0.0-beta.30
- tailwindcss: 4
- typescript: 5
- zod: 3.25.76