import logging

from django.conf import settings
from django.contrib.auth import authenticate
from django.core.mail import EmailMessage, get_connection
from django.utils import timezone
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action, api_view, parser_classes, permission_classes
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

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
from .serializers import (
    AttendanceSerializer,
    ClubSerializer,
    EventCommentSerializer,
    EventLikeSerializer,
    EventSerializer,
    MembershipSerializer,
    NewsSerializer,
    NotificationLogSerializer,
    NotifySerializer,
)

logger = logging.getLogger(__name__)


# ===========================================================================
# PERMISSIONS
# ===========================================================================
def _is_admin(user):
    return bool(user and user.is_authenticated and (user.is_staff or user.is_superuser))


class IsAdmin(permissions.BasePermission):
    """Réservé aux administrateurs (token obligatoire)."""

    def has_permission(self, request, view):
        return _is_admin(request.user)


class IsAdminOrReadOnly(permissions.BasePermission):
    """Lecture pour tout le monde, écriture réservée à l'admin."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return _is_admin(request.user)


# ===========================================================================
# CONNEXION ADMIN -> renvoie un token que React renvoie ensuite à chaque requête
#   Authorization: Token <token>
# ===========================================================================
@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def admin_login_api(request):
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response(
            {"error": "Veuillez fournir un nom d'utilisateur et un mot de passe."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(username=username, password=password)
    if user is None:
        return Response(
            {"error": "Nom d'utilisateur ou mot de passe incorrect."},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    if not _is_admin(user):
        return Response(
            {"error": "Accès refusé : ce compte n'est pas administrateur."},
            status=status.HTTP_403_FORBIDDEN,
        )

    token, _ = Token.objects.get_or_create(user=user)
    return Response(
        {"message": "Connexion administrateur réussie !", "username": user.username,
         "is_admin": True, "token": token.key},
        status=status.HTTP_200_OK,
    )


# ===========================================================================
# E-MAILS AUX PARENTS (fonctions utilitaires)
# ===========================================================================
def collect_parents(club=None):
    """
    Parents des inscriptions VALIDÉES (d'un club, ou de toute l'école si club=None).
    Un parent qui a plusieurs enfants ne reçoit qu'UN seul mail, avec les prénoms regroupés.
    Retourne une liste de (email, "Prénom1, Prénom2").
    """
    qs = Membership.objects.filter(status=Membership.Status.APPROVED)
    if club is not None:
        qs = qs.filter(club=club)

    parents = {}
    for m in qs.order_by("id"):
        names = parents.setdefault(m.parent_email.strip().lower(), [])
        if m.student_name not in names:
            names.append(m.student_name)
    return [(email, ", ".join(names)) for email, names in parents.items()]


def build_email_body(student_name, title, details):
    return (
        "Bonjour cher parent,\n\n"
        f"Nous vous informons de la vie associative de votre enfant {student_name} "
        "à l'Institut Saint Jean (ISJ) :\n\n"
        f"✨ {title} ✨\n\n"
        f"Détails :\n{details}\n\n"
        "L'ISJ veille à la transparence et à l'épanouissement de ses étudiants.\n\n"
        "Cordialement,\nL'Administration de l'ISJ"
    )


def notify_parents(*, kind, target, recipients, title, details, club=None, event=None, attachment=None):
    """
    Envoie un mail par parent, enregistre l'historique (NotificationLog)
    et renvoie {"sent": n, "failed": n, "total": n}.
    attachment = (nom_fichier, contenu_bytes, mimetype) ou None.
    """
    sent = failed = 0
    try:
        with get_connection() as connection:
            for email, student_name in recipients:
                msg = EmailMessage(
                    subject=f"ISJ Campus – {title}",
                    body=build_email_body(student_name, title, details),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[email],
                    connection=connection,
                )
                if attachment:
                    msg.attach(*attachment)
                try:
                    msg.send(fail_silently=False)
                    sent += 1
                except Exception:
                    logger.exception("Échec d'envoi à %s", email)
                    failed += 1
    except Exception:
        # Connexion SMTP impossible : tous ceux qui n'ont pas été envoyés sont en échec
        logger.exception("Connexion e-mail impossible")
        failed = len(recipients) - sent

    NotificationLog.objects.create(
        kind=kind, target=target, club=club, event=event,
        subject=title, message=details, recipients_count=sent,
    )
    return {"sent": sent, "failed": failed, "total": len(recipients)}


@api_view(["POST"])
@permission_classes([IsAdmin])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def notify_api(request):
    """Mail de victoire / annonce : à un parent, aux parents d'un club, ou à toute l'école."""
    serializer = NotifySerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    d = serializer.validated_data

    club = None
    if d["target"] == "individual":
        recipients = [(d["parent_email"].strip().lower(), d.get("student_name") or "")]
        recipients = [(e, n or "votre enfant") for e, n in recipients]
    elif d["target"] == "club":
        club = Club.objects.get(pk=d["club_id"])
        recipients = collect_parents(club)
    else:  # school = tous les parents ayant une inscription validée
        recipients = collect_parents()

    if not recipients:
        return Response(
            {"error": "Aucun parent trouvé (il faut des inscriptions validées avec un e-mail parent)."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    attachment = None
    photo = d.get("photo")
    if photo:
        attachment = (photo.name, photo.read(), photo.content_type)

    report = notify_parents(
        kind=d["kind"], target=d["target"], recipients=recipients,
        title=d["subject"], details=d["message"],
        club=club, event=Event.objects.filter(pk=d.get("event_id")).first(),
        attachment=attachment,
    )

    if report["sent"] == 0:
        return Response(
            {"error": "Aucun e-mail n'a pu être envoyé. Vérifiez la configuration e-mail du serveur.", **report},
            status=status.HTTP_502_BAD_GATEWAY,
        )
    return Response(
        {"message": f"{report['sent']} e-mail(s) envoyé(s) sur {report['total']}.", **report},
        status=status.HTTP_200_OK,
    )


# ===========================================================================
# CLUBS (CRUD admin, lecture publique)
# ===========================================================================
class ClubViewSet(viewsets.ModelViewSet):
    queryset = Club.objects.all()
    serializer_class = ClubSerializer
    permission_classes = [IsAdminOrReadOnly]


# ===========================================================================
# INSCRIPTIONS : création publique, tout le reste réservé à l'admin
# (la liste contient des e-mails d'étudiants et de parents)
# ===========================================================================
class MembershipViewSet(viewsets.ModelViewSet):
    serializer_class = MembershipSerializer

    def get_permissions(self):
        if self.action == "create":
            return [permissions.AllowAny()]
        return [IsAdmin()]

    def get_queryset(self):
        qs = Membership.objects.select_related("club")
        club = self.request.query_params.get("club")
        status_param = self.request.query_params.get("status")
        if club:
            qs = qs.filter(club_id=club)
        if status_param:
            qs = qs.filter(status=status_param)
        return qs

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        membership = self.get_object()
        membership.status = Membership.Status.APPROVED
        membership.save(update_fields=["status"])
        return Response(self.get_serializer(membership).data)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        membership = self.get_object()
        membership.status = Membership.Status.REJECTED
        membership.save(update_fields=["status"])
        return Response(self.get_serializer(membership).data)


# ===========================================================================
# ÉVÉNEMENTS : CRUD admin + like public + début/fin + appel
# ===========================================================================
class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        # prefetch : évite une requête SQL par événement pour compter likes/commentaires
        qs = Event.objects.select_related("club").prefetch_related("likes", "comments")
        club = self.request.query_params.get("club")
        if club:
            qs = qs.filter(club_id=club)
        return qs

    # --- LIKE (public) : un clic = like, un 2e clic = unlike -----------------
    @action(detail=True, methods=["post"], permission_classes=[permissions.AllowAny])
    def like(self, request, pk=None):
        event = self.get_object()
        visitor_id = str(request.data.get("visitor_id", "")).strip()
        if not visitor_id or len(visitor_id) > 64:
            return Response({"error": "visitor_id manquant ou invalide."}, status=status.HTTP_400_BAD_REQUEST)

        like, created = EventLike.objects.get_or_create(event=event, visitor_id=visitor_id)
        if not created:
            like.delete()
        # On recompte en base (event.likes est en cache à cause du prefetch)
        return Response({"liked": created, "likes_count": EventLike.objects.filter(event=event).count()})

    # --- DÉBUT D'ACTIVITÉ : statut + mail aux parents DU CLUB ------------------
    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    def start(self, request, pk=None):
        event = self.get_object()
        if event.status != Event.Status.PLANNED:
            return Response({"error": "Cette activité a déjà été démarrée."}, status=status.HTTP_400_BAD_REQUEST)

        event.status = Event.Status.RUNNING
        event.started_at = timezone.now()
        event.save(update_fields=["status", "started_at"])

        report = notify_parents(
            kind=NotificationLog.Kind.ACTIVITY_START, target=NotificationLog.Target.CLUB,
            recipients=collect_parents(event.club),
            title=f"🚀 Début de l'activité : {event.title}",
            details=f"L'activité « {event.title} » du club {event.club.name} vient de commencer ({event.location}).",
            club=event.club, event=event,
        )
        return Response({"event": self.get_serializer(event).data, "emails": report})

    # --- FIN D'ACTIVITÉ ---------------------------------------------------------
    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    def finish(self, request, pk=None):
        event = self.get_object()
        if event.status != Event.Status.RUNNING:
            return Response({"error": "Cette activité n'est pas en cours."}, status=status.HTTP_400_BAD_REQUEST)

        event.status = Event.Status.FINISHED
        event.ended_at = timezone.now()
        event.save(update_fields=["status", "ended_at"])
        minutes = int((event.ended_at - event.started_at).total_seconds() // 60)

        report = notify_parents(
            kind=NotificationLog.Kind.ACTIVITY_END, target=NotificationLog.Target.CLUB,
            recipients=collect_parents(event.club),
            title=f"🏁 Fin de l'activité : {event.title}",
            details=f"L'activité « {event.title} » du club {event.club.name} est terminée (durée : {minutes} min).",
            club=event.club, event=event,
        )
        return Response({"event": self.get_serializer(event).data, "emails": report})

    # --- APPEL : GET = feuille de présence, POST = enregistrer ------------------
    @action(detail=True, methods=["get", "post"], permission_classes=[IsAdmin])
    def attendance(self, request, pk=None):
        event = self.get_object()

        # Une ligne de présence par inscrit VALIDÉ du club (créée à la demande)
        approved = Membership.objects.filter(club=event.club, status=Membership.Status.APPROVED)
        for membership in approved:
            Attendance.objects.get_or_create(event=event, membership=membership)

        if request.method == "POST":
            records = request.data.get("records")
            if not isinstance(records, list):
                return Response(
                    {"error": 'Envoyez {"records": [{"membership": 1, "present": true}, ...]}.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            for record in records:
                att = Attendance.objects.filter(event=event, membership_id=record.get("membership")).first()
                if att:
                    att.present = bool(record.get("present"))
                    att.save()

        rows = (Attendance.objects.filter(event=event, membership__status=Membership.Status.APPROVED)
                .select_related("membership").order_by("membership__student_name"))
        data = AttendanceSerializer(rows, many=True).data
        return Response({
            "event": event.id,
            "total": len(data),
            "present_count": sum(1 for r in data if r["present"]),
            "records": data,
        })


# ===========================================================================
# COMMENTAIRES : lecture/création publiques, suppression admin
# ===========================================================================
class EventCommentViewSet(mixins.ListModelMixin, mixins.CreateModelMixin,
                          mixins.DestroyModelMixin, viewsets.GenericViewSet):
    serializer_class = EventCommentSerializer

    def get_permissions(self):
        if self.action in ("list", "create"):
            return [permissions.AllowAny()]
        return [IsAdmin()]

    def get_queryset(self):
        qs = EventComment.objects.select_related("event")
        event = self.request.query_params.get("event")
        return qs.filter(event_id=event) if event else qs


# ===========================================================================
# CONSULTATION ADMIN : likes et historique des mails
# ===========================================================================
class EventLikeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = EventLike.objects.select_related("event")
    serializer_class = EventLikeSerializer
    permission_classes = [IsAdmin]


class NotificationLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = NotificationLog.objects.all()
    serializer_class = NotificationLogSerializer
    permission_classes = [IsAdmin]


# ===========================================================================
# NEWS : l'admin publie (texte + image/PDF), le front les lit
# ===========================================================================
class NewsViewSet(viewsets.ModelViewSet):
    queryset = News.objects.select_related("club", "author")
    serializer_class = NewsSerializer
    permission_classes = [IsAdminOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)