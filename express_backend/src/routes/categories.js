import { Router } from "express";
import { getCategories } from "../models/linksModel.js";

const router = Router();

/**
 PUBLIC_INTERFACE
 GET /categories
 Returns derived categories for current user with counts: [{ name, count }]
*/
router.get("/", async (req, res, next) => {
  try {
    const data = await getCategories(req.user.id);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

export default router;
