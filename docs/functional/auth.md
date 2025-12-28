# Authentication Module

## Overview

Handles user authentication and session management using Supabase Auth.

## Features

- Email/password signup and signin
- Google OAuth integration
- Password reset and update flows
- Session management with middleware
- Route protection

## Key Files

- [app/login/page.tsx](../../app/login/page.tsx) - Login/signup UI
- [app/auth/reset-password/page.tsx](../../app/auth/reset-password/page.tsx) - Password reset
- [utils/supabase/server.ts](../../utils/supabase/server.ts) - Server-side client
- [utils/supabase/client.ts](../../utils/supabase/client.ts) - Browser client
- [middleware.ts](../../middleware.ts) - Session middleware

## Usage

Protected routes automatically redirect unauthenticated users to login via middleware.
