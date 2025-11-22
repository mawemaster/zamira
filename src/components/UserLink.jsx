import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function UserLink({ user, children, className = "" }) {
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (user?.username) {
      navigate(createPageUrl("Perfil") + `?username=${user.username}`);
    } else if (user?.id) {
      navigate(createPageUrl("Perfil") + `?id=${user.id}`);
    }
  };

  return (
    <div onClick={handleClick} className={`cursor-pointer inline-block ${className}`}>
      {children}
    </div>
  );
}