const Category = require('../models/category');
const ServiceCrud = require('./ServiceCrud'); 

class ModelFactory {
    static createService(model) {
        switch (model) {
        case 'category' :
            return new ServiceCrud(Category)
        default:
            throw new Error(`Unknown model: ${model}`);
        }
    }
}

module.exports = ModelFactory;
