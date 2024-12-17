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

const Inventory = () => {
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

	const openModalMaterial = () => {
		setIsModalOpenMaterial(true);
	};

	const closeModalMaterial = () => {
		setIsModalOpenMaterial(false);
	};

	// Handle saving a new product
	// const saveProduct = (newProduct) => {
	// 	setProducts([...products, { id: Date.now(), ...newProduct }]); // Add new product to state
	// };

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
				// alert(JSON.stringify(data.products));
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
			setRawMaterials(
				rawMaterials.map((item) =>
					item.id === id ? { ...item, archived: true } : item
				)
			);
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

	// const openModalForEdit = (product) => {
	// 	setCurrentProduct(product);
	// 	setImageShowcase(product.productImage);
	// 	setIsAddModal(false);
	// 	setShowModal(true);
	// };

	// const handleImageChange = (e) => {
	// 	const file = e.target.files[0];
	// 	if (file) {
	// 		setImage(file);
	// 	}
	// };

	// const handleInputChange = (e) => {};

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
							// paginationModel={{
							// 	pageSize: 5,
							// 	page: 0,
							// }}
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
									? // false
									  [
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
												field: "actions",
												headerName: "Actions",
												width: 200,
												renderCell: (params) => (
													<>
														<Button
															variant="contained"
															color="primary"
															// onClick={() =>
															// 	openModalForEdit(
															// 		params.row
															// 	)
															// }
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
														>
															Archive
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
												width: 150,
												renderCell: (params) => (
													<img
														src={params.value[0]}
														alt={params.row.name}
														style={{
															width: 50,
															height: 50,
														}}
													/>
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
												width: 200,
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
														>
															Archive
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
				<MaterialsModal
					isOpen={isModalOpenMaterial}
					onClose={closeModalMaterial}
					material={selectedMaterial}
					onSave={saveMaterial}
				/>
				{
					// <Modal open={showModal} onClose={() => setShowModal(false)}>
					// 	<div
					// 		style={{
					// 			backgroundColor: "white",
					// 			padding: "20px",
					// 			maxWidth: "400px",
					// 			margin: "50px auto",
					// 			borderRadius: "8px",
					// 		}}
					// 	>
					// 		<h2>
					// 			{!isAddModal ? "Edit Product" : "Add Product"}
					// 		</h2>
					// 		<TextField
					// 			label="Name"
					// 			value={currentProduct?.name}
					// 			onChange={handleInputChange}
					// 			fullWidth
					// 			margin="normal"
					// 		/>
					// 		<TextField
					// 			label="Quantity"
					// 			value={currentProduct?.quantity}
					// 			onChange={handleInputChange}
					// 			fullWidth
					// 			margin="normal"
					// 			type="number"
					// 		/>
					// 		<TextField
					// 			label="Price"
					// 			value={currentProduct?.price}
					// 			onChange={handleInputChange}
					// 			fullWidth
					// 			margin="normal"
					// 			type="number"
					// 		/>
					// 		<Button
					// 			variant="contained"
					// 			color="primary"
					// 			onClick={() => {}}
					// 			fullWidth
					// 			style={{ marginTop: "20px" }}
					// 		>
					// 			Save
					// 		</Button>
					// 	</div>
					// </Modal>
				}
			</div>
		</ThemeProvider>
	);
};

export default Inventory;
