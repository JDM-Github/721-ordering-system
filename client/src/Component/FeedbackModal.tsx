import React, { useState } from "react";

const FeedbackModal = ({ isOpen, closeModal, submitFeedback, order }) => {
	const [rating, setRating] = useState(5);
	const [comment, setComment] = useState("");

	const handleRatingChange = (newRating) => {
		setRating(newRating);
	};

	const handleSubmit = () => {
		if (rating === 0) {
			alert("Please select a rating");
			return;
		}
		submitFeedback({ order, rate: rating, comment });
		closeModal();
	};

	const getEmoji = (rating) => {
		switch (rating) {
			case 1:
				return "😡"; // Very bad
			case 2:
				return "😕"; // Bad
			case 3:
				return "😐"; // Neutral
			case 4:
				return "🙂"; // Good
			case 5:
				return "😊"; // Excellent
			default:
				return "⭐"; // Default (no rating)
		}
	};

	return (
		<div
			className={`fixed inset-0 flex items-center justify-center z-50 ${
				isOpen ? "block" : "hidden"
			}`}
		>
			<div
				className="fixed inset-0 bg-gray-800 opacity-60"
				onClick={closeModal}
			></div>
			<div className="bg-white rounded-xl p-8 w-96 z-100 shadow-lg" style={{zIndex: 999}}>
				<h3 className="text-2xl font-semibold text-center text-orange-600 mb-6">
					Provide Feedback
				</h3>
				<div className="flex items-center justify-center mb-6">
					{[1, 2, 3, 4, 5].map((star) => (
						<button
							key={star}
							className={`text-4xl transition-all ${
								star <= rating
									? "text-orange-500"
									: "text-gray-400 hover:text-orange-500"
							}`}
							onClick={() => handleRatingChange(star)}
						>
							★
						</button>
					))}
				</div>
				<div className="text-3xl text-center mb-6">
					{getEmoji(rating)}{" "}
					{/* Display the emoji based on the rating */}
				</div>
				<textarea
					className="w-full p-3 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
					placeholder="Leave a comment"
					value={comment}
					onChange={(e) => setComment(e.target.value)}
				/>
				<div className="mt-6 flex justify-between">
					<button
						className="bg-gray-500 text-white py-2 px-6 rounded-md transition-all hover:bg-gray-600"
						onClick={closeModal}
					>
						Cancel
					</button>
					<button
						className="bg-orange-500 text-white py-2 px-6 rounded-md transition-all hover:bg-orange-600"
						onClick={handleSubmit}
					>
						Submit
					</button>
				</div>
			</div>
		</div>
	);
};

export default FeedbackModal;
