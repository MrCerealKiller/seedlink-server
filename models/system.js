/**
* @file Model for the System as stored on the database
* @author Jeremy Mallette
* @version 0.0.0
* @module Models/OutputSector
*/

// Imports ---------------------------------------------------------------------
const mongoose  = require('mongoose');
const inputSector = require('./isector');
const outputSector = require('./osector');

// Create Models ---------------------------------------------------------------
const systemSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    dropDups: true
  },
  passcode: {
    type: String,
    required: true,
    trim: true,
  },
  inputPorts: [{
    type: String,
    required: true,
    trim: true,
    sectors: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InputSector'
    }]
  }],
  outputPorts: [{
    type: String,
    required: true,
    trim: true,
    sectors: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OutputSector'
    }]
  }],
  tempWarning: {
    type: Number
  },
  tempCritical: {
    type: Number
  },
  humidityWarning: {
    type: Number
  },
  humidityCritical: {
    type: Number
  },
  pHWarning: {
    type: Number
  },
  pHCritical: {
    type: Number
  },
  waterLevelWarning: {
    type: Number
  },
  waterLevelCritical: {
    type: Number
  },
}, {timestamps: true});

const System = module.exports = mongoose.model('System', systemSchema);

// Get Sector ------------------------------------------------------------------
module.exports.getSystemById = function(id, callback) {
  System.findById(id, callback);
};

module.exports.getSystemByName = function(name, callback) {
  var query = {name: name};
  System.findOne(query, callback);
};

module.exports.getAllSystems = function(callback) {
  System.find(callback);
};

// Add Event -------------------------------------------------------------------
module.exports.addSystem = function(system, callback) {
  system.save(callback);
};

// Update Event ----------------------------------------------------------------
module.exports.updateSystem = function(system, callback) {
  System.findById(system._id, function(err, dbSystem) {
    if (err) {
      throw err;
    }

    dbSystem.name = system.name;
    dbSystem.passcode = system.passcode;
    dbSystem.inputPorts = system.inputPorts;
    dbSystem.outputPorts = system.outputPorts;
    dbSystem.tempWarning = system.tempWarning;
    dbSystem.tempCritical = system.tempCritical;
    dbSystem.humidityWarning = system.humidityWarning;
    dbSystem.humidityCritical = system.humidityCritical;
    dbSystem.pHWarning = system.pHWarning;
    dbSystem.pHCritical = system.pHCritical;
    dbSystem.waterLevelWarning = system.waterLevelWarning;
    dbSystem.waterLevelCritical = system.waterLevelCritical;

    dbSystem.save(callback);
  });
};

// Remove Event ----------------------------------------------------------------
module.exports.removeSystemById = function(id, callback) {
  System.findById(id, function(err, system) {
    if (err) {
      throw err;
    }

    if (system == null || system == undefined) {
      callback(new Error('Invalid ID'), null);
      return;
    }

    // Remove all of the children input sectors
      system.inputPorts.forEach(function(port) {
        port.sectors.forEach(function(sector) {
          inputSector.removeISectorById(sector, function(err) {
            if (err) {
              throw err;
            }
          });
        });
      });

    // Remove all of the children output sectors
    system.outputPorts.forEach(function(port) {
      port.sectors.forEach(function(sector) {
        inputSector.removeISectorById(sector, function(err) {
          if (err) {
            throw err;
          }
        });
      });
    });

    system.remove(callback);
  });
};
