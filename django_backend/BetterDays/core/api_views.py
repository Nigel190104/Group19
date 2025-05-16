from django.shortcuts import render, get_object_or_404
from django.db import models

from django.contrib.auth import get_user_model
from .models import ApplicationUser

from rest_framework.decorators import action
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from datetime import datetime  

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone






from .models import (
    ApplicationUser,
    Follow,
    Post,
    Comment,
    PostLike,
    CommentLike,
    AccountabilityPartner,
    MoodCategory,
    MoodSubcategory,
    Note,
    Habit,
    Achievement,
    AchievementType,
    WorkNote,
    WorkTask,
)
from .serializers import (
    ApplicationUserSerializer,
    FollowSerializer,
    PostSerializer,
    CommentSerializer,
    PostLikeSerializer,
    CommentLikeSerializer,
    AccountabilityPartnerSerializer,
    MoodCategorySerializer,
    MoodSubcategorySerializer,
    NoteSerializer,
    HabitSerializer,
    AchievementSerializer,
    AchievementTypeSerializer,
    GeneratingPostSerializer,
    JournalSerializer,
    WorkNoteSerializer,
    WorkTaskSerializer
)

@csrf_exempt
def signup_view(request):
    if request.method == "POST":
        username = request.POST.get("username")
        email = request.POST.get("email")
        password = request.POST.get("password")
        profile_image = request.FILES.get("profileImage")
        user = ApplicationUser.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        if profile_image:
            user.profile_image = profile_image
        user.save()
        return JsonResponse({"success": True})
    return JsonResponse({"error": "Invalid request"}, status=400)

class ApplicationUserViewSet(viewsets.ModelViewSet):
    queryset = ApplicationUser.objects.all()
    serializer_class = ApplicationUserSerializer


class FollowViewSet(viewsets.ModelViewSet):
    queryset = Follow.objects.all()
    serializer_class = FollowSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Override to filter follows based on the user ID in the URL"""
        user_id = self.kwargs.get('pk')
        if user_id:
            return Follow.objects.filter(following_id=user_id)
        return Follow.objects.none()
    
    @action(detail=True, methods=['GET'])
    def following(self, request, pk=None):
        """Get users that the specified user follows"""
        following = Follow.objects.filter(followers_id=pk)
        serializer = self.get_serializer(following, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['GET'])
    def followers(self, request, pk=None):
        """Get users who follow the specified user"""
        followers = Follow.objects.filter(following_id=pk)
        serializer = self.get_serializer(followers, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['POST'])
    def toggle(self, request):
        """Toggle follow/unfollow a user"""
        following_id = request.data.get('following_id')
        
        if not following_id:
            return Response({"error": "following_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            following_user = ApplicationUser.objects.get(pk=following_id)
        except ApplicationUser.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
        # Check if user is trying to follow themselves
        if request.user.id == following_user.id:
            return Response({"error": "You cannot follow yourself"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Check if follow relationship already exists
        try:
            follow = Follow.objects.get(followers=request.user, following=following_user)
            # If exists, unfollow
            follow.delete()
            return Response({"status": "unfollowed"}, status=status.HTTP_200_OK)
        except Follow.DoesNotExist:
            # Create new follow relationship
            follow = Follow(followers=request.user, following=following_user)
            follow.save()
            return Response({"status": "following"}, status=status.HTTP_201_CREATED)


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer


class PostLikeViewSet(viewsets.ModelViewSet):
    queryset = PostLike.objects.all()
    serializer_class = PostLikeSerializer


class CommentLikeViewSet(viewsets.ModelViewSet):
    queryset = CommentLike.objects.all()
    serializer_class = CommentLikeSerializer


# class AccountabilityPartnerViewSet(viewsets.ModelViewSet):
#     queryset = AccountabilityPartner.objects.all()
#     serializer_class = AccountabilityPartnerSerializer


class MoodCategoryViewSet(viewsets.ModelViewSet):
    queryset = MoodCategory.objects.all()
    serializer_class = MoodCategorySerializer


class MoodSubcategoryViewSet(viewsets.ModelViewSet):
    queryset = MoodSubcategory.objects.all()
    serializer_class = MoodSubcategorySerializer


class NoteViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    permission_classes = [
        IsAuthenticated
    ]  # user needs to be authenticated to see their notes

    def get_queryset(self):
        return Note.objects.filter(
            user=self.request.user
        )  # Just return notes taht belong to certain user

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    # to retrieve individual note of a user
    def get_object(self):
        obj = super().get_object()
        if obj.user != self.request.user:
            raise PermissionDenied(
                "Sorry, you are not authorised to access this journal entry"
            )  # prevents user from accessing anoothe's notes
        return obj


class HabitViewSet(viewsets.ModelViewSet):
    serializer_class = HabitSerializer
    permission_classes = [IsAuthenticated]
    queryset = Habit.objects.all()

    def get_queryset(self):
        """
        This view should return a list of all the habits
        for the currently authenticated user.
        """
        user = self.request.user
        return Habit.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_completed(self, request, pk=None):
        habit = self.get_object()
        
        try:
            date_str = request.data.get('date')
            completed = request.data.get('completed', True)
            
            if not date_str:
                return Response(
                    {'error': 'Date is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Parse the date string to a date object
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
            
            # Use model method
            habit.mark_completed(date=date, completed=completed)
            
            habit.updated_at = timezone.now()
            habit.save(update_fields=['updated_at'])
            
            # Return the updated habit
            serializer = self.get_serializer(habit)
            return Response(serializer.data)
            
        except ValueError as e:
            return Response(
                {'error': f'Invalid date format: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class AchievementViewSet(viewsets.ModelViewSet):
    queryset = Achievement.objects.all()
    serializer_class = AchievementSerializer


class AchievementTypeViewSet(viewsets.ModelViewSet):
    queryset = AchievementType.objects.all()
    serializer_class = AchievementTypeSerializer


class GeneratingPostViewSet(viewsets.ViewSet):
    serializer_class = GeneratingPostSerializer

    def list(self, request):
        serializer = GeneratingPostSerializer(
            instance={"user": request.user}, context={"request": request}
        )
        return Response(serializer.data)


class JournalViewSet(viewsets.ViewSet):
    serializer_class = JournalSerializer

    def list(self, request):
        serializer = JournalSerializer(
            instance={"user": request.user}, context={"request": request}
        )
        return Response(serializer.data)
    
    



class WorkNoteViewSet(viewsets.ModelViewSet):
    # permission_classes = [permissions.IsAuthenticated]
    serializer_class = WorkNoteSerializer
    
    def get_queryset(self):
        return WorkNote.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class WorkTaskViewSet(viewsets.ModelViewSet):
    # permission_classes = [permissions.IsAuthenticated]
    serializer_class = WorkTaskSerializer
    
    def get_queryset(self):
        return WorkTask.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        
        
        
        
        
############# new accountability partners functionality for habits ###############
"""
    ViewSet for managing accountability partners
"""
class AccountabilityPartnerViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        user = request.user # retrieve users aprtners
        
        # Find all partnerships where the user is either the user or partner
        partnerships = AccountabilityPartner.objects.filter(
            models.Q(user=user) | models.Q(partner=user),
            is_active=True
        )
        
        # Extract the partners to a separate list (for each in partnershp)
        partners = []
        for partnership in partnerships:
            if partnership.user == user:
                partners.append(partnership.partner)
            else:
                partners.append(partnership.user)
        
        serializer = ApplicationUserSerializer(partners, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    # function to add partner by either email or username
    def add(self, request):
        user = request.user
        partner_id = request.data.get('partner_id')
        
        if not partner_id:
            return Response(
                {"error": "Partner username or email is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        #find the partner by username or email
        try:
            partner = ApplicationUser.objects.get(
                models.Q(username=partner_id) | 
                models.Q(email=partner_id)
            )
        except ApplicationUser.DoesNotExist:
            return Response(
                {"error": "User not found with the provided username or email"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # check to prevent user from adding himself
        if partner == user:
            return Response(
                {"error": "You cannot add yourself as an accountability partner"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if partnership already exists
        existing_partnership = AccountabilityPartner.objects.filter(
            models.Q(user=user, partner=partner) | 
            models.Q(user=partner, partner=user)
        ).first()
        
        if existing_partnership:
            if existing_partnership.is_active:
                return Response(
                    {"error": "This user is already your accountability partner"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            else:
                # Reactivate the partnership
                existing_partnership.is_active = True
                existing_partnership.save()
                serializer = ApplicationUserSerializer(partner)
                return Response(serializer.data)
        
        # creates new partnership
        try:
            partnership = AccountabilityPartner(user=user, partner=partner)
            partnership.save()
            serializer = ApplicationUserSerializer(partner)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    #function to delete partnership
    @action(detail=True, methods=['delete'])
    def remove(self, request, pk=None):
       
        user = request.user
        partner = get_object_or_404(ApplicationUser, id=pk)
        
        # Find the partnership
        partnership = AccountabilityPartner.objects.filter(
            models.Q(user=user, partner=partner) | 
            models.Q(user=partner, partner=user)
        ).first()
        
        if not partnership:
            return Response(
                {"error": "Partnership not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Set partnership to inactive
        partnership.is_active = False
        partnership.save()
        
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['get'])
    def habits(self, request, pk=None):
        """Get habits for a specific partner"""
        user = request.user
        partner = get_object_or_404(ApplicationUser, id=pk)
        
        # Verify that they are partners
        partnership = AccountabilityPartner.objects.filter(
            models.Q(user=user, partner=partner) | 
            models.Q(user=partner, partner=user),
            is_active=True
        ).first()
        
        if not partnership:
            return Response(
                {"error": "You are not accountability partners with this user"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get partner's habits
        habits = Habit.objects.filter(user=partner)
        serializer = HabitSerializer(habits, many=True, context={'request': request})
        
        return Response(serializer.data)

"""
    ViewSet for accountability partner-related habit operations
"""
class HabitPartnerViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    
    #Copy a partner's habit to my habits
    @action(detail=True, methods=['post'])
    def copy(self, request, pk=None):
        user = request.user
        habit = get_object_or_404(Habit, id=pk)
        
        # Verify this is a partner's habit
        if habit.user == user:
            return Response(
                {"error": "This is already your habit"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify they are partners
        partnership = AccountabilityPartner.objects.filter(
            models.Q(user=user, partner=habit.user) | 
            models.Q(user=habit.user, partner=user),
            is_active=True
        ).first()
        
        if not partnership:
            return Response(
                {"error": "You are not accountability partners with this habit's owner"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Create a copy of the habit for the current user
        new_habit = Habit(
            user=user,
            habit_name=habit.habit_name,
            habit_description=habit.habit_description,
            habit_colour=habit.habit_colour,
            habit_frequency=habit.habit_frequency,
            accountability_partner=habit.user  # Set original owner as accountability partner
        )
        
        try:
            new_habit.save()
            serializer = HabitSerializer(new_habit, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
