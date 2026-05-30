AI-Assisted IT Lifecycle With Behavioral Risk Detection
This repository hosts a proactive IT Asset Management System designed to transition operational workflows from manual, trust-based processes to automated, data-driven security. By combining Machine Learning and Cybersecurity, this platform mitigates financial risks from user negligence, prevents unauthorized identity use, and ensures strict database integrity.

Core Features
AI Behavioral Risk Detection: Utilizes a Random Forest machine learning model to calculate dynamic Risk Scores based on user history, proactively evaluating factors like damage frequency and return timeliness.

Digital Handshake (Non-Repudiation): Secures the asset handover process using Cryptographic Signing to verify the user's identity and effectively prevent denial of receipt.

Immutable Audit Trail (Anti-Tampering): Implements Chain-Hashing on transaction logs to automatically detect anomalies and alert administrators if malicious insiders or intruders attempt unauthorized database modifications.

Tech Stack
Frontend: Built with React 19, Vite, and Tailwind CSS 4 for a highly responsive, role-based user interface.

Backend: Powered by FastAPI (Python) and SQLAlchemy to ensure high-performance API endpoints and robust database interaction.

Security & Database: Utilizes Bcrypt for password hashing, JWT via python-jose for session management, and PostgreSQL (psycopg2-binary) for relational data storage.

Project Structure
client/: Contains the React application, specifically organized into pages for distinct operational roles: User, Admin, Manager, and Finance.

server/: Contains the FastAPI application, housing the core business logic, Pydantic schemas, database models, and the AI models (random_forest.pkl).

docs/: Stores comprehensive project documentation, including activity diagrams, entity-relationship diagrams, and academic proposal forms.

Team Members
This Capstone Design Project was developed for the Faculty of Computer Science, President University by:

Athaillah Dea Arkananta: Cybersecurity Integration (Anti-Tampering)

Firdaus Hamonangan Manalu: Cybersecurity Integration (Non-Repudiation)

Hafidh Bintang Ramadhan: Artificial Intelligence (Behavioral Risk Detection)
