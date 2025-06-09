import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '../../../src/generated/prisma'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    })
  }

  try {
    console.log('🔍 [API] Fetching approved ONGs...')
    
    // Get all approved ONGs from the database
    const approvedONGs = await prisma.approvedONG.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`✅ [API] Found ${approvedONGs.length} approved ONGs`)

    return res.status(200).json({
      success: true,
      ongs: approvedONGs
    })
  } catch (error) {
    console.error('❌ [API] Error fetching approved ONGs:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor al obtener ONGs aprobadas' 
    })
  }
}
