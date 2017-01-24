var mongoose = require('mongoose')

var DeviceSchema = new mongoose.Schema({
  id: {
    type: Number, 
    unique: true,
    index: true
  },
  type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeviceType',
    required: true
  }
})

module.exports = mongoose.model('Device', DeviceSchema)
