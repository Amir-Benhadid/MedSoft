# MedSoft

**MedSoft** is a modern, comprehensive desktop application designed for medical appointments and practice management. Built with robust web technologies and wrapped in Electron, it offers a seamless experience for doctors and secretaries to manage patient data, consultations, prescriptions, and billing.

## Download

You can download the latest version of MedSoft from the [Releases Page](https://github.com/Amir-Benhadid/MedSoft/releases/latest).

## Features

*   **Patient Management**: Complete patient records, history, and contact details.
*   **Appointment Scheduling**: Interactive calendar for managing appointments and walk-ins.
*   **Doctor Dashboard**:
    *   **Consultations**: Dedicated interface for conducting consultations.
    *   **Clinical Exams**: Record visual acuity, refraction, tonometry, and slit lamp exams.
    *   **Prescriptions**: Generate and print prescriptions effortlessly.
    *   **Medical History**: Track patient history and previous treatments.
*   **Document Management**: Generate and manage medical certificates, reports, and referrals.
*   **Billing & Invoicing**: Track payments, generate invoices, and manage practice finances.
*   **Hybrid Data**: Uses local **SQLite** for speed and offline capability, with **Supabase** sync for backup and multi-device support.
*   **Auto-Updates**: Seamless background updates to keep the software current.

## Technology Stack

*   **Core**: [Electron](https://www.electronjs.org/), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Styling**: [TailwindCSS](https://tailwindcss.com/)
*   **Database**: [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) (Local), [Supabase](https://supabase.com/) (Cloud Sync)
*   **Architecture**: Multi-window architecture with robust IPC communication.

## Getting Started

### Prerequisites

*   **Node.js**: v18 or higher (v20+ recommended)
*   **pnpm**: v9+ (Recommended package manager)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Amir-Benhadid/MedSoft.git
    cd MedSoft
    ```

2.  **Install dependencies**
    ```bash
    pnpm install
    ```

3.  **Setup Environment**
    Create a `.env` file in the root directory (see `.env.example` if available) with necessary API keys (e.g., Supabase credentials).

### Running Locally

Start the development server with hot-reloading:

```bash
pnpm run dev
```

This will launch:
*   Vite server for the UI (`localhost:3000`)
*   Electron main process

## Building and Release

To build the application for production (Windows):

```bash
pnpm run build:win
```

To publish a new release (requires GitHub Token):

```bash
pnpm run dist
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

© [Amir Benhadid](https://github.com/Amir-Benhadid)
