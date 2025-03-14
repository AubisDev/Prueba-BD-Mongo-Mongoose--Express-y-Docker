const express = require("express");
const router = express.Router();
const Book = require("../models/book.model");

//MIDDLEWARE
const getBook = async (req, res, next) => {
  let book;
  const { id } = req.params;

  //confirma que corresponda a un ID valido
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    // Esta es una forma de verificar si es un ID valido de mongo
    return res.status(404).json({
      message: "el ID del libro no es valido",
    });
  }

  try {
    book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({
        message: "El libro no fue encontrado",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }

  res.book = book;
  next();
};

// Obtener todos los libros
router.get("/", async (req, res) => {
  try {
    const books = await Book.find(); // de mongoose para buscar un libro pero al especificar trae todos
    console.log("GET ALL", books);

    if (books.length == 0) {
      // condicion para si no hay lbiros
      return res.status(204).json([]);
    }
    res.json(books); // retornamos los libros
  } catch (error) {
    res.status(500, json({ message: error.message })); // error de base de datos  para poner algo
  }
});

// Crear un nuevo libro (recurso) con POST

router.post("/", async (req, res) => {
  const { title, author, genre, publication_date } = req?.body;
  if (!title || !author || !genre || !publication_date) {
    //verificamos que tenga todos los valores en el req y si no retornamos error
    return res.status(400).json({
      message: "Los campos: titulo, autor, genero y fecha son obligatorios",
    });
  }

  //Creacion  de nuevo libro
  const book = new Book({
    title,
    author,
    genre,
    publication_date,
  });
  res.status(201).json(book);
  try {
    const newBook = await book.save();
    console.log(newBook);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

router.get("/:id", getBook, async (req, res) => {
  res.json(res.book);
});

router.put("/:id", getBook, async (req, res) => {
  try {
    const book = res.book;
    book.title = req.body.title || book.title;
    book.author = req.body.author || book.author;
    book.genre = req.body.genre || book.genre;
    book.publication_date = req.body.publication_date || book.publication_date;
    const updatedBook = await book.save(); // asi se guarda en libro nuevamente en la b
    res.json(updatedBook); // para mostrarlo en la respuesta http
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

router.patch("/:id", getBook, async (req, res) => {
  if (
    !req.body.title &&
    !req.body.author &&
    !req.body.genre &&
    !req.body.publication_date
  ) {
    res.status(400).json({
      message:
        "Al menos uno de estos campos debe ser enviado: Titulo, Author, Genero o Fecha de publicacion",
    });
  }
  try {
    const book = res.book;
    book.title = req.body.title || book.title;
    book.author = req.body.author || book.author;
    book.genre = req.body.genre || book.genre;
    book.publication_date = req.body.publication_date || book.publication_date;
    const updatedBook = await book.save(); // asi se guarda en libro nuevamente en la b
    res.json(updatedBook); // para mostrarlo en la respuesta http
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

router.delete("/:id", getBook, async (req, res) => {
  console.log(res.book);
  try {
    await res.book.deleteOne({
      _id: res.book._id,
    });
    res.json({
      message: `El libro ${res.book.title} ha sido borrado`,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
