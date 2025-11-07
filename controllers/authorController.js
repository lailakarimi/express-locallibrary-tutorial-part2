const Author = require("../models/author");
const Book = require("../models/book");
const { body, validationResult } = require("express-validator");

// Display list of all Authors.
exports.author_list = async (req, res, next) => {
  try {
    const list_authors = await Author.find().sort([["family_name", "ascending"]]);
    res.render("author_list", { title: "Author List", author_list: list_authors });
  } catch (err) {
    return next(err);
  }
};

// Display detail page for a specific Author.
exports.author_detail = async (req, res, next) => {
  try {
    const [author, author_books] = await Promise.all([
      Author.findById(req.params.id),
      Book.find({ author: req.params.id }, "title summary"),
    ]);

    if (author == null) {
      const err = new Error("Author not found");
      err.status = 404;
      return next(err);
    }

    res.render("author_detail", { title: "Author Detail", author, author_books });
  } catch (err) {
    return next(err);
  }
};

// Display Author create form on GET.
exports.author_create_get = (req, res, next) => {
  res.render("author_form", { title: "Create Author" });
};

// Handle Author create on POST.
exports.author_create_post = [
  body("first_name").trim().isLength({ min: 1 }).escape().withMessage("First name must be specified."),
  body("family_name").trim().isLength({ min: 1 }).escape().withMessage("Family name must be specified."),
  body("date_of_birth", "Invalid date of birth").optional({ checkFalsy: true }).isISO8601().toDate(),
  body("date_of_death", "Invalid date of death").optional({ checkFalsy: true }).isISO8601().toDate(),

  async (req, res, next) => {
    const errors = validationResult(req);

    const author = new Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
    });

    if (!errors.isEmpty()) {
      res.render("author_form", { title: "Create Author", author, errors: errors.array() });
      return;
    } else {
      try {
        await author.save();
        res.redirect(author.url);
      } catch (err) {
        return next(err);
      }
    }
  },
];

// Display Author delete form on GET.
exports.author_delete_get = async (req, res, next) => {
  try {
    const [author, author_books] = await Promise.all([
      Author.findById(req.params.id),
      Book.find({ author: req.params.id }),
    ]);

    if (author == null) {
      res.redirect("/authors");
      return;
    }

    res.render("author_delete", { title: "Delete Author", author, author_books });
  } catch (err) {
    return next(err);
  }
};

// Handle Author delete on POST.
exports.author_delete_post = async (req, res, next) => {
  try {
    const [author, author_books] = await Promise.all([
      Author.findById(req.body.authorid),
      Book.find({ author: req.body.authorid }),
    ]);

    if (author_books.length > 0) {
      res.render("author_delete", { title: "Delete Author", author, author_books });
      return;
    } else {
      await Author.findByIdAndRemove(req.body.authorid);
      res.redirect("/authors");
    }
  } catch (err) {
    return next(err);
  }
};

// Display Author update form on GET.
exports.author_update_get = async (req, res, next) => {
  try {
    const author = await Author.findById(req.params.id);
    if (author == null) {
      const err = new Error("Author not found");
      err.status = 404;
      return next(err);
    }
    res.render("author_form", { title: "Update Author", author });
  } catch (err) {
    return next(err);
  }
};

// Handle Author update on POST.
exports.author_update_post = [
  body("first_name").trim().isLength({ min: 1 }).escape().withMessage("First name must be specified."),
  body("family_name").trim().isLength({ min: 1 }).escape().withMessage("Family name must be specified."),
  body("date_of_birth", "Invalid date of birth").optional({ checkFalsy: true }).isISO8601().toDate(),
  body("date_of_death", "Invalid date of death").optional({ checkFalsy: true }).isISO8601().toDate(),

  async (req, res, next) => {
    const errors = validationResult(req);

    const author = new Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      res.render("author_form", { title: "Update Author", author, errors: errors.array() });
      return;
    } else {
      try {
        const updatedAuthor = await Author.findByIdAndUpdate(req.params.id, author, {});
        res.redirect(updatedAuthor.url);
      } catch (err) {
        return next(err);
      }
    }
  },
];
