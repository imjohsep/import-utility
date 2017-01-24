var mongoose = require('mongoose')

var DeviceTypeSchema = new mongoose.Schema({
  id: {
    type: Number,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  config: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model('DeviceType', DeviceTypeSchema)
