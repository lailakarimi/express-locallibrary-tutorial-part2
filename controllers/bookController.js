const Book = require("../models/book");
const Author = require("../models/author");
const Genre = require("../models/genre");
const BookInstance = require("../models/bookinstance");
const { body, validationResult } = require("express-validator");

// Display the home page of the catalog
exports.index = async (req, res, next) => {
  try {
    const book_count = await Book.countDocuments({});
    const book_instance_count = await BookInstance.countDocuments({});
    const book_instance_available_count = await BookInstance.countDocuments({ status: "Available" });
    const author_count = await Author.countDocuments({});
    const genre_count = await Genre.countDocuments({});

    res.render("index", {
      title: "Local Library Home",
      data: {
        book_count,
        book_instance_count,
        book_instance_available_count,
        author_count,
        genre_count,
      },
    });
  } catch (err) {
    return next(err);
  }
};

// Display list of all Books.
exports.book_list = async (req, res, next) => {
  try {
    const books = await Book.find({}, "title author").populate("author").exec();
    res.render("book_list", { title: "Book List", book_list: books });
  } catch (err) {
    return next(err);
  }
};

// Display detail page for a specific Book.
exports.book_detail = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate("author")
      .populate("genre")
      .exec();
    if (!book) {
      const err = new Error("Book not found");
      err.status = 404;
      return next(err);
    }
    const book_instances = await BookInstance.find({ book: req.params.id });
    res.render("book_detail", { title: book.title, book, book_instances });
  } catch (err) {
    return next(err);
  }
};

// Display Book create form on GET.
exports.book_create_get = async (req, res, next) => {
  try {
    const authors = await Author.find();
    const genres = await Genre.find();
    res.render("book_form", { title: "Create Book", authors, genres });
  } catch (err) {
    return next(err);
  }
};

// Handle Book create on POST.
exports.book_create_post = [
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      req.body.genre = req.body.genre ? [req.body.genre] : [];
    }
    next();
  },
  body("title", "Title must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("author", "Author must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("summary", "Summary must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
  async (req, res, next) => {
    const errors = validationResult(req);
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre,
    });
    if (!errors.isEmpty()) {
      try {
        const authors = await Author.find();
        const genres = await Genre.find();
        for (const genre of genres) {
          if (book.genre.includes(genre._id)) {
            genre.checked = "true";
          }
        }
        res.render("book_form", { title: "Create Book", authors, genres, book, errors: errors.array() });
      } catch (err) {
        return next(err);
      }
      return;
    }
    try {
      await book.save();
      res.redirect(book.url);
    } catch (err) {
      return next(err);
    }
  },
];

// Display Book delete form on GET.
exports.book_delete_get = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    const book_instances = await BookInstance.find({ book: req.params.id });
    if (!book) res.redirect("/catalog/books");
    res.render("book_delete", { title: "Delete Book", book, book_instances });
  } catch (err) {
    return next(err);
  }
};

// Handle Book delete on POST.
exports.book_delete_post = async (req, res, next) => {
  try {
    const book_instances = await BookInstance.find({ book: req.body.bookid });
    if (book_instances.length > 0) {
      const book = await Book.findById(req.body.bookid);
      res.render("book_delete", { title: "Delete Book", book, book_instances });
      return;
    } else {
      await Book.findByIdAndRemove(req.body.bookid);
      res.redirect("/catalog/books");
    }
  } catch (err) {
    return next(err);
  }
};

// Display Book update form on GET.
exports.book_update_get = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).populate("author").populate("genre").exec();
    const authors = await Author.find();
    const genres = await Genre.find();
    for (const genre of genres) {
      if (book.genre.includes(genre._id)) {
        genre.checked = "true";
      }
    }
    res.render("book_form", { title: "Update Book", authors, genres, book });
  } catch (err) {
    return next(err);
  }
};

// Handle Book update on POST.
exports.book_update_post = [
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      req.body.genre = req.body.genre ? [req.body.genre] : [];
    }
    next();
  },
  body("title", "Title must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("author", "Author must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("summary", "Summary must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
  async (req, res, next) => {
    const errors = validationResult(req);
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: typeof req.body.genre === "undefined" ? [] : req.body.genre,
      _id: req.params.id,
    });
    if (!errors.isEmpty()) {
      try {
        const authors = await Author.find();
        const genres = await Genre.find();
        for (const genre of genres) {
          if (book.genre.includes(genre._id)) {
            genre.checked = "true";
          }
        }
        res.render("book_form", { title: "Update Book", authors, genres, book, errors: errors.array() });
      } catch (err) {
        return next(err);
      }
      return;
    }
    try {
      await Book.findByIdAndUpdate(req.params.id, book, {});
      res.redirect(book.url);
    } catch (err) {
      return next(err);
    }
  },
];
