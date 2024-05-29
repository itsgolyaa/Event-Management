var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

  var userSchema = new Schema({
    email: {
      type: String,
      required: [true, "Need Email "],
    },
   
    Token: {
      type: String,
        required: [true, "Need Token "]
    }
  });
  
  module.exports = mongoose.model('LoginUsers', userSchema);