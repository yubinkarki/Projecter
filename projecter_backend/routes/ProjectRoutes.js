const router = require("express").Router();

const { authentication } = require("../utils/Auth");

const {
  addProject,
  updateProject,
  deleteProject,
  getOneProject,
  getAllProjects,
  addProjectMember,
  getManyProjects,
} = require("../controllers/ProjectController");

// Defining api routes.
router.get("/get/:id", getOneProject);
router.get("/getall", getAllProjects);
router.get("/getmany", getManyProjects);
router.post("/add", addProject);
router.post("/addmember", addProjectMember);
router.put("/update/:id", updateProject);
router.delete("/delete/:id", deleteProject);

module.exports = router;
