const Genre = require("../models/genre");
const Book = require("../models/book");
const { body, validationResult } = require("express-validator");

// Display list of all Genre.
exports.genre_list = async (req, res, next) => {
  try {
    const list_genres = await Genre.find().sort([["name", "ascending"]]);
    res.render("genre_list", { title: "Genre List", genre_list: list_genres });
  } catch (err) {
    return next(err);
  }
};

// Display detail page for a specific Genre.
exports.genre_detail = async (req, res, next) => {
  try {
    const [genre, genre_books] = await Promise.all([
      Genre.findById(req.params.id),
      Book.find({ genre: req.params.id }),
    ]);

    if (genre == null) {
      const err = new Error("Genre not found");
      err.status = 404;
      return next(err);
    }

    res.render("genre_detail", { title: "Genre Detail", genre, genre_books });
  } catch (err) {
    return next(err);
  }
};

// Display Genre create form on GET.
exports.genre_create_get = (req, res) => {
  res.render("genre_form", { title: "Create Genre" });
};

// Handle Genre create on POST.
exports.genre_create_post = [
  body("name", "Genre name required").trim().isLength({ min: 1 }).escape(),

  async (req, res, next) => {
    const errors = validationResult(req);

    const genre = new Genre({ name: req.body.name });

    if (!errors.isEmpty()) {
      res.render("genre_form", { title: "Create Genre", genre, errors: errors.array() });
      return;
    } else {
      try {
        const found_genre = await Genre.findOne({ name: req.body.name });
        if (found_genre) res.redirect(found_genre.url);
        else {
          await genre.save();
          res.redirect(genre.url);
        }
      } catch (err) {
        return next(err);
      }
    }
  },
];

// Display Genre delete form on GET.
exports.genre_delete_get = async (req, res, next) => {
  try {
    const [genre, genre_books] = await Promise.all([
      Genre.findById(req.params.id),
      Book.find({ genre: req.params.id }),
    ]);

    if (genre == null) res.redirect("/genres");

    res.render("genre_delete", { title: "Delete Genre", genre, genre_books });
  } catch (err) {
    return next(err);
  }
};

// Handle Genre delete on POST.
exports.genre_delete_post = async (req, res, next) => {
  try {
    const [genre, genre_books] = await Promise.all([
      Genre.findById(req.body.genreid),
      Book.find({ genre: req.body.genreid }),
    ]);

    if (genre_books.length > 0) {
      res.render("genre_delete", { title: "Delete Genre", genre, genre_books });
      return;
    } else {
      await Genre.findByIdAndRemove(req.body.genreid);
      res.redirect("/genres");
    }
  } catch (err) {
    return next(err);
  }
};

// Display Genre update form on GET.
exports.genre_update_get = async (req, res, next) => {
  try {
    const genre = await Genre.findById(req.params.id);
    if (genre == null) {
      const err = new Error("Genre not found");
      err.status = 404;
      return next(err);
    }
    res.render("genre_form", { title: "Update Genre", genre });
  } catch (err) {
    return next(err);
  }
};

// Handle Genre update on POST.
exports.genre_update_post = [
  body("name", "Genre name required").trim().isLength({ min: 1 }).escape(),

  async (req, res, next) => {
    const errors = validationResult(req);

    const genre = new Genre({
      name: req.body.name,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      res.render("genre_form", { title: "Update Genre", genre, errors: errors.array() });
      return;
    } else {
      try {
        const updatedGenre = await Genre.findByIdAndUpdate(req.params.id, genre, {});
        res.redirect(updatedGenre.url);
      } catch (err) {
        return next(err);
      }
    }
  },
];
