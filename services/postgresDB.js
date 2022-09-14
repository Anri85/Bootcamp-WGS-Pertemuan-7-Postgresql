const { Pool } = require("pg");
const pool = new Pool();

// fungsi SELECT semua contact atau contact berdasarkan nama pada postgresql
const loadContacts = async (name) => {
    // jika name tidak bernilai undefined maka SELECT contact berdasarkan name
    if (name) {
        // merancang perintah query
        const order = {
            text: "SELECT name, email, mobile FROM contacts WHERE name = $1",
            values: [name],
        };
        // mengeksekusi query
        const contact = await pool.query(order);
        if (!contact.rowCount) {
            throw new Error();
        }
        return contact.rows[0];
    } else {
        // jika name bernilai undefined maka SELECT semua contact
        const contacts = await pool.query("SELECT name, email, mobile FROM contacts");
        return contacts.rows;
    }
};

// fungsi CREATE contact pada postgresql
const saveContact = async ({ name, email, mobile }) => {
    // komparasikan nilai input dengan nilai pada database
    const allContacts = await loadContacts();
    // filter contact berdasarkan nama yang diinput
    const contact = allContacts.filter((ac) => ac.name.toLowerCase() === name.toLowerCase());
    // jika contact ditemukan bandingkan nama yang diinput dengan nama yang telah ditemukan
    if (contact.length > 0) {
        // cek jika nama yang diinput telah ada dalam database secara LOWERCASE
        if (contact.name.toLowerCase() === name.toLowerCase()) {
            throw new Error();
        }
    }
    // jika lolos seleksi diatas lakukan perancangan perintah query
    const order = {
        text: "INSERT INTO contacts VALUES($1, $2, $3) RETURNING name",
        values: [name, email, mobile.toString()],
    };
    const result = await pool.query(order);
    if (!result.rows[0].name) {
        throw new Error();
    }
    return result.rows[0].name;
};

// fungsi UPDATE contact pada postgresql
const editContact = async (name, { newName, email, mobile }) => {
    // komparasikan nilai input dengan nilai database dengan meload semuan data contacts
    const allContacts = await loadContacts();
    // ambil semua data contacts kecuali contact yang sedang diupdate
    const contacts = allContacts.filter((ac) => ac.name !== name);
    contacts.forEach((c) => {
        // cek jika nama yang diinput telah ada dalam database secara LOWERCASE
        if (c.name.toLowerCase() === newName.toLowerCase()) {
            throw new Error();
        }
    });
    // jika lolos seleksi diatas lakukan perancangan perintah query
    const order = {
        text: "UPDATE contacts SET name = $1, email = $2, mobile = $3 WHERE name = $4 RETURNING name",
        values: [newName, email, mobile.toString(), name],
    };
    // mengeksekusi query
    const result = await pool.query(order);
    if (!result.rowCount) {
        throw new Error();
    }
    return false;
};

// fungsi DELETE contact pada postgresql
const removeContact = async (name) => {
    // merancang query
    const order = {
        text: "DELETE FROM contacts WHERE name = $1 RETURNING name",
        values: [name],
    };
    // mengeksekusi query
    const result = await pool.query(order);
    if (!result.rowCount) {
        throw new Error();
    }
};

module.exports = { saveContact, loadContacts, editContact, removeContact };
