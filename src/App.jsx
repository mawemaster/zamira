import React from 'react';
import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Analytics } from "@vercel/analytics/react" // Importação correta para Vite

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Pages />
      <Toaster />
      <Analytics />
    </QueryClientProvider>
  )
}

export default App