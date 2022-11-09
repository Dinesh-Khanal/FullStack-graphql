import React, { useState, useEffect } from "react";
import { gql, useMutation } from "@apollo/client";

const LOGIN = gql`
  mutation userLogin($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`;

const Login = ({ show, setError, setPage, setToken }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [login, response] = useMutation(LOGIN, {
    onError: (error) => {
      setError(error.graphQLErrors[0].message);
    },
  });
  useEffect(() => {
    if (response.data) {
      const value = response.data.login.value;
      setToken(value);
      localStorage.setItem("library-user-token", value);
    }
  }, [response.data, setToken]);
  const handleSubmit = (e) => {
    e.preventDefault();
    login({ variables: { username, password } });
    setPage("authors");
    setUsername("");
    setPassword("");
  };
  if (!show) return null;
  return (
    <form onSubmit={handleSubmit}>
      <h2>User Login</h2>
      <label htmlFor="username">User Name</label>
      <input
        type="text"
        value={username}
        id="username"
        onChange={(e) => setUsername(e.target.value)}
        placeholder="username"
      />
      <br />
      <label htmlFor="password">Password</label>
      <input
        type="password"
        value={password}
        id={"password"}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password"
      />
      <br />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
