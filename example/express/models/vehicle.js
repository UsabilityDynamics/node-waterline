module.exports = {
  identity: 'vehicle',
  connection: 'diskStore',
  attributes: {

    // Don't allow two objects with the same value
    make: {
      type: 'string',
      unique: true
    },

    // Ensure a value is set
    year: {
      type: 'integer',
      required: true
    },

    model: {
      type: 'string'
    }

  }
}