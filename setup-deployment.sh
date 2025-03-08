#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Deployment Setup Script${NC}"
echo "This script will help you set up the necessary GitHub repository secrets for deployment."
echo

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}GitHub CLI (gh) is not installed. You'll need to set up the secrets manually.${NC}"
    echo "Please visit https://github.com/cli/cli#installation for installation instructions."
    echo
    echo "You need to set the following secrets in your GitHub repository:"
    echo "- SERVER_HOST: Your server's hostname or IP address"
    echo "- SERVER_USERNAME: SSH username for your server"
    echo "- SERVER_PASSWORD: SSH password for authentication"
    echo "- MONGODB_URI: MongoDB connection string"
    echo "- JWT_SECRET: JWT secret"
    echo "- SMTP_HOST: SMTP host"
    echo "- SMTP_USER: SMTP user"
    echo "- SMTP_PASS: SMTP password"
    echo "- GOOGLE_MAPS_API_KEY: Google Maps API key"
    echo "- OPENAI_API_KEY: OpenAI API key"
    exit 1
fi

# Check if logged in to GitHub
if ! gh auth status &> /dev/null; then
    echo "You need to log in to GitHub first."
    gh auth login
fi

# Get repository information
echo "Please enter your GitHub repository (format: username/repo):"
read -r REPO

# Get server information
echo "Please enter your server hostname or IP address:"
read -r SERVER_HOST

echo "Please enter your SSH username for the server:"
read -r SERVER_USERNAME

echo "Please enter your SSH password for the server:"
read -r SERVER_PASSWORD

# Get database URL
echo "Please enter your MongoDB connection string:"
read -r MONGODB_URI

# Generate NextAuth secret if not provided
echo "Please enter your JWT secret (leave blank to generate one):"
read -r JWT_SECRET

if [ -z "$Please" ]; then
    Please=$(openssl rand -base64 32)
    echo -e "${GREEN}Generated JWT secret: ${Please}${NC}"
fi

# Get email settings
echo "Please enter your SMTP host:"
read -r SMTP_HOST

echo "Please enter your SMTP user:"
read -r SMTP_USER

echo "Please enter your SMTP password:"
read -r SMTP_PASS

# Get Google Maps API key
echo "Please enter your Google Maps API key:"
read -r GOOGLE_MAPS_API_KEY

# Get OpenAI API key
echo "Please enter your OpenAI API key:"
read -r OPENAI_API_KEY

# Set GitHub secrets
echo -e "${GREEN}Setting up GitHub repository secrets...${NC}"

gh secret set SERVER_HOST --body "$SERVER_HOST" --repo "$REPO"
gh secret set SERVER_USERNAME --body "$SERVER_USERNAME" --repo "$REPO"
gh secret set SERVER_PASSWORD --body "$SERVER_PASSWORD" --repo "$REPO"
gh secret set MONGODB_URI --body "$MONGODB_URI" --repo "$REPO"
gh secret set JWT_SECRET --body "$JWT_SECRET" --repo "$REPO"
gh secret set SMTP_HOST --body "$SMTP_HOST" --repo "$REPO"
gh secret set SMTP_USER --body "$SMTP_USER" --repo "$REPO"
gh secret set SMTP_PASS --body "$SMTP_PASS" --repo "$REPO"

echo -e "${GREEN}Setup complete!${NC}"
echo "Your GitHub repository is now configured for automatic deployment."
echo "Push to the main branch or manually trigger the workflow from the Actions tab to deploy." 