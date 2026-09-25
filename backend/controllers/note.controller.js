import { Note } from "../models/Note.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

export const getNotes = asyncHandler(async (req, res) => {
    const { lead, contact, search } = req.query;
    const filter = { owner: req.user._id };
    if (lead) filter.lead = lead;
    if (contact) filter.contact = contact;
    if (search) filter.content = new RegExp(search, "i");    
    
    // Correctly await the Mongoose query chain (DO NOT put parentheses around await Note.find)
    const notes = await Note.find(filter)
        .sort({ pinned: -1, createdAt: -1 })
        .populate("lead", "name company")
        .populate("contact", "name company");

    res.json({ success: true, count: notes.length, notes });
});

export const createNote = asyncHandler(async (req, res) => {
    const { content, lead, contact, pinned } = req.body;
    if (!content || !content.trim()) throw new ApiError(400, "Content is required");
    
    const note = await Note.create({
        owner: req.user._id,
        content: content.trim(),
        lead: lead || null,
        contact: contact || null,
        pinned: Boolean(pinned),
    });

    const populated = await Note.findById(note._id)
        .populate("lead", "name company")
        .populate("contact", "name company");

    res.status(201).json({ success: true, note: populated || note });
});

export const updateNote = asyncHandler(async (req, res) => {
    const { owner, ...updates } = req.body;
    if (updates.lead === "") updates.lead = null;
    if (updates.contact === "") updates.contact = null;

    const note = await Note.findOneAndUpdate(
        { _id: req.params.id, owner: req.user._id },
        updates,
        { new: true, runValidators: true }
    )
        .populate("lead", "name company")
        .populate("contact", "name company");

    if (!note) throw new ApiError(404, "Note not found");
    res.json({ success: true, note });
});

export const deleteNote = asyncHandler(async (req, res) => {
    const note = await Note.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!note) throw new ApiError(404, "Note not found");
    res.json({ success: true, message: "Note deleted" });
});