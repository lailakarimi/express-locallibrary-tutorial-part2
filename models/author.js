const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
  first_name: { type: String, required: true, maxLength: 100 },
  family_name: { type: String, required: true, maxLength: 100 },
  date_of_birth: { type: Date },
  date_of_death: { type: Date },
});

// Virtual for author's full name
AuthorSchema.virtual("name").get(function () {
  // To avoid errors in cases where an author does not have either a family name or first name
  // We want to make sure we handle the exception by returning an empty string for that case
  let fullname = "";
  if (this.first_name && this.family_name) {
    fullname = `${this.family_name}, ${this.first_name}`;
  }

  return fullname;
});

// Virtual for author's URL
AuthorSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/catalog/author/${this._id}`;
});

// Virtual for author's lifespan
AuthorSchema.virtual("lifespan").get(function () {
  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const birth = formatDate(this.date_of_birth);
  const death = formatDate(this.date_of_death);

  return `${birth} - ${death}`;
});

// Virtuals to format dates for input[type="date"] (YYYY-MM-DD)
AuthorSchema.virtual("date_of_birth_yyyy_mm_dd").get(function () {
  if (!this.date_of_birth) return "";
  const iso = this.date_of_birth.toISOString();
  return iso.split("T")[0]; // YYYY-MM-DD
});

AuthorSchema.virtual("date_of_death_yyyy_mm_dd").get(function () {
  if (!this.date_of_death) return "";
  const iso = this.date_of_death.toISOString();
  return iso.split("T")[0]; // YYYY-MM-DD
});

// Export model
module.exports = mongoose.model("Author", AuthorSchema);
