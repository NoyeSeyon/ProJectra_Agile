# Install Nodemailer Package

The email invitation system requires the `nodemailer` package.

## Installation

Run this command in the `server` directory:

```bash
npm install nodemailer
```

## Verification

After installation, start the server to verify:

```bash
cd server
node index.js
```

You should see:
```
✅ Email service initialized successfully
```

OR (if SMTP not configured):
```
⚠️  SMTP credentials not configured. Email sending will be disabled.
```

## Configuration

Update `server/config.env` with your Gmail SMTP credentials:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
```

**To get Gmail App Password:**
1. Enable 2-Factor Authentication on Gmail
2. Go to Google Account → Security → App passwords
3. Generate new app password for "Mail"
4. Copy the 16-character password to `SMTP_PASS`

## Testing

After configuration, test by sending an invitation:
1. Login as admin
2. Go to `/admin/users`
3. Click "Send Invitation"
4. Fill in your email address
5. Check your inbox for the professional invitation email

---

**Note:** Nodemailer supports many email providers (Gmail, SendGrid, Mailgun, AWS SES, etc.). The current configuration uses Gmail SMTP for simplicity.

