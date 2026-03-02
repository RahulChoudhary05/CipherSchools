const mongoose = require('mongoose');

const columnSchema = new mongoose.Schema({
  columnName: { type: String, required: true },
  dataType: { type: String, required: true }
}, { _id: false });

const sampleTableSchema = new mongoose.Schema({
  tableName: { type: String, required: true },
  columns: [columnSchema],
  rows: { type: mongoose.Schema.Types.Mixed, required: true }
}, { _id: false });

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard']
  },
  topic: {
    type: String,
    default: 'SQL'
  },
  description: {
    type: String,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  hints: [{
    type: String
  }],
  sampleTables: [sampleTableSchema],
  expectedOutput: {
    type: {
      type: String,
      enum: ['table', 'single_value', 'column', 'count', 'row'],
      default: 'table'
    },
    columns: [String],
    value: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Assignment', assignmentSchema);
