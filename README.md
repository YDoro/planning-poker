<h1 align="center">Planning Poker App</h1>

Free / Open source Scrum/Agile Planning Poker Web App to estimate user stories for the Agile/Scrum teams. Create sessions and invite team members to estimate user stories efficiently. Intuitive UI/UX for voting story points, showing team members' voting status with emojis (👍 - Voting Done, 🤔 - Yet to Vote). The Session Moderator has full control to reveal story points and restart the session.

<div align="center">
  
[![Build and Tests](https://github.com/ydoro/planning-poker/actions/workflows/build-and-tests.yml/badge.svg)](https://github.com/ydoro/planning-poker/actions/workflows/build-and-tests.yml)
[![Deploy to Firebase](https://github.com/ydoro/planning-poker/actions/workflows/deploy-to-firebase-on-master.yml/badge.svg)](https://github.com/ydoro/planning-poker/actions/workflows/deploy-to-firebase-on-master.yml)

</div>

## Live Site

- <https://planning-poker-agile.web.app/>

## Home Page

<img src="docs/HomePage.jpg" alt="Home Page Screenshot" />

## Active Session

<img src="docs/ActiveSession.jpg" alt="Active Session Screenshot" />

---

## Architecture & Project Structure

The project has been refactored to follow **Clean Architecture** and **Domain-Driven Design (DDD)** principles, separating pure business logic and models from framework/infrastructure details.

### Directory Mapping

```text
src/
├── core/                   # Pure business logic and domain models (Framework-agnostic)
│   ├── domain/             # Domain entities, value objects, interfaces, and exceptions
│   │   ├── entities/       # Rich domain models: Game.ts, Player.ts, Task.ts
│   │   ├── value-objects/  # Simple schemas: CardConfig.ts, TimerProps.ts
│   │   └── repositories/   # Port definitions: IGameRepository.ts (repository interface)
│   └── use-cases/          # Application business rules / orchestrators
│       ├── CreateGame.ts   # Creates a new game session
│       ├── AddPlayer.ts    # Joins a player to a game
│       ├── VoteOnTask.ts   # Submits a player's estimate
│       ├── RevealCards.ts  # Reveals estimated story cards
│       ├── NextTask.ts     # Proceeds to the next user story task
│       ├── FinishGame.ts   # Completes the poker planning session
│       └── CheckIsModerator.ts # Checks player's host/moderator privileges
│
├── infrastructure/         # External tools, framework drivers, database drivers
│   ├── firebase/           # Google Cloud Firestore repository driver & connections
│   │   ├── FirebaseGameRepository.ts # Implementation of IGameRepository
│   │   └── firebase.ts     # Firebase initializations & configurations
│   └── cache/              # Local browser storage cache integrations
│       └── localStorage.ts # Cache helper for user preferences & active sessions
│
├── presentation/           # React Layer - Components, Styling, Routing, and Stores
│   ├── components/         # Reusable design system / presentation widgets
│   ├── pages/              # Application pages (PokerPage, HomePage, DeleteOldGames)
│   └── stores/             # Zustand stores for state management & real-time DB syncs
│       └── useGameStore.ts # Central React/Zustand game store
```

### Core Design Decisions

* **Rich Domain Model:** Aggregates (like `Game`) and Entities (like `Player` and `Task`) contain their own internal business rules, invariants, and state transitions (e.g., verifying if a vote can be submitted or calculating averages).
* **Decoupled Persistence (Ports & Adapters):** The presentation and domain layers depend solely on the repository interface `IGameRepository` (Port). The Firestore repository implementation resides in the `infrastructure` directory (Adapter).
* **Zustand State Management:** Real-time listeners and store events are decoupled from React Contexts, allowing performant component rendering through selective store selectors.

---

## Tech Stack

The application is built using a modern, performant frontend stack:

1. **Framework:** [React 19](https://react.dev/) — Declarative UI with functional components and hooks.
2. **Bundler:** [Vite 8](https://vite.dev/) — Fast compilation, hot reloading, and optimized production builds.
3. **State Management:** [Zustand 5](https://github.com/pmndrs/zustand) — React-independent, lightweight real-time state management.
4. **Database & Sync:** [Google Cloud Firestore](https://firebase.google.com/docs/firestore) — Real-time document database syncing active games.
5. **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) — Modern utility-first CSS styling.
6. **Form Validation:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) — Strict schema validation for inputs.
7. **Testing:** [Vitest](https://vitest.dev/) & [React Testing Library](https://testing-library.com/) — High-performance testing suite matching JSDOM environments.
8. **Hosting:** [Firebase Hosting](https://firebase.google.com/docs/hosting).

---

## How to Run the App Locally

### Prerequisites

* **Node.js** version 20.x or higher.
* **Yarn** package manager.
* **Java JDK** version 11 or higher (required to run the Firestore local emulator).

### Step-by-Step Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/ydoro/planning-poker.git
   cd planning-poker
   ```

2. **Install dependencies:**

   ```bash
   yarn install
   ```

3. **Install the Firebase CLI globally:**

   ```bash
   npm install -g firebase-tools
   ```

4. **Start the Firestore Local Emulator:**

   ```bash
   npm run start:emulator
   ```

5. **Configure environment variables:**
   Copy `.env.example` to `.env` and ensure `VITE_USE_FIRESTORE_EMULATOR` is set to `true`:

   ```bash
   cp .env.example .env
   ```

6. **Start the Vite development server:**

   ```bash
   yarn start
   ```

7. **Access the application:**
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Docker Support

### Prerequisites

* [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### Instructions

1. **Build the production bundle:**
   Ensure your `.env` specifies the production configurations or emulator options accordingly.

   ```bash
   npm run build
   ```

2. **Build the Docker Image:**

   ```bash
   docker build -t planning-poker .
   ```

3. **Run the Docker Container:**

   ```bash
   docker run -it -p 8080:8080 -p 3000:3000 planning-poker
   ```

4. **Access the application:**
   Wait for both the emulator and Vite dev server to start. Open [http://localhost:3000](http://localhost:3000).

---

## Development Guidelines

1. **Follow Clean Architecture/DDD:** Avoid importing files from `infrastructure` or `presentation` inside `src/core`. Maintain pure domain rules in core entities.
2. **Write Unit Tests:** Always add unit tests for domain entities, use-cases, and component presentations.
3. **Strict Type Safety:** Keep types strictly typed using TypeScript schemas; avoid using `any`.
4. **Use Zustand Selectors:** Always select minimal state slices from `useGameStore` to prevent unnecessary component updates.
5. **Linting & Formatting:** Ensure code is formatted using Prettier and linted before committing.

---

## Pending Features

1. Export voting statistics options.
2. Preserve game voting history.
3. Ask AI integration.

---

## Tech Debts

1. Add Semantic Release to generate automated changelogs and release tags.

---

[![Buy Me A Coffee](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/ydoro)
