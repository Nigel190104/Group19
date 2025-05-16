from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import (
    ApplicationUser,
    Follow,
    Post,
    Comment,
    PostLike,
    CommentLike,
    Note,
    Habit,
    AccountabilityPartner,
    AchievementType,
    Achievement,
    MoodCategory,
    MoodSubcategory,
    WorkNote,
    WorkTask
)


# need to configure this and models.py properly such that i can properly calibrate the user field for each model
# will attempt to resolve this tommorrow
# current proposed solution is i will remove editable is false in user fields in all related models and see if this resolves the issue
# as this affects the backbone of the applications
# Inline for linking ApplicationUser to Django's built-in User model
class ApplicationUserInline(admin.StackedInline):
    model = ApplicationUser
    can_delete = False
    verbose_name_plural = "Application Users"


class CustomUserAdmin(BaseUserAdmin):
    inlines = [ApplicationUserInline]


@admin.register(ApplicationUser)
class ApplicationUserAdmin(admin.ModelAdmin):
    list_display = [
        "followers_count",
        "user_gender",
        "profile_image",
        "roles",
        "following_count",
    ]
    list_editable = ["profile_image", "user_gender", "roles"]
    list_filter = ["user_gender", "roles"]


@admin.register(Follow)
class FollowAdmin(admin.ModelAdmin):
    list_display = ["created_at", "followers", "following"]
    list_editable = ["followers", "following"]
    list_filter = ["created_at"]


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ["user", "post_title", "post_date_created", "post_image"]
    list_editable = ["post_title", "post_date_created", "post_image"]
    list_filter = ["post_date_created"]


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = [
        "user",
        "post",
        "parent_comment",
        "comment_content",
        "date_created",
        "comment_image",
    ]
    list_editable = [
        "post",
        "parent_comment",
        "comment_content",
        "date_created",
        "comment_image",
    ]
    list_filter = ["date_created"]


@admin.register(PostLike)
class PostLikeAdmin(admin.ModelAdmin):
    list_display = ["user", "post"]


@admin.register(CommentLike)
class CommentLikeAdmin(admin.ModelAdmin):
    list_display = ["user", "comment"]


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = [
        "user",
        "note_caption",
        "note_date_created",
        "time_spent",
        "note_image",
    ]
    list_editable = ["note_caption", "time_spent", "note_image"]
    list_filter = ["note_date_created"]

@admin.register(Habit)
class HabitAdmin(admin.ModelAdmin):
    list_display = [
        'habit_name', 
        'get_frequency_display', 
        'get_current_streak',
        'get_longest_streak',
        'last_completed',
        'get_is_active'
    ]
    
    list_filter = [
        ('frequency_unit', admin.AllValuesFieldListFilter),
        ('is_active', admin.BooleanFieldListFilter),
        'created_at',
    ]
    
    list_editable = []  # Removed is_active since it's not a direct field
    
    search_fields = [
        'habit_name',
        'description',
    ]
    
    readonly_fields = [
        'get_current_streak',
        'get_longest_streak',
        'created_at',
        'updated_at',
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'habit_name', 'description', 'color', 'accountability_partner')
        }),
        ('Frequency Settings', {
            'fields': ('frequency_number', 'frequency_unit')
        }),
        ('Completion Tracking', {
            'fields': ('completions', 'last_completed')
        }),
        ('Metadata', {
            'fields': ('is_active', 'created_at', 'updated_at')
        }),
    )
    
    def get_frequency_display(self, obj):
        return obj.get_frequency_display()
    get_frequency_display.short_description = 'Frequency'
    
    def get_current_streak(self, obj):
        return obj.current_streak
    get_current_streak.short_description = 'Current Streak'
    
    def get_longest_streak(self, obj):
        return obj.longest_streak
    get_longest_streak.short_description = 'Longest Streak'
    
    def get_is_active(self, obj):
        return obj.is_active
    get_is_active.short_description = 'Is Active'
    get_is_active.boolean = True  # Shows as a checkbox in admin
    
    def get_queryset(self, request):
        """Optimize queryset to reduce database queries"""
        return super().get_queryset(request).select_related('user', 'accountability_partner')


@admin.register(AccountabilityPartner)
class AccountabilityPartnerAdmin(admin.ModelAdmin):
    list_display = [
        "special_key",
        "user",
        "partner",
        "date_started",
        "is_active",
    ]
    list_editable = ["partner", "date_started", "is_active"]
    list_filter = ["date_started", "is_active"]


@admin.register(AchievementType)
class AchievementTypeAdmin(admin.ModelAdmin):
    list_display = ["ranking", "name", "achievement_type_image", "description"]
    prepopulated_fields = {"name": ("name",)}
    list_editable = ["achievement_type_image", "name", "description"]


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ["user", "achievement_type", "ach_count", "ach_date_earned"]
    list_editable = ["achievement_type", "ach_count", "ach_date_earned"]
    list_filter = ["ach_date_earned"]


@admin.register(MoodCategory)
class MoodCategoryAdmin(admin.ModelAdmin):
    list_display = ["name"]
    search_fields = ["name"]


@admin.register(MoodSubcategory)
class MoodSubcategoryAdmin(admin.ModelAdmin):
    list_display = ["category", "name", "mood_image", "description", "mbti_insight"]
    list_filter = ["category"]
    search_fields = ["name", "category__name"]


admin.site.register(User, CustomUserAdmin)



# registering routes for new models (work journal)
@admin.register(WorkNote)
class WorkNoteAdmin(admin.ModelAdmin):
    list_display = [
        "user", 
        "title", 
        "date_created"
    ]
    list_editable = ["title"]
    list_filter = ["date_created"]
    search_fields = ["title", "content"]

@admin.register(WorkTask)
class WorkTaskAdmin(admin.ModelAdmin):
    list_display = [
        "user", 
        "task_name", 
        "category", 
        "priority", 
        "time_spent", 
        "completed", 
        "date_created"
    ]
    list_editable = ["task_name", "category", "priority", "time_spent", "completed"]
    list_filter = ["category", "priority", "completed", "date_created"]
    search_fields = ["task_name", "description", "category"]