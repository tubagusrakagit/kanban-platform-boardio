// backend/models/Column.js
const mongoose = require('mongoose');

const columnSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    columnId: {
        type: String,
        required: true,
        unique: false, 
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    order: {
        type: Number,
        default: 0,
    },
});

// Opsional: Buat Compound Index agar 'columnId' unik HANYA dalam satu proyek
// Artinya: Proyek A boleh punya 'todo', Proyek B boleh punya 'todo'.
// Tapi Proyek A tidak boleh punya DUA 'todo'.
columnSchema.index({ project: 1, columnId: 1 }, { unique: true });

const Column = mongoose.model('Column', columnSchema);

module.exports = Column;