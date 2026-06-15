---
Task ID: 1
Agent: main
Task: Add login system with email + 3-question guest limit

Work Log:
- Read existing page.tsx (already had basic auth state: userEmail, showLogin, etc.)
- Added guestQuestionCount state and MAX_GUEST_QUESTIONS=3 constant
- Added loginReason state ('welcome' | 'limit') to differentiate modal content
- Added canSendChat(), incrementGuestCount(), showLimitModal(), handleContinueAsGuest() functions
- Modified handleSendChat() and handleMainInput() to check guest limits before sending
- Updated login modal: shows "Bienvenue sur WS" for welcome, "Limite atteinte" for limit reached
- Added "Continuer sans compte (3 questions gratuites)" button (hidden when limit reached)
- Added guest counter banner on home view (amber when questions remain, red when limit reached)
- Added guest counter banner above chat input in write panel
- Updated sidebar footer: shows "Invité" + remaining questions + login button for guests
- Updated standalone index.html with same logic (JS + HTML + CSS)
- Copied updated index.html to public/ folder
- Tested all flows with agent-browser + VLM analysis

Stage Summary:
- Login modal shows on first visit with "Continue as guest" option
- Guest users get 3 free AI questions tracked in localStorage (ws_guest_count)
- After 3 questions, red banner shows "Limite atteinte" and modal forces login
- Logged-in users have no limit; sidebar shows name + email + logout button
- Both page.tsx and index.html have consistent login + guest limit logic
