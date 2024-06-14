const FactoryCrud = require('../utils/FactoryCrud');

const CategoryCRUD = FactoryCrud.createService('category');

const getAll = CategoryCRUD.GetAll();
const getById = CategoryCRUD.GetById();
const create = CategoryCRUD.Create();
const updateById = CategoryCRUD.UpdateById();
const deleteById = CategoryCRUD.DeleteById();

module.exports = {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
};
