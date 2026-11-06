from django.core.management.base import BaseCommand
from clubs.models import Club

class Command(BaseCommand):
    help = "Charge les clubs initiaux dans la base de données pour la démo"

    def handle(import_self, *args, **options):
        # Vos données de clubs (issues directement de votre fichier clubs.ts)
        clubs_data = [
            {
                "name": "Club Dev & Code",
                "category": "Technologie",
                "description": "Ateliers de programmation, hackathons et projets web full-stack entre étudiants.",
                "members": 42,
                "location": "Salle Lab Info 1",
                "meeting": "Mercredi à 15h"
            },
            {
                "name": "Club Robotique & IoT",
                "category": "Technologie",
                "description": "Conception de robots, manipulation de microcontrôleurs et projets électroniques.",
                "members": 35,
                "location": "Atelier Matériel",
                "meeting": "Jeudi à 16h"
            },
            {
                "name": "Club Sport & E-Sport",
                "category": "Sport",
                "description": "Tournois de football inter-filières, compétitions de jeux vidéo et cohésion d'équipe.",
                "members": 60,
                "location": "Stade & Foyer",
                "meeting": "Samedi à 10h"
            },
            {
                "name": "Club Arts & Culture",
                "category": "Culture",
                "description": "Musique, théâtre, danse et expressions artistiques pour animer la vie du campus.",
                "members": 28,
                "location": "Salle Polyvalente",
                "meeting": "Mardi à 17h"
            }
        ]

        for item in clubs_data:
            club, created = Club.objects.get_or_create(
                name=item["name"],
                defaults={
                    "description": item["description"],
                }
            )
            if created:
                import_self.stdout.write(import_self.style.SUCCESS(f"Club créé : {club.name}"))
            else:
                import_self.stdout.write(import_self.style.WARNING(f"Le club existe déjà : {club.name}"))

        import_self.stdout.write(import_self.style.SUCCESS("🎉 Tous les clubs ont été injectés avec succès pour la démo !"))