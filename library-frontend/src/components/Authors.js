import { useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import Select from "react-select";

export const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookCount
      id
    }
  }
`;

const EDIT_BORN = gql`
  mutation editBorn($name: String!, $born: Int!) {
    editAuthor(name: $name, born: $born) {
      name
      born
      bookCount
      id
    }
  }
`;
const Authors = (props) => {
  const { loading, error, data } = useQuery(ALL_AUTHORS);
  const [editBorn] = useMutation(EDIT_BORN);
  const [selectName, setSelectName] = useState(null);
  const [born, setBorn] = useState("");

  if (!props.show) {
    return null;
  }
  const handleSubmit = (e) => {
    e.preventDefault();
    editBorn({ variables: { name: selectName.value, born: Number(born) } });
    setSelectName(null);
    setBorn("");
  };
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;
  const authors = data.allAuthors;
  const nameOptions = authors.map((ath) => ({
    value: ath.name,
    label: ath.name,
  }));
  const selectStyel = {
    control: (styles) => ({ ...styles, width: "25%" }),
  };
  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Set Birth year</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name</label>
        <Select
          value={selectName}
          onChange={setSelectName}
          options={nameOptions}
          styles={selectStyel}
        />
        {/* <input
          type="text"
          id="name"
          name="name"
          value={name}
          onChange={({ target }) => setName(target.value)}
        /> */}
        <br />
        <label htmlFor="born">Born</label>
        <input
          type="text"
          id="born"
          name="born"
          value={born}
          onChange={({ target }) => setBorn(target.value)}
        />
        <br />
        <button type="submit">Update Author</button>
      </form>
    </div>
  );
};

export default Authors;
