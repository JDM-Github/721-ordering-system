import React, { useState, useEffect } from "react";
import {
	Button,
	Checkbox,
	FormControlLabel,
	Modal,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import RequestHandler from "../../Functions/RequestHandler";
import { DataGrid } from "@mui/x-data-grid";
import AddProductModal from "../../Component/AddProductModal.tsx";
import MaterialsModal from "../../Component/AddMaterialModal.tsx";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Inventory = () => {
	const navigate = useNavigate();
	const authToken = sessionStorage.getItem("authToken");
	useEffect(() => {
		if (authToken !== "admin-token") {
			toast.error("You are not authorized to view this page.");
			navigate("/?message=invalid-auth");
		}
	}, []);
	const [materials, setMaterials] = useState<any>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedMaterial, setSelectedMaterial] = useState<any>(null);

	const openModal = (material = null) => {
		setSelectedMaterial(material);
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setSelectedMaterial(null);
	};

	const saveMaterial = (material) => {
		if (selectedMaterial) {
			setMaterials((prev) =>
				prev.map((mat) =>
					mat.id === selectedMaterial.id
						? { ...mat, ...material }
						: mat
				)
			);
		} else {
			setMaterials((prev) => [...prev, { id: Date.now(), ...material }]);
		}
	};

	const [isModalOpenMaterial, setIsModalOpenMaterial] = useState(false);

	const openModalMaterial = (material = null) => {
		setSelectedMaterial(material);
		setIsModalOpenMaterial(true);
	};

	const closeModalMaterial = () => {
		setIsModalOpenMaterial(false);
	};

	const [activeTab, setActiveTab] = useState("finishedProducts");
	const [showArchived, setShowArchived] = useState(false);
	const [rawMaterials, setRawMaterials] = useState<any>([]);

	const [loading, setLoading] = useState(false);
	const [finishedProducts, setProducts] = useState([]);
	const loadAllProducts = async () => {
		setLoading(true);
		try {
			const data = await RequestHandler.handleRequest(
				"get",
				"product/get-all-product",
				{}
			);
			setLoading(false);
			if (data.success === false) {
				alert(JSON.stringify(data));
			} else {
				setRawMaterials(data.materials);
				setProducts(data.products);
			}
		} catch (error) {
			alert(`An error occurred while archiving data. ${error}`);
		}
	};
	useEffect(() => {
		loadAllProducts();
	}, []);

	const handleTabClick = (tab) => {
		setActiveTab(tab);
	};

	const toggleArchivedFilter = () => {
		setShowArchived(!showArchived);
	};

	const archiveProduct = async (id) => {
		if (activeTab === "rawMaterials") {
			alert("FUCK");
			try {
				const data = await RequestHandler.handleRequest(
					"post",
					"product/archive-unarchived-material",
					{ id }
				);
				setLoading(false);
				if (data.success === false) {
					toast.error("Unable to archive/unarchived the material.");
				} else {
					toast.success(`Material successfully archived/unarchived,`);
					loadAllProducts();
				}
			} catch (error) {
				toast.error(`An error occurred while archiving data. ${error}`);
			}
		} else {
			try {
				const data = await RequestHandler.handleRequest(
					"post",
					"product/archive-unarchived-product",
					{ id }
				);
				setLoading(false);
				if (data.success === false) {
					toast.error("Unable to archive/unarchived the product.");
				} else {
					toast.success(`Product successfully archived/unarchived,`);
					loadAllProducts();
				}
			} catch (error) {
				toast.error(`An error occurred while archiving data. ${error}`);
			}
		}
	};

	const deleteProduct = async (id) => {
		if (activeTab === "rawMaterials") {
			try {
				const data = await RequestHandler.handleRequest(
					"post",
					"product/delete-material",
					{ id }
				);
				setLoading(false);
				if (data.success === false) {
					toast.error("Unable to delete the material.");
				} else {
					toast.success(`Material successfully deleted the material`);
					loadAllProducts();
				}
			} catch (error) {
				toast.error(`An error occurred while archiving data. ${error}`);
			}
		} else {
			try {
				const data = await RequestHandler.handleRequest(
					"post",
					"product/delete-product",
					{ id }
				);
				setLoading(false);
				if (data.success === false) {
					toast.error("Unable to delete the product.");
				} else {
					toast.success(`Product successfully deleted the product`);
					loadAllProducts();
				}
			} catch (error) {
				toast.error(`An error occurred while archiving data. ${error}`);
			}
		}
	};

	const filterProducts = (products) => {
		return products.filter((item) =>
			showArchived ? item.isArchive : !item.isArchive
		);
	};

	const openModalForAdd = () => {
		// setSelectedMaterial(null);
		if (activeTab === "rawMaterials") {
			openModalMaterial();
		} else {
			openModal();
		}
	};

	const theme = createTheme({
		palette: {
			primary: {
				main: "#FFA500",
			},
			background: {
				default: "#F5F5F5",
			},
		},
		typography: {
			fontFamily: "'Roboto', sans-serif",
		},
	});

	return (
		<ThemeProvider theme={theme}>
			<div className="w-5/6 p-4 overflow-y-auto">
				<div className="bg-white shadow-lg rounded-lg p-4 mb-3">
					<h1 className="border-l-4 ps-4 border-orange-500 text-2xl font-semibold text-gray-700">
						INVENTORY
					</h1>
				</div>
				<div className="bg-white shadow-lg rounded-lg p-4 justify-between flex">
					<div className="flex space-x-6">
						<Button
							variant={
								activeTab === "rawMaterials"
									? "contained"
									: "outlined"
							}
							color="primary"
							onClick={() => handleTabClick("rawMaterials")}
						>
							Raw Materials
						</Button>
						<Button
							variant={
								activeTab === "finishedProducts"
									? "contained"
									: "outlined"
							}
							color="primary"
							onClick={() => handleTabClick("finishedProducts")}
						>
							Finished Products
						</Button>
					</div>
					<div className="flex space-x-6">
						<FormControlLabel
							control={
								<Checkbox
									checked={showArchived}
									onChange={toggleArchivedFilter}
									color="primary"
								/>
							}
							label="Show Archived"
						/>

						<Button
							variant="contained"
							color="secondary"
							onClick={openModalForAdd}
							className="mb-4 ml-auto block"
						>
							Add{" "}
							{activeTab === "rawMaterials"
								? "Raw Material"
								: "Finished Product"}
						</Button>
					</div>
				</div>

				<div className="mt-4" style={{ height: 400, width: "100%" }}>
					<div className="bg-white shadow-lg rounded-lg p-4">
						<DataGrid
							disableColumnSelector
							disableRowSelectionOnClick
							initialState={{
								pagination: {
									paginationModel: { pageSize: 5 },
								},
							}}
							pageSizeOptions={[5, 10, 25]}
							rows={
								activeTab === "rawMaterials"
									? filterProducts(rawMaterials)
									: filterProducts(finishedProducts)
							}
							columns={
								activeTab === "rawMaterials"
									? [
											{
												field: "id",
												headerName: "ID",
												width: 90,
											},
											{
												field: "name",
												headerName: "Name",
												width: 180,
											},
											{
												field: "quantity",
												headerName: "Quantity",
												width: 130,
											},
											{
												field: "price",
												headerName: "Price",
												width: 130,
											},
											{
												field: "unitType",
												headerName: "Unit Type",
												width: 130,
											},
											{
												field: "actions",
												headerName: "Actions",
												width: 300,
												renderCell: (params) => (
													<>
														<Button
															variant="contained"
															color="primary"
															onClick={() =>
																openModalMaterial(
																	params.row
																)
															}
															style={{
																marginRight: 10,
															}}
														>
															Edit
														</Button>
														<Button
															variant="contained"
															color="secondary"
															onClick={() =>
																archiveProduct(
																	params.row
																		.id
																)
															}
															style={{
																marginRight: 10,
															}}
														>
															{params.row
																.isArchive
																? `Unarchived`
																: `Archive`}
														</Button>
														<Button
															variant="contained"
															color="error"
															onClick={() =>
																deleteProduct(
																	params.row
																		.id
																)
															}
														>
															Delete
														</Button>
													</>
												),
											},
									  ]
									: [
											{
												field: "id",
												headerName: "ID",
												width: 90,
											},
											{
												field: "productName",
												headerName: "Name",
												width: 180,
											},
											{
												field: "productImages",
												headerName: "Image",
												width: 80,
												renderCell: (params) => (
													<div className="bg-gray-200 center flex justify-center align-items-center">
													<img
														src={params.value[0]}
														alt={params.row.name}
														style={{
															width: 50,
															height: 50,
														}}
													/>
													</div>
												),
											},
											{
												field: "stocks",
												headerName: "Stocks",
												width: 130,
											},
											{
												field: "price",
												headerName: "Price",
												width: 130,
											},
											{
												field: "status",
												headerName: "Status",
												width: 130,
											},
											{
												field: "isCustomizable",
												headerName: "Customizable",
												width: 150,
												renderCell: (params) => (
													<span>
														{params.value
															? "Yes"
															: "No"}
													</span>
												),
											},
											{
												field: "actions",
												headerName: "Actions",
												width: 300,
												renderCell: (params) => (
													<>
														<Button
															variant="contained"
															color="primary"
															onClick={() =>
																openModal(
																	params.row
																)
															}
															style={{
																marginRight: 10,
															}}
														>
															Edit
														</Button>
														<Button
															variant="contained"
															color="secondary"
															onClick={() =>
																archiveProduct(
																	params.row
																		.id
																)
															}
															style={{
																marginRight: 10,
															}}
														>
															{params.row
																.isArchive
																? `Unarchived`
																: `Archive`}
														</Button>
														<Button
															variant="contained"
															color="error"
															onClick={() =>
																deleteProduct(
																	params.row
																		.id
																)
															}
														>
															Delete
														</Button>
													</>
												),
											},
									  ]
							}
							// checkboxSelection
						/>
					</div>
				</div>
				{isModalOpen && (
					<AddProductModal
						original={selectedMaterial}
						isOpen={isModalOpen}
						onClose={closeModal}
						onSave={loadAllProducts}
					/>
				)}
				{isModalOpenMaterial && (
					<MaterialsModal
						onClose={closeModalMaterial}
						material={selectedMaterial}
						onSave={loadAllProducts}
					/>
				)}
			</div>
		</ThemeProvider>
	);
};

export default Inventory;
