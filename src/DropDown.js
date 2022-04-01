import React, { useState } from "react";
import { FormControl } from "react-bootstrap";

export const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <a
      className="menu-link"
      href=""
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
    >
      {children} 
    </a>
  ));

  