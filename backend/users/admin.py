from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    fieldsets = UserAdmin.fieldsets + (
        ('Informations ISJ', {'fields': ('role', 'phone')}),
    )

admin.site.register(CustomUser, CustomUserAdmin)