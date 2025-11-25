import Layout from "./Layout.jsx";
import Hub from "./Hub";
import Arquetipo from "./Arquetipo";
import Chat from "./Chat";
import Portais from "./Portais";
import Criar from "./Criar";
import Notificacoes from "./Notificacoes";
import Arena from "./Arena";
import TiragemDiaria from "./TiragemDiaria";
import Pendulo from "./Pendulo";
import Progresso from "./Progresso";
import Distintivos from "./Distintivos";
import PlannerLunar from "./PlannerLunar";
import MinhaConta from "./MinhaConta";
import Configuracoes from "./Configuracoes";
import Horoscopo from "./Horoscopo";
import MapaAstral from "./MapaAstral";
import DiarioSonhos from "./DiarioSonhos";
import Temas from "./Temas";
import Explorar from "./Explorar";
import Loja from "./Loja";
import Carteira from "./Carteira";
import Perfil from "./Perfil";
import Produto from "./Produto";
import AreaDoAluno from "./AreaDoAluno";
import ArenaDuel from "./ArenaDuel";
import ArenaHub from "./ArenaHub";
import Dojo from "./Dojo";
import TarotOnline from "./TarotOnline";
import OraculoCoracao from "./OraculoCoracao";
import OraculoCombinacoes from "./OraculoCombinacoes";
import PortalTarotPremium from "./PortalTarotPremium";
import Missoes from "./Missoes";
import Ranking from "./Ranking";
import ZamiraCity from "./ZamiraCity";
import Inventario from "./Inventario";
import AdminZamira from "./AdminZamira";
import Suporte from "./Suporte";
import ZamiraAds from "./ZamiraAds";
import MandalaCriativa from "./MandalaCriativa";
import AuraDigital from "./AuraDigital";
import OraculoOpiniao from "./OraculoOpiniao";
import CicloMenstrual from "./CicloMenstrual";
import CofreTesouros from "./CofreTesouros";
import SantuarioSilencio from "./SantuarioSilencio";
import QuizzesMisticos from "./QuizzesMisticos";
import BibliotecaMistica from "./BibliotecaMistica";
import ComoGanharOuros from "./ComoGanharOuros";
import Certificado from "./Certificado";
import Enquetes from "./Enquetes";
import Home from "./Home";
import Sobre from "./Sobre";
import PlanoDeAcao from "./PlanoDeAcao";
import Kamasutra from "./Kamasutra";
import PortalEntrada from "./PortalEntrada";
import ConsultaEmelyn from "./ConsultaEmelyn";
import RoomConsulta from "./RoomConsulta";
import EspheraAI from "./EspheraAI";
import ConfiguracoesNotificacoes from "./ConfiguracoesNotificacoes";
import MagicArena from "./MagicArena";
import Enciclopedia from "./Enciclopedia";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    Hub: Hub,
    Arquetipo: Arquetipo,
    Chat: Chat,
    Portais: Portais,
    Criar: Criar,
    Notificacoes: Notificacoes,
    Arena: Arena,
    TiragemDiaria: TiragemDiaria,
    Pendulo: Pendulo,
    Progresso: Progresso,
    Distintivos: Distintivos,
    PlannerLunar: PlannerLunar,
    MinhaConta: MinhaConta,
    Configuracoes: Configuracoes,
    Horoscopo: Horoscopo,
    MapaAstral: MapaAstral,
    DiarioSonhos: DiarioSonhos,
    Temas: Temas,
    Explorar: Explorar,
    Loja: Loja,
    Carteira: Carteira,
    Perfil: Perfil,
    Produto: Produto,
    AreaDoAluno: AreaDoAluno,
    ArenaDuel: ArenaDuel,
    ArenaHub: ArenaHub,
    Dojo: Dojo,
    TarotOnline: TarotOnline,
    OraculoCoracao: OraculoCoracao,
    OraculoCombinacoes: OraculoCombinacoes,
    PortalTarotPremium: PortalTarotPremium,
    Missoes: Missoes,
    Ranking: Ranking,
    ZamiraCity: ZamiraCity,
    Inventario: Inventario,
    AdminZamira: AdminZamira,
    Suporte: Suporte,
    ZamiraAds: ZamiraAds,
    MandalaCriativa: MandalaCriativa,
    AuraDigital: AuraDigital,
    OraculoOpiniao: OraculoOpiniao,
    CicloMenstrual: CicloMenstrual,
    CofreTesouros: CofreTesouros,
    SantuarioSilencio: SantuarioSilencio,
    QuizzesMisticos: QuizzesMisticos,
    BibliotecaMistica: BibliotecaMistica,
    ComoGanharOuros: ComoGanharOuros,
    Certificado: Certificado,
    Enquetes: Enquetes,
    Home: Home,
    Sobre: Sobre,
    PlanoDeAcao: PlanoDeAcao,
    Kamasutra: Kamasutra,
    PortalEntrada: PortalEntrada,
    ConsultaEmelyn: ConsultaEmelyn,
    RoomConsulta: RoomConsulta,
    EspheraAI: EspheraAI,
    ConfiguracoesNotificacoes: ConfiguracoesNotificacoes,
    MagicArena: MagicArena,
    Enciclopedia: Enciclopedia,
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                {/* Rota padrão vai para o HUB agora */}
                <Route path="/" element={<Hub />} />
                
                <Route path="/Hub" element={<Hub />} />
                <Route path="/hub" element={<Hub />} />
                <Route path="/Arquetipo" element={<Arquetipo />} />
                <Route path="/Chat" element={<Chat />} />
                <Route path="/Portais" element={<Portais />} />
                <Route path="/Criar" element={<Criar />} />
                <Route path="/Notificacoes" element={<Notificacoes />} />
                <Route path="/Arena" element={<Arena />} />
                <Route path="/TiragemDiaria" element={<TiragemDiaria />} />
                <Route path="/Pendulo" element={<Pendulo />} />
                <Route path="/Progresso" element={<Progresso />} />
                <Route path="/Distintivos" element={<Distintivos />} />
                <Route path="/PlannerLunar" element={<PlannerLunar />} />
                <Route path="/MinhaConta" element={<MinhaConta />} />
                <Route path="/Configuracoes" element={<Configuracoes />} />
                <Route path="/Horoscopo" element={<Horoscopo />} />
                <Route path="/MapaAstral" element={<MapaAstral />} />
                <Route path="/DiarioSonhos" element={<DiarioSonhos />} />
                <Route path="/Temas" element={<Temas />} />
                <Route path="/Explorar" element={<Explorar />} />
                <Route path="/Loja" element={<Loja />} />
                <Route path="/Carteira" element={<Carteira />} />
                <Route path="/Perfil" element={<Perfil />} />
                <Route path="/Produto" element={<Produto />} />
                <Route path="/AreaDoAluno" element={<AreaDoAluno />} />
                <Route path="/ArenaDuel" element={<ArenaDuel />} />
                <Route path="/ArenaHub" element={<ArenaHub />} />
                <Route path="/Dojo" element={<Dojo />} />
                <Route path="/TarotOnline" element={<TarotOnline />} />
                <Route path="/OraculoCoracao" element={<OraculoCoracao />} />
                <Route path="/OraculoCombinacoes" element={<OraculoCombinacoes />} />
                <Route path="/PortalTarotPremium" element={<PortalTarotPremium />} />
                <Route path="/Missoes" element={<Missoes />} />
                <Route path="/Ranking" element={<Ranking />} />
                <Route path="/ZamiraCity" element={<ZamiraCity />} />
                <Route path="/Inventario" element={<Inventario />} />
                <Route path="/AdminZamira" element={<AdminZamira />} />
                <Route path="/Suporte" element={<Suporte />} />
                <Route path="/ZamiraAds" element={<ZamiraAds />} />
                <Route path="/MandalaCriativa" element={<MandalaCriativa />} />
                <Route path="/AuraDigital" element={<AuraDigital />} />
                <Route path="/OraculoOpiniao" element={<OraculoOpiniao />} />
                <Route path="/CicloMenstrual" element={<CicloMenstrual />} />
                <Route path="/CofreTesouros" element={<CofreTesouros />} />
                <Route path="/SantuarioSilencio" element={<SantuarioSilencio />} />
                <Route path="/QuizzesMisticos" element={<QuizzesMisticos />} />
                <Route path="/BibliotecaMistica" element={<BibliotecaMistica />} />
                <Route path="/ComoGanharOuros" element={<ComoGanharOuros />} />
                <Route path="/Certificado" element={<Certificado />} />
                <Route path="/Enquetes" element={<Enquetes />} />
                <Route path="/Home" element={<Home />} />
                <Route path="/Sobre" element={<Sobre />} />
                <Route path="/PlanoDeAcao" element={<PlanoDeAcao />} />
                <Route path="/Kamasutra" element={<Kamasutra />} />
                <Route path="/PortalEntrada" element={<PortalEntrada />} />
                <Route path="/ConsultaEmelyn" element={<ConsultaEmelyn />} />
                <Route path="/RoomConsulta" element={<RoomConsulta />} />
                <Route path="/EspheraAI" element={<EspheraAI />} />
                <Route path="/ConfiguracoesNotificacoes" element={<ConfiguracoesNotificacoes />} />
                <Route path="/MagicArena" element={<MagicArena />} />
                <Route path="/Enciclopedia" element={<Enciclopedia />} />
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}
