# Campus Clubs — frontend

Vitrine responsive de la vie associative de l’ISJ, construite avec React, TypeScript, Vite et Tailwind CSS v4.

## Démarrer

```bash
npm install
npm run dev
```

## Vérifier

```bash
npm run build
npm run lint
```

## Périmètre actuel

Les clubs et rendez-vous sont alimentés par des données mockées dans `src/data/clubs.ts`. La vitrine met en avant les événements, propose un calendrier mensuel interactif, permet de rechercher et filtrer les clubs et présente la fiche détaillée de chacun.

La navigation publique, le pied de page, les notifications toast, les cartes d’événements et le calendrier sont réutilisables. Les données sont statiques ; aucune API d’événements ou d’inscriptions n’est encore connectée.
