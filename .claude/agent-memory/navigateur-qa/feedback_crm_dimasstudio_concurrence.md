---
name: crm-dimasstudio-concurrence
description: Piège CRM Dimas Studio (dimasstudio.com/crm) — base Google Sheets partagée en direct, ne jamais tester en même temps qu'un autre agent
metadata:
  type: feedback
---

Le CRM Dimas Studio (`https://dimasstudio.com/crm/`) écrit en direct dans une base Google Sheets
partagée entre tous les utilisateurs et agents connectés (indicateur « Partagé » en haut à droite).
Lors d'un test le 2026-09-03, un autre agent (`qa-crm`) testait le même CRM en parallèle dans la
même session d'équipe : des cartes ont bougé, sont apparues ou ont disparu sans mon intervention
(compteur Opportunités fluctuant de 153 à 150 hors de mes propres actions). Confirmé après coup par
le chef d'équipe : le déplacement d'« Anais Designs » vers « Site web créé » était un vrai changement
volontaire fait par une autre session, pas un bug — donc pas toujours une preuve de casse, mais
toujours une source d'instabilité pour des assertions à compteur exact.

**Why:** les compteurs absolus (ex. « Opportunités doit valoir exactement 154 ») deviennent
invérifiables si un autre agent écrit en même temps dans la même base. On risque aussi de polluer
les vraies données de Miguel (créer/supprimer par erreur la fiche d'un autre agent, ou l'inverse).

**How to apply:** avant de lancer un test QA sur ce CRM, vérifier auprès de l'équipe (SendMessage à
`main`) qu'aucun autre agent ne teste le même CRM en ce moment. Si la concurrence est avérée
pendant le test, ne pas s'arrêter mais basculer la preuve sur des **deltas relatifs** et la
**présence/absence de sa propre fiche par son nom unique** plutôt que sur des compteurs absolus, et
signaler la concurrence explicitement dans le verdict. Une fois l'autre agent terminé, refaire le
parcours proprement pour obtenir des compteurs absolus exacts et un verdict propre.

Second piège indépendant, confirmé à froid (seul sur la base, donc pas lié à la concurrence) : le
bouton **Supprimer** d'une fiche et le bouton **Ajouter au pipeline** du formulaire de création
souffrent tous deux du même lag de rendu — le premier clic ne produit souvent aucun changement
visible à l'écran (screenshot identique), et il faut soit re-cliquer, soit enchaîner deux clics dans
le même batch sans `wait` entre eux (clic sur « Supprimer » puis clic direct à l'endroit où « Oui,
supprimer » doit apparaître). **Piège associé : un premier clic « silencieux » sur un bouton peut
avoir réellement réussi malgré l'absence de changement visible** — recliquer sur « Ajouter au
pipeline » après un premier clic sans effet apparent a créé un **doublon** (deux fiches identiques,
une restée dans Opportunités, une dans le panneau ouvert). Toujours vérifier par une recherche du nom
exact après création, pas seulement le delta de compteur affiché juste après le clic.

Troisième piège : dans le panneau de détail d'une fiche, la molette ne fait parfois rien du tout
(pas seulement en retard d'un frame comme GHL — carrément aucun effet, même après plusieurs essais à
différentes coordonnées). Ce qui marche de façon fiable : cliquer une fois dans le panneau puis
appuyer deux fois sur **Tab** pour amener le focus clavier sur la zone de note tout en bas — le
panneau se scrolle automatiquement pour suivre le focus. Ne pas presser Échap pendant cette
manipulation : ça ferme tout le panneau au lieu de juste désélectionner un champ.

Voir aussi [[reference_ghl_builder_lag]] pour le piège similaire de builder GHL en retard d'un frame
(action-puis-vérifier plutôt que clics en aveugle), même logique ici mais pire car la source du lag
est une synchronisation réseau, pas juste le rendu de l'iframe.
