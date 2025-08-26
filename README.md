# UniRoute Admin Panel

UniRoute is a University Bus Tracking System Admin Dashboard. This project provides a modern, full-featured admin interface for managing university bus fleets, routes, schedules, drivers, users, and more.

## Features

- **Bus Management**: Add, edit, and manage buses and their details.
- **Route Management**: Create and update bus routes and stops.
- **Schedule Management**: Assign buses to routes and manage semester schedules.
- **Driver Management**: Manage driver profiles and assignments.
- **User Management**: Administer system users and roles.
- **Emergency Messaging**: Trigger and manage emergency notifications.
- **Feedback Collection**: Collect feedback from users.
- **Settings**: Configure system settings and preferences.
- **Authentication**: Secure login for administrators.
- **Database Integration**: Supports PostgreSQL and Firebase for data storage.
- **Responsive UI**: Built with [shadcn/ui](https://ui.shadcn.com/) and Tailwind CSS for a modern look and feel.

## Tech Stack

- **Next.js** (App Router, TypeScript)
- **React** (Hooks, Components)
- **Tailwind CSS** (Customizable, utility-first styling)
- **shadcn/ui** (UI components)
- **PostgreSQL** (Primary database)
- **Firebase** (Realtime database integration)
- **Radix UI** (Accessible UI primitives)
- **Lucide Icons** (Icon library)

## Project Structure

```
├── app/                # Next.js app directory (pages, layouts, features)
├── components/         # Reusable React components
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries (db, auth, firebase)
├── public/             # Static assets
├── scripts/            # Utility scripts (e.g., set-admin-password)
├── styles/             # Global and component styles
├── .env                # Environment variables
├── package.json        # Project dependencies and scripts
├── tailwind.config.ts  # Tailwind CSS configuration
├── tsconfig.json       # TypeScript configuration
└── README.md           # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- pnpm (or npm/yarn)
- PostgreSQL database (local or cloud)
- Firebase project (optional, for realtime features)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/icechidi/UniRouteAdminPanel.git
   cd uniroute-admin-panel
   ```

2. **Install dependencies:**
   ```sh
   pnpm install
   # or
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in your database and Firebase credentials.

4. **Run the development server:**
   ```sh
   pnpm dev
   # or
   npm run dev
   ```

5. **Access the app:**
   - Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

- The app supports PostgreSQL. You can configure your connection string in `.env`.
- To initialize the database, use the setup page or run migration scripts as needed.

### Admin Password

To set or update the admin password, use the provided script:

```sh
npx ts-node scripts/set-admin-password.ts <admin_email> <new_password>
```

## Deployment

- Deploy on [Vercel](https://vercel.com/) or any platform supporting Next.js.
- Ensure environment variables are set in your deployment environment.

## License

This project is licensed under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements or bug fixes.

## Acknowledgements

- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Next.js](https://nextjs.org/)
- [Radix UI](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)

---

**UniRoute Admin Panel** – Modern university bus management made