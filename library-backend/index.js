const {
  ApolloServer,
  gql,
  UserInputError,
  AuthenticationError,
} = require("apollo-server");
const { v1: uuid } = require("uuid");
const connectDb = require("./config/dbConnection");
const Book = require("./models/bookModel");
const Author = require("./models/authorModel");
const User = require("./models/userModel");
const jwt = require("jsonwebtoken");

if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({ path: "./config/config.env" });
}
connectDb();

/* let authors = [
  {
    name: "Robert Martin",
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: "Martin Fowler",
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963,
  },
  {
    name: "Fyodor Dostoevsky",
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821,
  },
  {
    name: "Joshua Kerievsky", // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  {
    name: "Sandi Metz", // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
];
*/
/*
 * It might make more sense to associate a book with its author by storing the author's id in the context of the book instead of the author's name
 * However, for simplicity, we will store the author's name in connection with the book
 */

/* let books = [
  {
    title: "Clean Code",
    published: 2008,
    author: "Robert Martin",
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring"],
  },
  {
    title: "Agile software development",
    published: 2002,
    author: "Robert Martin",
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ["agile", "patterns", "design"],
  },
  {
    title: "Refactoring, edition 2",
    published: 2018,
    author: "Martin Fowler",
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring"],
  },
  {
    title: "Refactoring to patterns",
    published: 2008,
    author: "Joshua Kerievsky",
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring", "patterns"],
  },
  {
    title: "Practical Object-Oriented Design, An Agile Primer Using Ruby",
    published: 2012,
    author: "Sandi Metz",
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring", "design"],
  },
  {
    title: "Crime and punishment",
    published: 1866,
    author: "Fyodor Dostoevsky",
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ["classic", "crime"],
  },
  {
    title: "The Demon ",
    published: 1872,
    author: "Fyodor Dostoevsky",
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ["classic", "revolution"],
  },
];
*/

const typeDefs = gql`
  type Query {
    bookCount: Int
    authorCount: Int
    allBooks(author: String, genre: String): [Book]
    allAuthors: [Author]
    me: User
  }
  type Book {
    id: ID!
    title: String!
    author: Author
    published: Int!
    genres: [String!]!
  }
  type Author {
    id: ID!
    name: String!
    born: Int
    bookCount: Int
  }

  type User {
    username: String!
    favouriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Mutation {
    addBook(
      title: String!
      author: String
      published: Int!
      genres: [String!]!
    ): Book

    editAuthor(name: String!, born: Int!): Author

    createUser(username: String!, favouriteGenre: String!): User

    login(username: String!, password: String!): Token
  }
`;

const resolvers = {
  Query: {
    bookCount: async () => {
      return Book.collection.countDocuments();
    },
    authorCount: async () => {
      return Author.collection.countDocuments();
    },
    allBooks: async (root, args) => {
	if(args.author){
	const auth = await Author.findOne({name: args.author});
	
	return Book.find({author: auth.id}).populate("author");
	}
	if(args.genre){
	return Book.find({genres:{ $all: [args.genre]}}).populate("author");
	}
      return Book.find().populate("author");
      // return books.filter(
      //   (book) =>
      //     // book.author === args.author && book.genres.includes(args.genre)
      //     book.author.indexOf(args.author) !== -1
      //   //&& book.genres.includes(args.genre)
      // );
    },
    allAuthors: async () => {
      return Author.find();
    },
    me: async (root, args, { currentUser }) => {
      return currentUser;
    },
  },
  Author: {
    bookCount: async (root) => {
      //return books.filter((book) => book.author === root.name).length;
      return await Book.find({ author: root.id }).countDocuments();
    },
  },
  Mutation: {
    addBook: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError("not authenticated");
      }
      //const isAuthorAlready = authors.find((a) => a.name === args.author);
      const isAuthorAlready =
        (await Author.find({ name: args.author }).countDocuments()) > 0;

      if (!isAuthorAlready) {
        //const author = { name: args.author, id: uuid() };
        //authors = authors.concat(author);
        const author = new Author({ name: args.author });
        try {
          await author.save();
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          });
        }
      }

      //const book = { ...args, id: uuid() };
      //books = books.concat(book);
      const author = await Author.findOne({ name: args.author });
      const book = new Book({ ...args, author: author._id });
      try {
        await book.save();
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      }
	return book;
    },
    editAuthor: async (root, args, { currentUser }) => {
      //const author = authors.find((a) => a.name === args.name);
      const author = await Author.findOne({ name: args.name });
      if (!author) {
        return null;
      }
      if (!currentUser) {
        throw new AuthenticationError("not authenticated");
      }
      //const updatedAuthor = { ...author, born: args.born };
      author.born = args.born;
      //authors = authors.map((a) => (a.name === args.name ? updatedAuthor : a));
      await author.save();
      //return updatedAuthor;
      return author;
    },
    createUser: async (root, args) => {
      const user = new User({ ...args });
      try {
        await user.save();
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      }
      return user;
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });
      if (!user || args.password !== "secret") {
        throw new UserInputError("wrong credential");
      }

      const userForToken = {
        id: user._id,
        name: user.username,
      };
      const token = jwt.sign(userForToken, process.env.JWT_SECRET);
      return { value: token };
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null;
    if (auth && auth.toLowerCase().startsWith("bearer ")) {
      const decodedToken = jwt.verify(
        auth.substring(7),
        process.env.JWT_SECRET
      );
      const currentUser = await User.findById(decodedToken.id);
      return { currentUser };
    }
  },
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
