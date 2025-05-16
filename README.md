COM2027 - Group 19 Project
=====================================================

Welcome to the repository for COM2027, Group 19! This project is designed to showcase our work for the module, and this README will guide you through setting up and running the project using Docker. Feel free to modify this README as needed to reflect your project's details.

Getting Started
Before you begin, ensure you have updated the com2027.yml file with your team members and project details. This information will appear on your static site at https://csee.pages.surrey.ac.uk/com2027/2024-25/Group19.

Docker Setup
This project uses Docker to simplify development and deployment. Follow the steps below to get started.

Prerequisites
- Install Docker on your machine from https://docs.docker.com/get-docker/.  
- Install Docker Compose from https://docs.docker.com/compose/install/ (if not included with Docker). 

Running the Project:

    1. Clone the Repository:  
    git https://gitlab.surrey.ac.uk/csee/com2027/2024-25/Group19.git
    cd into the group 19 project directory on your device

    2. Build and Start the Docker Containers:  
    Run the following command to build and start the Docker containers:  
    docker-compose up --build  
    This will:  
    - Build the Docker images for the backend and frontend (if applicable).  
    - Start the services defined in docker-compose.yml.  

    3. Access the Application:  
    - The backend service will be available at http://localhost:8000. 
    - But wont be exposed outside the docker conatiner.
    - This just means you wont be able to acess it via a search engine.
    - The frontend service (if applicable) will be available at http://localhost:5000.  

    4. Stop the Containers:  
    To stop the running containers, use:  
    docker-compose down 


.  

├── backend/               # Backend application code  

│   ├── Dockerfile         # Dockerfile for the backend  

│   ├── requirements.txt  # Python dependencies  

│   └── ...               # Other backend files  

├── frontend/              # Frontend application code (if applicable)  

│   ├── Dockerfile         # Dockerfile for the frontend  

│   └── ...               # Other frontend files  

├── docker-compose.yml     # Docker Compose configuration  

├── README.md              # This file  

└── com2027.yml            # Team and project details 


You have two branches created for you, `trunk` and `release`. The final commit on `release` will be marked.

Commits must be merged into `release` using a merge request, which requires two approvals. Force-pushing is disabled for both branches, as this can destroy your work. Only `trunk` can be merged into `release`.

You may develop directly on `trunk`, although it is recommended that you branch from `trunk` and submit merge requests (or merge directly onto the branch). How you use `trunk` is up to your team.
