const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an issue title'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide an issue description'],
      trim: true,
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High'],
        message: '{VALUE} is not a valid priority. Choose Low, Medium, or High',
      },
      default: 'Medium',
    },
    status: {
      type: String,
      enum: {
        values: ['Open', 'In Progress', 'Resolved'],
        message: '{VALUE} is not a valid status. Choose Open, In Progress, or Resolved',
      },
      default: 'Open',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Issue creator is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Add text index for fast search on title and description
issueSchema.index({ title: 'text', description: 'text' });
issueSchema.index({ status: 1 });
issueSchema.index({ priority: 1 });
issueSchema.index({ assignedTo: 1 });
issueSchema.index({ createdBy: 1 });

const Issue = mongoose.model('Issue', issueSchema);

module.exports = Issue;
