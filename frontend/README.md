# Campus Clubs — frontend

Interface responsive de découverte et d’administration des clubs étudiants, construite avec React, TypeScript, Vite et Tailwind CSS v4.

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

Les clubs sont alimentés par des données mockées dans `src/data/clubs.ts`. L’interface permet de rechercher et filtrer les clubs, consulter leur fiche détaillée et créer, modifier ou supprimer un club. Les changements sont conservés en mémoire le temps de la session ; aucune API n’est encore connectée.

La navigation latérale, l’en-tête, le pied de page et les notifications toast sont partagés. Les inscriptions et les événements sont signalés comme fonctionnalités à venir.
