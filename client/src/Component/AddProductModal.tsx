import React, { useState } from "react";
import {
	Modal,
	TextField,
	Button,
	Checkbox,
	FormControlLabel,
	MenuItem,
	Select,
	InputLabel,
	FormControl,
	ToggleButton,
	ToggleButtonGroup,
} from "@mui/material";
import RequestHandler from "../Functions/RequestHandler";
import { toast } from "react-toastify";

export default function AddProductModal({
	showModal,
	setShowModal,
	isAddModal,
	currentProduct,
	handleInputChange,
	handleSave,
	loadAllProducts,
}) {
	const [currentFile, setCurrentFile] = useState<File | null>(null);
	const [newProduct, setNewProduct] = useState(currentProduct || {});
	const [selectedSize, setSelectedSize] = useState(newProduct.size || []);
	const [imagePreview, setImagePreview] = useState(
		newProduct.productImage || ""
	);

	const handleClose = () => {
		setShowModal(false);
	};

	const handleSaveProduct = async () => {
		// handleSave(newProduct);
		await createProduct();
		setShowModal(false);
	};

	const handleSizeChange = (event, newSize) => {
		setSelectedSize(newSize);
		setNewProduct({ ...newProduct, size: newSize });
	};

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		setCurrentFile(file);
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result);
				setNewProduct({ ...newProduct, productImage: reader.result });
			};
			reader.readAsDataURL(file);
		}
	};

	const createProduct = async () => {
		const toastId = toast.loading("Adding product...", {
			position: "top-center",
		});
		let imageUrl = "";
		try {
			if (currentFile && currentFile instanceof File) {
				const formData = new FormData();
				formData.append("file", currentFile);
				try {
					const data = await RequestHandler.handleRequest(
						"post",
						"file/upload-image",
						formData,
						{
							headers: {
								"Content-Type": "multipart/form-data",
							},
						}
					);
					if (data.success) {
						imageUrl = data.uploadedDocument;
					} else {
						toast.update(toastId, {
							render: data.message,
							type: "error",
							isLoading: false,
							autoClose: 3000,
							position: "top-center",
						});
						return;
					}
				} catch (error) {
					console.error("Error submitting the document:", error);
					toast.update(toastId, {
						render: "Error submitting the document",
						type: "error",
						isLoading: false,
						autoClose: 3000,
						position: "top-left",
					});
				}
			}

			const data = await RequestHandler.handleRequest(
				"post",
				"product/create",
				{
					productImage: imageUrl,
					productName: newProduct.productName,
					price: newProduct.price,
					size: newProduct.size,
					stocks: newProduct.stocks,
					description: newProduct.description,
					isCustomizable: newProduct.isCustomizable,
				}
			);

			if (data.success) {
				toast.update(toastId, {
					render: "Product added successfully!",
					type: "success",
					isLoading: false,
					autoClose: 3000,
					position: "top-center",
				});
				loadAllProducts();
			} else {
				toast.update(toastId, {
					render: data.message,
					type: "error",
					isLoading: false,
					autoClose: 3000,
					position: "top-center",
				});
				return;
			}
		} catch (e) {
			toast.update(toastId, {
				render: `${e}`,
				type: "error",
				isLoading: false,
				autoClose: 3000,
				position: "top-center",
			});
		}
	};

	return (
		<Modal open={showModal} onClose={handleClose}>
			<div
				style={{
					backgroundColor: "white",
					padding: "20px",
					maxWidth: "500px",
					margin: "50px auto",
					borderRadius: "8px",
					overflowY: "auto",
					maxHeight: "80vh",
				}}
			>
				<h2>{!isAddModal ? "Edit Product" : "Add Product"}</h2>

				{/* Product Name */}
				<TextField
					label="Product Name"
					value={newProduct.productName || ""}
					onChange={(e) =>
						setNewProduct({
							...newProduct,
							productName: e.target.value,
						})
					}
					fullWidth
					margin="normal"
				/>

				{/* Price */}
				<TextField
					label="Price"
					value={newProduct.price || ""}
					onChange={(e) =>
						setNewProduct({ ...newProduct, price: e.target.value })
					}
					fullWidth
					margin="normal"
					type="number"
				/>

				{/* Stocks */}
				<TextField
					label="Stocks"
					value={newProduct.stocks || ""}
					onChange={(e) =>
						setNewProduct({ ...newProduct, stocks: e.target.value })
					}
					fullWidth
					margin="normal"
					type="number"
				/>

				{/* Size (Toggle Buttons) */}
				<div style={{ margin: "20px 0" }}>
					<InputLabel>Size</InputLabel>
					<ToggleButtonGroup
						value={selectedSize}
						onChange={handleSizeChange}
						aria-label="size selection"
						fullWidth
						style={{
							display: "flex",
							justifyContent: "space-evenly",
						}}
					>
						{["S", "M", "L", "XL"].map((size) => (
							<ToggleButton
								key={size}
								value={size}
								aria-label={size}
							>
								{size}
							</ToggleButton>
						))}
					</ToggleButtonGroup>
				</div>

				{/* Description */}
				<TextField
					label="Description"
					value={newProduct.description || ""}
					onChange={(e) =>
						setNewProduct({
							...newProduct,
							description: e.target.value,
						})
					}
					fullWidth
					margin="normal"
					multiline
					rows={4}
				/>

				{/* Is Customizable */}
				<FormControlLabel
					control={
						<Checkbox
							checked={newProduct.isCustomizable || false}
							onChange={(e) =>
								setNewProduct({
									...newProduct,
									isCustomizable: e.target.checked,
								})
							}
							color="primary"
						/>
					}
					label="Customizable"
				/>

				{/* Image Upload (File Input) */}
				<input
					type="file"
					accept="image/*"
					onChange={handleImageChange}
					style={{ display: "block", marginTop: "20px" }}
				/>
				{imagePreview && (
					<div
						style={{
							marginTop: "20px",
							textAlign: "center",
						}}
					>
						<img
							src={imagePreview}
							alt="Product Preview"
							style={{
								maxWidth: "100%",
								maxHeight: "300px",
								objectFit: "contain",
								margin: "10px 0",
							}}
						/>
					</div>
				)}

				{/* Save Button */}
				<Button
					variant="contained"
					color="primary"
					onClick={handleSaveProduct}
					fullWidth
					style={{ marginTop: "20px" }}
				>
					Save
				</Button>
			</div>
		</Modal>
	);
}
