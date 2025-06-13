# 🎰 TimbaDAO - Social Impact Lottery on Mantle Network

**Where Every Bet Creates Real-World Impact**

TimbaDAO revolutionizes the lottery experience by combining thrilling gameplay with meaningful social impact. Every time you play, you're not just chasing prizes – you're directly supporting verified NGOs and creating positive change in the world.

## 🌟 The Vision

In a world where entertainment often lacks purpose, TimbaDAO bridges the gap between fun and philanthropy. Our decentralized lottery platform transforms casual gaming into a force for good, where every bet becomes a donation to causes that matter.

### 💡 How It Works - Play, Win, Impact

1. **🎯 Choose Your Cause**: Select from a curated list of verified NGOs working on issues you care about
2. **🎲 Pick Your Number**: Choose a unique number from 0-99 for your lottery ticket  
3. **🤝 Make Your Impact**: A portion of every bet automatically goes to your chosen NGO
4. **🏆 Win Prizes**: Compete for prizes while knowing your participation creates real change
5. **🌍 Track Your Impact**: See exactly how your gaming contributes to social causes

## 🚀 Key Features

- **🎰 Single Number Lottery (0-99)** - Simple, fair, and transparent
- **🏥 Verified NGO Support** - Directly fund meaningful causes with every bet
- **⚡ Real-time Updates** - Live polling system for instant results
- **🔐 Secure Authentication** - Privy wallet integration for seamless access
- **⛓️ Mantle Network** - Low fees, high performance blockchain
- **✨ Neon Gaming Interface** - Immersive casino-style experience

## 🎮 How to Play & Create Impact

### Your Journey from Player to Changemaker

**🔗 Step 1: Connect Your Wallet**
- Use any Mantle-compatible wallet to join the platform
- Secure authentication via Privy ensures your assets are safe

**🏥 Step 2: Choose Your Impact**
- Browse our verified NGO partners working on diverse causes:
  - 🌱 Environmental conservation
  - 🎓 Education access
  - 🏥 Healthcare initiatives  
  - 🍲 Hunger relief
  - 💧 Clean water projects
- Each NGO is thoroughly vetted for transparency and effectiveness

**🎯 Step 3: Select Your Lucky Number**
- Pick any number from 0-99 (each number is unique per draw)
- Your number choice is your ticket to potential prizes

**💰 Step 4: Place Your Bet**
- Minimum bet: 1 MNT
- **15% goes directly to your chosen NGO**
- **80% forms the prize pool**
- **5% supports platform operations**

**🎉 Step 5: Win & Celebrate Impact**
- Wait for the draw results (automatic execution)
- Winners are determined fairly and transparently
- Whether you win or not, you've already created positive impact!

## 🛠️ Installation & Development

```bash
# Clone repository
git clone [repository-url]
cd timbaDAO

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your configurations

# Initialize database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

## 🧪 Development Testing Menu

When you run `npm run dev`, you'll access a comprehensive testing suite:

### 🎮 Admin Panel Features
- **Execute draws** manually for testing
- **Specific numbers** for controlled testing scenarios
- **System status** verification
- **Real-time logs** and debugging

### 🎯 Testing Modes
- **Normal Mode**: Completely random draws
- **Win Mode**: Forces user victory (selected number = winning number)
- **Lose Mode**: Forces user loss (selected number ≠ winning number)  
- **Specific Numbers**: Manually define the winning number

### 🔄 Debug Tools
- **Real-time bet status** monitoring
- **Automatic results refresh** after each game
- **Detailed transaction logs**
- **Multi-user simulation** capabilities

## 🏗️ Build & Production

```bash
# Build for production
npm run build

# Run in production
npm start
```
## 🔧 Administration

For system administrators, check the [Administration Guide](./ADMIN_GUIDE.md) which includes:

- 🎯 **Production draw execution**
- 🔐 **Security configuration**
- 📡 **Administration endpoints**
- 🛠️ **Required environment variables**

### Quick Command - Execute Draw

```bash
curl -X POST http://127.0.0.1:3000/api/admin/execute-production-draw \
  -H "Content-Type: application/json" \
  -d '{"adminKey": "TimbaDAO2025_SuperSecretAdmin_Key_Change_In_Production"}'
```

### 🔑 Required Environment Variables

```bash
# ADMINISTRATION (REQUIRED)
ADMIN_KEY=TimbaDAO2025_SuperSecretAdmin_Key_Change_In_Production

# DATABASE (REQUIRED)
DATABASE_URL="postgresql://user:password@localhost:5432/timbadao"

# BLOCKCHAIN - Mantle Network
NEXT_PUBLIC_CHAIN_ID=5000
NEXT_PUBLIC_RPC_URL="https://rpc.mantle.xyz"

# AUTHENTICATION - Privy
NEXT_PUBLIC_PRIVY_APP_ID="your_privy_app_id_here"
PRIVY_APP_SECRET="your_privy_app_secret_here"

# ENVIRONMENT
NODE_ENV=development
```

## 📁 Project Structure

```
timbaDAO/
├── src/
│   ├── components/         # React components
│   ├── pages/api/         # API Routes
│   ├── lib/               # Utilities and configuration
│   └── contexts/          # React contexts
├── prisma/                # Database schema
├── public/                # Static files
├── ADMIN_GUIDE.md         # Administration guide
└── README.md              # This file
```

## 🌍 Social Impact Through Gaming

### Why NGOs Love TimbaDAO

**🔄 Sustainable Funding**: Unlike traditional donations, TimbaDAO creates a continuous funding stream as players engage with the platform daily.

**🎯 Targeted Support**: Players consciously choose which causes to support, creating engaged communities around specific NGO missions.

**📊 Transparent Impact**: All transactions are blockchain-verified, ensuring NGOs receive their designated funds transparently.

**🚀 Scalable Growth**: As the gaming community grows, so does the collective impact on supported causes.

### The Multiplier Effect

Every 1 MNT bet creates multiple layers of value:
- **💰 Direct Funding**: 0.15 MNT goes immediately to the chosen NGO
- **🏆 Prize Incentive**: 0.80 MNT motivates continued participation
- **🔄 Platform Growth**: 0.05 MNT ensures sustainability and expansion
- **📈 Community Building**: Creates networks of supporters around shared causes

## 🎮 User Flow: From Entertainment to Impact

1. **🔗 Connect Wallet** - Secure Privy authentication
2. **🏥 Select NGO** - Choose your cause to support
3. **🎯 Pick Number** - Select unique number (0-99)
4. **💰 Place Bet** - Make your impact with minimum 1 MNT
5. **⏱️ Await Draw** - Automatic execution system
6. **📊 View Results** - Real-time polling updates
7. **🎉 Celebrate Impact** - See your contribution in action

## 🔐 Security & Trust

- **🛡️ Robust Authentication** via Privy wallet integration
- **🔑 Configurable Admin Keys** for production security
- **✅ Frontend & Backend Validation** at every step
- **📋 Complete Audit Logs** for full transparency
- **🔍 NGO Verification Process** ensures legitimate partnerships

## 🌐 Technology Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Backend**: Next.js API Routes  
- **Database**: PostgreSQL with Prisma ORM
- **Blockchain**: Mantle Network
- **Authentication**: Privy wallet integration
- **Styling**: CSS-in-JS with neon effects

## 📝 Project Status

✅ **Complete & Functional MVP**
- End-to-end lottery system operational
- Real-time polling implementation
- Fixed win/lose detection logic
- Production-optimized build
- Comprehensive documentation
- NGO funding mechanism active

## 🚨 Important Notes

1. **Change `ADMIN_KEY`** in production environments
2. **Configure all environment** variables properly
3. **Use HTTPS** in production deployments
4. **Verify database** configuration settings

## 🤝 Contributing to Social Impact

TimbaDAO is more than a lottery platform – it's a movement toward purposeful gaming. Join us in proving that entertainment and social good can coexist beautifully.

### For Developers
- Contribute to the open-source codebase
- Help optimize the platform for greater impact
- Build features that enhance the NGO experience

### For NGOs
- Apply to become a verified partner
- Access sustainable funding streams
- Connect with engaged communities

### For Players
- Choose causes you care about
- Play responsibly while creating impact
- Share the platform with friends to multiply the effect

---

*Built with ❤️ to prove that technology can be a force for social good*
