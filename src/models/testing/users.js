import { usernameExists, saveUser, getAllUsers, getUserById, updateUser, deleteUser } from '../forms/registration.js';
import bcrypt from 'bcrypt';

const testUsersModel = async () => {
    // Create a hardcoded test user
    /*const username = 'joe3';
    const password = 'joe1234%';
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await saveUser(username, hashedPassword);*/
    
    await updateUser(3, 'bob', 'admin');
    await deleteUser(1);
};

export { testUsersModel };