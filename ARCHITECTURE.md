# GoalSync AI Architecture

Below is the complete system architecture diagram for your submission. You can copy the code block below into [Mermaid Live Editor](https://mermaid.live/) to export it as a high-quality PDF or Image for your submission!

```mermaid
graph TD
    %% Styling
    classDef frontend fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:#fff
    classDef backend fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff
    classDef database fill:#f59e0b,stroke:#b45309,stroke-width:2px,color:#fff
    classDef auth fill:#f43f5e,stroke:#be123c,stroke-width:2px,color:#fff
    classDef external fill:#64748b,stroke:#334155,stroke-width:2px,color:#fff

    %% Nodes
    subgraph "Frontend Layer (Vercel)"
        React["React.js SPA\n(Tailwind, Framer Motion)"]:::frontend
        Context["Auth Context\n& State Management"]:::frontend
    end

    subgraph "Authentication Layer"
        FirebaseUI["Firebase Auth SDK"]:::auth
        FirebaseAuth["Firebase Cloud Auth\n(Identity Provider)"]:::auth
    end

    subgraph "Backend Layer (Render)"
        NodeAPI["Node.js / Express\nREST API"]:::backend
        AuthService["Auth Controller\n(Verifies Firebase Tokens)"]:::backend
        PrismaORM["Prisma ORM"]:::backend
    end

    subgraph "Data Layer (Neon)"
        Postgres[(Neon Serverless\nPostgreSQL)]:::database
    end

    %% Relationships
    React <-->|"REST API calls (Axios)\nwith JWT Bearer Token"| NodeAPI
    React -->|"Trigger Login"| FirebaseUI
    FirebaseUI <-->|"Email/Password validation"| FirebaseAuth
    FirebaseUI -->|"Returns Secure idToken"| Context
    
    Context -->|"POST /api/auth/firebase\n(Sends idToken)"| AuthService
    AuthService -->|"Verifies idToken\nIssues Backend JWT"| NodeAPI
    
    NodeAPI <-->|"Database Queries"| PrismaORM
    PrismaORM <-->|"Connection Pool"| Postgres
```
