from ...models import MoodCategory, MoodSubcategory
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = "Populate the database with mood categories and subcategories."
    # moods_data.py (or a data migration script)
    moods = {
        "Happy": [
            {"name": "Euphoric", "description": "Overwhelming happiness, high energy, thrilled.", "mbti_insight": "Extroverts: Express excitement outwardly. Introverts: Feel joy but keep it controlled."},
            {"name": "Excited", "description": "Anticipation and high energy about something positive.", "mbti_insight": "Extroverts: Thrive on achieving goals. Introverts: Find excitement in meaningful moments."},
            {"name": "Playful", "description": "Lighthearted, fun-seeking, humorous.", "mbti_insight": "Extroverts: Social and spontaneous fun. Introverts: Playfulness in structured settings."},
            {"name": "Serene", "description": "Peaceful, at ease, relaxed.", "mbti_insight": "Introverts: Find serenity in deep thought. Extroverts: Prefer active relaxation (e.g., sports)."},
            {"name": "Accomplished", "description": "Feeling of success and pride in achievement.", "mbti_insight": "Introverts: Achievement-driven. Extroverts: Value personal growth over competition."},
        ],
        "Sad": [
            {"name": "Disappointed", "description": "Expectations not met, mild sadness.", "mbti_insight": "Extroverts: Move on quickly. Introverts: Feel deeply and reflect."},
            {"name": "Heartbroken", "description": "Pain from loss, betrayal, or separation.", "mbti_insight": "Introverts: Grieve privately. Extroverts: Seek social support."},
            {"name": "Depressed", "description": "Deep, prolonged sadness, emotional numbness.", "mbti_insight": "Introverts: Withdraw to process. Extroverts: Seek comfort from others."},
            {"name": "Regretful", "description": "Wishing things had been different.", "mbti_insight": "Introverts: Overanalyze the past. Extroverts: Try to fix mistakes and move forward."},
        ],
        "Angry": [
            {"name": "Frustrated", "description": "Annoyed by obstacles, feeling stuck.", "mbti_insight": "Introverts: Become solution-focused. Extroverts: Feel restricted."},
            {"name": "Resentful", "description": "Long-term bitterness, holding grudges.", "mbti_insight": "Introverts: Internalize resentment. Extroverts: Express it directly."},
            {"name": "Jealous", "description": "Feeling threatened by others' success.", "mbti_insight": "Introverts: Compare abilities. Extroverts: Fear social exclusion."},
            {"name": "Indignant", "description": "Righteous anger, sense of unfairness.", "mbti_insight": "Extroverts: Advocate for justice. Introverts: Criticize irrationality."},
        ],
        "Fearful": [
            {"name": "Anxious", "description": "Worry, nervousness, excessive thinking.", "mbti_insight": "Introverts: Overthink social situations. Extroverts: Dislike uncertainty."},
            {"name": "Insecure", "description": "Doubting oneself, feeling inadequate.", "mbti_insight": "Introverts: Feel misunderstood. Extroverts: Hide insecurities with confidence."},
            {"name": "Terrified", "description": "Extreme fear, panic response.", "mbti_insight": "Introverts: Feel it emotionally. Extroverts: Try to suppress fear."},
            {"name": "Stressed", "description": "Overwhelmed by responsibilities or pressure.", "mbti_insight": "Introverts: Stress over inefficiency. Extroverts: Stress over commitment."},
        ],
        "Calm": [
            {"name": "Tranquil", "description": "Inner peace, unshaken by outside chaos.", "mbti_insight": "Introverts: Find peace in deep reflection. Extroverts: Feel calm in action."},
            {"name": "Secure", "description": "Safe, grounded, emotionally stable.", "mbti_insight": "Introverts: Feel secure with routines. Extroverts: Seek emotional safety."},
            {"name": "Mindful", "description": "Present in the moment, reflective.", "mbti_insight": "Introverts: Enjoy intellectual presence. Extroverts: Engage physically in the moment."},
        ],
        "Energy Levels": [
            {"name": "Exhausted", "description": "Mentally or physically drained.", "mbti_insight": "Introverts: From overthinking. Extroverts: From overstimulation."},
            {"name": "Motivated", "description": "Energized to achieve a goal.", "mbti_insight": "Extroverts: Fueled by ambition. Introverts: Inspired by creativity."},
            {"name": "Restless", "description": "Inability to sit still, hyperactive.", "mbti_insight": "Extroverts: Mind racing with ideas. Introverts: Need a physical outlet."},
            {"name": "Rejuvenated", "description": "Feeling refreshed and ready.", "mbti_insight": "Introverts: After solitude. Extroverts: After adventure."},
        ],
    }


    def handle(self, *args, **kwargs):
        for category_name, subcategories in self.moods.items():
            category, _ = MoodCategory.objects.get_or_create(name=category_name)
            for mood in subcategories:
                MoodSubcategory.objects.get_or_create(
                    category=category,
                    name=mood["name"],
                    description=mood["description"],
                    mbti_insight=mood["mbti_insight"]
                )
        self.stdout.write(self.style.SUCCESS("Mood categories and subcategories populated successfully!"))