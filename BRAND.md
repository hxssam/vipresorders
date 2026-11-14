# ВИАЙПИ РЕСТОБАР КУХНЯ — тема «Indigo Pro» (v9.1)

Один набор токенов для сайта, печати и слайдов. Вставляйте блок ниже в любые будущие запросы.

## Brand block (copy / paste)

```
Brand: ВИАЙПИ РЕСТОБАР КУХНЯ · mood: Indigo Pro (light) + Dark Pro (dark) · UI language: Russian
Logo: logo.png (white, for dark) / logo-ink.png (ink, for light)
Font: system-ui stack (SF / Roboto / Segoe) — full Cyrillic, zero download, instant
Radius 16px · tap targets ≥44px · inputs ≥16px (no iOS zoom) · one accent system (indigo → violet)

LIGHT  bg #f1f2f9 · surface #ffffff · text #141726 · muted #5b6080 · accent #4338ca → #7c3aed
       soft #eceafd · line #dfe1ef · warn #b45309 · danger #c81e1e · ok #047857 (bg #e2f5ed)
DARK   bg #0b0d17 · surface #141829 · text #eceefb · muted #9a9fc4 · accent #8b8dfa · #c084fc
       gradient #5457e8 → #7e3fe0 · soft #202550 · line #272c49 · warn #fbbf24 · danger #f87171 · ok #34d399
```

## Rules the whole app follows
- Every colour has one job: accent = main action / selected; warn = needs attention; danger = delete / urgent; ok = done.
- Text contrast ≥ 4.5:1 on its surface (checked for every pair in both themes; white on the button gradient 5.4–7.9:1).
- Lists are vertical rows, never squeezed side by side; one card per task; one screen per job.
- Empty screens say what is missing and what to do next (icon + one line).
- Admin things (team, catalogue, kitchen day, password) sit in collapsible sections behind the chief's password.
- Motion is short (≤300 ms) and turns off with «reduce motion».
