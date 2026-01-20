## ADDED Requirements

### Requirement: User Registration
The system SHALL allow new users to create accounts using email or social login providers.

#### Scenario: Email registration
- **WHEN** a user visits the signup page and provides email and password
- **THEN** a new account is created with email verification required
- **AND** a verification email is sent to the provided address
- **AND** the user is prompted to verify their email before accessing the dashboard

#### Scenario: Social login registration
- **WHEN** a user clicks "Sign up with Google" or "Sign up with Microsoft"
- **THEN** they are redirected to the OAuth provider for authentication
- **AND** upon successful authentication, an account is created automatically
- **AND** the user is redirected to the dashboard

#### Scenario: Duplicate email registration
- **WHEN** a user attempts to register with an email that already exists
- **THEN** the system displays an error message
- **AND** suggests logging in instead

### Requirement: User Login
The system SHALL authenticate users and establish secure sessions.

#### Scenario: Successful login with email
- **WHEN** a user provides correct email and password credentials
- **THEN** a session is created with secure HTTP-only cookie
- **AND** the user is redirected to the dashboard
- **AND** the session persists across browser refresh

#### Scenario: Failed login attempt
- **WHEN** a user provides incorrect credentials
- **THEN** an error message is displayed
- **AND** the login attempt is logged
- **AND** after 5 failed attempts, the account is temporarily locked

#### Scenario: Social login
- **WHEN** a user clicks "Log in with Google" or "Log in with Microsoft"
- **THEN** they are redirected to the OAuth provider
- **AND** upon successful authentication, a session is established
- **AND** the user is redirected to the dashboard

### Requirement: Protected Routes
The system SHALL restrict access to authenticated pages based on user session.

#### Scenario: Unauthenticated access attempt
- **WHEN** an unauthenticated user attempts to access /dashboard
- **THEN** they are redirected to /login
- **AND** the original URL is stored for post-login redirect

#### Scenario: Authenticated access
- **WHEN** an authenticated user navigates to /dashboard
- **THEN** the dashboard is displayed
- **AND** user information is available in the session

#### Scenario: Authenticated user accessing login page
- **WHEN** an already logged-in user visits /login
- **THEN** they are automatically redirected to /dashboard

### Requirement: Session Management
The system SHALL maintain secure user sessions with appropriate timeout and refresh logic.

#### Scenario: Session persistence
- **WHEN** a user logs in and closes the browser
- **THEN** upon reopening, the session is still active (if not expired)
- **AND** the user remains logged in

#### Scenario: Session expiration
- **WHEN** a user session exceeds the configured timeout period (7 days default)
- **THEN** the user is automatically logged out
- **AND** redirected to the login page on next access

#### Scenario: Session revocation
- **WHEN** a user clicks the logout button
- **THEN** the session is immediately invalidated
- **AND** the session cookie is cleared
- **AND** the user is redirected to the home page

### Requirement: Password Reset
The system SHALL provide a secure password reset flow for users who forgot their password.

#### Scenario: Password reset request
- **WHEN** a user clicks "Forgot password" and provides their email
- **THEN** a password reset email is sent (if the email exists)
- **AND** the email contains a secure time-limited reset link
- **AND** the same success message is shown regardless of email existence (security)

#### Scenario: Password reset completion
- **WHEN** a user clicks the reset link and provides a new password
- **THEN** the password is updated securely
- **AND** all existing sessions for that user are invalidated
- **AND** the user is prompted to log in with the new password

#### Scenario: Expired reset link
- **WHEN** a user clicks a password reset link older than 1 hour
- **THEN** an error message is displayed
- **AND** the user is prompted to request a new reset link

### Requirement: Email Verification
The system SHALL require email verification for new accounts created with email.

#### Scenario: Verification email sent
- **WHEN** a user signs up with email
- **THEN** a verification email is sent immediately
- **AND** the email contains a secure time-limited verification link

#### Scenario: Email verification success
- **WHEN** a user clicks the verification link
- **THEN** their email is marked as verified
- **AND** they are granted full access to the dashboard

#### Scenario: Unverified email access restriction
- **WHEN** a user logs in with an unverified email
- **THEN** they see a prompt to verify their email
- **AND** access to dashboard features is restricted until verification

#### Scenario: Resend verification email
- **WHEN** a user clicks "Resend verification email"
- **THEN** a new verification email is sent
- **AND** previous verification links are invalidated

### Requirement: User Profile Management
The system SHALL allow users to view and update their profile information.

#### Scenario: View profile
- **WHEN** a user navigates to /account
- **THEN** their profile information is displayed (name, email, account created date)
- **AND** subscription information is shown (plan, status, renewal date)

#### Scenario: Update profile
- **WHEN** a user updates their name or business information
- **THEN** the changes are saved to the database
- **AND** a success message is displayed

#### Scenario: Change password
- **WHEN** a user provides current password and new password
- **THEN** the current password is verified
- **AND** the new password is securely hashed and stored
- **AND** all other sessions are invalidated (except current)

### Requirement: API Authentication
The system SHALL authenticate API requests using session tokens.

#### Scenario: Authenticated API request
- **WHEN** an API request includes a valid session token
- **THEN** the user ID is extracted from the token
- **AND** the request is processed with user context

#### Scenario: Unauthenticated API request
- **WHEN** an API request to a protected endpoint has no session token
- **THEN** the request is rejected with 401 Unauthorized
- **AND** the response includes a JSON error message

#### Scenario: Expired session token
- **WHEN** an API request includes an expired session token
- **THEN** the request is rejected with 401 Unauthorized
- **AND** the client is prompted to re-authenticate

### Requirement: User Database Sync
The system SHALL sync authentication provider user data with the application database.

#### Scenario: New user created webhook
- **WHEN** Clerk sends a user.created webhook
- **THEN** a new record is created in the users table
- **AND** the Clerk user ID is stored as the primary identifier
- **AND** basic profile information is synced (email, name, creation date)

#### Scenario: User updated webhook
- **WHEN** Clerk sends a user.updated webhook
- **THEN** the corresponding database record is updated
- **AND** profile changes are reflected in the application

#### Scenario: User deleted webhook
- **WHEN** Clerk sends a user.deleted webhook
- **THEN** the user's data is anonymized or deleted (per retention policy)
- **AND** associated subscription and usage data handling is triggered

### Requirement: Login Page UI
The system SHALL provide a branded login page consistent with the application design.

#### Scenario: Login page display
- **WHEN** a user navigates to /login
- **THEN** a console-themed login page is displayed
- **AND** includes email/password fields
- **AND** includes social login buttons (Google, Microsoft)
- **AND** includes "Forgot password" link
- **AND** includes "Don't have an account? Sign up" link

### Requirement: Signup Page UI
The system SHALL provide a branded signup page consistent with the application design.

#### Scenario: Signup page display
- **WHEN** a user navigates to /signup
- **THEN** a console-themed signup page is displayed
- **AND** includes email, password, and name fields
- **AND** includes social signup buttons (Google, Microsoft)
- **AND** includes Terms of Service and Privacy Policy agreement checkbox
- **AND** includes "Already have an account? Log in" link

### Requirement: Account Page UI
The system SHALL provide an account management page for users to view and edit their profile.

#### Scenario: Account page display
- **WHEN** an authenticated user navigates to /account
- **THEN** their profile information is displayed
- **AND** editable fields are shown (name, business name)
- **AND** password change form is available
- **AND** account deletion option is shown (with confirmation)
- **AND** subscription details are displayed

### Requirement: Header Authentication State
The landing page header SHALL display different content based on authentication state.

#### Scenario: Unauthenticated user header
- **WHEN** an unauthenticated user views the landing page
- **THEN** "Log In" and "Sign Up" buttons are displayed in the header

#### Scenario: Authenticated user header
- **WHEN** an authenticated user views the landing page
- **THEN** a user avatar or name is displayed in the header
- **AND** a dropdown menu provides links to Dashboard, Account, and Logout
