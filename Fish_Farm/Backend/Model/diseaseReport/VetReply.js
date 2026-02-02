const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AttachmentSchema = new Schema({
  filename: String,
  path: String,        // URL path like /uploads/vetReplies/<reportId>/<file>
  contentType: String,
});

const VetReplySchema = new Schema({
  diseaseReportId: { type: Schema.Types.ObjectId, ref: "DiseaseReport", required: true },
  from: String,
  subject: String,
  bodyText: String,
  bodyHtml: String,
  attachments: [AttachmentSchema],
  messageId: { type: String, index: true, unique: true, sparse: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("VetReply", VetReplySchema);
