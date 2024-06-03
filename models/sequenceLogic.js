var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

  var userSchema = new Schema({
    seqVal: {
      type: Number
    },
    idVal : {
        type: String,
        default: "AutoVal"
    }
  });
  
  module.exports = mongoose.model('GetSequence', userSchema);