
import React, { useEffect, useState } from 'react';

export default function Profile(){
  const [user,setUser]=useState(null);
  const [msg,setMsg]=useState('');

  useEffect(()=> {
    async function load(){
      setMsg('');
      try{
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3000/api/sessions/current', {
          headers: { Authorization: 'Bearer ' + token }
        });
        const data = await res.json();
        if(res.ok){
          setUser(data);
        } else {
          setMsg(data.error || 'Error');
        }
      } catch(err){
        setMsg('Error de conexión');
      }
    }
    load();
  }, []);

  if(msg) return <div><p>{msg}</p></div>;
  if(!user) return <div>Loading...</div>;

  return (
    <div>
      <h2>Mi Perfil</h2>
      <p><b>Nombre:</b> {user.first_name} {user.last_name}</p>
      <p><b>Email:</b> {user.email}</p>
      <p><b>Rol:</b> {user.role}</p>
    </div>
  );
}
