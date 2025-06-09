// 👤 API ENDPOINT: Obtener o crear usuario
// POST /api/users/get-or-create

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface GetOrCreateUserRequest {
  walletAddress: string;
  email?: string;
  name?: string;
}

interface GetOrCreateUserResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      walletAddress: string;
      email?: string;
      name?: string;
      createdAt: Date;
      isNew: boolean;
    };
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetOrCreateUserResponse>
) {
  // ✅ VALIDAR MÉTODO
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      error: 'Only POST method is supported'
    });
  }

  try {
    // 📝 EXTRAER Y VALIDAR DATOS
    const { walletAddress, email, name }: GetOrCreateUserRequest = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        error: 'walletAddress is required'
      });
    }

    // Normalizar dirección de wallet (lowercase)
    const normalizedAddress = walletAddress.toLowerCase();

    console.log('👤 [API] Getting or creating user:', { normalizedAddress, email, name });

    // 🔍 INTENTAR ENCONTRAR USUARIO EXISTENTE
    let user = await prisma.user.findUnique({
      where: { walletAddress: normalizedAddress }
    });

    let isNew = false;

    // 🆕 CREAR USUARIO SI NO EXISTE
    if (!user) {
      console.log('👤 [API] User not found, creating new user...');
      
      user = await prisma.user.create({
        data: {
          id: normalizedAddress, // Usar la dirección como ID
          walletAddress: normalizedAddress,
          email: email || null,
          name: name || `User ${normalizedAddress.slice(0, 8)}...`,
          participations: 0,
          totalWinnings: '0',
          isActive: true
        }
      });

      isNew = true;
      console.log('✅ [API] User created successfully:', user.id);
    } else {
      console.log('✅ [API] User found:', user.id);
    }

    // 📤 RESPONDER CON DATOS DEL USUARIO
    return res.status(200).json({
      success: true,
      message: isNew ? 'User created successfully' : 'User found',
      data: {
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          email: user.email || undefined,
          name: user.name || undefined,
          createdAt: user.createdAt,
          isNew
        }
      }
    });

  } catch (error) {
    console.error('❌ [API] Error in get-or-create user:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  } finally {
    await prisma.$disconnect();
  }
}
