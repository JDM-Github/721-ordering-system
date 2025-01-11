import React, { useEffect, useState } from "react";
import RequestHandler from "../../Functions/RequestHandler";
import { DataGrid } from "@mui/x-data-grid";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AllFeedback = () => {
	const navigate = useNavigate();
	const authToken = sessionStorage.getItem("authToken");
	useEffect(() => {
		if (authToken !== "admin-token") {
			toast.error("You are not authorized to view this page.");
			navigate("/?message=invalid-auth");
		}
	}, []);
	const [feedback, setFeedback] = useState([]);

	const loadRequest = async () => {
		try {
			const data = await RequestHandler.handleRequest(
				"post",
				"product/get-feedback",
				{}
			);
			if (data.success) {
				const ord = data.feedback.map((feedback) => ({
					id: feedback.id,
					name:
						feedback.User.firstName + " " + feedback.User.lastName,
					email: feedback.User.email,
					rate: feedback.rate,
					comment: feedback.comment,
				}));
				setFeedback(ord);
			} else {
				toast.error(data.message || "Unable to load order history");
				return;
			}
		} catch (error) {
			toast.error(error.message || "Unable to load order history");
			return;
		}
	};

	useEffect(() => {
		loadRequest();
	}, []);

	const columns = [
		{
			field: "id",
			headerName: "ID",
			width: 150,
		},
		{
			field: "name",
			headerName: "Full Name",
			width: 150,
		},
		{
			field: "email",
			headerName: "Email",
			width: 100,
		},
		{
			field: "comment",
			headerName: "Comment",
			width: 350,
		},
		{
			field: "rate",
			headerName: "Rating",
			width: 100,
		},
		{ field: "createdAt", headerName: "Feedback Date", width: 100 },
	];

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
			<div className="flex justify-center w-full min-h-[80vh] p-4 max-h-[80vh]">
				<div className="bg-white shadow-lg rounded-lg p-4">
					<DataGrid
						rows={feedback}
						columns={columns}
						disableColumnSelector
						disableRowSelectionOnClick
						style={{ borderRadius: "8px" }}
						sx={{
							"& .MuiDataGrid-root": {
								border: "none",
							},
							"& .MuiDataGrid-columnHeaders": {
								backgroundColor: "#FFA500",
								color: "black",
							},
							"& .MuiDataGrid-cell": {
								borderBottom: "1px solid #f1f1f1",
							},
							"& .MuiDataGrid-footerContainer": {
								backgroundColor: "#FFF",
								borderTop: "1px solid #f1f1f1",
							},
						}}
					/>
				</div>
			</div>
		</ThemeProvider>
	);
};

export default AllFeedback;
