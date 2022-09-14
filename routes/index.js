const router = require("express").Router();

// import handler
const { homePage, aboutPage, contactsPage, addContact, detailContactPage, updateContact, deleteContact } = require("../api");

// sesuaikan handler dengan path url
router.get("/", homePage);
router.get("/about", aboutPage);
router.get("/contacts", contactsPage);
router.post("/contacts/add", addContact);
router.get("/contacts/:name", detailContactPage);
router.post("/contacts/update/:name", updateContact);
router.get("/contacts/delete/:name", deleteContact);

module.exports = router;
