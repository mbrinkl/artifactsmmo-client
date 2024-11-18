import { useState } from "react";
import { tokenStorageKey } from "./config";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem(tokenStorageKey));

  const updateToken = (value: string) => {
    localStorage.setItem(tokenStorageKey, value);
    setToken(value);
  };

  const clearToken = () => {
    localStorage.removeItem(tokenStorageKey);
    setToken(null);
  };

  if (!token) {
    return <Login updateToken={updateToken} />;
  }

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column" }}>
      <button onClick={clearToken}>Clear Token</button>
      <Dashboard token={token} />
    </div>
  );
};

export default App;