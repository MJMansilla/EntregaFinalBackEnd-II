import React, { useEffect, useState } from "react";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState("");

  async function load() {
    setMsg("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/users", {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      } else {
        setMsg(data.error || "Error");
      }
    } catch (err) {
      setMsg("Error de conexión");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function promote(id) {
    const role = prompt("Ingresar nuevo rol (user/admin)");
    if (!role) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/api/users/${id}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Rol actualizado");
        load();
      } else {
        setMsg(data.error || "Error");
      }
    } catch (err) {
      setMsg("Error de conexión");
    }
  }

  return (
    <div>
      <h2>Usuarios (solo admins)</h2>
      <p>{msg}</p>
      <button onClick={load}>Refrescar</button>
      <table border="1" cellPadding="8" style={{ marginTop: 10 }}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>
                {u.first_name} {u.last_name}
              </td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <button onClick={() => promote(u._id)}>Cambiar rol</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
