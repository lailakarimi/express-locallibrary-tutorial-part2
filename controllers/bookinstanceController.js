const BookInstance = require("../models/bookinstance");
const Book = require("../models/book");
const { body, validationResult } = require("express-validator");

// Display list of all BookInstances.
exports.bookinstance_list = async (req, res, next) => {
  try {
    const list_bookinstances = await BookInstance.find()
      .populate("book")
      .sort([["due_back", "ascending"]]);
    res.render("bookinstance_list", { title: "Book Instance List", bookinstance_list: list_bookinstances });
  } catch (err) {
    return next(err);
  }
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = async (req, res, next) => {
  try {
    const bookinstance = await BookInstance.findById(req.params.id).populate("book");
    if (bookinstance == null) {
      const err = new Error("Book copy not found");
      err.status = 404;
      return next(err);
    }
    res.render("bookinstance_detail", { title: "Book:", bookinstance });
  } catch (err) {
    return next(err);
  }
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = async (req, res, next) => {
  try {
    const books = await Book.find();
    res.render("bookinstance_form", { title: "Create BookInstance", book_list: books });
  } catch (err) {
    return next(err);
  }
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified").trim().isLength({ min: 1 }).escape(),
  body("status").escape(),
  body("due_back", "Invalid date").optional({ checkFalsy: true }).isISO8601().toDate(),

  async (req, res, next) => {
    const errors = validationResult(req);

    const bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });

    if (!errors.isEmpty()) {
      try {
        const books = await Book.find();
        res.render("bookinstance_form", { title: "Create BookInstance", book_list: books, selected_book: bookinstance.book._id, errors: errors.array(), bookinstance });
      } catch (err) {
        return next(err);
      }
      return;
    } else {
      try {
        await bookinstance.save();
        res.redirect(bookinstance.url);
      } catch (err) {
        return next(err);
      }
    }
  },
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = async (req, res, next) => {
  try {
    const bookinstance = await BookInstance.findById(req.params.id).populate("book");
    if (bookinstance == null) res.redirect("/bookinstances");
    res.render("bookinstance_delete", { title: "Delete BookInstance", bookinstance });
  } catch (err) {
    return next(err);
  }
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = async (req, res, next) => {
  try {
    await BookInstance.findByIdAndRemove(req.body.bookinstanceid);
    res.redirect("/bookinstances");
  } catch (err) {
    return next(err);
  }
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = async (req, res, next) => {
  try {
    const [bookinstance, books] = await Promise.all([BookInstance.findById(req.params.id), Book.find()]);
    if (bookinstance == null) {
      const err = new Error("Book copy not found");
      err.status = 404;
      return next(err);
    }
    res.render("bookinstance_form", { title: "Update BookInstance", book_list: books, bookinstance });
  } catch (err) {
    return next(err);
  }
};

// Handle BookInstance update on POST.
exports.bookinstance_update_post = [
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified").trim().isLength({ min: 1 }).escape(),
  body("status").escape(),
  body("due_back", "Invalid date").optional({ checkFalsy: true }).isISO8601().toDate(),

  async (req, res, next) => {
    const errors = validationResult(req);

    const bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      try {
        const books = await Book.find();
        res.render("bookinstance_form", { title: "Update BookInstance", book_list: books, selected_book: bookinstance.book._id, errors: errors.array(), bookinstance });
      } catch (err) {
        return next(err);
      }
      return;
    } else {
      try {
        const updatedInstance = await BookInstance.findByIdAndUpdate(req.params.id, bookinstance, {});
        res.redirect(updatedInstance.url);
      } catch (err) {
        return next(err);
      }
    }
  },
];
