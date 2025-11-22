import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

// Criando o "motor" de dados
const queryClient = new QueryClient()

function App() {
  return (
    // Envolvendo o site inteiro com o provedor de dados
    <QueryClientProvider client={queryClient}>
      <Pages />
      <Toaster />
    </QueryClientProvider>
  )
}

export default App