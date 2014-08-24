module.exports = {
  identity: 'person',
  connection: 'diskStore',
  attributes: {

    // Don't allow two objects with the same value
    lastName: {
      type: 'string',
      unique: true
    },

    // Ensure a value is set
    age: {
      type: 'integer',
      required: true
    },

    // Set a default value if no value is set
    phoneNumber: {
      type: 'string',
      defaultsTo: '111-222-3333'
    },

    // Create an auto-incrementing value (not supported by all data-stores)
    incrementMe: {
      type: 'integer',
      autoIncrement: true
    },

    // Index a value for faster queries
    emailAddress: {
      type: 'email', // Email type will get validated by the ORM
      index: true
    }
  }
}