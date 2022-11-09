import React, { useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { ALL_BOOKS } from "./Books";

const CURRENT_USER = gql`
  query {
    me {
      username
      favouriteGenre
      id
    }
  }
`;
const Recommend = ({ show }) => {
  const { loading, data } = useQuery(CURRENT_USER);
  const [authorToSearch] = useState("");
  const result = useQuery(ALL_BOOKS, {
    variables: { authorToSearch },
  });
  if (loading || result.loading) return <div>Loading...</div>;
  let books = result.data.allBooks;
  books = books.filter((b) => b.genres.includes(data.me.favouriteGenre));
  if (!show) return null;
  return (
    <div>
      <h2>Recommendation</h2>
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
    </div>
  );
};

export default Recommend;
