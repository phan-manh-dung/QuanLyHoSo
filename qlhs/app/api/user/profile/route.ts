import { NextRequest } from 'next/server';
import UserController from '../../../../src/controllers/User';

export async function GET(request: NextRequest) {
  return UserController.getProfile(request);
}

export async function PUT(request: NextRequest) {
  return UserController.updateProfile(request);
} 