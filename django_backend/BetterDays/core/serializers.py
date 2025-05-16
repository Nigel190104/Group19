from django.urls import reverse
from rest_framework import serializers
from django.utils import timezone
from .models import ApplicationUser, Follow, Post, Comment, PostLike, CommentLike, AccountabilityPartner, MoodCategory, MoodSubcategory, Note, Habit, Achievement, AchievementType, WorkNote, WorkTask
from datetime import datetime

class ApplicationUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = ApplicationUser
        fields = ['id','username','password','profile_image', 'user_gender',  'email','roles', 'followers_count', 'following_count', 'bio']
    

class FollowSerializer(serializers.ModelSerializer):
    follower_details = ApplicationUserSerializer(source='followers', read_only=True)
    following_details = ApplicationUserSerializer(source='following', read_only=True)
    
    class Meta:
        model = Follow
        fields = ['id', 'followers', 'following', 'created_at', 'follower_details', 'following_details']
        read_only_fields = ['created_at']

class PostSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'user', 'author', 'post_title', 'post_description', 'post_date_created', 'post_image', 'like_count', 'comment_count']

    def get_author(self, obj):
        return obj.user.username if obj.user else None


class GeneratingPostSerializer(serializers.ModelSerializer):
    all_posts = serializers.SerializerMethodField()
    user_posts = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'all_posts', 'user_posts']

    def get_all_posts(self, obj):
        request = self.context.get('request')
        posts = Post.objects.all()
        posts_data = []

        for post in posts:
            post_serializer = PostSerializer(post, context={'request': request})
            posts_data.append(post_serializer.data)

        return posts_data

    def get_user_posts(self, obj):
        request = self.context.get('request')
        user = obj.user if hasattr(obj, 'user') else None
        if user:
            posts = Post.objects.filter(user=user)
            posts_data = []

            for post in posts:
                post_serializer = PostSerializer(post, context={'request': request})
                posts_data.append(post_serializer.data)

            return posts_data
        return []



class CommentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Comment
        fields = ['id', 'user', 'post', 'parent_comment', 'comment_content', 'date_created', 'like_count','comment_image']


class PostLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostLike
        fields = ['id', 'user', 'post']

    # def save(self, *args, **kwargs):
    #     existing_like = PostLike.objects.filter(user=self.user, post=self.post)
    #     if existing_like.exists():
    #         existing_like.delete()
    #     else:
    #         super().save(*args, **kwargs)


class CommentLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommentLike
        fields = ['id', 'user', 'comment']
    
    # def save(self, *args, **kwargs):
    #     existing_like = PostLike.objects.filter(user=self.user, post=self.post)
    #     if existing_like.exists():
    #         existing_like.delete()
    #     else:
    #         super().save(*args, **kwargs)



class AccountabilityPartnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountabilityPartner
        fields = ['user', 'partner', 'date_started', 'is_active', 'special_key']



class MoodCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MoodCategory
        fields = ['id', 'name']



class MoodSubcategorySerializer(serializers.ModelSerializer):
    category = MoodCategorySerializer()

    class Meta:
        model = MoodSubcategory
        fields = ['id', 'category', 'name', 'mood_image', 'description', 'mbti_insight']


#class NoteSerializer(serializers.ModelSerializer):

#    class Meta:
#        model = Note
#        fields = ['id', 'user', 'note_caption', 'note_content', 'note_date_created', 'time_spent', 'note_image', 'accountability_partner', 'achievements', 'mood_subcategory', 'Habit']

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'user', 'note_caption', 'note_content', 'note_date_created', 'time_spent', 'note_image', 'accountability_partner', 'achievements', 'mood_subcategory', 'Habit']
        read_only_fields = ['user']  # Make user read-only
    
    def create(self, validated_data):
        # Automatically sets the user from forntend request
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
    
    
    
class JournalSerializer(serializers.ModelSerializer):
    notes = serializers.SerializerMethodField()
    class Meta:
        model = Note
        fields = ['id', 'notes']
    def get_notes(self, obj):
        request = self.context.get('request')
        user = obj.user if hasattr(obj, 'user') else None 
        if user:
            notes = Note.objects.filter(user=user)
            serializer = NoteSerializer(notes, many=True, context={'request': request})
            return serializer.data
        return []

class HabitSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(
        default=serializers.CurrentUserDefault()
    )

    accountability_partner = serializers.PrimaryKeyRelatedField(
        queryset=ApplicationUser.objects.all(),
        allow_null=True,
        required=False
    )

    class Meta:
        model = Habit
        fields = [
            'id',
            'user',
            'habit_name',
            'habit_description',
            'habit_colour',
            'habit_frequency',
            'completions',
            'streak_count',
            'last_completed',
            'created_at',
            'updated_at',
            'accountability_partner',
        ]
        read_only_fields = [
            'id',
            'streak_count',
            'created_at',
            'updated_at',
            'last_completed',
        ]

    def validate(self, data):
        """Check that the user isn't setting themselves as their own accountability partner."""
        user = data.get('user', self.instance.user if self.instance else None)
        accountability_partner = data.get('accountability_partner')

        if accountability_partner and user and accountability_partner == user:
            raise serializers.ValidationError(
                "You cannot be your own accountability partner."
            )

        return data

    def validate_habit_frequency(self, value):
        """Ensure habit frequency is at least 1."""
        if value < 1:
            raise serializers.ValidationError(
                "Habit frequency must be at least 1."
            )
        return value

    def validate_completions(self, value):
        """Ensure completions are properly formatted with valid dates and boolean values."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Completions must be a dictionary.")

        cleaned_completions = {}
        
        for date_str, completed in value.items():
            try:
                date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()

                if isinstance(completed, bool):
                    cleaned_completions[date_str] = completed
                elif str(completed).lower() in ['1', 'true']:
                    cleaned_completions[date_str] = True
                elif str(completed).lower() in ['0', 'false']:
                    cleaned_completions[date_str] = False
                else:
                    raise serializers.ValidationError(
                        f"Invalid completion value for {date_str}. Must be True/False."
                    )
            except ValueError:
                raise serializers.ValidationError(
                    f"Invalid date format in completions: {date_str}. Use YYYY-MM-DD format."
                )

        return cleaned_completions

    def create(self, validated_data):
        habit = super().create(validated_data)
        habit.update_streak()
        habit.save()
        return habit

    def update(self, instance, validated_data):
        instance = super().update(instance, validated_data)

        if 'completions' in validated_data:
            instance.update_streak()
            instance.save()

        return instance


class AchievementTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AchievementType
        fields = ['id', 'ranking', 'name', 'achievement_type_image', 'description']

    def get_achievement_type_image(self, obj):
        request = self.context.get('request')
        if obj.achievement_type_image:
            return request.build_absolute_uri(obj.achievement_type_image.url)
        return None


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ['id', 'user', 'achievement_type', 'ach_count', 'ach_date_earned']

    def create(self, validated_data):
        user = validated_data['user']
        achievement_type = validated_data['achievement_type']
        existing_achievement = Achievement.objects.filter(user=user, achievement_type=achievement_type).first()
        if existing_achievement:
            existing_achievement.ach_count += 1
            existing_achievement.ach_date_earned = timezone.now()
            existing_achievement.save()
            return existing_achievement
        return super().create(validated_data)




class WorkTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkTask
        fields = ['id', 'task_name', 'description', 'category', 'priority', 
                  'time_spent', 'date_created', 'completed', 'note']

# class WorkNoteSerializer(serializers.ModelSerializer):
#     tasks = WorkTaskSerializer(many=True, read_only=True)
    
#     class Meta:
#         model = WorkNote
#         fields = ['id', 'title', 'content', 'date_created', 'tasks']

class WorkNoteSerializer(serializers.ModelSerializer):
    tasks = WorkTaskSerializer(many=True, read_only=True)

    class Meta:
        model = WorkNote
        fields = ['id', 'title', 'content', 'date_created', 'tasks']