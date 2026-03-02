# cse-340-final-beales

Note: Initial code draws from CSE-340 Practice Site code.

As of 2/24/2026: Code currently includes a partial outline of an Express app that doesn't really do anything yet.

Project Management Site

Project Overview:

This website is designed to provide project and other business management tools for the small business I am a part of as well as serving as my final project for CSE 340. 

Projects: This site will include projects that may be created, archives, or unarchived by admins. Each project will include a name, description, creation date, and creator. Archived projects cannot have additional tasks or subtasks added to them unless they are first unarchived.

Tasks: Each project may contain one or more tasks to be completed. Tasks work like a ticket system. An employee may submit a task for completion. Tasks include a name, description, priority, general vs delegated (see section below), status (created, accepted(if it is a delegated task), completed, archived), creator, accepting employee(if it is a delegated task), and creation date. 

General vs delegated tasks: A task may be either general or delegated. A general task is controlled by the creator (or an admin) only. They determine when the task is complete. Delegated tasks may be accepted by any, but only one, employee. Only the employee who accepted the task may mark it as complete.


Ideas for bonus features and project expansion: 

Subtasks: Subtasks would work exactly like tasks except they are attached to a task. All subtasks must be completed for a task to be considered complete.

Status Reports: When an employee changes the status of a task or subtask, they may include a report with it. For example, a completion report would include any relevant details on the completion of the task or subtask.


User roles/permissions: 

Admins: Admins have all permissions of lesser roles. They may create, archive, and unarchive projects. They may also change the status of any task (though it is recommended that they first contact the creator and/or employee who accepted the task). They may also change the role of any user (besides themself). Admins may change the role of another admin (this may be necessary if an admin account becomes compromised).

Employees: Employees are allowed to create and accept tasks as is explained above.

Pending Users: Pending users may only see the home page with information on how to contact an admin for their role to be upgraded. This is done so that anyone who registers must be verified by an admin before accessing company information.
