const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Defining schema
let issueSchema = new mongoose.Schema({
  issue_title: {type: String, required: true},
  issue_text: {type: String, required: true},
  created_by: {type: String, required: true},
  open: {type: Boolean, default: true},
  assigned_to: String,
  status_text: String,
  project: {type: String, required: true},
  created_on: Date,
  updated_on: Date,
});

module.exports = mongoose.model('issue', issueSchema);