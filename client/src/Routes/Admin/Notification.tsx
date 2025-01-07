import React, { useState, useEffect } from "react";
import RequestHandler from "../../Functions/RequestHandler";
import { toast } from "react-toastify";
import { DataGrid } from "@mui/x-data-grid";

function Notification({ user }) {
	const [notifications, setNotifications] = useState([]);
	const [page, setPage] = useState(0);
	const [pageSize, setPageSize] = useState(5);
	const [rowCount, setRowCount] = useState(0);
	const [loading, setLoading] = useState(false);

	const loadRequest = async (page, pageSize) => {
		setLoading(true);
		try {
			const data = await RequestHandler.handleRequest(
				"post",
				"user/get-all-notification",
				{
					id: user?.id,
					page: page + 1,
					pageSize,
				}
			);
			if (data.success) {
				setNotifications(data.notifications || []);
				setRowCount(data.totalCount || 0);
			} else {
				toast.error(data.message || "Unable to fetch notifications");
			}
		} catch (error) {
			toast.error(error.message || "Unable to fetch notifications");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadRequest(page, pageSize);
	}, [page, pageSize]);

	const columns = [
		{ field: "id", headerName: "ID", width: 90 },
		{ field: "title", headerName: "Title", flex: 1 },
		{ field: "message", headerName: "Message", flex: 2 },
		{ field: "createdAt", headerName: "Created At", flex: 1 },
	];

	return (
		<div className="lg:p-10 lg:px-20 bg-gray-100 min-h-screen">
			<h1 className="text-3xl font-bold mb-6 text-gray-800">
				Notifications
			</h1>
			<div className="bg-white shadow-lg rounded-lg p-6">
				<DataGrid
					rows={notifications}
					columns={columns}
					pageSize={pageSize}
					onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
					rowsPerPageOptions={[5, 10, 20]}
					pagination
					paginationMode="server"
					onPageChange={(newPage) => setPage(newPage)}
					rowCount={rowCount}
					loading={loading}
				/>
			</div>
		</div>
	);
}

export default Notification;
