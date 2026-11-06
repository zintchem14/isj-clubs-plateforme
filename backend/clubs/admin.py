from django.contrib import admin

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


@admin.register(Club)
class ClubAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "leader", "created_at")
    search_fields = ("name",)


@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    list_display = ("student_name", "club", "student_email", "parent_email", "status", "joined_at")
    list_filter = ("status", "club")
    search_fields = ("student_name", "student_email", "parent_email")
    actions = ["approve", "reject"]

    @admin.action(description="Valider les inscriptions sélectionnées")
    def approve(self, request, queryset):
        queryset.update(status=Membership.Status.APPROVED)

    @admin.action(description="Refuser les inscriptions sélectionnées")
    def reject(self, request, queryset):
        queryset.update(status=Membership.Status.REJECTED)


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("title", "club", "date", "start_time", "status", "featured")
    list_filter = ("status", "club", "featured")


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ("membership", "event", "present", "marked_at")
    list_filter = ("present", "event")


@admin.register(EventLike)
class EventLikeAdmin(admin.ModelAdmin):
    list_display = ("event", "visitor_id", "created_at")
    list_filter = ("event",)


@admin.register(EventComment)
class EventCommentAdmin(admin.ModelAdmin):
    list_display = ("event", "author_name", "content", "created_at")
    list_filter = ("event",)


@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    list_display = ("title", "club", "author", "created_at")


@admin.register(NotificationLog)
class NotificationLogAdmin(admin.ModelAdmin):
    list_display = ("kind", "target", "club", "subject", "recipients_count", "created_at")
    list_filter = ("kind", "target")