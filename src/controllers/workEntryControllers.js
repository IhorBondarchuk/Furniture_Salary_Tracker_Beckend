import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import * as workEntryServices from '../services/workEntryServices.js';

const getAll = async (req, res) => {
  const { from, to } = req.validatedQuery;
  const entries = await workEntryServices.listWorkEntries({ from, to });
  res.json(entries);
};

const getById = async (req, res) => {
  const entry = await workEntryServices.getWorkEntryById(req.params.id);
  res.json(entry);
};

const create = async (req, res) => {
  const entry = await workEntryServices.createWorkEntry(req.body);
  res.status(201).json(entry);
};

const update = async (req, res) => {
  const entry = await workEntryServices.updateWorkEntry(req.params.id, req.body);
  res.json(entry);
};

const remove = async (req, res) => {
  await workEntryServices.deleteWorkEntry(req.params.id);
  res.status(204).send();
};

const getSalary = async (req, res) => {
  const { from, to } = req.validatedQuery;
  const salary = await workEntryServices.calculateSalary({ from, to });
  res.json(salary);
};

export const workEntryControllers = {
  getAll: ctrlWrapper(getAll),
  getById: ctrlWrapper(getById),
  create: ctrlWrapper(create),
  update: ctrlWrapper(update),
  remove: ctrlWrapper(remove),
  getSalary: ctrlWrapper(getSalary),
};
