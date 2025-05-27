/**
 * Database connection module
 * @adr ADR-0003
 */
import mongoose from 'mongoose';

// ADR-0003: Using MongoDB for database storage
export async function connectToDatabase(connectionString: string): Promise<void> {
  try {
    await mongoose.connect(connectionString);
    console.log('Connected to database');
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

export async function disconnectFromDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  } catch (error) {
    console.error('Database disconnection error:', error);
    throw error;
  }
}
