var mongoose = require('mongoose')

var DeviceConfigurationSchema = new mongoose.Schema({
  id: {
    type: Number, 
    unique: true,
    index: true
  },
  device_type: {
    type: Number,
    unique: [
      true, 'A device may only have one import configuration.'
    ], 
    required: true,
    index: true
  },
  configuration: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Configuration',
    required: true
  }
})

module.exports = mongoose.model('DeviceConfiguration', DeviceConfigurationSchema)
