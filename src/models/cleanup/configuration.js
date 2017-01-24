var mongoose = require('mongoose')

var ConfigurationSchema = new mongoose.Schema({
  id: {
    type: Number, 
    unique: true,
    index: true
  },
  name: {
      type: String,
      unique: true,
      required: true
  },
  ignore: {
      type: Boolean,
      required: true,
  },
  db_name: {
      type: String
  },
  criteria: {
      type: String
  },
  type: {
      type: String
  }
})

module.exports = mongoose.model('Configuration', ConfigurationSchema)