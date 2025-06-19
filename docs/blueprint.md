# **App Name**: AuraCert

## Core Features:

- Role-Based Authentication: Implements authentication with 'admin' and 'user' roles.
- Certificate Management: Allows admin users to create, update, and delete certificate records, accessible via /certificates.
- User Management: Provides an admin-only interface at /users to manage user accounts.
- Activity Logging: Logs all create, update, and delete operations on users and certificates, available at /logs.
- Dashboard Overview: Displays key statistics (number of certificates, users, logs) and a preview of recent certificates.

## Style Guidelines:

- Primary color: Indigo (#4F46E5) for a sense of trust and authority, fitting for certificate management.
- Background color: Light gray (#F9FAFB), providing a neutral backdrop that ensures content is easily readable.
- Accent color: Teal (#31C2B2) to complement indigo and add a fresh, modern touch to interactive elements.
- Font pairing: 'Space Grotesk' (sans-serif) for headlines and short amounts of body text, and 'Inter' (sans-serif) for longer body text.
- App shell with collapsible sidebar and header, breadcrumbs for navigation, and supports both dark and light themes.
- Tables designed with responsive features, including horizontal scrolling, centered alignment on mobile, and left alignment on larger screens.
- Crisp, scalable icons used to represent actions and data types within the application.