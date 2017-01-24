import fs from 'fs'

/* Mongo */
import mongoose from 'mongoose'
import generator from './models/generator'
mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost/august_home')
mongoose.connection.on('error', () => {
  console.info('Error: Could not connect to MongoDB. Did you forget to run `mongod`?')
})

import DeviceType from './models/device_type'

const Schema = mongoose.Schema

/**
 * Manufacturing Import Utility
 * 
 * Handles the creation of device configuration
 */
export class ImportUtility {
  /**
   * Import a device configuration schema.
   * The provided file needs to be a csv.
   * We'll be able to expand support for other file types 
   * in the future. 
   * 
   * @param {String} deviceType
   * @param {String} pathToFile
   */
  importConfiguration(deviceType, pathToFile) {
    let validFile = this.validFile(pathToFile, 'csv')
    
    if (validFile) {
      this.deviceTypeExists(deviceType).exec((err, result) => {
        if (result.length > 0) {
          console.log(`Device type "${deviceType}" alread exists. We are currenlty not allowing updates to configurations`)
        } else {
          let configurationData = this.readConfigurationFile(pathToFile)
          this.loadConfiguration(deviceType, configurationData)
        }
      })
    }
  }

  /**
   * Proccess data files from a manufacturer.
   * We are currently working with names of devices
   * to look up device type. 
   * 
   * @param {String} deviceType
   * @param {String} pathToFile
   */
  importManufacturingData(deviceType, pathToFile) {
    // We are only allowing csv at the momment.
    let validFile = this.validFile(pathToFile, 'csv')

    // We have a device type configuration
    this.deviceTypeExists(deviceType).exec((err, result) => {
      if (result.length > 0) {
        let manufacturingData = this.readManufacturerFile(pathToFile)
        this.loadManufacturingData(deviceType, manufacturingData, result[0])
      } else {
        console.log('This device type does not exist. Please upload a configuration file for', deviceType)
      }
    })
  }

  /**
   * Insert new manufacturing data for devices.
   * This is a rather large method. We should consider
   * refactoring it.
   *
   * @param {String} deviceType
   * @param {Array} manufacturingData
   * @param {Object} configuration
   */
  loadManufacturingData(deviceType, manufacturingData, configuration) {
    let model

    try {
      model = mongoose.model(deviceType)
    } catch(error) {
      let schema = generator.convert(JSON.parse(configuration.config))
      let modelSchema = new Schema(schema)
      model = mongoose.model(deviceType, modelSchema)
    }

    let successes = 0,
        failures = 0,
        loadErrors = [],
        docs = [],
        validationErrors = []
    
    manufacturingData.forEach((row) => {
      let serialNumber = row['serialNumber']
      let dataModel = new model(row)
      let error = dataModel.validateSync()

      if (error) {
        failures += 1
        error.errors.forEach((err) => {
          validationErrors.push(err.message)
        })
        let loadError = {serialNumber: valdatationErrors}
        loadErrors.push(loadError)
      } else {
        docs.push(dataModel)
      }
    })
    
    if (validationErrors.length > 0) {
      console.log(`Failures: ${failures}`)
      console.log('Validation Errors:', validationErrors)
    } else {
      console.log('No validation errors')
    }

    model.insertMany(docs)
      .then((documents) => {
          console.log(`Successfully loaded ${documents.length}`)
      })
      .catch((err) => {
          console.log('Load Errors:', err)
      })
  }

  /**
   * Checks on the valdity of the provided path to file.
   * We are currently only using csv as a valid file type.
   * 
   * @param {String} pathToFile
   * @param {String} validFileType
   */
  validFile(pathToFile, validFileType) {
    if (typeof(pathToFile) != 'string') {
      console.log('Path to file is not a string.')
      return false
    }

    if (pathToFile.split(".").pop() != validFileType) {
      console.log(`File must be in ${validFileType} format. Sorry :(`)
      return false
    }

    try {
      return fs.statSync(pathToFile).isFile()
    } catch(e) {
      if (e.code === 'ENOENT') {
        console.log('Could not find file at path: ', pathToFile)
        return false;
      } else {
        throw e;
      }
    }
  }
  
  /**
   * Read configuration file.
   * We could combine this with the readManufacturerFile method.
   * 
   * @param {String} pathToFile
   */
  readConfigurationFile(pathToFile) {
    let data = fs.readFileSync(pathToFile)
    let csvData = data.toString().split('\n')
    let configurationData = this.rowsToObject(csvData)
    return configurationData
  }

  /**
   * Read manufacturer data file.
   * We could combine this with the readConfigurationFile method.
   * 
   * @param {String} pathToFile
   */
  readManufacturerFile(pathToFile) {
    let data = fs.readFileSync(pathToFile)
    let csvData = data.toString().split('\n')
    let manufacturingData = this.rowsToObject(csvData)
    return manufacturingData
  }

  /**
   * Parse csv into an object
   * 
   * @param {Array} rows
   */
  rowsToObject(rows) {
    let result = []
    let headers=rows.shift(0).split(',')
    
    rows.forEach((row) => {
      let obj = {}
      let columns = row.split(',')
      columns.forEach((column, index) => {
        obj[headers[index]] = column
      })
      result.push(obj)
    })
    return result
  }

  /**
   * Load up the formated configuration into the
   * device type collection.
   * 
   * @param {String} deviceType
   * @param {Object} configurationData
   */
  loadConfiguration(deviceType, configurationData) {
    let schema = {}
    // let virtuals = []
    configurationData.forEach((config) => {
      if (config['Ignore'] == 'false') {
        let alias = config['dbName']
        let dbName = config['dbName']
        let unique = false
        if (config['header'] != config['dbName']) {
          alias = config['header']
          dbName = config['header']
          // virtuals.push({header: dbName})
        }

        if (config['header'] == 'serialNumber') {
          unique = true
        }

        schema[dbName] = {
          "type": this.capitalizeFirstLetter(config['type']),
          "validate": config['criteria'],
          "required": true,
          "unique": unique,
          "read": alias // Since this doesn't alias correctly we might want to do this instead https://github.com/ramiel/mongoose-aliasfield
        }
      }
    })
    console.log('schema', schema)

    // if (virtuals.length() > 0) {
    //   virtuals.forEach((virtual) => {
    //     generator.addGetter(virtual, () => {
    //       return this.dbName
    //     })
    //   })
    // }
    
    this.addDeviceType(deviceType, schema)
    console.log('##### Success! #####')
    console.log(`Configuration for "${deviceType}" has been loaded into the devicetypes collection.`)
    console.log('You can now load data into the collection using the importManufacturingData method.')
  }

  /**
   * Helper function to capitalize the first letter of a string.
   * We need this to capitalize the type of our data when generating 
   * our schema. 
   * 
   * @param {String} string
   */
  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  /**
   * Add a device type and it's configuration to the database
   * 
   * @param {String} deviceTypeName
   * @param {Object} schema
   */
  addDeviceType(deviceTypeName, schema) {
      let schemaString = JSON.stringify(schema)
      let type = new DeviceType({name:deviceTypeName, config:schemaString})
      type.save((err) => {
        if (err) console.log('Mongoose Error:', err)
      })
  }

  /**
   * Query the database for a device type.
   * 
   * @param {String} deviceType
   */
  deviceTypeExists(deviceType) {
    let query = DeviceType.find({'name':deviceType})
    return query
  }

}