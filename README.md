# SyncStripe — Enterprise-Grade SaaS Task Manager

TaskFlow is a premium, high-fidelity SaaS task management dashboard designed for high-performance team workspaces. It merges modern design systems (reminiscent of Linear, Stripe, and Vercel) with database-driven drag-and-drop workflows, real-time query engines, and native Gemini AI Assist capability.

---

## 🚀 How to Run the Project Locally

Follow these steps to set up and run both the backend and frontend services.

### Prerequisites
- **Java Development Kit (JDK)**: Version 17 or higher
- **Maven**: For compiling and packaging the Java backend
- **Node.js**: Version 18 or higher (with `npm`)
- **MySQL Server**: Standard relational database engine

---

### Step 1: Database Setup
1. Open your MySQL client and create a database named `taskdb`:
   ```sql
   CREATE DATABASE taskdb;
   ```

---

### Step 2: Environment Configuration
1. Locate the `.env` file in the project's root folder (`s:/Projects/Task Manager/.env`).
2. Verify or add the following environment parameters (adjust credentials to match your MySQL database):
   ```env
   DB_URL=jdbc:mysql://localhost:3306/taskdb
   DB_USERNAME=your_mysql_username
   DB_PASSWORD=your_mysql_password
   GEMINI_API_KEY=your_gemini_api_key_here
   
   ```
   

---

### Step 3: Run the Backend (Spring Boot)
1. Open your terminal, navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Compile and run the Spring Boot application using Maven:
   ```bash
   mvn spring-boot:run
   ```
   The backend will start and listen on port **`8080`**. Database tables (`tasks` and `users`) will generate automatically.

---

### Step 4: Run the Frontend (React + Vite)
1. Open a new terminal, navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install the node modules:
   ```bash
   npm install
   ```
3. Launch the local Vite development server:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to **`http://localhost:5173`** (or the port specified in your console) to launch the workspace!

---

## 🛠️ Tech Stack Choices & Rationale

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend Frame** | **React (v18)** | Lightweight, modular component structure, and highly optimized virtual DOM rendering—perfect for responsive interfaces. |
| **Build Tooling** | **Vite** | Offers lightning-fast Hot Module Replacement (HMR) and zero-config compilation compared to legacy Create React App (Webpack) wrappers. |
| **Styling System** | **Tailwind CSS & Vanilla CSS** | Combines Tailwind utility classes for rapid layout prototyping with Vanilla HSL tokens for precise color themes, glassmorphism, and responsive layouts. |
| **Backend Engine** | **Java & Spring Boot** | Standard enterprise architecture pattern. Provides stable MVC controllers, REST endpoints, dependency injection, and JPA database mapping. |
| **Persistence** | **Hibernate / JPA & MySQL** | Hibernate handles object-relational mapping (ORM) and ddl-auto updates, while MySQL stores robust tables for relational users and tasks. |

---

## 🧠 AI Tools, Libraries, & Resources

*   **Google Gemini API (`v1` models)**: Connects to Google's generative models (`gemini-2.5-pro`, `gemini-2.0-flash`) using your API key to power the **AI Assist** task creator. It analyzes task titles to generate contextual description text and suggests priority weights.
*   **Gson (Google JSON Library)**: Used on the backend to construct escape-proof request payloads and safely extract raw JSON blocks out of raw Gemini markdown code-blocks.
*   **react-beautiful-dnd**: Powers the visual drag-and-drop task column boards.
*   **React Portals (`createPortal`)**: Solved a stacking context bug where dragged cards clipped underneath adjacent columns. Dragged cards are portalled directly to `document.body` level on drag, so cards slide cleanly over all columns.
*   **Optimistic UI Updates**: Status and position order updates are applied instantly in the frontend React state, ensuring drag releases lock in place instantly without waiting for backend network query lag.
*   **Fractional Indexing Algorithm**: Reordering tasks uses double precision numbers (`positionOrder`) in the database. New positions are computed dynamically in the frontend (e.g. `(prev.positionOrder + next.positionOrder) / 2`), resulting in a single database write instead of full list re-indexing.

---

## 🔮 Future Enhancements (With More Time)

If given more time, the single most critical improvement would be **Real-Time Collaboration Syncing via WebSockets (STOMP/SockJS)**. 

### Why this is important:
Currently, when a user moves a task card or updates a detail, the changes are saved to the backend database and local state. However, other users logged into the same workspace will not see the changes until they refresh their browser. 

By implementing WebSockets:
- Any drag-and-drop movements or status transitions would trigger a server broadcast.
- The cards would slide and move automatically in real-time on all teammate screens.
- This would convert TaskFlow from a personal task board into a fully collaborative multiplayer tool, similar to Linear or Figma!
