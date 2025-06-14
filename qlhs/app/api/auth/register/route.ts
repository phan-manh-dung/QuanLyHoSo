import { NextRequest } from 'next/server';
import UserController from '../../../../src/controllers/User';
 
export async function POST(request: NextRequest) {
  return UserController.register(request);
} 