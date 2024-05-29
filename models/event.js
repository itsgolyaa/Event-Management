var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

  var userSchema = new Schema({
    UserToken: {
      type: String,
      required: [true, "No token passed!!! "],
    },
    event: {
      type: String,
      trim: true,
      required: [true, "event is required"],
  
    },
    Date: {
      type: Date,
      required: [true, "Date required"]
    },
    Participants : {
      type: Array
    },
    created: {
      type: Date,
      default: Date.now
    }
  });
  
  module.exports = mongoose.model('AddEvent', userSchema);