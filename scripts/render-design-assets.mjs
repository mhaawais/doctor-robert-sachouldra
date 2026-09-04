/**
 * Renders brand-critical design assets (OG image + forthcoming book cover
 * placeholder) from SVG → PNG via sharp, using the site's real fonts.
 * Run: bun /home/z/my-project/scripts/render-design-assets.mjs
 */
import sharp from "sharp";
import fs from "fs";

const OUT = "/home/z/my-project/public/images";

// ── OG IMAGE (1200x630) ────────────────────────────────────────────────
const ogSvg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0e1b2a"/>
      <stop offset="0.55" stop-color="#13273a"/>
      <stop offset="1" stop-color="#1d3a4f"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.85" cy="0.12" r="0.9">
      <stop offset="0" stop-color="#b59a62" stop-opacity="0.22"/>
      <stop offset="0.6" stop-color="#b59a62" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="rule" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#b59a62" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#d9c69a"/>
      <stop offset="1" stop-color="#b59a62" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <!-- frame -->
  <rect x="36" y="36" width="1128" height="558" fill="none" stroke="#b59a62" stroke-opacity="0.45" stroke-width="1.5"/>
  <rect x="48" y="48" width="1104" height="534" fill="none" stroke="#b59a62" stroke-opacity="0.2" stroke-width="1"/>

  <!-- monogram -->
  <circle cx="600" cy="150" r="56" fill="none" stroke="#b59a62" stroke-opacity="0.65" stroke-width="1.5"/>
  <text x="600" y="168" text-anchor="middle" font-family="Playfair Display" font-weight="600" font-size="40" letter-spacing="3" fill="#d9c69a">RS</text>

  <!-- eyebrow -->
  <rect x="380" y="252" width="90" height="1" fill="url(#rule)"/>
  <text x="600" y="258" text-anchor="middle" font-family="Source Sans 3" font-weight="600" font-size="19" letter-spacing="7" fill="#b59a62">PHYSICIAN  ·  SCIENTIST  ·  AUTHOR</text>
  <rect x="730" y="252" width="90" height="1" fill="url(#rule)"/>

  <!-- name -->
  <text x="600" y="352" text-anchor="middle" font-family="Playfair Display" font-weight="700" font-size="76" letter-spacing="0.5" fill="#f7f4ee">Dr. Robert Sakulanda</text>

  <!-- positioning -->
  <text x="600" y="428" text-anchor="middle" font-family="Playfair Display" font-style="italic" font-size="27" fill="#f7f4ee" fill-opacity="0.72">Medicine, science, and the stories that connect us.</text>

  <!-- bottom rule + site -->
  <rect x="480" y="492" width="240" height="1" fill="url(#rule)"/>
  <text x="600" y="534" text-anchor="middle" font-family="Source Sans 3" font-weight="400" font-size="19" letter-spacing="5" fill="#f7f4ee" fill-opacity="0.45">WWW.ROBERTSAKULANDA.COM</text>
</svg>`;

// ── FORTHCOMING BOOK COVER PLACEHOLDER (700x1050, 2:3) ────────────────
const coverSvg = `
<svg width="700" height="1050" viewBox="0 0 700 1050" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cbg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0e1b2a"/>
      <stop offset="0.5" stop-color="#15293d"/>
      <stop offset="1" stop-color="#1d3a4f"/>
    </linearGradient>
    <radialGradient id="cglow" cx="0.75" cy="0.08" r="1">
      <stop offset="0" stop-color="#b59a62" stop-opacity="0.20"/>
      <stop offset="0.55" stop-color="#b59a62" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="crule" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#b59a62" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#d9c69a"/>
      <stop offset="1" stop-color="#b59a62" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="700" height="1050" fill="url(#cbg)"/>
  <rect width="700" height="1050" fill="url(#cglow)"/>

  <rect x="42" y="42" width="616" height="966" fill="none" stroke="#b59a62" stroke-opacity="0.5" stroke-width="1.5"/>
  <rect x="54" y="54" width="592" height="942" fill="none" stroke="#b59a62" stroke-opacity="0.22" stroke-width="1"/>

  <!-- top: byline -->
  <text x="350" y="180" text-anchor="middle" font-family="Source Sans 3" font-weight="600" font-size="19" letter-spacing="8" fill="#b59a62">A BOOK BY</text>
  <text x="350" y="248" text-anchor="middle" font-family="Playfair Display" font-weight="700" font-size="44" fill="#f7f4ee">Dr. Robert</text>
  <text x="350" y="304" text-anchor="middle" font-family="Playfair Display" font-weight="700" font-size="44" fill="#f7f4ee">Sakulanda</text>

  <rect x="270" y="360" width="160" height="1.5" fill="url(#crule)"/>

  <!-- center motif: open pages / horizon lines -->
  <g stroke="#d9c69a" stroke-opacity="0.55" fill="none" stroke-width="1.5">
    <path d="M 230 540 Q 350 480 470 540"/>
    <path d="M 230 570 Q 350 510 470 570"/>
    <path d="M 230 600 Q 350 540 470 600"/>
  </g>
  <circle cx="350" cy="452" r="30" fill="none" stroke="#b59a62" stroke-opacity="0.6" stroke-width="1.5"/>
  <path d="M 336 452 L 347 463 L 366 440" stroke="#d9c69a" stroke-opacity="0.85" stroke-width="2" fill="none"/>

  <!-- center: forthcoming title -->
  <text x="350" y="700" text-anchor="middle" font-family="Playfair Display" font-style="italic" font-size="34" fill="#f7f4ee" fill-opacity="0.85">Title to be</text>
  <text x="350" y="744" text-anchor="middle" font-family="Playfair Display" font-style="italic" font-size="34" fill="#f7f4ee" fill-opacity="0.85">announced</text>

  <!-- bottom: status -->
  <text x="350" y="920" text-anchor="middle" font-family="Source Sans 3" font-weight="600" font-size="18" letter-spacing="10" fill="#f7f4ee" fill-opacity="0.5">FORTHCOMING</text>
</svg>`;

async function render(name, svg) {
  const buf = await sharp(Buffer.from(svg)).png({ quality: 95 }).toBuffer();
  fs.writeFileSync(`${OUT}/${name}`, buf);
  console.log(`✓ rendered ${name} (${(buf.length / 1024).toFixed(0)} KB)`);
}

await render("general/og-image.png", ogSvg);
await render("books/forthcoming-cover-placeholder.png", coverSvg);
console.log("done");
