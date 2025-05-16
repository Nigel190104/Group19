# core/sse.py
import json
import time
from datetime import datetime
from django.http import StreamingHttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.db.models import Q
import logging

from .models import AccountabilityPartner, Habit, ApplicationUser

logger = logging.getLogger(__name__)

@login_required
def accountability_stream(request):
    """
    Creates a streaming response for real-time accountability partner updates
    """
    logger.info(f"SSE connection established for user {request.user.username}")
    
    def event_stream():
        user = request.user
        last_check = datetime.now()
        
        # Initial data - send current partners
        partners_data = get_partners_data(user)
        logger.info(f"Sending initial partners data: {json.dumps(partners_data)}")
        yield f"event: initial_partners\ndata: {json.dumps(partners_data)}\n\n"
        
        # Keep connection open and check for updates
        while True:
            current_time = datetime.now()
            
            # Check for partnership changes
            partnership_changes = check_for_partnership_changes(user, last_check)
            if partnership_changes:
                logger.info(f"Partnership changes detected: {json.dumps(partnership_changes)}")
                yield f"event: partners_update\ndata: {json.dumps(partnership_changes)}\n\n"
            
            # Check for habit changes
            habit_changes = check_for_habit_changes(user, last_check)
            if habit_changes:
                logger.info(f"Habit changes detected: {json.dumps(habit_changes)}")
                yield f"event: habit_update\ndata: {json.dumps(habit_changes)}\n\n"
            
            last_check = current_time
            
            # Heartbeat to keep connection alive
            yield f"event: heartbeat\ndata: {json.dumps({'timestamp': current_time.isoformat()})}\n\n"
            
            # Sleep to avoid overloading the server
            time.sleep(5)  # Check every 5 seconds
    
    response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
    response['Cache-Control'] = 'no-cache'
    response['X-Accel-Buffering'] = 'no'  # Disable buffering for Nginx
    return response

def get_partners_data(user):
    """Helper to serialize partner data"""
    # Find all partnerships
    partnerships = AccountabilityPartner.objects.filter(
        (Q(user=user) | Q(partner=user)),
        is_active=True
    )
    
    # Extract partner users
    partners = []
    for partnership in partnerships:
        if partnership.user == user:
            partners.append(partnership.partner)
        else:
            partners.append(partnership.user)
    
    # Serialize to basic data
    partners_data = []
    for partner in partners:
        partners_data.append({
            'id': partner.id,
            'username': partner.username,
            'profile_image': partner.profile_image.url if partner.profile_image else None,
            'email': partner.email,
        })
    
    return partners_data

def check_for_partnership_changes(user, last_check):
    """Check for partnership changes since last check"""
    # New partnerships created
    new_partnerships = AccountabilityPartner.objects.filter(
        (Q(user=user) | Q(partner=user)),
        is_active=True,
        date_started__gt=last_check
    )
    
    # Partnerships removed/deactivated
    removed_partnerships = AccountabilityPartner.objects.filter(
        (Q(user=user) | Q(partner=user)),
        is_active=False,
        updated_at__gt=last_check
    )
    
    if not new_partnerships.exists() and not removed_partnerships.exists():
        return None
    
    # Return the complete list of current partners
    return get_partners_data(user)

 
def check_for_habit_changes(user, last_check):
    updated_habits = Habit.objects.filter(
        (Q(user=user) | Q(accountability_partner=user)),
        updated_at__gt=last_check
    )
    
    if not updated_habits.exists():
        return None
    
    # Group habits by owner/partner
    habit_changes = {}
    for habit in updated_habits:
        # Determine the partner_id for organizing the habits
        if habit.user == user and habit.accountability_partner:
            # User owns the habit, partner is the accountability partner
            partner_id = habit.accountability_partner.id
        elif habit.accountability_partner == user:
            # User is the accountability partner for this habit
            partner_id = habit.user.id
        else:
            # User owns the habit but no accountability partner
            continue  
        
        if partner_id not in habit_changes:
            habit_changes[partner_id] = []
        
        # Serialize the habit data
        habit_data = {
            'id': habit.id,
            'habit_name': habit.habit_name,
            'habit_description': habit.habit_description,
            'habit_colour': habit.habit_colour,
            'habit_frequency': habit.habit_frequency,
            'completions': habit.completions,
            'streak_count': habit.streak_count,
            'last_completed': habit.last_completed.isoformat() if habit.last_completed else None,
            'created_at': habit.created_at.isoformat(),
            'updated_at': habit.updated_at.isoformat(),
            'accountability_partner': habit.accountability_partner.id if habit.accountability_partner else None
        }
        habit_changes[partner_id].append(habit_data)
    
    # Format the response to include both the changes and message
    result = {
        'message': 'Habits updated',
        'changes': habit_changes
    }
    
    return result

def get_habit_data(habit):
   
    return {
        'id': habit.id,
        'habit_name': habit.habit_name,
        'habit_description': habit.habit_description,
        'habit_colour': habit.habit_colour,
        'habit_frequency': habit.habit_frequency,
        'completions': habit.completions,
        'streak_count': habit.streak_count,
        'last_completed': habit.last_completed.isoformat() if habit.last_completed else None,
        'created_at': habit.created_at.isoformat(),
        'updated_at': habit.updated_at.isoformat(),
        'accountability_partner': habit.accountability_partner.id if habit.accountability_partner else None
    }