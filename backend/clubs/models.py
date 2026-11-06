from django.conf import settings
from django.db import models


# ---------------------------------------------------------------------------
# CLUBS
# ---------------------------------------------------------------------------
class Club(models.Model):
    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=60, default="Général")
    description = models.TextField(blank=True)
    image = models.URLField(blank=True, help_text="URL de l'image de couverture")
    logo = models.ImageField(upload_to="club_logos/", blank=True, null=True)
    leader = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="managed_clubs",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


# ---------------------------------------------------------------------------
# INSCRIPTIONS (demande -> validation par l'admin)
# Pas de compte étudiant : l'étudiant remplit un formulaire public,
# donc on stocke directement son nom, son e-mail et l'e-mail du parent.
# ---------------------------------------------------------------------------
class Membership(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "En attente"
        APPROVED = "approved", "Validée"
        REJECTED = "rejected", "Refusée"

    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name="memberships")
    student_name = models.CharField(max_length=150)
    student_email = models.EmailField()
    parent_email = models.EmailField()
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Un même étudiant ne peut demander qu'une fois le même club
        unique_together = ("club", "student_email")
        ordering = ["-joined_at"]

    def __str__(self):
        return f"{self.student_name} → {self.club.name} ({self.get_status_display()})"


# ---------------------------------------------------------------------------
# ÉVÉNEMENTS (remplace la liste statique featuredEvents du front)
# Le statut + les horodatages remplacent les chronomètres en localStorage :
# l'état de l'activité vit dans la base, donc tout le monde voit la même chose.
# ---------------------------------------------------------------------------
class Event(models.Model):
    class Status(models.TextChoices):
        PLANNED = "planned", "Planifié"
        RUNNING = "running", "En cours"
        FINISHED = "finished", "Terminé"

    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name="events")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    format = models.CharField(max_length=60, default="Atelier")
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField(null=True, blank=True)
    location = models.CharField(max_length=150)
    image = models.URLField(blank=True)
    featured = models.BooleanField(default=False)

    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PLANNED)
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["date", "start_time"]

    def __str__(self):
        return f"{self.title} ({self.date})"


# ---------------------------------------------------------------------------
# PRÉSENCE : une ligne par (événement, inscrit validé)
# ---------------------------------------------------------------------------
class Attendance(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="attendances")
    membership = models.ForeignKey(Membership, on_delete=models.CASCADE, related_name="attendances")
    present = models.BooleanField(default=False)
    marked_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("event", "membership")

    def __str__(self):
        return f"{self.membership.student_name} - {self.event.title} : {'présent' if self.present else 'absent'}"


# ---------------------------------------------------------------------------
# LIKES & COMMENTAIRES PAR ÉVÉNEMENT
# Visiteur anonyme => on identifie un "navigateur" par un visitor_id
# généré côté React (UUID gardé en localStorage). Ça empêche de liker
# 50 fois le même événement sans imposer de compte.
# ---------------------------------------------------------------------------
class EventLike(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="likes")
    visitor_id = models.CharField(max_length=64)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("event", "visitor_id")

    def __str__(self):
        return f"❤️ {self.event.title} ({self.visitor_id[:8]})"


class EventComment(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="comments")
    author_name = models.CharField(max_length=100, default="Anonyme")
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.author_name} sur {self.event.title}"


# ---------------------------------------------------------------------------
# NEWS : publiées par l'admin, lues par le front
# ---------------------------------------------------------------------------
class News(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    club = models.ForeignKey(Club, on_delete=models.SET_NULL, null=True, blank=True, related_name="news")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    attachment = models.FileField(upload_to="news_attachments/", blank=True, null=True,
                                  help_text="Image ou PDF joint")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "news"
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


# ---------------------------------------------------------------------------
# HISTORIQUE DES E-MAILS ENVOYÉS AUX PARENTS
# Utile pour la démo / le rapport : on voit qui a été prévenu, de quoi, quand.
# ---------------------------------------------------------------------------
class NotificationLog(models.Model):
    class Target(models.TextChoices):
        INDIVIDUAL = "individual", "Un parent"
        CLUB = "club", "Parents d'un club"
        SCHOOL = "school", "Toute l'école"

    class Kind(models.TextChoices):
        ACTIVITY_START = "start", "Début d'activité"
        ACTIVITY_END = "end", "Fin d'activité"
        VICTORY = "victory", "Victoire / compétition"

    kind = models.CharField(max_length=10, choices=Kind.choices)
    target = models.CharField(max_length=12, choices=Target.choices)
    club = models.ForeignKey(Club, on_delete=models.SET_NULL, null=True, blank=True)
    event = models.ForeignKey(Event, on_delete=models.SET_NULL, null=True, blank=True)
    subject = models.CharField(max_length=200)
    message = models.TextField()
    recipients_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_kind_display()} → {self.get_target_display()} ({self.recipients_count})"