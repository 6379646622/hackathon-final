import express from 'express';
import Ticket from '../models/Ticket.js';

const router = express.Router();

// GET /ticket - list all tickets
router.get('/', async (req, res) => {
	try {
		const tickets = await Ticket.find().sort({ createdAt: -1 });
		res.json(tickets);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// GET /ticket/:id - get a single ticket
router.get('/:id', async (req, res) => {
	try {
		const ticket = await Ticket.findById(req.params.id);
		if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
		res.json(ticket);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// POST /ticket - create a ticket
router.post('/', async (req, res) => {
	try {
		const { title, description, status } = req.body;
		const ticket = new Ticket({ title, description, status });
		const saved = await ticket.save();
		res.status(201).json(saved);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
});

// PUT /ticket/:id - update a ticket
router.put('/:id', async (req, res) => {
	try {
		const updated = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true });
		if (!updated) return res.status(404).json({ message: 'Ticket not found' });
		res.json(updated);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
});

// DELETE /ticket/:id - delete a ticket
router.delete('/:id', async (req, res) => {
	try {
		const removed = await Ticket.findByIdAndDelete(req.params.id);
		if (!removed) return res.status(404).json({ message: 'Ticket not found' });
		res.json({ message: 'Ticket deleted' });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

export default router;
