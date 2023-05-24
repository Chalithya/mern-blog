import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";

export default function EditPost() {
  const { id } = useParams();
  const [heading, setHeading] = useState("");
  const [postBody, setPostBody] = useState("");
  const [files, setFiles] = useState("");
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    fetch("http://localhost:4000/post/" + id).then((response) => {
      response.json().then((postInfo) => {
        setHeading(postInfo.heading);
        setPostBody(postInfo.postBody);
        setFiles(postInfo?.coverImage);
      });
    });
  }, []);

  async function updatePost(ev) {
    ev.preventDefault();
    const data = new FormData();
    data.set("heading", heading);
    data.set("postBody", postBody);
    data.set("id", id);
    if (files?.[0]) {
      data.set("file", files?.[0]);
    }
    const response = await fetch("http://localhost:4000/post/" + id, {
      method: "PUT",
      body: data,
      credentials: "include",
    });
    if (response.ok) {
      setRedirect(true);
    }
  }

  if (redirect) {
    return <Navigate to={"/post/" + id} />;
  }

  return (
    <form onSubmit={updatePost}>
      <input
        type="title"
        placeholder={"Title"}
        value={heading}
        onChange={(ev) => setHeading(ev.target.value)}
      />
      <input
        type="postBody"
        placeholder={"postBody"}
        value={postBody}
        onChange={(ev) => setPostBody(ev.target.value)}
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
