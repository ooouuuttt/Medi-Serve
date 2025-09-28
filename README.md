# MediServe - Pharmacy Management System

MediServe is a comprehensive, AI-powered pharmacy management solution built with Next.js and Firebase. It provides pharmacy owners with a powerful set of tools to streamline their operations, from inventory management to prescription handling and sales analytics.

## Features

- **Authentication**: Secure user registration and login for pharmacy owners using Firebase Authentication (Email & Password).
- **Dashboard**: A central hub that provides an at-a-glance overview of your pharmacy's status, including:
    - Key metrics like total items in stock, low stock items, and out-of-stock items.
    - A summary of new prescriptions awaiting fulfillment.
    - A list of recent, unread notifications.
- **Stock Management**:
    - View, search, and filter your entire medicine inventory.
    - Add new medicines with details such as manufacturer, quantity, price, and expiry date.
    - Automatically get status indicators for medicines that are 'In Stock', 'Low Stock', or 'Out of Stock'.
- **Prescription Handling**:
    - Manage all incoming patient prescriptions in a centralized table.
    - Update the status of a prescription (`Pending`, `Ready for Pickup`, `Completed`).
    - **AI Patient Updates**: Use a Genkit-powered AI tool to automatically generate a friendly, personalized SMS message to notify patients that their prescription is ready.
- **Order Fulfillment**: A dedicated page to manage and track customer orders.
- **AI-Powered Analytics & Reports**:
    - Leverage a powerful Genkit AI flow to analyze your sales and prescription history.
    - Get AI-driven insights on:
        - **Highest Demand Medicines**: Identify top-selling products.
        - **Future Stock Predictions**: Forecast future demand to optimize inventory.
        - **Stock Optimization Suggestions**: Receive actionable advice to prevent stockouts and reduce waste.
    - Visualize sales data and future predictions with interactive charts.
- **AI Symptom Checker**: A tool that allows users to input symptoms and receive preliminary, AI-generated information about potential conditions and next steps.
- **Profile Management**:
    - View and edit your pharmacy profile details.
    - Set your pharmacy's status to 'Open' or 'Closed', which is visible across the dashboard.
- **Real-time Notifications**: Receive instant notifications for:
    - New prescriptions.
    - Low stock alerts.
    - Medicine expiry warnings.

## Tech Stack

- **Framework**: Next.js (with App Router)
- **Styling**: Tailwind CSS with ShadCN UI components
- **Backend & Database**: Firebase (Authentication, Firestore)
- **Generative AI**: Google AI & Genkit

## Getting Started

### 1. Prerequisites

- Node.js (v18 or later)
- An active Firebase project.

### 2. Setup Instructions

1.  **Clone the Repository**:
    ```bash
    git clone <your-repository-url>
    cd <repository-name>
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Firebase**:
    - Open the `src/firebase/config.ts` file.
    - Replace the placeholder `firebaseConfig` object with the actual configuration object from your Firebase project's settings. You can find this in `Project Settings > General > Your apps > Firebase SDK snippet > Config`.

4.  **Configure Environment Variables for Genkit**:
    - Create a new file named `.env.local` in the root of the project.
    - Add your Google AI API key to this file. You can get this from [Google AI Studio](https://aistudio.google.com/).
    ```
    GEMINI_API_KEY=your_google_ai_api_key_here
    ```

5.  **Run the Development Servers**:
    This project requires two development servers to run concurrently: one for the Next.js application and one for the Genkit AI flows.

    - **Terminal 1: Start the Next.js App**:
      ```bash
      npm run dev
      ```
      Your application will be available at `http://localhost:9002`.

    - **Terminal 2: Start the Genkit Server**:
      ```bash
      npm run genkit:watch
      ```
      This will start the Genkit development server and watch for changes in your AI flows.

### 6. Using the Application

Once both servers are running, you can open `http://localhost:9002` in your browser. You can register a new pharmacy account and start exploring the features.
