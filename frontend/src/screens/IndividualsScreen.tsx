import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import {
	useGetSpeciesByIdQuery,
	useGetSpeciesIndividualsQuery,
	useDeleteSpeciesMutation,
} from "../slices/speciesApiSlice";
import { useDeleteIndividualMutation } from "../slices/individualsApiSlice";
import { useGetAccessibleResourcesQuery } from "../slices/usersApiSlice";
import BlockingLoader from "../components/BlockingLoader";
import { FaTrash } from "react-icons/fa6";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import LocalErrorDisplay from "../components/LocalErrorDisplay";

const IndividualsScreen = () => {
	const { speciesId } = useParams();
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
			getAccessibleResourcesQuery.data[1].permissionId < 2
		)
			navigate("/login");
	}, [navigate, userDetails]);

	const getIndividualsQuery = useGetSpeciesIndividualsQuery(
		parseInt(speciesId!)
	);

	const getSpeciesByIdQuery = useGetSpeciesByIdQuery(speciesId as string);

	const [deleteIndividual, deleteIndividualResult] =
		useDeleteIndividualMutation();

	const [deleteSpecies, deleteSpeciesResult] = useDeleteSpeciesMutation();

	const handleDeleteSpecies = async () => {
		try {
			await deleteSpecies(speciesId as string).unwrap();
			navigate("/species");
		} catch (error) {
			throw error;
		}
	};
	const handleDeleteIndividual = async (id: number) => {
		try {
			await deleteIndividual(id).unwrap();
		} catch (error) {
			throw error;
		}
	};

	const isLoading =
		getSpeciesByIdQuery.isLoading ||
		getIndividualsQuery.isLoading ||
		getAccessibleResourcesQuery.isLoading ||
		deleteIndividualResult.isLoading ||
		deleteSpeciesResult.isLoading;

	const hasData: boolean =
		getSpeciesByIdQuery.data &&
		getIndividualsQuery.data &&
		getAccessibleResourcesQuery.data;

	const error =
		getSpeciesByIdQuery.error ||
		getIndividualsQuery.error ||
		getAccessibleResourcesQuery.error ||
		deleteIndividualResult.error ||
		deleteSpeciesResult.error;

	if (isLoading) return <BlockingLoader />;
	if (!hasData) return <BlockingLoader statusCode={1} />;

	return (
		<section>
			<Link to={"/species"} className="inline-block mt-8">
				<p className="text-emerald-600">&larr; Back to all species</p>
			</Link>
			<h1 className="mb-8">
				{getSpeciesByIdQuery.data[speciesId as string].genusName}&nbsp;
				{getSpeciesByIdQuery.data[speciesId as string].speciesName}
			</h1>
			<p className="mb-2">
				Please note that the prehistoric animal biodiversity in Jurassic Park is
				carefully managed by the Genetic Engineering department. If you have
				questions or concerns, please do <em>not</em> contact Chief Geneticist
				Dr. Henry Wu directly.
			</p>

			{error && <LocalErrorDisplay error={error} />}
			<div className="flex flex-col justify-start items-center">
				{getAccessibleResourcesQuery.data[1].permissionId >= 3 && (
					<Link
						to={`/species/${speciesId as string}/new`}
						className="inline-block mt-4"
					>
						<p className="px-4 py-2 bg-zinc-800 hover:bg-emerald-600 transition-all text-white inline-block rounded-md">
							Add Individual
						</p>
					</Link>
				)}
				{Object.keys(getIndividualsQuery.data).length <= 0 &&
				getAccessibleResourcesQuery.data[7].permissionId >= 3 ? (
					<Link
						to={"#"}
						onClick={handleDeleteSpecies}
						className="inline-block mt-4"
					>
						<p className="text-emerald-600 hover:text-zinc-800 transition-all inline-block">
							Delete species
						</p>
					</Link>
				) : (
					<table className="mx-auto mt-4">
						<thead>
							<tr>
								<th className="px-2 py-1">ID</th>
								<th className="px-2 py-1">Name</th>
								{getAccessibleResourcesQuery.data[1].permissionId >= 3 && (
									<th className="px-2 py-1"></th>
								)}
							</tr>
						</thead>
						<tbody>
							{Object.keys(getIndividualsQuery.data).map((i: string) => (
								<tr key={i}>
									<td className="px-2 py-1">{i}</td>
									<td className="px-2 py-1">
										{getIndividualsQuery.data[i].name}
									</td>
									{getAccessibleResourcesQuery.data[1].permissionId >= 3 && (
										<td className="px-2 py-1">
											<Link
												onClick={() => handleDeleteIndividual(parseInt(i))}
												to={"#"}
											>
												<p className="text-red-600 font-semibold flex flex-col justify-center items-center">
													<FaTrash />
												</p>
											</Link>
										</td>
									)}
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		</section>
	);
};

export default IndividualsScreen;
