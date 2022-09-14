const validator = require("validator");

// service pengolahan data kedalam file json
// const { findDuplicate, loadContact, saveContact } = require("../services/localDB");

// service pengolahan data kedalam database
const { saveContact, loadContacts, editContact, removeContact } = require("../services/postgresDB");

// fungsi untuk melayani permintaan ('/')
exports.homePage = (req, res) => {
    res.render("index", {
        name: "Ramdhani Arya",
        title: "WebServer EJS",
        err: [],
        msg: "",
        page: "Home Page",
        layout: "layout/main-layout",
    });
};

// fungsi untuk melayani permintaan ('/about')
exports.aboutPage = (req, res, next) => {
    res.render("about", {
        name: "Ramdhani Arya",
        title: "WebServer EJS",
        err: [],
        msg: "",
        page: "About Page",
        layout: "layout/main-layout",
    });
    next();
};

// fungsi untuk melayani permintaan ('/contacts)
exports.contactsPage = async (req, res) => {
    const contacts = await loadContacts();
    res.render("contacts", {
        name: "Ramdhani Arya",
        title: "WebServer EJS",
        err: req.flash("error"),
        msg: req.flash("message"),
        cont: contacts,
        page: "Contacts Page",
        layout: "layout/main-layout",
    });
};

// fungsi untuk melayani permintaan ('/contacts/add')
exports.addContact = async (req, res) => {
    // variabel penampung error
    const errDump = [];
    try {
        // ambil data inputan dari req.body
        const { name, email, mobile } = req.body;
        // validasi email
        if (email) {
            if (!validator.isEmail(email)) {
                errDump.push("Tolong masukan email yang valid");
            }
        }
        // validasi no telepon
        if (!validator.isMobilePhone(mobile, "id-ID")) {
            errDump.push("Tolong masukan no telepon yang valid");
        }
        // jika terjadi kesalahan validasi
        if (errDump.length > 0) {
            req.flash("error", errDump);
            res.redirect("/contacts");
        } else {
            // jika validasi lolos kirim data kedalam database
            await saveContact({ name, email, mobile });
            req.flash("message", "Kontak berhasil ditambahkan");
            // redirect halaman
            res.redirect("/contacts");
        }
    } catch (error) {
        // jika terjadi error pada saat operasi CREATE pada database terdapat duplikasi nama
        if (error instanceof Error) {
            req.flash("error", ["Nama telah digunakan"]);
            res.redirect("/contacts");
        }
    }
};

// fungsi untuk melayani permintaan ('/contacts/:name')
exports.detailContactPage = async (req, res) => {
    try {
        // ambil name pada req.params
        const { name } = req.params;
        // cari dalam database contact berdasarkan name
        const contact = await loadContacts(name);
        // render halaman
        res.render("update", {
            title: "WebServer EJS",
            page: "Update Page",
            err: req.flash("error"),
            msg: "",
            detail: { ...contact, oldName: name },
            layout: "layout/main-layout",
        });
    } catch (error) {
        if (error instanceof Error) {
            // jika terjadi error maka artinya data tidak ditemukan
            req.flash("error", ["Kontak tidak ditemukan"]);
            res.redirect("/contacts");
        }
    }
};

// fungsi untuk melayani permintaan ('/contacts/update/:name')
exports.updateContact = async (req, res) => {
    // variabel penampung error
    const errDump = [];
    // ambil nama kontak dari parameter
    const { name } = req.params;
    // ambil inputan data untuk mengupdate kontak
    const { newName, email, mobile } = req.body;
    try {
        // validasi email
        if (email) {
            if (!validator.isEmail(email)) {
                errDump.push("Tolong masukan email yang valid");
            }
        }
        // validasi no telepon
        if (!validator.isMobilePhone(mobile, "id-ID")) {
            errDump.push("Tolong masukan no telepon yang valid");
        }
        // jika terjadi kesalahan validasi
        if (errDump.length > 0) {
            req.flash("error", errDump);
            // render ulang halaman dengan value sebelumnya
            res.render("update", {
                title: "WebServer EJS",
                page: "Update Page",
                err: req.flash("error"),
                msg: "",
                detail: { name: newName, email, mobile, oldName: name },
                layout: "layout/main-layout",
            });
        } else {
            // jika validasi lolos kirim data kedalam database
            await editContact(name, { newName, email, mobile });
            req.flash("message", ["Kontak berhasil diupdate"]);
            // redirect halaman
            res.redirect("/contacts");
        }
    } catch (error) {
        // jika terjadi error pada saat operasi UPDATE pada database terdapat duplikasi NAMA DENGAN KONTAK LAIN
        if (error instanceof Error) {
            req.flash("error", ["Nama telah digunakan"]);
            // render ulang halaman dengan value sebelumnya
            res.render("update", {
                title: "WebServer EJS",
                page: "Update Page",
                err: req.flash("error"),
                msg: "",
                detail: { name: newName, email, mobile, oldName: name },
                layout: "layout/main-layout",
            });
        }
    }
};

// fungsi untuk melayani permintaan ('/contacts/delete/:name')
exports.deleteContact = async (req, res) => {
    try {
        // ambil parameter nama kontak
        const { name } = req.params;
        await removeContact(name);
        req.flash("message", "Kontak berhasil dihapus");
        // redirect halaman
        res.redirect("/contacts");
    } catch (error) {
        if (error instanceof Error) {
            req.flash("error", ["Nama tidak ditemukan"]);
            res.redirect("/contacts");
        }
    }
};
