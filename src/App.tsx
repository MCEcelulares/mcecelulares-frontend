import { Route, Routes } from 'react-router-dom'
import { RotaProtegida } from './components/auth/RotaProtegida'
import { CheckoutLayout } from './components/layout/CheckoutLayout'
import { Layout } from './components/layout/Layout'
import Cadastro from './pages/Cadastro'
import Carrinho from './pages/Carrinho'
import Checkout from './pages/Checkout'
import Contato from './pages/Contato'
import CheckoutPagamento from './pages/CheckoutPagamento'
import CheckoutRetorno from './pages/CheckoutRetorno'
import Home from './pages/Home'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import PedidoDetalhe from './pages/PedidoDetalhe'
import Pedidos from './pages/Pedidos'
import ContaLayout from './pages/conta/ContaLayout'
import DadosConta from './pages/conta/DadosConta'
import EnderecosConta from './pages/conta/EnderecosConta'
import Seguranca from './pages/conta/Seguranca'
import ProdutoDetalhe from './pages/ProdutoDetalhe'
import Produtos from './pages/Produtos'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="produtos" element={<Produtos />} />
        <Route path="produtos/:id" element={<ProdutoDetalhe />} />
        <Route path="login" element={<Login />} />
        <Route path="cadastro" element={<Cadastro />} />
        <Route path="contato" element={<Contato />} />
        <Route element={<RotaProtegida />}>
          <Route path="carrinho" element={<Carrinho />} />
          <Route path="pedidos" element={<Pedidos />} />
          <Route path="pedidos/:id" element={<PedidoDetalhe />} />
          <Route path="conta" element={<ContaLayout />}>
            <Route index element={<DadosConta />} />
            <Route path="enderecos" element={<EnderecosConta />} />
            <Route path="seguranca" element={<Seguranca />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route element={<RotaProtegida />}>
        <Route element={<CheckoutLayout />}>
          <Route path="checkout" element={<Checkout />} />
          <Route path="checkout/pagamento/:id" element={<CheckoutPagamento />} />
          <Route path="checkout/retorno/:id" element={<CheckoutRetorno />} />
        </Route>
      </Route>
    </Routes>
  )
}
