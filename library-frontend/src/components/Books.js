import { useState } from "react";
import { gql, useQuery } from "@apollo/client";

export const ALL_BOOKS = gql`
  query findAllBooks($authorToSearch: String, $genreToSearch: String) {
    allBooks(author: $authorToSearch, genre: $genreToSearch) {
      id
      title
      author {
        id
        name
        born
      }
      published
      genres
    }
  }
`;
const Books = (props) => {
  const [authorToSearch] = useState("");
  const [genreToSearch, setGenreToSearch] = useState("");
  //const [filter, setFilter] = useState("");
  const { loading, error, data } = useQuery(ALL_BOOKS, {
    variables: { authorToSearch, genreToSearch },
  });
  if (!props.show) {
    return null;
  }
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;
  let books = data.allBooks;
  // if (filter !== "") {
  //   books = books.filter((b) => b.genres.includes(filter));
  // }
  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        style={
          genreToSearch === "refactoring" ? { backgroundColor: "yellow" } : null
        }
        onClick={() => setGenreToSearch("refactoring")}
      >
        refactoring
      </button>
      <button
        style={genreToSearch === "agile" ? { backgroundColor: "yellow" } : null}
        onClick={() => setGenreToSearch("agile")}
      >
        agile
      </button>
      <button
        style={
          genreToSearch === "patterns" ? { backgroundColor: "yellow" } : null
        }
        onClick={() => setGenreToSearch("patterns")}
      >
        patterns
      </button>
      <button
        style={
          genreToSearch === "design" ? { backgroundColor: "yellow" } : null
        }
        onClick={() => setGenreToSearch("design")}
      >
        design
      </button>
      <button
        style={genreToSearch === "crime" ? { backgroundColor: "yellow" } : null}
        onClick={() => setGenreToSearch("crime")}
      >
        crime
      </button>
      <button
        style={
          genreToSearch === "classic" ? { backgroundColor: "yellow" } : null
        }
        onClick={() => setGenreToSearch("classic")}
      >
        classic
      </button>
      <button
        style={genreToSearch === "" ? { backgroundColor: "yellow" } : null}
        onClick={() => setGenreToSearch("")}
      >
        all genres
      </button>
    </div>
  );
};

export default Books;
