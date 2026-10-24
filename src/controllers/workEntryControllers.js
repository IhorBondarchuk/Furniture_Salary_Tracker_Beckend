import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { HttpError } from '../utils/HttpError.js';
import * as workEntryServices from '../services/workEntryServices.js';

const getAll = async (req, res) => {
  // workers only ever see their own entries; admins may filter by ?worker=
  const filter = req.user.role === 'admin' && req.validatedQuery.worker
    ? { worker: req.validatedQuery.worker }
    : req.user.role === 'admin'
      ? {}
      : { worker: req.user._id };

  const { from, to } = req.validatedQuery;
  const entries = await workEntryServices.listWorkEntries(filter, { from, to });
  res.json(entries);
};

const getById = async (req, res) => {
  const entry = await workEntryServices.getWorkEntryById(req.params.id);

  if (req.user.role !== 'admin' && String(entry.worker) !== String(req.user._id)) {
    throw new HttpError(403, 'Access denied');
  }

  res.json(entry);
};

const create = async (req, res) => {
  // admins may log work on behalf of a worker; a worker may only log their own
  const worker = req.user.role === 'admin' && req.body.worker
    ? req.body.worker
    : req.user._id;

  const entry = await workEntryServices.createWorkEntry({
    ...req.body,
    worker,
  });
  res.status(201).json(entry);
};

const update = async (req, res) => {
  const existing = await workEntryServices.getWorkEntryById(req.params.id);

  if (req.user.role !== 'admin' && String(existing.worker) !== String(req.user._id)) {
    throw new HttpError(403, 'Access denied');
  }

  const entry = await workEntryServices.updateWorkEntry(req.params.id, req.body);
  res.json(entry);
};

const remove = async (req, res) => {
  const existing = await workEntryServices.getWorkEntryById(req.params.id);

  if (req.user.role !== 'admin' && String(existing.worker) !== String(req.user._id)) {
    throw new HttpError(403, 'Access denied');
  }

  await workEntryServices.deleteWorkEntry(req.params.id);
  res.status(204).send();
};

const getSalary = async (req, res) => {
  const { from, to } = req.validatedQuery;
  const worker = req.user.role === 'admin' && req.validatedQuery.worker
    ? req.validatedQuery.worker
    : req.user._id;

  const salary = await workEntryServices.calculateSalary({ worker, from, to });
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
