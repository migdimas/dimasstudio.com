// Publie dm-site sur GitHub Pages sous le domaine dimasstudio.com.
// Prérequis : GITHUB_TOKEN (jeton classique, portée « repo ») dans C:\Users\cameleon\Desktop\miguel\.env
// Usage : node deploy.mjs
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(fs.readFileSync(path.join(here, '..', '.env'), 'utf8').split('\n')
  .filter(l => /^[A-Z0-9_]+=/.test(l)).map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const TOKEN = env.GITHUB_TOKEN;
const OWNER = env.GITHUB_USERNAME || 'migdimas';
const REPO = 'dimasstudio.com';
const DOMAIN = 'dimasstudio.com';
if (!TOKEN) { console.error('GITHUB_TOKEN manquant dans .env'); process.exit(1); }

const api = async (method, url, body) => {
  const r = await fetch('https://api.github.com' + url, {
    method, headers: { Authorization: 'Bearer ' + TOKEN, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const txt = await r.text(); let j; try { j = JSON.parse(txt); } catch { j = txt; }
  return { status: r.status, body: j };
};

const me = await api('GET', '/user');
if (me.status !== 200) { console.error('Jeton refusé', me.status, me.body); process.exit(1); }
console.log('Connecté à GitHub comme', me.body.login);
const owner = me.body.login;

let repo = await api('GET', `/repos/${owner}/${REPO}`);
if (repo.status === 404) {
  repo = await api('POST', '/user/repos', { name: REPO, description: 'Site Dimas Studio', private: false, has_issues: false, has_wiki: false, has_projects: false });
  if (repo.status !== 201) { console.error('Création du dépôt refusée', repo.status, repo.body); process.exit(1); }
  console.log('Dépôt créé', repo.body.html_url);
} else console.log('Dépôt existant', repo.body.html_url);

const sh = c => execSync(c, { cwd: here, stdio: 'pipe' }).toString().trim();
sh('git add -A');
try { sh('git -c user.name="Dimas Studio" -c user.email="info@dimasstudio.com" commit -q -m "Mise à jour du site"'); } catch {}
sh('git branch -M main');
const remote = `https://x-access-token:${TOKEN}@github.com/${owner}/${REPO}.git`;
try { sh('git remote remove origin'); } catch {}
sh(`git remote add origin ${remote}`);
sh('git push -u origin main --force');
sh(`git remote set-url origin https://github.com/${owner}/${REPO}.git`);
console.log('Poussé sur main');

let pages = await api('GET', `/repos/${owner}/${REPO}/pages`);
if (pages.status === 404) {
  pages = await api('POST', `/repos/${owner}/${REPO}/pages`, { source: { branch: 'main', path: '/' } });
  console.log('Pages activé', pages.status);
}
const upd = await api('PUT', `/repos/${owner}/${REPO}/pages`, { cname: DOMAIN, source: { branch: 'main', path: '/' } });
console.log('Domaine personnalisé', DOMAIN, upd.status);
const st = await api('GET', `/repos/${owner}/${REPO}/pages`);
console.log('État Pages :', JSON.stringify({ url: st.body.html_url, cname: st.body.cname, https: st.body.https_enforced, status: st.body.status }));
console.log(`\nDNS à poser chez GoDaddy :\n  A     @    185.199.108.153\n  A     @    185.199.109.153\n  A     @    185.199.110.153\n  A     @    185.199.111.153\n  CNAME www  ${owner}.github.io\nPuis, une fois le certificat émis (quelques minutes à 1 h) : PUT /pages { https_enforced: true }.`);
