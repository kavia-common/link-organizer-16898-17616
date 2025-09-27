import { Router } from "express";
import {
  getUserLinks,
  createLink,
  updateLink,
  deleteLink,
  getUserAnalytics,
  incrementClicksPublic,
  getLinkPublic
} from "../models/linksModel.js";
import { linkCreateSchema, linkUpdateSchema, linkQuerySchema } from "../utils/validators.js";

const router = Router();

/**
 PUBLIC_INTERFACE
 GET /links
 Lists links for the authenticated user with optional search/filter/sort/pagination.
 Query: search, category, sort, limit, offset
*/
router.get("/", async (req, res, next) => {
  try {
    const { value, error } = linkQuerySchema.validate(req.query);
    if (error) return res.status(400).json({ error: error.message });
    const data = await getUserLinks(req.user.id, value);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

/**
 PUBLIC_INTERFACE
 POST /links
 Creates a new link for the authenticated user.
 Body: { title, url, description?, category?, notes? }
*/
router.post("/", async (req, res, next) => {
  try {
    const { value, error } = linkCreateSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const data = await createLink(req.user.id, value);
    res.status(201).json(data);
  } catch (e) {
    next(e);
  }
});

/**
 PUBLIC_INTERFACE
 PATCH /links/:id
 Updates a link owned by the authenticated user.
 Body: any of { title, url, description, category, notes }
*/
router.patch("/:id", async (req, res, next) => {
  try {
    const { value, error } = linkUpdateSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const data = await updateLink(req.user.id, req.params.id, value);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

/**
 PUBLIC_INTERFACE
 DELETE /links/:id
 Deletes a link owned by the authenticated user.
*/
router.delete("/:id", async (req, res, next) => {
  try {
    await deleteLink(req.user.id, req.params.id);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

/**
 PUBLIC_INTERFACE
 GET /links/analytics/summary
 Returns { totalLinks, totalClicks } for the authenticated user.
*/
router.get("/analytics/summary", async (req, res, next) => {
  try {
    const data = await getUserAnalytics(req.user.id);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

/**
 PUBLIC_INTERFACE
 POST /links/:id/click
 Public endpoint to increment click count. Does not require auth.
 Implementation relies on DB RLS/policies or RPC function.
 Returns { clicks, url }
*/
router.post("/:id/click", async (req, res, next) => {
  try {
    const data = await incrementClicksPublic(req.params.id);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

/**
 PUBLIC_INTERFACE
 GET /links/:id
 Fetch single link (must belong to the user if authenticated route is used)
 For simplicity we return via public path with auth, but you can add separate public if needed.
*/
router.get("/:id", async (req, res, next) => {
  try {
    // By default, we can fetch public and let RLS enforce visibility.
    const data = await getLinkPublic(req.params.id);
    // Optional: ensure owner if you want strict private read
    if (data?.user_id !== req.user.id) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json(data);
  } catch (e) {
    next(e);
  }
});

export default router;
