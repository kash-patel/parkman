import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, FormEvent, useState } from "react";
import {
	useGetRoleByIdQuery,
	useGetRoleResourcePermissionsQuery,
	useUpdateRoleMutation,
} from "../slices/rolesApiSlice";
import { useGetAccessibleResourcesQuery } from "../slices/usersApiSlice";
import BlockingLoader from "../components/BlockingLoader";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import LocalErrorDisplay from "../components/LocalErrorDisplay";

const UpdateRoleScreen = () => {
	const { roleId } = useParams();
	const navigate = useNavigate();
	const { userDetails } = useSelector((state: any) => state.auth);

	useEffect(() => {
		if (!userDetails) navigate("/login");
	}, [navigate, userDetails]);

	const getAccessibleResourcesQuery = useGetAccessibleResourcesQuery(
		userDetails ? userDetails.userId : skipToken
	);

	useEffect(() => {
		if (
			getAccessibleResourcesQuery.data &&
			getAccessibleResourcesQuery.data[6].permissionId < 3
		)
			navigate("/login");
	}, [navigate, userDetails]);

	const getRoleResourcePermissionsQuery = useGetRoleResourcePermissionsQuery(
		roleId as string
	);

	const getRoleByIdQuery = useGetRoleByIdQuery(roleId as string);

	useEffect(() => {
		if (getRoleByIdQuery.data && name == "")
			setName(getRoleByIdQuery.data[roleId as string].name);
	});

	const [updateRole, updateRoleResult] = useUpdateRoleMutation();

	const [name, setName] = useState("");

	const initialRoleResourcePermissions: {
		[resourceId: number]: {
			resourceName: string;
			permissionId: number;
		};
	} = {
		1: {
			resourceName: "Animals",
			permissionId: 1,
		},
		2: {
			resourceName: "Departments",
			permissionId: 1,
		},
		// 3: {
		// 	resourceName: "Issues",
		// 	permissionId: 1,
		// },
		// 4: {
		// 	resourceName: "Locations",
		// 	permissionId: 1,
		// },
		5: {
			resourceName: "Resources",
			permissionId: 1,
		},
		6: {
			resourceName: "Roles",
			permissionId: 1,
		},
		7: {
			resourceName: "Species",
			permissionId: 1,
		},
		// 8: {
		// 	resourceName: "Systems",
		// 	permissionId: 1,
		// },
		9: {
			resourceName: "Users",
			permissionId: 1,
		},
		10: {
			resourceName: "Vehicles",
			permissionId: 1,
		},
	};

	const [roleResourcePermissions, setRoleResourcePermissions] = useState(
		initialRoleResourcePermissions
	);

	const [didFetchResourcePermissions, setDidFetchResourcePermissions] =
		useState(false);

	if (
		!didFetchResourcePermissions &&
		getRoleResourcePermissionsQuery.data &&
		getRoleResourcePermissionsQuery.data[roleId as string]
	) {
		setRoleResourcePermissions((prevPermissions) => {
			const updatedPermissions = { ...prevPermissions }; // Create a new object

			Object.keys(
				getRoleResourcePermissionsQuery.data[roleId as string]
			).forEach((r) => {
				const resourceId = parseInt(r);
				updatedPermissions[resourceId] = {
					...updatedPermissions[resourceId], // Create a new object
					permissionId:
						getRoleResourcePermissionsQuery.data[roleId as string][r]
							.permissionId,
				};
			});

			return updatedPermissions; // Return the updated object
		});

		setDidFetchResourcePermissions(true);
	}

	const handlePermissionChange = (
		resourceId: number,
		newPermissionId: number
	) => {
		const updatedPermissions = { ...roleResourcePermissions };
		updatedPermissions[resourceId].permissionId = newPermissionId;
		setRoleResourcePermissions(updatedPermissions);
	};

	const submitHandler = async (e: FormEvent) => {
		e.preventDefault();

		try {
			const resourcePermissions: { [resourceId: number]: number } = {};
			Object.keys(roleResourcePermissions).forEach((resourceId: string) => {
				if (roleResourcePermissions[parseInt(resourceId)].permissionId > 1)
					resourcePermissions[parseInt(resourceId)] =
						roleResourcePermissions[parseInt(resourceId)].permissionId;
			});

			await updateRole({
				id: roleId as string,
				newName: name,
				newResourcePermissions: resourcePermissions,
			}).unwrap();

			navigate(
				`/departments/${
					getRoleByIdQuery.data[parseInt(roleId as string)].departmentId
				}`
			);
		} catch (err) {
			console.log(err);
		}
	};

	const isLoading =
		getAccessibleResourcesQuery.isLoading ||
		getRoleByIdQuery.isLoading ||
		getRoleResourcePermissionsQuery.isLoading ||
		updateRoleResult.isLoading;

	const hasData: boolean =
		getAccessibleResourcesQuery.data &&
		getRoleByIdQuery.data &&
		getRoleResourcePermissionsQuery.data;

	const error =
		getAccessibleResourcesQuery.error ||
		getRoleByIdQuery.error ||
		getRoleResourcePermissionsQuery.error ||
		updateRoleResult.error;

	if (isLoading) return <BlockingLoader />;
	if (!hasData) return <BlockingLoader statusCode={1} />;

	return (
		<section>
			<Link
				to={`/departments/${
					getRoleByIdQuery.data[roleId as string].departmentId
				}`}
				className="inline-block mt-8"
			>
				<p className="text-emerald-600">&larr; Back to department</p>
			</Link>
			<h1 className="mb-8">Update Role</h1>
			<form onSubmit={submitHandler} className="my-4">
				<fieldset
					disabled={getAccessibleResourcesQuery.data[6].permissionId < 3}
					className="flex flex-col justify-evenly gap-8 items-start mb-8"
				>
					<label className="w-full">
						<p>Name (required)</p>
						<input
							type="text"
							id="name"
							name="name"
							defaultValue={name}
							required
							onChange={(e) => setName(e.target.value)}
							className="w-full"
						/>
					</label>
					{error && <LocalErrorDisplay error={error} />}
				</fieldset>
				<fieldset
					disabled={getAccessibleResourcesQuery.data[6].permissionId < 3}
					className="flex flex-col justify-between gap-4 mb-8"
				>
					<h2>Role Resource Permissions</h2>
					{Object.keys(roleResourcePermissions).map((r) => (
						<label key={r} className="w-full flex flex-row justify-between">
							{roleResourcePermissions[parseInt(r)].resourceName}
							<div className="flex flex-row justify-between gap-2">
								<label className="text-center">
									<p>None</p>
									<input
										type="radio"
										id={`${r}-permission-none`}
										name={`${r}-permission`}
										value={1}
										checked={
											roleResourcePermissions[parseInt(r)].permissionId == 1
										}
										onChange={() => handlePermissionChange(parseInt(r), 1)}
									/>
								</label>
								<label className="text-center">
									<p>Read</p>
									<input
										type="radio"
										id={`${r}-permission-read`}
										name={`${r}-permission`}
										value={2}
										checked={
											roleResourcePermissions[parseInt(r)].permissionId == 2
										}
										onChange={() => handlePermissionChange(parseInt(r), 2)}
									/>
								</label>
								<label className="text-center">
									<p>Write</p>
									<input
										type="radio"
										id={`${r}-permission-write`}
										name={`${r}-permission`}
										value={3}
										checked={
											roleResourcePermissions[parseInt(r)].permissionId == 3
										}
										onChange={() => handlePermissionChange(parseInt(r), 3)}
									/>
								</label>
							</div>
						</label>
					))}
				</fieldset>
				<fieldset className="flex flex-row justify-around">
					<button
						type="submit"
						className="bg-zinc-800 hover:bg-emerald-600 transition-all px-4 py-2 mx-auto text-white rounded-md"
					>
						Update Role
					</button>
					<button
						type="button"
						onClick={() =>
							navigate(
								`/departments/${
									getRoleByIdQuery.data[roleId as string].departmentId
								}`
							)
						}
						className="bg-zinc-800 hover:bg-emerald-600 transition-all px-4 py-2 mx-auto text-white rounded-md"
					>
						Cancel
					</button>
				</fieldset>
			</form>
		</section>
	);
};

export default UpdateRoleScreen;
