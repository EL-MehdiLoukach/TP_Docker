const express = require('express');
const CategoryController = require('../controllers/categoryController');
const AuthController = require('../controllers/Auth')

class FactoryRoutes {
  static create(entity) {
    const router = express.Router();

    const controllers = {
      category: CategoryController,
      auth : AuthController
    };

    const controller = controllers[entity];

    if (controller) {
        if(entity == 'auth'){
            router.post('/login', controller.loginUser);
            router.post('/register', controller.registerUser);
            router.get('/verify/:userId/:uniqueString', controller.verifyEmail);
        }else {
            router.get('/', controller.getAll);
            router.get('/:id', controller.getById);
            router.post('/', controller.create);
            router.put('/:id', controller.updateById);
            router.delete('/:id', controller.deleteById);
        }
    } else {
      router.get('/', (req, res) => {
        res.status(404).json({ message: 'Entity not found' });
      });
    }

    return router;
  }
}

module.exports = FactoryRoutes;
