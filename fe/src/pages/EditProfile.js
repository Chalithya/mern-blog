import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function EditProfile() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [files, setFiles] = useState("");
  const [password, setPassword] = useState("");
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    fetch("http://localhost:4000/profile/", {
      credentials: "include",
    }).then((response) => {
      response.json().then((userInfo) => {
        setUsername(userInfo.username);
        setEmail(userInfo.email);
        setFiles(userInfo?.profilePicture);
      });
    });
  }, []);

  const validateEmail = (inputValue) => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const isValid = emailRegex.test(inputValue);
    setIsValidEmail(isValid);
  };

  const handleEmailChange = (ev) => {
    const inputValue = ev.target.value;
    setEmail(inputValue);
    validateEmail(inputValue);
  };

  async function updateProfile(ev) {
    ev.preventDefault();
    const data = new FormData();
    data.set("username", username);
    data.set("email", email);
    data.set("password", password);
    if (files?.[0]) {
      data.set("file", files?.[0]);
    }
    const response = await fetch("http://localhost:4000/profile/", {
      method: "PUT",
      body: data,
      credentials: "include",
    });
    if (response.ok) {
      fetch("http://localhost:4000/logout", {
        credentials: "include",
        method: "POST",
      });
      setRedirect(true);
      alert("Profile updated successfully");
    }
  }

  if (redirect) {
    return <Navigate to="/login" />;
  }

  return (
    <form onSubmit={updateProfile}>
      <input
        type="username"
        placeholder={"Username"}
        value={username}
        onChange={(ev) => setUsername(ev.target.value)}
        required
      />
      <input
        type="email"
        placeholder={"email"}
        value={email}
        onChange={handleEmailChange}
      />
      <input
        type="password"
        placeholder={"password"}
        value={password}
        onChange={(ev) => setPassword(ev.target.value)}
        required
      />
      <input type="file" onChange={(ev) => setFiles(ev.target.files)} />
      <button style={{ marginTop: "5px", marginBottom: "10px" }}>
        Update post
      </button>
      <div className="image">
        <img src={`http://localhost:4000/${files}`} alt="" />
      </div>
    </form>
  );
}
