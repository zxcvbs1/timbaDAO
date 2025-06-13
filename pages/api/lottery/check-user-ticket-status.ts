import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../src/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;
    
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ message: 'userId parameter is required' });
    }

    console.log(`✅ [API] Checking ticket status for user: ${userId}`);

    // Get the most recent ticket for this user that's still pending (only from last 2 hours)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    
    const pendingTicket = await prisma.gameSession.findFirst({
      where: {
        userId: userId.toLowerCase(),
        winningNumbers: null, // Still pending
        playedAt: {
          gte: twoHoursAgo // Only check recent tickets
        }
      },
      orderBy: {
        playedAt: 'desc'
      }
    });

    if (!pendingTicket) {
      // Check for recently completed tickets (within last 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      const recentCompletedTicket = await prisma.gameSession.findFirst({
        where: {
          userId: userId.toLowerCase(),
          winningNumbers: { not: null },
          confirmedAt: {
            gte: fiveMinutesAgo
          }
        },
        orderBy: {
          confirmedAt: 'desc'
        }
      });

      if (recentCompletedTicket) {
        return res.status(200).json({
          status: 'completed',
          ticket: {
            id: recentCompletedTicket.id,
            selectedNumbers: recentCompletedTicket.selectedNumbers,
            winningNumbers: recentCompletedTicket.winningNumbers,
            isWinner: recentCompletedTicket.isWinner,
            prizeAmount: recentCompletedTicket.prizeAmount,
            confirmedAt: recentCompletedTicket.confirmedAt
          }
        });
      }

      return res.status(200).json({ 
        status: 'no_pending_tickets',
        message: 'No pending tickets found'
      });
    }

    // Ticket is still pending
    return res.status(200).json({
      status: 'pending',
      ticket: {
        id: pendingTicket.id,
        selectedNumbers: pendingTicket.selectedNumbers,
        playedAt: pendingTicket.playedAt
      }
    });

  } catch (error) {
    console.error('❌ [API] Error checking ticket status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
