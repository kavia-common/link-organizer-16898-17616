import Joi from "joi";

export const linkCreateSchema = Joi.object({
  title: Joi.string().min(1).max(300).required(),
  url: Joi.string().uri({ scheme: [/https?/] }).required(),
  description: Joi.string().allow("", null).max(2000),
  category: Joi.string().allow("", null).max(120),
  notes: Joi.string().allow("", null)
});

export const linkUpdateSchema = Joi.object({
  title: Joi.string().min(1).max(300),
  url: Joi.string().uri({ scheme: [/https?/] }),
  description: Joi.string().allow("", null).max(2000),
  category: Joi.string().allow("", null).max(120),
  notes: Joi.string().allow("", null)
}).min(1);

// Query validation for list/search
export const linkQuerySchema = Joi.object({
  search: Joi.string().allow("", null).max(200),
  category: Joi.string().allow("", null).max(120).default("All"),
  sort: Joi.string().valid("newest", "oldest", "most_clicked", "title").default("newest"),
  limit: Joi.number().integer().min(1).max(100).default(50),
  offset: Joi.number().integer().min(0).default(0)
});
