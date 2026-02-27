import { usernameExists, saveUser, getAllUsers, getUserById, updateUser, deleteUser } from '../forms/registration.js';
import bcrypt from 'bcrypt';

const testUsersModel = async () => {
    // Create a hardcoded test user
    const username = 'joe';
    const password = 'joe1234%';
    const hashedPassword = await bcrypt.hash(password, 10);
    await saveUser(username, hashedPassword);
};

export { testUsersModel };