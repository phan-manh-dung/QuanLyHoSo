import { NextRequest } from 'next/server';
import UserController from '../../../src/controllers/User';
import { connectToDatabase } from '../../../src/configs/db';

export async function GET(request: NextRequest) {
  await connectToDatabase();
  return UserController.getUsers(request);
}
