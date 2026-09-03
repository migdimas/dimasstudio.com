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
(étape d'une fiche changée pendant une simple lecture, carte de test étrangère visible puis
disparue, compteur Opportunités fluctuant de 153 à 150 hors de mes propres actions).

**Why:** les compteurs absolus (ex. « Opportunités doit valoir exactement 154 ») deviennent
invérifiables si un autre agent écrit en même temps dans la même base. On risque aussi de polluer
les vraies données de Miguel (créer/supprimer par erreur la fiche d'un autre agent, ou l'inverse).

**How to apply:** avant de lancer un test QA sur ce CRM, vérifier auprès de l'équipe (SendMessage à
`main`) qu'aucun autre agent ne teste le même CRM en ce moment. Si la concurrence est avérée
pendant le test, ne pas s'arrêter mais basculer la preuve sur des **deltas relatifs** et la
**présence/absence de sa propre fiche par son nom unique** plutôt que sur des compteurs absolus, et
signaler la concurrence explicitement dans le verdict.

Second piège indépendant : le bouton **Supprimer** d'une fiche affiche une confirmation
« Supprimer ce commerce ? » / « Oui, supprimer » / « Annuler », mais cette confirmation apparaît de
façon instable — sur 4 à 6 clics identiques au même bouton, la confirmation n'apparaissait parfois
pas du tout, ou disparaissait avant qu'un second clic sur « Oui, supprimer » ne l'atteigne. Ce qui a
fini par marcher : cliquer « Supprimer » puis, **sans attendre**, cliquer directement à l'endroit où
« Oui, supprimer » doit apparaître (deux clics dans le même batch, pas de wait entre les deux) — le
toast « Commerce supprimé » confirme le succès. Probablement lié à des re-renders déclenchés par la
synchronisation Google Sheets en direct qui réinitialisent le state React local du bouton.

Voir aussi [[reference_ghl_builder_lag]] pour le piège similaire de builder GHL en retard d'un frame
(action-puis-vérifier plutôt que clics en aveugle), même logique ici mais pire car la source du lag
est une synchronisation réseau, pas juste le rendu de l'iframe.
