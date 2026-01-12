# To-Do-list
This project is a full-stack task management application that provides user authentication, task organization, and real-time collaboration. Users can register and log in using JWT-based authentication. Authenticated users can create, update, categorize, and delete tasks, as well as mark tasks as completed.

The system supports category sharing, allowing tasks within a category to be accessed by other users with appropriate permissions. Real-time synchronization is implemented using Socket.io, enabling live updates across clients without page reloads. Data persistence is handled through a relational database namely MySQL via xampp, with structured tables for users, tasks, and sharing relationships.

The backend exposes RESTful APIs for authentication and CRUD operations, while the frontend implements the user interface for task management and shared category interaction.
