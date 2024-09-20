/* eslint-disable no-unused-vars */
import React from "react";
import Select from "./Select";
import { Button } from "@mui/material";

function MenuInicio() {
  const [congre, setCongre] = React.useState("");

  const handleChange = (event) => {
    setCongre(event.target.value);
  };
  return (
    <>
      <h2>Congregaciones</h2>
      <Select handleChange={handleChange} />
      <Button>Grupo 1</Button>
      <article className="flex flex-col p-6 gap-6">
        
      <div className="">
        <label htmlFor="">Nombre</label>
        <input
          className="border-2 border-green-900"
          type="text"
          name=""
          id=""
        />
        <label htmlFor="">Participó?</label>
        <input
          className="border-2 border-green-300"
          type="checkbox"
          name=""
          id=""
        />
        <label htmlFor="">Estudios</label>
        <input
          className="border-2 border-green-300"
          type="number"
          name=""
          id=""
        />
        <label htmlFor="">Precursor Auxiliar</label>
        <input
          className="border-2 border-green-300"
          type="checkbox"
          name=""
          id=""
        />
        <label htmlFor="">Horas</label>
        <input
          className="border-2 border-green-300"
          type="number"
          name=""
          id=""
        />
      </div>
      <div className="">
        <label htmlFor="">Nombre</label>
        <input
          className="border-2 border-green-300"
          type="text"
          name=""
          id=""
        />
        <label htmlFor="">Participó?</label>
        <input
          className="border-2 border-green-300"
          type="checkbox"
          name=""
          id=""
        />
        <label htmlFor="">Estudios</label>
        <input
          className="border-2 border-green-300"
          type="number"
          name=""
          id=""
        />
        <label htmlFor="">Precursor Auxiliar</label>
        <input
          className="border-2 border-green-300"
          type="checkbox"
          name=""
          id=""
        />
        <label htmlFor="">Horas</label>
        <input
          className="border-2 border-green-300"
          type="number"
          name=""
          id=""
        />
      </div>
      </article>
    </>
  );
}

export default MenuInicio;
