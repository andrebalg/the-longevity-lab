# The Longevity Lab

Website for Saran Kalsi's online coaching practice (Coach+, Equinox Bishopsgate): performance,
health and longevity. A rebuild of https://longevitylabcoach.netlify.app/.

Static site: no build step, no framework, no dependencies.

## Files

- `index.html` – the page. All copy lives here.
- `styles.css` – design tokens at the top of the file, then components, then breakpoints.
  The logotype (THE / LONGΞVITY / LAB) is rendered in type; the Ξ is the `.xi` component.
- `script.js` – load sequence, navigation, scroll-linked hero, reveals, the growth-ring canvas,
  the live London clock, and the form handler.
- `assets/saran-kalsi.jpg` – coach portrait, recovered from a screenshot of the original site.
  Replace it with the original high-resolution file when you have it (any aspect ratio works).
- `assets/leaf.jpg` – droplet detail from the original hero photograph, softened, used as the
  hero's background layer. Swap in the original photograph (without the logo baked in) for a
  sharper result.

## Run locally

```
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Deploy

**GitHub Pages.** `.github/workflows/pages.yml` publishes the site on every push to `main`.
The workflow tries to enable Pages itself; if GitHub refuses, enable it once under
Settings > Pages > Build and deployment > Source: GitHub Actions, then re-run the workflow.
GitHub Pages has no form backend, so the contact form falls back to a mailto link there.

**Netlify.** `netlify.toml` publishes the repository root. The contact form is a Netlify Form
(`data-netlify="true"`, name `consultation`) with a honeypot field; submissions appear under
Forms in the Netlify dashboard.

## Before launch

- Instagram: replace the `https://www.instagram.com/` link and the `@thelongevitylab` handle in
  the Contact section with the real profile.
- "Book a consultation" opens a pre-filled email. Swap in a booking link if one exists.
- Check the Who this is for section reads true to how Saran coaches; it is new copy written from
  the original site's philosophy.
