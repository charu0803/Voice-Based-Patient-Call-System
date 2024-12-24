import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { User } from './models/User';
import Task from './models/Task';
import { Request } from './models/Request';
import Shift from './models/Shift';
import Message from './models/Message';
import { NursingDepartment, RequestPriority, RequestStatus, UserRole, UserStatus } from './types';

dotenv.config();

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('MongoDB connected for seeding...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed data
const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Task.deleteMany({});
    await Request.deleteMany({});
    await Shift.deleteMany({});
    await Message.deleteMany({});
    console.log('Existing data cleared...');

    // Insert Users (with required fields)
    const users = await User.insertMany([
      { 
        firstName: 'John', 
        lastName: 'Doe', 
        email: 'john@example.com', 
        password: bcrypt.hashSync('123456', 10), 
        role: UserRole.ADMIN,
        department: NursingDepartment.CARDIOLOGY,
        active: true,
        status: UserStatus.APPROVED,
      },
      { 
        firstName: 'Jane', 
        lastName: 'Smith', 
        email: 'jane@example.com', 
        password: bcrypt.hashSync('123456', 10), 
        role: UserRole.NURSE,
        department: NursingDepartment.INTENSIVE_CARE,
        active: true,
        status: UserStatus.PENDING,
      },
    ]);
    console.log('Users seeded:', users);

    // Insert Tasks
    const tasks = await Task.insertMany([
      { 
        description: 'Complete the documentation', 
        status: RequestStatus.PENDING,
        assignedTo: users[0]._id, 
        assignedBy: users[1]._id
      },
      { 
        description: 'Fix bugs', 
        status: RequestStatus.COMPLETED,
        assignedTo: users[1]._id, 
        assignedBy: users[0]._id
      },
    ]);
    console.log('Tasks seeded:', tasks);

    // Insert Requests
    const requests = await Request.insertMany([
      { 
        patient: users[1]._id, 
        nurse: users[0]._id, 
        priority: RequestPriority.HIGH,
        status: RequestStatus.PENDING,
        description: 'Emergency case requiring immediate attention', 
        department: NursingDepartment.EMERGENCY,
        room: 'A101', 
      },
      { 
        patient: users[0]._id, 
        nurse: users[1]._id, 
        priority: RequestPriority.MEDIUM,
        status: RequestStatus.PENDING,
        description: 'Routine check-up request', 
        department: NursingDepartment.OUTPATIENT,
        room: 'B202', 
      }
    ]);
    console.log('Requests seeded:', requests);

    // Insert Shifts
    const shifts = await Shift.insertMany([
      { 
        user: users[0]._id, 
        nurse: users[1]._id,
        createdBy: users[0]._id,
        department: NursingDepartment.CARDIOLOGY,
        startTime: '09:00', 
        endTime: '17:00', 
        date: '2024-12-19' 
      },
      { 
        user: users[1]._id, 
        nurse: users[1]._id,
        createdBy: users[0]._id,
        department: NursingDepartment.INTENSIVE_CARE,
        startTime: '10:00', 
        endTime: '18:00', 
        date: '2024-12-19' 
      },
    ]);
    console.log('Shifts seeded:', shifts);

    // Insert Messages
    const messages = await Message.insertMany([
      { sender: users[0]._id, receiver: users[1]._id, content: 'Hello! Can you finish the task?' },
      { sender: users[1]._id, receiver: users[0]._id, content: 'Yes, I’ll work on it.' },
    ]);
    console.log('Messages seeded:', messages);

    console.log('Database seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

// Run the seeding
(async () => {
  await connectDB();
  await seedData();
})();
