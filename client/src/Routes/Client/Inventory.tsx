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

const Inventory = () => {
	const [activeTab, setActiveTab] = useState("rawMaterials");
	const [showArchived, setShowArchived] = useState(false);
	const [rawMaterials, setRawMaterials] = useState([
		{
			id: 1,
			name: "Wood",
			quantity: 120,
			price: 10,
			status: "In Stock",
			archived: false,
			imageUrl: "https://via.placeholder.com/100",
		},
		{
			id: 2,
			name: "Metal",
			quantity: 50,
			price: 25,
			status: "Out of Stock",
			archived: false,
			imageUrl: "https://via.placeholder.com/100",
		},
	]);

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
				setProducts(data.products);
			}
		} catch (error) {
			alert(`An error occurred while archiving data. ${error}`);
		}
	};
	useEffect(() => {
		loadAllProducts();
	}, []);

	const [showModal, setShowModal] = useState(false);
	const [showModalProduct, setShowModalProduct] = useState(false);
	const [isAddModal, setIsAddModal] = useState(false);

	const [currentProduct, setCurrentProduct] = useState();
	const [image, setImage] = useState();
	const [imageShowcase, setImageShowcase] = useState(null);

	const handleTabClick = (tab) => {
		setActiveTab(tab);
	};

	const toggleArchivedFilter = () => {
		setShowArchived(!showArchived);
	};

	const archiveProduct = (id) => {
		if (activeTab === "rawMaterials") {
			setRawMaterials(
				rawMaterials.map((item) =>
					item.id === id ? { ...item, archived: true } : item
				)
			);
		} else {
			// setProducts();
			// finishedProducts.map((item) =>
			// 	item.id === id
			// 		? { ...item, archived: !item.archived }
			// 		: item
			// )
		}
	};

	const filterProducts = (products) => {
		return products.filter((item) =>
			showArchived ? item.archived : !item.archived
		);
	};

	const openModalForAdd = () => {
		setShowModalProduct(true);
		if (activeTab === "rawMaterials") {
		} else {
			setIsAddModal(true);
		}
	};

	const openModalForEdit = (product) => {
		setCurrentProduct(product);
		setImageShowcase(product.productImage);
		setIsAddModal(false);
		setShowModal(true);
	};

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setImage(file);
		}
	};

	const handleInputChange = (e) => {};

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
												field: "imageUrl",
												headerName: "Image",
												width: 150,
												renderCell: (params) => (
													<img
														src={params.value}
														alt={params.row.name}
														style={{
															width: 50,
															height: 50,
														}}
													/>
												),
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
												field: "status",
												headerName: "Status",
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
															onClick={() =>
																openModalForEdit(
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
												field: "productImage",
												headerName: "Image",
												width: 150,
												renderCell: (params) => (
													<img
														src={params.value}
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
																openModalForEdit(
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

				<AddProductModal
					showModal={showModalProduct}
					setShowModal={setShowModalProduct}
					isAddModal={isAddModal}
					currentProduct={currentProduct}
					handleInputChange={handleInputChange}
					handleSave={null}
					loadAllProducts={loadAllProducts}
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
