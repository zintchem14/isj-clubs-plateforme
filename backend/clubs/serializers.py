from rest_framework import serializers

from .models import (
    Attendance,
    Club,
    Event,
    EventComment,
    EventLike,
    Membership,
    News,
    NotificationLog,
)


# ---------------------------------------------------------------------------
# CLUBS
# ---------------------------------------------------------------------------
class ClubSerializer(serializers.ModelSerializer):
    leader_name = serializers.ReadOnlyField(source="leader.username")
    # Seuls les inscrits VALIDÉS comptent comme membres
    members_count = serializers.SerializerMethodField()
    events_count = serializers.SerializerMethodField()

    class Meta:
        model = Club
        fields = [
            "id", "name", "category", "description", "image", "logo",
            "leader", "leader_name", "created_at", "members_count", "events_count",
        ]

    def get_members_count(self, obj):
        return obj.memberships.filter(status=Membership.Status.APPROVED).count()

    def get_events_count(self, obj):
        return obj.events.count()


# ---------------------------------------------------------------------------
# INSCRIPTIONS
# - À la création (formulaire public) : club, student_name, student_email, parent_email
# - Le statut est en lecture seule : seul l'admin le change via les actions approve/reject
# ---------------------------------------------------------------------------
class MembershipSerializer(serializers.ModelSerializer):
    club_name = serializers.ReadOnlyField(source="club.name")
    status_label = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Membership
        fields = [
            "id", "club", "club_name",
            "student_name", "student_email", "parent_email",
            "status", "status_label", "joined_at",
        ]
        read_only_fields = ["status", "joined_at"]
        # Message clair quand l'étudiant s'inscrit deux fois au même club
        validators = []

    def validate(self, attrs):
        club = attrs.get("club")
        email = attrs.get("student_email")
        # Sur une création uniquement (self.instance est None)
        if self.instance is None and Membership.objects.filter(club=club, student_email__iexact=email).exists():
            raise serializers.ValidationError(
                {"error": "Cette adresse e-mail a déjà une demande pour ce club."}
            )
        return attrs


# ---------------------------------------------------------------------------
# ÉVÉNEMENTS
# status / started_at / ended_at sont en lecture seule : ils changent uniquement
# via les actions start / finish de la vue (pas en modifiant le JSON à la main).
# ---------------------------------------------------------------------------
class EventSerializer(serializers.ModelSerializer):
    club_name = serializers.ReadOnlyField(source="club.name")
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    liked = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "id", "club", "club_name", "title", "description", "format",
            "date", "start_time", "end_time", "location", "image", "featured",
            "status", "started_at", "ended_at",
            "likes_count", "comments_count", "liked",
        ]
        read_only_fields = ["status", "started_at", "ended_at"]

    def validate(self, attrs):
        start = attrs.get("start_time")
        end = attrs.get("end_time")
        if start and end and end <= start:
            raise serializers.ValidationError(
                {"end_time": "L'heure de fin doit être après l'heure de début."}
            )
        return attrs

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_liked(self, obj):
        """Ce navigateur a-t-il déjà liké ? Le front envoie ?visitor_id=..."""
        request = self.context.get("request")
        visitor_id = request.query_params.get("visitor_id") if request else None
        if not visitor_id:
            return False
        return obj.likes.filter(visitor_id=visitor_id).exists()


# ---------------------------------------------------------------------------
# LIKES & COMMENTAIRES (consultation admin + création publique)
# ---------------------------------------------------------------------------
class EventLikeSerializer(serializers.ModelSerializer):
    event_title = serializers.ReadOnlyField(source="event.title")

    class Meta:
        model = EventLike
        fields = ["id", "event", "event_title", "visitor_id", "created_at"]
        read_only_fields = ["created_at"]


class EventCommentSerializer(serializers.ModelSerializer):
    event_title = serializers.ReadOnlyField(source="event.title")

    class Meta:
        model = EventComment
        fields = ["id", "event", "event_title", "author_name", "content", "created_at"]
        read_only_fields = ["created_at"]

    def validate_content(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Le commentaire ne peut pas être vide.")
        if len(value) > 500:
            raise serializers.ValidationError("500 caractères maximum.")
        return value


# ---------------------------------------------------------------------------
# PRÉSENCE
# ---------------------------------------------------------------------------
class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source="membership.student_name")
    parent_email = serializers.ReadOnlyField(source="membership.parent_email")

    class Meta:
        model = Attendance
        fields = ["id", "event", "membership", "student_name", "parent_email", "present", "marked_at"]
        read_only_fields = ["marked_at"]


# ---------------------------------------------------------------------------
# NEWS : le front a besoin de l'URL complète du fichier et de son type
# ---------------------------------------------------------------------------
class NewsSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source="author.username")
    club_name = serializers.ReadOnlyField(source="club.name")
    attachment_url = serializers.SerializerMethodField()
    attachment_type = serializers.SerializerMethodField()

    class Meta:
        model = News
        fields = [
            "id", "title", "content", "club", "club_name",
            "author_name", "attachment", "attachment_url", "attachment_type", "created_at",
        ]
        read_only_fields = ["created_at"]
        # "attachment" sert à l'upload ; le front lit attachment_url
        extra_kwargs = {"attachment": {"write_only": True, "required": False}}

    def get_attachment_url(self, obj):
        if not obj.attachment:
            return None
        url = obj.attachment.url
        request = self.context.get("request")
        return request.build_absolute_uri(url) if request else url

    def get_attachment_type(self, obj):
        if not obj.attachment:
            return None
        name = obj.attachment.name.lower()
        if name.endswith(".pdf"):
            return "pdf"
        if name.endswith((".png", ".jpg", ".jpeg", ".gif", ".webp")):
            return "image"
        return "file"


# ---------------------------------------------------------------------------
# E-MAILS PARENTS
# ---------------------------------------------------------------------------
class NotificationLogSerializer(serializers.ModelSerializer):
    kind_label = serializers.CharField(source="get_kind_display", read_only=True)
    target_label = serializers.CharField(source="get_target_display", read_only=True)

    class Meta:
        model = NotificationLog
        fields = [
            "id", "kind", "kind_label", "target", "target_label",
            "club", "event", "subject", "message", "recipients_count", "created_at",
        ]


class NotifySerializer(serializers.Serializer):
    """Valide la demande d'envoi (victoire, annonce...) avant d'envoyer quoi que ce soit."""

    kind = serializers.ChoiceField(choices=NotificationLog.Kind.choices, default="victory")
    target = serializers.ChoiceField(choices=NotificationLog.Target.choices)
    club_id = serializers.IntegerField(required=False)
    event_id = serializers.IntegerField(required=False)
    parent_email = serializers.EmailField(required=False)
    student_name = serializers.CharField(required=False, allow_blank=True)
    subject = serializers.CharField(max_length=200)
    message = serializers.CharField()

    def validate(self, attrs):
        target = attrs["target"]
        if target == "individual" and not attrs.get("parent_email"):
            raise serializers.ValidationError({"parent_email": "Obligatoire pour un envoi individuel."})
        if target == "club" and not attrs.get("club_id"):
            raise serializers.ValidationError({"club_id": "Choisissez un club."})
        if target == "club" and not Club.objects.filter(pk=attrs["club_id"]).exists():
            raise serializers.ValidationError({"club_id": "Ce club n'existe pas."})
        return attrs