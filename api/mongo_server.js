import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Connect to MongoDB Atlas
mongoose
	.connect(process.env.MONGODB_URI)
	.then(() => console.log("✅ Connected to MongoDB Atlas"))
	.catch((err) => console.error("❌ MongoDB connection error:", err));

// Updated Schema for CO marks - stores multiple exam types and courses for same student
const COMarksSchema = new mongoose.Schema({
	group_id: String,
	group_name: String,
	year: Number,
	student_usn: String,
	student_name: String,
	courses: {
		type: Map,
		of: {
			course_name: String,
			exams: {
				type: Map,
				of: {
					co_data: {
						type: Map,
						of: {
							max: Number,
							obtained: Number,
						},
					},
				},
			},
		},
	},
	uploaded_by: String,
	created_at: { type: Date, default: Date.now },
	updated_at: { type: Date, default: Date.now },
});

// Create compound index for efficient querying
COMarksSchema.index({ student_usn: 1, group_id: 1 }, { unique: true });

const COMarks = mongoose.model("COMarks", COMarksSchema);

// Save/Update CO marks endpoint - ALWAYS appends to same student document
app.post("/api/co-marks/save", async (req, res) => {
	try {
		const {
			group_id,
			group_name,
			year,
			student_usn,
			student_name,
			course_code,
			course_name,
			exam_type,
			co_data,
			uploaded_by,
		} = req.body;

		// Validate required fields
		if (
			!student_usn ||
			!group_id ||
			!course_code ||
			!exam_type ||
			!co_data
		) {
			return res.status(400).json({
				success: false,
				message:
					"Missing required fields: student_usn, group_id, course_code, exam_type, co_data",
			});
		}

		// ALWAYS find by student_usn and group_id only (not course_code)
		let studentDoc = await COMarks.findOne({
			student_usn,
			group_id,
		});

		if (studentDoc) {
			// Document exists - append to it
			console.log(
				`📝 Found existing document for ${student_usn}, appending data...`,
			);

			// Ensure courses map exists
			if (!studentDoc.courses) {
				studentDoc.courses = new Map();
			}

			// Get existing course entry or create new one
			let courseEntry = studentDoc.courses.get(course_code);

			if (courseEntry) {
				// Course exists - add/update exam type
				console.log(
					`  → Course ${course_code} exists, adding/updating ${exam_type}`,
				);
				courseEntry.exams.set(exam_type, {
					co_data: new Map(Object.entries(co_data)),
				});
			} else {
				// New course for this student
				console.log(
					`  → Adding new course ${course_code} with ${exam_type}`,
				);
				courseEntry = {
					course_name,
					exams: new Map([
						[
							exam_type,
							{
								co_data: new Map(Object.entries(co_data)),
							},
						],
					]),
				};
			}

			// Update the course in the document
			studentDoc.courses.set(course_code, courseEntry);
			studentDoc.updated_at = new Date();

			// Save the updated document
			const saved = await studentDoc.save();

			console.log(`✅ Successfully appended to document ${saved._id}`);

			res.json({
				success: true,
				documentId: saved._id,
				isNewDocument: false,
				message: `Marks appended successfully for ${student_name}`,
			});
		} else {
			// No document exists - create first one for this student
			console.log(`🆕 Creating first document for ${student_usn}`);

			const examMap = new Map();
			examMap.set(exam_type, {
				co_data: new Map(Object.entries(co_data)),
			});

			const courseMap = new Map();
			courseMap.set(course_code, {
				course_name,
				exams: examMap,
			});

			const newDoc = new COMarks({
				group_id,
				group_name,
				year,
				student_usn,
				student_name,
				courses: courseMap,
				uploaded_by,
				created_at: new Date(),
				updated_at: new Date(),
			});

			const saved = await newDoc.save();

			console.log(`✅ Created new document ${saved._id}`);

			res.json({
				success: true,
				documentId: saved._id,
				isNewDocument: true,
				message: `First marks entry created for ${student_name}`,
			});
		}
	} catch (err) {
		console.error("❌ Error saving CO marks:", err);

		// Check if it's a duplicate key error
		if (err.code === 11000) {
			return res.status(500).json({
				success: false,
				message: "Duplicate entry detected. Please try again.",
			});
		}

		res.status(500).json({
			success: false,
			message: err.message,
		});
	}
});

// Get CO marks for a specific student in a group
app.get("/api/co-marks/:student_usn/:group_id", async (req, res) => {
	try {
		const { student_usn, group_id } = req.params;

		const marks = await COMarks.findOne({
			student_usn,
			group_id,
		});

		if (!marks) {
			return res.status(404).json({
				success: false,
				message: "No marks found for this student",
			});
		}

		// Convert Maps to Objects for JSON response
		const coursesObj = {};
		for (const [courseCode, courseData] of marks.courses.entries()) {
			const examsObj = {};
			for (const [examType, examData] of courseData.exams.entries()) {
				examsObj[examType] = {
					co_data: Object.fromEntries(examData.co_data),
				};
			}
			coursesObj[courseCode] = {
				course_name: courseData.course_name,
				exams: examsObj,
			};
		}

		res.json({
			success: true,
			data: {
				...marks.toObject(),
				courses: coursesObj,
			},
		});
	} catch (err) {
		console.error("Error fetching CO marks:", err);
		res.status(500).json({
			success: false,
			message: err.message,
		});
	}
});

// Get all marks for a group
app.get("/api/co-marks/group/:group_id", async (req, res) => {
	try {
		const { group_id } = req.params;

		const allMarks = await COMarks.find({ group_id });

		const formattedMarks = allMarks.map((marks) => {
			const coursesObj = {};
			for (const [courseCode, courseData] of marks.courses.entries()) {
				const examsObj = {};
				for (const [examType, examData] of courseData.exams.entries()) {
					examsObj[examType] = {
						co_data: Object.fromEntries(examData.co_data),
					};
				}
				coursesObj[courseCode] = {
					course_name: courseData.course_name,
					exams: examsObj,
				};
			}

			return {
				...marks.toObject(),
				courses: coursesObj,
			};
		});

		res.json({
			success: true,
			data: formattedMarks,
			count: formattedMarks.length,
		});
	} catch (err) {
		console.error("Error fetching group marks:", err);
		res.status(500).json({
			success: false,
			message: err.message,
		});
	}
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
