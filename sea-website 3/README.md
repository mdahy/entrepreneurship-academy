# Social Entrepreneurship Academy — website

This is a static copy of entrepreneurship-academy.eu, rebuilt to move it off GoDaddy Websites + Marketing. It uses plain HTML, CSS and JavaScript, with no build step and no paid services. Every file it needs is in this folder, including fonts, images, the guidebook PDF and the PDF viewer, so it makes no requests to Google or other third parties.

## What's in the folder

```
index.html                 Home
programme/index.html       Programme (modules, benefits, eligibility)
participants/index.html    Photo gallery of the 1st cohort (currently "coming soon") + eligibility
partners/index.html        The three partner organisations
contact-us/index.html      Contact form + newsletter sign-up
404.html                   Not-found page
assets/css/style.css       All styles
assets/js/main.js          Menu, "More" menu, mobile menu, Show more, gallery, forms, back-to-top
assets/js/pdf-viewer.js    Guidebook page viewer (page through all 55 pages on the site)
assets/vendor/pdfjs/       PDF.js 4.10.38 by Mozilla (Apache-2.0 licence)
assets/fonts/              Open Sans + Playfair Display (SIL Open Font Licence)
assets/docs/               The guidebook PDF (CC BY-SA 4.0), optimised for fast web viewing
assets/img/                Your logo, partner logos, EU logo, photo, guidebook cover, share image
robots.txt, sitemap.xml, site.webmanifest, .nojekyll
```

## Differences from the GoDaddy version

- **Photos:** the hero photo and the photos on Modules 2–4 were GoDaddy stock images, so they can't be reused. The hero now uses your own team photo. The module cards use the guidebook's module colours and numbers (yellow 01, magenta 02, blue 03, green 04). The Contact page uses the coloured circles from your logo.
- **No cookie banner:** the new site sets no cookies and loads nothing from third parties, so it doesn't need one.
- **Interface labels are in English:** GoDaddy showed some interface labels in German, such as "Mehr", "Zeige mehr", "Weiter" and "Annehmen".
- **Consent tick boxes:** both forms now have one, which is good practice under GDPR.
- **The guidebook PDF is hosted with the site:** it's no longer on GoDaddy's servers. Its page viewer loads only when a visitor scrolls to it, and fetches pages one at a time.

The original page text is unchanged, typos included. You can edit it directly in the HTML files.

## Common edits

- **Adding cohort photos:** save the photos in `assets/img/` (JPG, around 1600 px wide). Then edit `participants/index.html`:
  1. Delete the `<div class="coming-soon">…</div>` line.
  2. For each photo, add this inside `<div class="gallery-stage">`, before the buttons:
     `<figure class="gallery-slide" style="margin:0"><img src="../assets/img/cohort-1.jpg" alt="Describe the photo"></figure>`
  3. For each photo, add a matching thumbnail inside `<div class="gallery-thumbs">`:
     `<button type="button" aria-label="Show photo 1"><img src="../assets/img/cohort-1.jpg" alt=""></button>`

  The arrows, thumbnails, swiping and arrow keys start working on their own once there are two or more photos.
- **Changing the header or footer:** these are repeated on every page, so use find-and-replace across all six HTML files.
- **Colours** are defined at the top of `assets/css/style.css`.

## Forms

Both forms use FormSubmit (formsubmit.co), which is free and needs no account. Messages are emailed to the address in each form's `data-endpoint` and `action` attributes in `contact-us/index.html`. Replace `YOUR-EMAIL@example.com` with your address in all four places.

The first time someone submits a form, FormSubmit sends a confirmation email to that address. Click the link in it once to activate the forms.

## Preview on your computer

```bash
cd sea-website
python3 -m http.server 8000
# then open http://localhost:8000
```

## Hosting: GitHub Pages (free)

1. Upload the contents of this folder, not the folder itself, to the root of a public GitHub repository.
2. In the repository, go to Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)` → Save.
3. The site goes live at `https://<user>.github.io/<repository>/` after about a minute.

**Custom domain:** in Settings → Pages → Custom domain, enter `entrepreneurship-academy.eu`. Then create these DNS records at STRATO, where the domain is managed:
- four A records for `@`: 185.199.108.153, 185.199.109.153, 185.199.110.153 and 185.199.111.153
- a CNAME record for `www` pointing to `<user>.github.io`

Don't change any MX records, which handle email. Once DNS works, tick **Enforce HTTPS**.

`.nojekyll` tells GitHub to publish the files exactly as they are.

## Testing done

I tested the site in Chromium at desktop (1100 px), tablet (800 px) and mobile (390 px) widths:

- No script errors, no broken links or images, and no sideways scrolling on any page.
- The menu, the "More" menu and the mobile menu work, including the Esc key and keyboard focus.
- "Show more" opens and closes every module.
- The guidebook viewer renders real PDF pages and goes forward and back.
- The gallery responds to the arrows and thumbnails.
- Both forms check their fields and show success or error messages.
- All pages pass html-validate.
