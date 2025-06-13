# 🔧 Administration Guide - TimbaDAO

## 🚀 Production Draw Execution

### Prerequisites
1. **Configure environment variables** in the `.env` file:
```bash
# Admin key for production draw execution
ADMIN_KEY=TimbaDAO2025_SuperSecretAdmin_Key_Change_In_Production

# Database (already configured)
DATABASE_URL="your_database_url_here"

# Other necessary variables...
```

### 📡 Available Endpoints

#### 1. Draw with Random Numbers
```bash
curl -X POST http://127.0.0.1:3000/api/admin/execute-production-draw \
  -H "Content-Type: application/json" \
  -d '{
    "adminKey": "TimbaDAO2025_SuperSecretAdmin_Key_Change_In_Production"
  }'
```

#### 2. Draw with Specific Numbers (For Testing)
```bash
curl -X POST http://127.0.0.1:3000/api/admin/execute-production-draw \
  -H "Content-Type: application/json" \
  -d '{
    "adminKey": "TimbaDAO2025_SuperSecretAdmin_Key_Change_In_Production",
    "winningNumbers": [45]
  }'
```

#### 3. For Localhost (Development)
```bash
curl -X POST http://localhost:3000/api/admin/execute-draw \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 🔒 Production Security

1. **Change the ADMIN_KEY** to a unique and secure key
2. **Always use HTTPS** in production
3. **Restrict access by IP** if possible
4. **Audit logs** - all draws are recorded

### 📊 Expected Response

```json
{
  "success": true,
  "message": "Draw executed successfully in production",
  "result": {
    "winningNumbers": [45],
    "winners": [...],
    "totalPrizePool": "1000000000000000000",
    "drawId": "draw_1234567890",
    "executedAt": "2025-06-13T10:30:00.000Z",
    "environment": "production"
  }
}
```

### 🛠️ Other Administration Endpoints

#### Check Pending Bets
```bash
curl -X GET http://127.0.0.1:3000/api/admin/check-pending \
  -H "x-admin-key: TimbaDAO2025_SuperSecretAdmin_Key_Change_In_Production"
```

#### View Latest Games
```bash
curl -X GET http://127.0.0.1:3000/api/admin/latest-games \
  -H "x-admin-key: TimbaDAO2025_SuperSecretAdmin_Key_Change_In_Production"
```

### 🎯 Recommended Workflow

1. **Check pending bets** with `/api/admin/check-pending`
2. **Execute draw** with `/api/admin/execute-production-draw`
3. **Verify results** with `/api/admin/latest-games`

### ⚠️ Important Notes

- Draws are **irreversible**
- Each draw processes **all pending bets**
- Prizes are distributed **automatically**
- NGOs receive their percentage **instantly**

---

## 🧪 Development Mode & Testing

### 🎮 Testing Menu in Development

When you run `npm run dev`, you'll have access to a comprehensive testing menu that includes:

#### 🔧 Administration Panel
- **Execute draws** manually
- **Specific numbers** for testing
- **System status** verification
- **Real-time logs**

#### 🎯 Testing Modes
- **Normal Mode**: Random draws
- **Win Mode**: Forces a victory for testing
- **Lose Mode**: Forces a loss for testing
- **Specific Numbers**: Define the winning number

#### 🔄 Debug Tools
- **Real-time bet status**
- **Automatic results refresh**
- **Detailed transaction logs**
- **Multi-user simulation**

### 🚀 Development Commands

```bash
# Run in development mode (includes testing menu)
npm run dev

# Run in production mode
npm run build
npm start

# Check database
npm run db:studio
```

---

## 🔐 Required Environment Variables

Make sure you have these variables in your `.env` file:

```bash
# ADMINISTRATION
ADMIN_KEY=TimbaDAO2025_SuperSecretAdmin_Key_Change_In_Production

# DATABASE
DATABASE_URL="postgresql://user:password@localhost:5432/timbadao"

# BLOCKCHAIN (Mantle Network)
NEXT_PUBLIC_CHAIN_ID=5000
NEXT_PUBLIC_RPC_URL="https://rpc.mantle.xyz"

# AUTHENTICATION (Privy)
NEXT_PUBLIC_PRIVY_APP_ID="your_privy_app_id"
PRIVY_APP_SECRET="your_privy_app_secret"

# DEVELOPMENT
NODE_ENV=production
```

---

## 🚨 Security

### Change Key in Production
```bash
# Generate secure key (Linux/Mac)
openssl rand -base64 32

# Or use a custom strong key
ADMIN_KEY="YourCustomSuperSecureKey2025_ChangeInProduction"
```

### Secure Configuration Example
```bash
# .env.production
ADMIN_KEY="prod_timbadao_admin_2025_f8k3n9x2p7q1"
NODE_ENV=production
```

---

## 📈 Monitoring & Logs

### Important Logs
- All draws are recorded in the database
- Each transaction has a unique ID
- Error and exception logs
- Complete audit trail of admin actions

### System Metrics
- Total number of players
- Daily betting volume
- Prize distribution
- System efficiency

---

## 🆘 Troubleshooting

### Common Errors

1. **"Invalid admin key"**
   - Verify ADMIN_KEY is configured correctly
   - Make sure it matches exactly (case-sensitive)

2. **"No pending bets to process"**
   - Normal if there are no pending bets
   - Check with `/api/admin/check-pending`

3. **"Database connection error"**
   - Verify DATABASE_URL in .env
   - Make sure the database is running

### Diagnostic Commands

```bash
# Check database status
npx prisma db:studio

# View real-time logs
tail -f logs/system.log

# Check configuration
npm run config:check
```

---

*Built with ❤️ to create social impact through blockchain technology*
