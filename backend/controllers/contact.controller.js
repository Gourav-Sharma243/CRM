import {Contact} from "../models/Contact.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";


export const getContacts = asyncHandler(async (req, res) => {
    const {search,tag} = req.query;
    const filter = {owner: req.user._id};
    if(tag) filter.tags = tag;
    if(search) {
        const rx = new RegExp(search, "i");
        filter.$or = [
            {name: rx},
            {email: rx},
            {company: rx}
        ];
    }
    const contacts = await Contact.find(filter).sort({ favorite: -1, favourite: -1, name: 1 }).lean();
    const formattedContacts = contacts.map((c) => ({
        ...c,
        favorite: c.favorite ?? c.favourite ?? false,
        tags: Array.isArray(c.tags) ? c.tags.flat().filter(Boolean) : [],
    }));
    res.json({success: true, count: formattedContacts.length, contacts: formattedContacts});
});

export const getContact = asyncHandler(async (req, res) => {
    const contact = await Contact.findOne({_id: req.params.id, owner: req.user._id}).lean();
    if(!contact) throw new ApiError(404, "Contact not found");
    contact.favorite = contact.favorite ?? contact.favourite ?? false;
    contact.tags = Array.isArray(contact.tags) ? contact.tags.flat().filter(Boolean) : [];
    res.json({success: true, contact});
});

export const createContact = asyncHandler(async (req, res) => {
    const data = { ...req.body, owner: req.user._id };
    if (data.favorite !== undefined) data.favourite = data.favorite;
    if (data.favourite !== undefined) data.favorite = data.favourite;
    const contact = await Contact.create(data);
    const obj = contact.toObject();
    obj.favorite = obj.favorite ?? obj.favourite ?? false;
    obj.tags = Array.isArray(obj.tags) ? obj.tags.flat().filter(Boolean) : [];
    res.status(201).json({success: true, contact: obj});
});

export const updateContact = asyncHandler(async (req, res) => {
    const {owner, ...updates} = req.body;
    if (updates.favorite !== undefined) updates.favourite = updates.favorite;
    else if (updates.favourite !== undefined) updates.favorite = updates.favourite;
    const contact = await Contact.findOneAndUpdate(
        {_id: req.params.id, owner: req.user._id},
        updates,
        {new: true, runValidators: true}
    ).lean();
    if(!contact) throw new ApiError(404, "Contact not found");
    contact.favorite = contact.favorite ?? contact.favourite ?? false;
    contact.tags = Array.isArray(contact.tags) ? contact.tags.flat().filter(Boolean) : [];
    res.json({success: true, contact});
});

export const deleteContact = asyncHandler(async (req, res) => {
    const contact = await Contact.findOneAndDelete({_id: req.params.id, owner: req.user._id});
    if(!contact) throw new ApiError(404, "Contact not found");
    res.json({success: true, message: "Contact deleted"});
});
        