# Next.js Bill Easy Project

A modern, full-stack starter template with authentication, internationalization, and ready-to-use components.

## Features

- **Frontend**: React 18+, Next.js 14+ (App Router)
- **UI Components**: Shadcn UI, Radix UI, Tailwind CSS, Stylus
- **State Management**: Zustand
- **Internationalization**: next-intl with English, Spanish, French, and German
- **Backend**: Next.js API routes/Server Components
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Custom email magic link system
- **Validation**: Zod
- **Deployment**: GitHub Actions, Docker, SSH deployment

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- MongoDB instance (local or cloud)
- SMTP server for sending emails

### Installation

1. Clone this repository

   ```bash
   git clone https://github.com/yourusername/billeasy.git
   cd billeasy
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Set up environment variables by creating a `.env.local` file

   ```
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/billeasy

   # Authentication
   JWT_SECRET=your-jwt-secret
   JWT_EXPIRES_IN=7d

   # Email (SMTP)
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_USER=user@example.com
   SMTP_PASS=your-smtp-password
   EMAIL_FROM=noreply@example.com

   # App
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. Run the development server

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── [locale]/                 # Internationalized routes
│   │   │   ├── (auth)/               # Auth-related routes
│   │   │   │   ├── signin/           # Sign in page
│   │   │   │   └── verify/           # Email verification page
│   │   │   ├── dashboard/            # Protected routes
│   │   │   └── page.tsx              # Home page
│   │   └── api/                      # API routes
│   ├── components/                   # Shared components
│   │   ├── ui/                       # Shadcn UI components
│   │   ├── auth/                     # Auth-related components
│   │   └── layout/                   # Layout components
│   ├── lib/                          # Utility functions
│   │   ├── auth/                     # Auth utilities
│   │   ├── db/                       # MongoDB connection
│   │   └── email/                    # Email sending utility
│   ├── store/                        # Zustand store
│   ├── styles/                       # Global styles
│   │   └── *.module.styl             # Stylus modules
│   └── messages/                     # i18n messages
```

## Customization

### Theming

You can customize the theme by editing:

- `tailwind.config.ts` for Tailwind CSS
- `src/app/globals.css` for global styles
- Individual `.module.styl` files for component-specific styles

### Adding New Components

Use the Shadcn UI CLI to add new components:

```bash
npx @shadcn/ui add [component-name]
```

### Adding New Locales

1. Add the new locale code to the `locales` array in `next.config.js`
2. Create a new message file in the `src/messages` directory

## Deployment

This project includes a GitHub Actions workflow for deploying to a Linux server with a pre-existing MongoDB database. See `.github/workflows/deploy.yml` for details.

## License

MIT
