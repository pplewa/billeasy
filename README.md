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

   # Server-side key (used for actual API calls)
   GOOGLE_MAPS_API_KEY=your-google-maps-api-key
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

## Features

### Address Lookahead

The application includes an address autocomplete feature that uses the Google Maps Places API to suggest addresses as users type. This feature:

1. Automatically fills in address fields (street, city, zip code, country)
2. Improves data accuracy and user experience
3. Can be enabled/disabled via the `FEATURES.addressLookahead` flag in `src/lib/config.ts`

To use this feature:
1. Obtain a Google Maps API key with Places API enabled:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Navigate to "APIs & Services" > "Library"
   - Search for and enable the "Places API" and "Maps JavaScript API"
   - Go to "APIs & Services" > "Credentials"
   - Create an API key (restrict it to HTTP referrers for security)
2. Restart your development server

**Troubleshooting:**
- If you see a spinner that doesn't stop, check your browser console for errors
- Ensure your API key has the Places API enabled
- Verify that your API key doesn't have any restrictions that would block your local development environment
- If you see "API key is missing" warnings, check that your `.env.local` file contains the correct key

## Address Lookahead Setup

The application uses Google Maps Places API for address autocomplete through a secure backend implementation. This approach protects your API keys and provides better error handling.

### Setting up Google Maps API:

1. Visit the [Google Cloud Console](https://console.cloud.google.com/apis/credentials) and sign in
2. Create a project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "CREATE CREDENTIALS" > "API key"
5. Restrict the API key as needed (for production environments)
6. Enable the Places API for your project:
   - Go to "APIs & Services" > "Library"
   - Search for "Places API" and enable it

### Configuration:

Add the API key to your `.env.local` file:

```
# Server-side key (used for secure API calls)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### Using the Address Lookahead:

The address input has two modes:
1. **Lookahead Mode**: Type to search for addresses and select from suggestions
2. **Manual Mode**: Edit all address fields individually

You can toggle between modes using the button next to the address label.

### Troubleshooting:

If you're experiencing issues with address lookahead:

1. Check that your API key is correctly set in your `.env.local` file
2. Verify the Places API is enabled in your Google Cloud project
3. Check the server logs for any error messages
4. For HTTP 403 errors, check your API key restrictions
5. Make sure your API key has the Places API enabled

## Deployment

This project includes a GitHub Actions workflow for deploying to a Linux server with a pre-existing MongoDB database. See `.github/workflows/deploy.yml` for details.

## License

MIT