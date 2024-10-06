import {createRoot} from 'react-dom/client';
import './index.css'
import {StrictMode} from "react";
import App from "./App.tsx";
import {client} from "./api";

client.setConfig({
  baseURL: '/api',
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
