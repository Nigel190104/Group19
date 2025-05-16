from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import (
    AbstractBaseUser,
    PermissionsMixin,
    BaseUserManager,
)
from django.template.defaultfilters import slugify
import uuid
from django.core.exceptions import ValidationError
from datetime import datetime
from django.conf import settings
from django.core.validators import MinValueValidator

#what we need is to have a signals for the habits model that automatically runs the update as it pertains to streaks etc.

# Create your models here.
# overall some of the fiels may need to specify some more limitation
# like max length etc at a later date before finalisation
# we have to create two different like classes for post and comments
# as the current iteration the user can login and like the repsecitve classes infinite amount of times the like need to
# be associated with a account for either format
# i will need to add a images field to most of the classes
# i will also need to enable slugification of different components in models which is necessary

# we will have to change settings.py to accomodate changes in regards to creating media folder and then
# creating subdirectories/folders within that

# some of the save and delete functions may be migrated ot the apiviews or serialzers at a later date
# could make use of a default image in media


class CustomUserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not username:
            raise ValueError("The Username field must be set")
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(
            username=username, email=email, password=password, **extra_fields
        )


class AbstractCustomUser(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = CustomUserManager()

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email"]

    class Meta:
        abstract = True


"""
THIS USER MODEL IS A SUBJECT TO CHANGE
"""


# we will need to check if the current iteration of user model
# allows for a public facing sign in and login feature
# is this current version compatible
class ApplicationUser(AbstractCustomUser):
    # user_name = models.CharField(max_length=128, unique=True)
    profile_image = models.ImageField(null=True, blank=True)
    # we will need a function in the django model that auto increments
    # both types of user following
    # user follower and user following as seperate tables
    #
    followers_following = models.ManyToManyField(
        "Follow", related_name="followers_following_users", symmetrical=False
    )

    class Gender(models.TextChoices):
        MALE = "M", _("Male")
        FEMALE = "F", _("Female")
        OTHER = "O", _("Other")

    class Role(models.TextChoices):
        APP_USER = "AU", _("App User")
        STAFF = "ST", _("Staff")

    user_gender = models.CharField(
        max_length=1, choices=Gender.choices, default=Gender.MALE
    )

    roles = models.CharField(max_length=2, choices=Role.choices, default=Role.APP_USER) 
    followers_count = models.IntegerField(default=0, editable=False)
    following_count = models.IntegerField(default=0, editable=False)
    bio = models.TextField(blank=True, null=True, max_length=500, 
                        help_text="User's biography")

    def update_follow_counts(self):
        self.followers_count = self.followers_relation.count()
        self.following_count = self.following_relation.count()
        self.save()


class Follow(models.Model):
    followers = models.ForeignKey(
        ApplicationUser, on_delete=models.CASCADE, related_name="followers_relation"
    )
    following = models.ForeignKey(
        ApplicationUser, on_delete=models.CASCADE, related_name="following_relation"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["followers", "following"], name="Follow_constraint"
            )
        ]

    def save(self, *args, **kwargs):
        if self.followers == self.following:
            raise ValidationError("A user cannot follow themselves.")
        super().save(*args, **kwargs)
        self.followers.update_follow_counts()
        self.following.update_follow_counts()

    def delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)
        self.followers.update_follow_counts()
        self.following.update_follow_counts()


# for posts and and comments respecgtively we will make use of count and do it in a similar manner ot how follow and application user model
# increment followers and following respecively
class Post(models.Model):
    user = models.ForeignKey(ApplicationUser, on_delete=models.CASCADE)
    post_title = models.CharField(max_length=128)
    post_description = models.TextField(blank=True, null=True)
    post_date_created = models.DateTimeField(default=timezone.now)
    post_image = models.ImageField(null=True, blank=True)
    # achievements = models.ForeignKey(
    #     "Achievement",
    #     on_delete=models.SET_NULL,
    #     null=True,
    #     blank=True,
    #     related_name="posts",
    # )

    like_count = models.IntegerField(default=0, editable=False)
    comment_count = models.IntegerField(default=0, editable=False)

    def update_like_count(self):
        self.like_count = self.post_likes.count()
        self.save()

    def update_comment_count(self):
        self.comment_count = self.comments.count()
        self.save()


# we need to create a unary relationship for comment
# such that a person can respond to a comment with a commment
# in the front end we will need to have a reply button which create a comment box
# automatically assigns the parent comment field if its a reply to another
# keeps parnet comment field empty if its a reply to a post
# button that allows for comments to be create for a post
class Comment(models.Model):
    # might need to see how this would affect the backend as to users replying to other users content
    # if this would affect the unary relationship
    user = models.ForeignKey(ApplicationUser, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    parent_comment = models.ForeignKey(
        "self", null=True, blank=True, on_delete=models.CASCADE, related_name="replies"
    )
    comment_content = models.TextField(blank=True, null=True)
    date_created = models.DateTimeField(default=timezone.now)
    comment_image = models.ImageField(null=True, blank=True)

    like_count = models.IntegerField(default=0, editable=False)

    def update_like_count(self):
        self.like_count = self.comment_likes.count()
        self.save()

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.post.update_comment_count()

    def delete(self, *args, **kwargs):
        post = self.post
        super().delete(*args, **kwargs)
        post.update_comment_count()

# for both functions below for likes we need to create logic such that if they try to like again they will not be able to
# we also need to enable likes not being able to happen
# so it needs to be enforced in the actual save function
# we also need to be able to remove likes such that if it is already liked and they try to like again
# it removes likes instead of adding another


class PostLike(models.Model):
    user = models.ForeignKey(ApplicationUser, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="post_likes")



    def save(self, *args, **kwargs):
        # Check if the user has already liked the post
        existing_like = PostLike.objects.filter(user=self.user, post=self.post)
        if existing_like.exists():
            # If the like already exists, delete it (toggle off)
            existing_like.delete()
        else:
            # If the like doesn't exist, save it (toggle on)
            super().save(*args, **kwargs)
        self.post.update_like_count()

    def delete(self, *args, **kwargs):
        post = self.post
        super().delete(*args, **kwargs)
        post.update_like_count()



class CommentLike(models.Model):
    user = models.ForeignKey(ApplicationUser, on_delete=models.CASCADE)
    comment = models.ForeignKey(
        Comment, on_delete=models.CASCADE, related_name="comment_likes"
    )

    def save(self, *args, **kwargs):
        # Check if the user has already liked the comment
        existing_like = CommentLike.objects.filter(user=self.user, comment=self.comment)
        if existing_like.exists():
            # If the like already exists, delete it (toggle off)
            existing_like.delete()
        else:
            # If the like doesn't exist, save it (toggle on)
            super().save(*args, **kwargs)
        self.comment.update_like_count()

    def delete(self, *args, **kwargs):
        comment = self.comment
        super().delete(*args, **kwargs)
        comment.update_like_count()


# this is not a user facing role
# we need to change this such that if partner is set to null in the habits model
# the entry gets deleted
# we would also need habit id to form a unique constraint such
# setting of partner should be done through the habit or notes so should be able to access the partner field through notes or habits
class AccountabilityPartner(models.Model):
    user = models.ForeignKey(
        ApplicationUser,
        on_delete=models.CASCADE,
        related_name="acc_for",
        editable=False,
    )
    # modify such that it allows for the user to enter partner name and then it searches via user_name in the application user class
    # they can not set themsleves as their accoutnabilty partner
    partner = models.ForeignKey(
        ApplicationUser, on_delete=models.CASCADE, related_name="acc_partner"
    )
    date_started = models.DateTimeField(default=timezone.now)
    # get rid of the isactive field it is not needed
    is_active = models.BooleanField(default=True)
    special_key = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # what i realised is we will have a one to one relation with each user to partner relationship
        # is that there will be multiple notes or habits that acc partner may be assigned to
        # in this table so therefore using partner and user is not enough neither is date started in addition since there
        # could be multiple entries for the same pair in the table
        # to solve this problem i introduces a special key alphaneurmeric in nature which is generated such that it is unique
        # this will prevent probelms when trying to pull from data and stop multiple entries which
        # violates normalisation
        constraints = [
            models.UniqueConstraint(
                fields=["user", "partner", "date_started", "special_key"],
                name="unique_four_field_constraint",
            )
        ]

    # this will be reconfigured in views or serializers but will be necessary at a later time
    # logic is somewhat sound but shouldnt be in the models.py
    # def save(self, *args, **kwargs):
    #     super().save(*args, **kwargs)
    #     if not self.accountability_notes.exists() and not self.accountability_habits.exists():
    #         self.delete()


class MoodCategory(models.Model):
    """Defines broad mood categories"""

    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class MoodSubcategory(models.Model):
    """Subcategories within each mood category with MBTI insights"""

    category = models.ForeignKey(
        MoodCategory, on_delete=models.CASCADE, related_name="subcategories"
    )
    name = models.CharField(max_length=50, unique=True)
    mood_image = models.ImageField(null=True, blank=True)
    description = models.TextField()
    mbti_insight = models.TextField()

    def __str__(self):
        return f"{self.category.name} - {self.name}"


# i believe this is more of a personal entry
# good for those who are more introverterted
# dont need external stimuli to initiate a change in habits
# i will need to relate habits to notes in a similar manner to accountability partner
class Note(models.Model):
    user = models.ForeignKey(ApplicationUser, on_delete=models.CASCADE)
    # calendar = models.ForeignKey(
    #     "Calendar", on_delete=models.CASCADE, related_name="notes"
    # )
    note_caption = models.CharField(max_length=512)
    note_content = models.TextField(blank=True, null=True)
    note_date_created = models.DateTimeField(auto_now_add=True)
    # this variable relates to habit field
    time_spent = models.IntegerField(default=0)

    note_image = models.ImageField(null=True, blank=True)
    # will have to create save function for this field since it may change muliple times during app execution
    accountability_partner = models.ForeignKey(
        ApplicationUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="accountability_notes",
    )
    achievements = models.ForeignKey(
        "Achievement",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="notes",
    )

    mood_subcategory = models.ForeignKey(
        MoodSubcategory, on_delete=models.SET_NULL, null=True, blank=True
    )
    Habit = models.ForeignKey("Habit", on_delete=models.SET_NULL, null=True, blank=True)

    def save(self, *args, **kwargs):
        # Check that the user is not setting themselves as the accountability partner
        # i did it this way because when setting it up in the accountability partner
        # we sont want things to fail if they are we simply want them to get a help message that says that they cant do that
        # this applies to both note and habits
        if self.accountability_partner == self.user:
            raise ValidationError("A user cannot be their own accountability partner.")
        if self.accountability_partner:
            existing_partnership, created = AccountabilityPartner.objects.get_or_create(
                user=self.user, partner=self.accountability_partner
            )
            if not existing_partnership.is_active:
                existing_partnership.is_active = True
                existing_partnership.save()

        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        accountability_partner = self.accountability_partner
        super().delete(*args, **kwargs)

        # Check if the accountability partner is still referenced
        if accountability_partner:
            remaining_habits = Habit.objects.filter(
                user=self.user, accountability_partner=accountability_partner
            ).exists()
            remaining_notes = Note.objects.filter(
                user=self.user, accountability_partner=accountability_partner
            ).exists()

            if not remaining_habits and not remaining_notes:
                AccountabilityPartner.objects.filter(
                    user=self.user, partner=accountability_partner
                ).update(is_active=False)


class Habit(models.Model):

    user = models.ForeignKey(
        ApplicationUser, 
        on_delete=models.CASCADE,
        blank=False
    )
    
    habit_name = models.CharField(
        max_length=50,
        help_text="The name of your habit",
        blank=False
    )
    
    habit_description = models.TextField(
        blank=True,
        null=True,
        default='',
        help_text="Optional description of your habit"
    )
    
    habit_colour = models.CharField(
        blank=True,
        max_length=7,
        default='NO_COL',
        help_text="Optional hex color code for the habit"
    )
    
    habit_frequency = models.IntegerField(
        blank=True,
        default=1, 
        validators=[MinValueValidator(1)],
        help_text="Optional frequency in days (e.g., 1 for daily, 7 for weekly)"
    )
    
    # Completion tracking
    completions = models.JSONField(
        blank=True,
        default=dict,
        help_text="Dictionary of completion dates in format {'YYYY-MM-DD': true}"
    )
    
    # Streak tracking
    streak_count = models.PositiveIntegerField(
        blank=True,
        default=0,
        help_text="Current consecutive completion streak"
    )
    
    last_completed = models.DateField(
        null=True,
        blank=True,
        default=None,
        help_text="Most recent completion date"
    )
    
    # Metadata
    created_at = models.DateTimeField(
        default=timezone.now,
        help_text="When the habit was first created"
    )
    
    updated_at = models.DateTimeField(auto_now=True, help_text="When the habit was last modified")

    
    # Accountability
    accountability_partner = models.ForeignKey(
        ApplicationUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        default=None,
        related_name='accountability_habits',
        help_text="Optional partner for accountability"
    )

    class Meta:
        ordering = ['-created_at']
        unique_together = ['user', 'habit_name']

    def __str__(self):
        return f"{self.habit_name} ({self.user})"

    def clean(self):
        if self.accountability_partner and self.accountability_partner == self.user:
            raise ValidationError("You cannot be your own accountability partner.")

    

    def update_streak(self):

        from datetime import datetime, timedelta
        # """Update streak count based on completions and habit frequency"""
        if not self.completions:
            self.streak_count = 0
            self.last_completed = None
            return

        try:
            # Get sorted list of completion dates
            completion_dates = sorted(
                datetime.strptime(date, '%Y-%m-%d').date()
                for date in self.completions.keys()
                if self.completions[date]
            )

            if not completion_dates:
                self.streak_count = 0
                self.last_completed = None
                return

            self.last_completed = completion_dates[-1]
            today = timezone.now().date()
            current_streak = 0
            expected_date = today - timedelta(days=1)  # Start checking from yesterday

            # For daily habits (frequency=1)
            if self.habit_frequency == 1:
                streak_active = True
                day_counter = 0
                
                while streak_active and expected_date >= completion_dates[0]:
                    if expected_date in completion_dates:
                        current_streak += 1
                        expected_date -= timedelta(days=1)
                    else:
                        # If we're checking the current streak and find a missing day, break
                        if day_counter < current_streak:
                            current_streak = 0
                            streak_active = False
                        else:
                            expected_date -= timedelta(days=1)
                    
                    day_counter += 1

            # For habits with frequency > 1 (e.g., weekly)
            else:
                # Find the most recent completion within the expected frequency window
                current_streak = 0
                look_back_date = today - timedelta(days=self.habit_frequency - 1)
                
                # Check if there's any completion in the current frequency window
                has_recent_completion = any(
                    look_back_date <= date <= today 
                    for date in completion_dates
                )
                
                if has_recent_completion:
                    current_streak = 1
                    # Now look backwards for previous completions in their respective windows
                    previous_window_end = look_back_date - timedelta(days=1)
                    previous_window_start = previous_window_end - timedelta(days=self.habit_frequency - 1)
                    
                    while previous_window_start >= completion_dates[0]:
                        # Check if there's a completion in this previous window
                        has_previous_completion = any(
                            previous_window_start <= date <= previous_window_end
                            for date in completion_dates
                        )
                        
                        if has_previous_completion:
                            current_streak += 1
                            previous_window_end = previous_window_start - timedelta(days=1)
                            previous_window_start = previous_window_end - timedelta(days=self.habit_frequency - 1)
                        else:
                            break

            self.streak_count = current_streak

        except (ValueError, TypeError) as e:
            self.streak_count = 0
            self.last_completed = None

    def mark_completed(self, date=None, completed=True, save=True):
        """Mark habit as completed/uncompleted for a specific date"""
        date = date or timezone.now().date()
        date_str = date.isoformat()

        if completed:
            self.completions[date_str] = True
        elif date_str in self.completions:
            del self.completions[date_str]

        if save:
            self.save()

        return self

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


# we could make this a predefined list
# as well as allow users to create their own
class AchievementType(models.Model):
    # ranking is a temporaty varible i created in order for this model to be registered in the admin.py
    ranking = models.CharField(max_length=128, unique=True)
    name = models.CharField(max_length=128, unique=True)
    achievement_type_image = models.ImageField(null=True, blank=True)
    description = models.TextField(blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.ranking:
            # Automatically populate ranking based on the name and append the word 'award'
            self.ranking = f"{self.name} award"
        super().save(*args, **kwargs)


# we will need to reconsider how we go about this class
# may need to consider achievements dates earened as an array
# or we could make some constraints suhc that
# if achievement for that user is already achieved we could update the
# date earned ot the most recent and update count field respecively
# this will solve the issue of duplication
# will have to link post and achievement
# we make achievement constraints such that date earned and user form it
# we need to link this to psot and comment entities
class Achievement(models.Model):
    user = models.ForeignKey(
        ApplicationUser, on_delete=models.CASCADE, related_name="achievements"
    )
    achievement_type = models.ForeignKey(AchievementType, on_delete=models.CASCADE)
    # need to look at how this is done could probably do it in a similar way
    # to my django project in 1st semester in terms of how this function is defined
    ach_count = models.IntegerField(default=0)
    ach_date_earned = models.DateTimeField(default=timezone.now)

    # may have to consider removing the constraint
    #
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "achievement_type"], name="unique_user_achievement"
            )
        ]

    # may at a later time need to compartmentalise the save function
    # this just means that in everyhing in it may be added to a seperate function and vice versa
    # for other fields that may be upadated will have their own function that does this
    # then will be subsequently added to the save function
    def save(self, *args, **kwargs):
        existing_achievement = Achievement.objects.filter(
            user=self.user, achievement_type=self.achievement_type
        ).first()
        if existing_achievement:
            existing_achievement.ach_count += 1
            existing_achievement.ach_date_earned = timezone.now()
            existing_achievement.save()
        else:
            super().save(*args, **kwargs)


# we will need to add some constraints for this model
# after we have finalised what this model will do and look like
# in terms of its application
# class Calendar(models.Model):
#     note = models.ForeignKey(Note, on_delete=models.CASCADE)
#     habit = models.ForeignKey(Habit, on_delete=models.CASCADE)
#     user = models.ForeignKey(ApplicationUser, on_delete=models.CASCADE)


# we could make moods just a generic class with mood_type singular field which will be a dropdown
# we will need to implement logic at application or in react that wont allow the user to pick themselves as a accountability partner


# NEW MODELS FOR ADDITIONAL FUNCTIONLITY OF JOURNAL (tracking tasks for workers + time analytics)
class WorkNote(models.Model):
    user = models.ForeignKey(ApplicationUser, on_delete=models.CASCADE, related_name="work_notes")
    title = models.CharField(max_length=200)
    content = models.TextField(blank=True, null=True)
    date_created = models.DateTimeField(default=timezone.now)
    
    # tasks = models.ManyToManyField('WorkTask', related_name="notes", blank=True)
    
    class Meta:
        ordering = ['-date_created']
        
    def __str__(self):
        return f"{self.title} ({self.user.username})"
    

# Work task (work journal)
class WorkTask(models.Model):
    PRIORITY_CHOICES = (
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
    )
    
    user = models.ForeignKey(ApplicationUser, on_delete=models.CASCADE, related_name="work_tasks")
    note = models.ForeignKey('WorkNote', on_delete=models.CASCADE, related_name="tasks", null=True, blank=True)
    
    task_name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=50, blank=True)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='Medium')
    time_spent = models.IntegerField(default=0)
    date_created = models.DateTimeField(default=timezone.now)
    completed = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-date_created']
        
    def __str__(self):
        return f"{self.task_name} ({self.user.username})"