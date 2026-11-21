import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../styles/globals.css";
import ProfilePage from "./ProfilePage";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ProfilePage />
  </StrictMode>,
);
