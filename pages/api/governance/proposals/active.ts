// 📊 API ENDPOINT: Obtener propuestas activas
// GET /api/governance/proposals/active

import { NextApiRequest, NextApiResponse } from 'next';
import { governanceContract } from '../../../../src/lib/blockchain';

interface ActiveProposalsResponse {
  success: boolean;
  message: string;
  proposals?: any[];
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ActiveProposalsResponse>
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
    console.log('📊 [API] Fetching active proposals...');

    // 📊 OBTENER PROPUESTAS ACTIVAS DEL CONTRATO
    const activeProposals = await governanceContract.getActiveProposals();

    console.log(`✅ [API] Found ${activeProposals.length} active proposals`);

    // 🎯 RESPUESTA EXITOSA
    return res.status(200).json({
      success: true,
      message: 'Active proposals retrieved successfully',
      proposals: activeProposals
    });

  } catch (error) {
    console.error('❌ [API] Error fetching active proposals:', error);

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

      // Error genérico del contrato
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch proposals',
        error: error.message
      });
    }

    // Error completamente desconocido
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'An unexpected error occurred while fetching active proposals'
    });
  }
}
