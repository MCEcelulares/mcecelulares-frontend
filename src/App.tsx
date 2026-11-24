import { Route, Routes } from 'react-router-dom'
import { ExigePermissao } from './components/admin/ExigePermissao'
import { RotaProtegida } from './components/auth/RotaProtegida'
import { CheckoutLayout } from './components/layout/CheckoutLayout'
import { Layout } from './components/layout/Layout'
import { PERMISSAO } from './lib/permissoes'
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
import AdminInicio from './pages/admin/AdminInicio'
import { AdminCategorias, AdminMarcas } from './pages/admin/AdminCategoriasMarcas'
import AdminLayout from './pages/admin/AdminLayout'
import AdminPedidoDetalhe from './pages/admin/AdminPedidoDetalhe'
import AdminPedidos from './pages/admin/AdminPedidos'
import AdminProdutoForm from './pages/admin/AdminProdutoForm'
import AdminUsuarioForm from './pages/admin/AdminUsuarioForm'
import AdminVendas from './pages/admin/AdminVendas'
import AdminUsuarios from './pages/admin/AdminUsuarios'
import AdminProdutos from './pages/admin/AdminProdutos'
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
          <Route path="admin" element={<ExigePermissao permissao={PERMISSAO.painel} />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminInicio />} />
              <Route element={<ExigePermissao permissao={PERMISSAO.dashboard} />}>
                <Route path="vendas" element={<AdminVendas />} />
              </Route>
              <Route element={<ExigePermissao permissao={PERMISSAO.catalogo} />}>
                <Route path="produtos" element={<AdminProdutos />} />
                <Route path="produtos/novo" element={<AdminProdutoForm />} />
                <Route path="produtos/:id" element={<AdminProdutoForm />} />
                <Route path="categorias" element={<AdminCategorias />} />
                <Route path="marcas" element={<AdminMarcas />} />
              </Route>
              <Route element={<ExigePermissao permissao={PERMISSAO.usuariosListar} />}>
                <Route path="usuarios" element={<AdminUsuarios />} />
                <Route path="usuarios/:id" element={<AdminUsuarioForm />} />
              </Route>
              <Route element={<ExigePermissao permissao={PERMISSAO.pedidosListar} />}>
                <Route path="pedidos" element={<AdminPedidos />} />
                <Route path="pedidos/:id" element={<AdminPedidoDetalhe />} />
              </Route>
            </Route>
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
