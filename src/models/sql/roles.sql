INSERT INTO roles (role_name, role_description)
VALUES
    ('pending employee', 'Base user role that can only access the home page'),
    ('employee', 'Standard employee'),
    ('admin', 'Administrator with full editing, deleting, and role changing permissions')
ON CONFLICT (role_name) DO NOTHING;