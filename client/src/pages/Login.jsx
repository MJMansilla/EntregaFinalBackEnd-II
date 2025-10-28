
import React, { useState } from 'react';

export default function Login(){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [msg,setMsg]=useState('');

  const submit = async (e)=>{
    e.preventDefault();
    setMsg('');
    try{
      const res = await fetch('http://localhost:3000/api/sessions/login', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({email,password})
      });
      const data = await res.json();
      if(res.ok){
        localStorage.setItem('token', data.token);
        setMsg('Login exitoso 🎉');
      } else {
        setMsg(data.error || 'Error');
      }
    } catch(err){
      setMsg('Error de conexión');
    }
  };

  return (
    <div style={{maxWidth:400}}>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <div><input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%'}}/></div>
        <div><input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%', marginTop:8}}/></div>
        <button style={{marginTop:10}}>Ingresar</button>
      </form>
      <p>{msg}</p>
      <p>Para probar admin: crea un usuario vía POST /api/users con role 'admin' (por ejemplo en Postman)</p>
    </div>
  );
}
