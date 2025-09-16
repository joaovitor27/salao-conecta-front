import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import Home from '@/pages/Home.tsx';
// import { type SyntheticEvent, useState } from 'react';
// import { Button } from 'components/ui/Button';
// import { Box } from '@mui/material';
// import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './components/ui/Accordion.tsx';

function App() {
  // const [expanded, setExpanded] = useState<string | false>(false);

  // const handleChange = (panel: string) => (_event: SyntheticEvent, isExpanded: boolean) => {
  //   setExpanded(isExpanded ? panel : false);
  // };

  return (
    <>
      <BrowserRouter basename={'/'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="login" element={<Login />} />
        </Routes>
      </BrowserRouter>
      {/*<Box sx={{ display: 'flex', gap: 2, p: 4, flexWrap: 'wrap' }}>*/}
      {/*  <Button variant="default">Botão Padrão</Button>*/}
      {/*  <Button variant="hero">Entrar como cliente</Button>*/}
      {/*  <Button variant="accent">Botão de Acento</Button>*/}
      {/*  <Button variant="beauty">Botão Beauty</Button>*/}
      {/*  <Button variant="outline">Botão Outline</Button>*/}
      {/*  <Button variant="destructive">Botão Perigoso</Button>*/}
      {/*  <Button variant="ghost">Botão Ghost</Button>*/}
      {/*  <Button variant="link">Botão Link</Button>*/}

      {/*  <Accordion>*/}
      {/*    <AccordionItem*/}
      {/*      value="panel1"*/}
      {/*      expanded={expanded === 'panel1'} // ✅ Passado para o AccordionItem*/}
      {/*      onChange={handleChange('panel1')} // ✅ Passado para o AccordionItem*/}
      {/*    >*/}
      {/*      <AccordionTrigger>O que é o Salão Conecta?</AccordionTrigger>*/}
      {/*      <AccordionContent>O Salão Conecta é uma plataforma que conecta salões de beleza a clientes...</AccordionContent>*/}
      {/*    </AccordionItem>*/}
      {/*    <AccordionItem*/}
      {/*      value="panel2"*/}
      {/*      expanded={expanded === 'panel2'} // ✅ Passado para o AccordionItem*/}
      {/*      onChange={handleChange('panel2')} // ✅ Passado para o AccordionItem*/}
      {/*    >*/}
      {/*      <AccordionTrigger>Como posso agendar um serviço?</AccordionTrigger>*/}
      {/*      <AccordionContent>Para agendar, basta escolher o salão, o serviço e o horário desejado...</AccordionContent>*/}
      {/*    </AccordionItem>*/}
      {/*    <AccordionItem*/}
      {/*      value="panel3"*/}
      {/*      expanded={expanded === 'panel3'} // ✅ Passado para o AccordionItem*/}
      {/*      onChange={handleChange('panel3')} // ✅ Passado para o AccordionItem*/}
      {/*    >*/}
      {/*      <AccordionTrigger>Quais os métodos de pagamento aceitos?</AccordionTrigger>*/}
      {/*      <AccordionContent>Aceitamos pagamento por cartão de crédito, débito e Pix...</AccordionContent>*/}
      {/*    </AccordionItem>*/}
      {/*  </Accordion>*/}
      {/*</Box>*/}
    </>
  );
}

export default App;
