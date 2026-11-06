from django.shortcuts import render
from django.core.mail import send_mail
from django.conf import settings
from clubs.models import Club, Membership


def home(request):
    return render(request, 'index.html')


def clubs_view(request):
    clubs = Club.objects.all()
    return render(request, 'clubs_list.html', {'clubs': clubs})


def memberships_view(request):
    query = request.GET.get('q', '')  # Récupère l'e-mail ou le nom tapé par l'étudiant
    result_membership = None
    searched = False

    if query:
        searched = True
        # On cherche une adhésion dont l'utilisateur a cet email ou username
        result_membership = Membership.objects.filter(
            user__email__icontains=query
        ).first() or Membership.objects.filter(
            user__username__icontains=query
        ).first()

    context = {
        'query': query,
        'membership': result_membership,
        'searched': searched,
    }
    return render(request, 'memberships_list.html', context)


def send_parent_report_email(parent_email, student_name, achievement_title, message_details):
    """
    Envoie un rapport de fierté automatique aux parents concernant les réussites de leur enfant.
    """
    subject = f"🏆 ISJ Campus - Excellente nouvelle concernant {student_name} !"
    
    message = f"""
Bonjour cher parent,

Nous avons le plaisir de vous informer d'une nouvelle réussite concernant votre enfant {student_name} au sein de l'Institut Saint Jean (ISJ) :

✨ {achievement_title} ✨

Détails de l'événement :
{message_details}

L'ISJ s'engage à offrir un cadre d'épanouissement optimal, alliant excellence académique et développement des compétences (Soft Skills) à travers nos clubs et activités.

Félicitations à votre enfant pour son implication !

Cordialement,
L'Administration de l'ISJ
https://isj.cm
    """
    
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [parent_email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Erreur lors de l'envoi de l'e-mail : {e}")
        return False