COM2027, Group 19 - Betterdays

Welcome to the Betterdays project repo for COM2027, Group 19! Feel free to make changes to this README as needed.

Getting Started

To get started with the project, follow the steps below to set up your development environment and run the server.

Prerequisites

Ensure you have the following installed on your machine:
- Python 3.x
- pip (Python package manager)
- A virtual environment tool (like venv)

Installation Steps

1. Clone the repository (if you haven't already):
   git clone <repository-url>
   cd django_backend/Betterdays

2. Set up a virtual environment:
   - For Windows:
     python -m venv venv
     venv\Scripts\activate
   - For macOS/Linux:
     python3 -m venv venv
     source venv/bin/activate

3. Install dependencies:
   python -m pip install -r requirements.txt

4. Set the execution policy (Windows only):
   If you're on Windows, you may need to adjust your execution policy to bypass restrictions:
   Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process

5. Run the Django development server:
   Once the environment is set up and dependencies are installed, you can start the server:
   python manage.py runserver

6. Migrate mood data (if applicable):
   If your project involves mood data, you can migrate the data by running:
   python manage.py mood_data

Available Commands

- python manage.py runserver: Runs the Django development server.
- python manage.py mood_data: Migrates mood-related data (if relevant for your project).
- python manage.py migrate: Applies database migrations.
- python manage.py createsuperuser: Creates an admin user for the Django admin interface.

Project Structure

The project is organized as follows:

django_backend/
|

├── Betterdays/                # Main Django app folder

│   ├── migrations/            # Django database migrations

│   ├── static/                # Static files (e.g., CSS, JS)

│   ├── templates/             # HTML templates

│   ├── manage.py              # Django management script

│   ├── requirements.txt       # Project dependencies

│   └── ...                    # Other project files

│

└── venv/                      # Virtual environment

Running Tests

You can run tests in your Django project using:
python manage.py test

Deployment

For production deployment, you'll need to follow Django’s deployment checklist and configure settings such as ALLOWED_HOSTS, database configurations, and static file handling.

Refer to the official Django documentation (https://docs.djangoproject.com/en/stable/howto/deployment/) for deployment guidelines.

For more information on Django, check out the official documentation (https://www.djangoproject.com/).
