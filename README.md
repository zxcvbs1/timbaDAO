# 🎰 Super Lotería Neón - Mantle Network

A decentralized lottery application built on the Mantle blockchain with social impact at its core. Players bet on 4-digit numbers, and a percentage of each bet goes to approved NGOs (ONGs) that users can vote on.

## ✨ Features

### 🎮 Core Gameplay
- **4-digit lottery system** (0-9 digits per position)
- **Social impact betting** - support approved NGOs with every bet
- **Minimum 3 matching digits to win**
- **1 MNT minimum bet amount**
- **Immediate feedback** with neon-styled UI

### 🏛️ Governance System
- **Community-driven ONG approval** via voting
- **Minimum participation requirements** (3 games to vote, 10 to propose)
- **Weighted voting system** based on participation
- **7-day voting periods** with automatic finalization

### 🔧 Development Features
- **Mock blockchain contracts** for development
- **Force draw functionality** for testing
- **Configurable minimum players** (1 in dev, 3 in production)
- **Admin panel** for development testing
- **Comprehensive logging** and error handling

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (configured via Neon)
- Mantle Network wallet for testing

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd lottery-neon-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database and Privy app ID

# Run database migrations
npm run db:push

# Seed the database with initial data
npm run db:seed

# Start development server
npm run dev
```

## 🎯 Development Configuration

### Environment Variables
```env
DATABASE_URL="your-neon-postgres-url"
NEXT_PUBLIC_PRIVY_APP_ID="your-privy-app-id"
NODE_ENV="development"  # Enables admin features
```

### Development Features

#### Admin Panel
- **Force Draw Button** - Execute lottery draws immediately for testing
- **Bypasses player requirements** - Test with any number of players
- **Mock prize distribution** - Simulate real prize calculations
- **Development-only access** - Automatically hidden in production

#### Mock Contracts
- **Complete blockchain simulation** without real transactions
- **Instant confirmations** for faster development
- **Realistic gas calculations** and transaction hashes
- **Full prize distribution logic**

### Game Configuration
```typescript
// src/lib/blockchain/config.ts
export const GAME_CONFIG = {
  numbersCount: 4,                    // 4 digits per play
  numbersRange: 9,                    // 0-9 digits
  minMatchesToWin: 3,                 // Minimum matches to win
  defaultBetAmount: '1000000000000000000', // 1 MNT in wei
  minPlayersForDraw: process.env.NODE_ENV === 'development' ? 1 : 3,
  
  // Fund distribution
  ongPercentage: 15,     // 15% to selected ONG
  ownerPercentage: 5,    // 5% to platform
  poolPercentage: 80,    // 80% to prize pool
}
```

## 🏗️ Architecture

### Frontend (Next.js 15)
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Styled Components** for neon effects
- **Privy** for wallet authentication

### Backend (API Routes)
- **Next.js API routes** for all endpoints
- **Prisma ORM** with PostgreSQL
- **Mock blockchain layer** for development
- **RESTful API design**

### Database (PostgreSQL via Neon)
- **User management** with wallet integration
- **Game session tracking**
- **ONG management and voting**
- **Transaction history**
- **Governance proposals**

## 🎮 How to Play

1. **Connect Wallet** - Use any Mantle-compatible wallet
2. **Select an ONG** - Choose which organization to support
3. **Pick 4 digits** - Each digit can be 0-9
4. **Place bet** - Minimum 1 MNT
5. **Wait for draw** - Automatic or manual (dev mode)
6. **Check results** - Win with 3+ matching digits!

## 🏛️ Governance

### Proposing ONGs
- Minimum 10 game participations required
- Submit ONG details and verification
- Community voting determines approval

### Voting on Proposals
- Minimum 3 game participations to vote
- Vote weight based on participation level
- 7-day voting period
- 60% approval threshold required

## 🔧 Development Workflow

### Testing Lottery Functionality
1. **Start development server**: `npm run dev`
2. **Connect wallet** in the application
3. **Place a bet** with any 4 digits
4. **Use admin panel** to force a draw
5. **Check results** and prize distribution

### API Endpoints
- `POST /api/users/get-or-create` - User authentication
- `POST /api/game/place-bet` - Place lottery bet
- `POST /api/game/draw-numbers` - Execute draw
- `POST /api/admin/execute-draw` - Force draw (dev only)
- `GET /api/ongs/approved` - Get approved ONGs
- `POST /api/governance/propose-ong` - Propose new ONG
- `POST /api/governance/vote` - Vote on proposal

### Database Operations
```bash
# Push schema changes
npm run db:push

# Reset database
npm run db:reset

# Seed with test data
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

## 🚀 Deployment

### Production Configuration
1. **Set NODE_ENV=production** to disable admin features
2. **Configure real blockchain endpoints** if available
3. **Update minimum players** to production values
4. **Set up proper monitoring** and error handling

### Vercel Deployment
```bash
# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard
# - DATABASE_URL
# - NEXT_PUBLIC_PRIVY_APP_ID
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Test thoroughly with admin panel
4. Submit a pull request

## 📝 License

[Add your license here]

## 🆘 Support

For issues or questions:
- Check the console logs for detailed error messages
- Use the development admin panel for testing
- Review the Prisma Studio for database state
- Check Neon dashboard for database connectivity

---

**Built with ❤️ for social impact on Mantle Network**

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
