# Contributing to Sizabantu Barbershop OS

## Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes following the code style guide below
4. Commit: `git commit -m 'feat: add your feature'`
5. Push: `git push origin feature/your-feature`
6. Open a Pull Request

## Code Style

- TypeScript strict mode enabled
- Use async/await (no raw Promises)
- Functional components only (no class components)
- All API routes must use `ok()` / `err()` / `handleApiError()` helpers from `lib/utils/api-helpers`
- New Firebase reads/writes must go through services in `lib/services/`

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: fix a bug
chore: maintenance tasks
docs: documentation changes
refactor: code refactoring
```

## Environment

Never commit `.env.local` or any file containing real API keys. Use `.env.example` as a template.

## Questions?

Open an issue or contact the maintainers.
