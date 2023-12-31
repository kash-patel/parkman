import { db } from "../config/db";

// Read all or by department
const getAllRoles = async (departmentId?: string) => {
	try {
		const queryString: string =
			"SELECT * FROM roles" +
			(departmentId ? " WHERE department_id = $1;" : ";");

		const result = await (departmentId
			? db.query(queryString, [departmentId])
			: db.query(queryString));

		return transformRows(result.rows);
	} catch (error) {
		throw error;
	}
};

// Read specifc
const getRoleById = async (id: string) => {
	try {
		const result = await db.query("SELECT * FROM roles WHERE id = $1;", [id]);
		if (result.rowCount > 0) return transformRows(result.rows);

		throw new Error("No such role.");
	} catch (error) {
		throw error;
	}
};

// Create
const createRole = async (
	name: string,
	departmentId: number,
	resourcePermissions?: {
		[resourceId: number]: number;
	}
) => {
	try {
		await db.query("INSERT INTO roles VALUES (DEFAULT, $1, $2);", [
			name,
			departmentId,
		]);

		if (!resourcePermissions) return `Created role ${name}.`;

		const roleIdResult = await db.query("SELECT max(id) FROM roles;");
		const roleId: number = roleIdResult.rows[0].max
			? roleIdResult.rows[0].max
			: 1;

		for (const [key, val] of Object.entries(resourcePermissions)) {
			await db.query(
				"INSERT INTO role_resource_permissions VALUES (DEFAULT, $1, $2, $3);",
				[roleId, key, val]
			);
		}

		const newRoleQueryResult = await db.query(
			"SELECT * FROM roles WHERE department_id = $1 AND name = $2;",
			[departmentId, name]
		);

		return transformRows(newRoleQueryResult.rows);
	} catch (error) {
		throw error;
	}
};

// Update
const updateRole = async (
	id: string,
	name?: string,
	resourcePermissions?: {
		[resourceId: number]: number;
	}
) => {
	try {
		if (name)
			await db.query("UPDATE roles SET name = $1 WHERE id = $2;", [name, id]);

		if (resourcePermissions) {
			const existingResourcePermissionsResult = await db.query(
				"SELECT resource_id, permission_id FROM role_resource_permissions WHERE role_id = $1;",
				[id]
			);

			const existingResourcePermissions: { [resourceId: number]: number } = {};

			existingResourcePermissionsResult.rows.forEach((row) => {
				existingResourcePermissions[row.resource_id] = row.permission_id;
			});

			// Add to or update DB values
			for (const [key, val] of Object.entries(resourcePermissions)) {
				if (existingResourcePermissions.hasOwnProperty(key)) {
					await db.query(
						"UPDATE role_resource_permissions SET permission_id = $1 WHERE role_id = $2 AND resource_id = $3;",
						[val, id, key]
					);
				} else {
					await db.query(
						"INSERT INTO role_resource_permissions VALUES (DEFAULT, $1, $2, $3);",
						[id, key, val]
					);
				}
			}

			// Delete DB values
			for (const key of Object.keys(existingResourcePermissions)) {
				if (!(key in Object.keys(resourcePermissions)))
					await db.query(
						"DELETE FROM role_resource_permissions WHERE role_id = $1 AND resource_id = $2;",
						[id, key]
					);
			}
		}

		const updatedRoleQueryResult = await db.query(
			"SELECT * FROM roles WHERE id = $1;",
			[id]
		);
		return transformRows(updatedRoleQueryResult.rows);
	} catch (error) {
		throw error;
	}
};

// Delete
const deleteRole = async (id: string) => {
	try {
		await db.query(
			"DELETE FROM role_resource_permissions WHERE role_id = $1;",
			[id]
		);
		await db.query("DELETE FROM roles WHERE id = $1;", [id]);
		return `Deleted role ${id} and associated resource permissions.`;
	} catch (error) {
		throw error;
	}
};

function transformRows(rows: Array<any>): {
	[roleId: number]: {
		departmentId: number;
		name: string;
	};
} {
	const roles: {
		[roleId: number]: {
			departmentId: number;
			name: string;
		};
	} = {};

	rows.forEach((row) => {
		roles[row.id] = {
			departmentId: row.department_id,
			name: row.name,
		};
	});

	return roles;
}

export const RoleService = {
	createRole,
	getAllRoles,
	getRoleById,
	updateRole,
	deleteRole,
};
