// Génère index.html (FR), en.html et es.html à partir de src/template.html et src/i18n.mjs.
// Usage : node build.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { t, langs } from './src/i18n.mjs';
const BASE = 'https://dimasstudio.com/';
const url = f => BASE + (f === 'index.html' ? '' : f);

const here = path.dirname(fileURLToPath(import.meta.url));
const tpl = fs.readFileSync(path.join(here, 'src', 'template.html'), 'utf8');

const keys = Object.keys(t.fr);
for (const l of Object.keys(t)) {
  const missing = keys.filter(k => !(k in t[l]));
  const extra = Object.keys(t[l]).filter(k => !keys.includes(k));
  if (missing.length || extra.length) throw new Error(`i18n ${l}: manquantes ${missing.join(',')} ; en trop ${extra.join(',')}`);
}

for (const [l, cfg] of Object.entries(langs)) {
  const d = { ...t[l], lang: cfg.code, locale: cfg.locale };
  d.lang_switch = Object.entries(langs).map(([k, c]) =>
    `<a href="${url(c.file)}" lang="${c.code}" hreflang="${c.code}"${k === l ? ' class="on" aria-current="page"' : ''}>${c.label}</a>`).join('');
  d.hreflang = Object.values(langs).map(c => `<link rel="alternate" hreflang="${c.code}" href="${url(c.file)}">`).join('\n  ')
    + `\n  <link rel="alternate" hreflang="x-default" href="${url(langs.fr.file)}">`;
  d.canonical = url(cfg.file);
  d.form_lang = cfg.code;
  const out = tpl.replace(/\{\{(\w+)\}\}/g, (m, k) => {
    if (!(k in d)) throw new Error(`clé inconnue dans le gabarit : ${k}`);
    return d[k];
  });
  fs.writeFileSync(path.join(here, cfg.file), out);
  console.log(cfg.file, Math.round(Buffer.byteLength(out) / 1024), 'Ko');
}
