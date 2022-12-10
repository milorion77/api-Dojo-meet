const FollowController = require("../controllers/follow.controller");
const check = require("../middlewares/auth");


module.exports = app => {
    app.get("/api/follow/pruebafollow", FollowController.pruebaFollow);
    app.post("/api/follow/guardar", check.auth, FollowController.guardar);
    app.delete("/api/follow/delete/:id", check.auth, FollowController.deletefollow);
    app.get("/api/follow/following/:id?/:page?", check.auth, FollowController.following)
    app.get("/api/follow/followers/:id?/:page?", check.auth, FollowController.followers)
}