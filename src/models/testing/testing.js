import { usernameExists, saveUser, getAllUsers, getUserById, updateUsername, deleteUser } from '../forms/registration.js';
import { nameExists, saveProject, getAllProjects, getProjectById, updateProject, deleteProject } from '../projects.js';
import bcrypt from 'bcrypt';
import { saveTask, getTasksByProjectId, getTaskById, updateTask, deleteTask } from '../tasks.js';

const testUsersModel = async () => {
    // Create a hardcoded test user
    /*const username = 'joe3';
    const password = 'joe1234%';
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await saveUser(username, hashedPassword);*/
    
    await updateUser(3, 'bob', 'admin');
    await deleteUser(1);
};

const testProjectsModel = async () => {
    // Create a hardcoded test project
    const name = 'project1';
    const description = 'A testing project';
    const archived = false;
    const creator_id = 5; //admin user

    let project = null;

    const exists = await nameExists(name);
    let projectId = null;

    if (!exists) {
        project = await saveProject(name, creator_id, description, archived);
        projectId = project.id;
    }

    else {
        projectId = 1;
    }

    // get the project by id and display it
    project = await getProjectById(projectId);
    console.log(project);

    // get all projects and display them
    const projects = await getAllProjects();
    console.log(projects);

    // archive the project
    project = await updateProject(project.id, project.name, project.description, true);
    console.log(project);

    // delete the project
    const deleted = await deleteProject(project.id);
    console.log(deleted);
};

const testTasksModel = async () => {
    const task = await saveTask(7, 'Project244', 5, 'A hard-coded project', 2, true, 'created', null);
    console.log(task);

    console.log(await getTasksByProjectId(7));

    console.log(await getTaskById(task.id));

    const updated = await updateTask(task.id, task.project_id, 'Project255', 5, 'N/A', 2, true, 'created', null);
    console.log(updated);

    console.log(await deleteTask(updated.id));
};

export { testUsersModel, testProjectsModel, testTasksModel };