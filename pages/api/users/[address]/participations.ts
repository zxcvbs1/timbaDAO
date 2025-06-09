// 👤 API ENDPOINT: Obtener participaciones del usuario
// GET /api/users/[address]/participations

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '../../../../src/generated/prisma';

const prisma = new PrismaClient();

interface UserParticipationsResponse {
  success: boolean;
  message: string;
  participations?: number;
  userInfo?: {
    id: string;
    email: string | null;
    participations: number;
    totalAmountPlayed: string;
    totalWinnings: string;
    totalContributed: string;
    totalGamesWon: number;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserParticipationsResponse>
) {
  // ✅ VALIDAR MÉTODO
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      error: 'Only GET method is supported'
    });
  }

  try {
    // 📝 EXTRAER PARÁMETROS
    const { address } = req.query;

    if (!address || typeof address !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter',
        error: 'User address is required'
      });
    }

    console.log('👤 [API] Fetching user participations for:', address);

    // 🔍 BUSCAR USUARIO Y SUS ESTADÍSTICAS
    const user = await prisma.user.findUnique({
      where: { id: address },
      select: {
        id: true,
        email: true,
        participations: true,
        totalAmountPlayed: true,
        totalWinnings: true,
        totalContributed: true,
        totalGamesWon: true
      }
    });

    if (!user) {
      // Si el usuario no existe, retornar 0 participaciones
      console.log(`ℹ️ [API] User ${address} not found, returning 0 participations`);
      
      return res.status(200).json({
        success: true,
        message: 'User not found, returning default values',
        participations: 0,
        userInfo: {
          id: address,
          email: null,
          participations: 0,
          totalAmountPlayed: '0',
          totalWinnings: '0',
          totalContributed: '0',
          totalGamesWon: 0
        }
      });
    }

    console.log(`✅ [API] User ${address} has ${user.participations} participations`);

    // 🎯 RESPUESTA EXITOSA
    return res.status(200).json({
      success: true,
      message: 'User participations retrieved successfully',
      participations: user.participations,
      userInfo: {
        id: user.id,
        email: user.email,
        participations: user.participations,
        totalAmountPlayed: user.totalAmountPlayed,
        totalWinnings: user.totalWinnings,
        totalContributed: user.totalContributed,
        totalGamesWon: user.totalGamesWon
      }
    });

  } catch (error) {
    console.error('❌ [API] Error fetching user participations:', error);

    // Manejar errores específicos
    if (error instanceof Error) {
      // Error de base de datos
      if (error.message.includes('database') || error.message.includes('prisma')) {
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: error.message
        });
      }

      // Error de validación
      if (error.message.includes('invalid') || error.message.includes('validation')) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          error: error.message
        });
      }

      // Error genérico
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch user participations',
        error: error.message
      });
    }

    // Error completamente desconocido
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'An unexpected error occurred while fetching user participations'
    });
  }
}
