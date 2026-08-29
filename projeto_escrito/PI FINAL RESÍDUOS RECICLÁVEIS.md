RESÍDUOS RECICLÁVEIS NA FATEC FRANCO DA ROCHA:
proposta de software para apoio tecnológico à catadores autônomos
Grazyelle Pontes Vieira
Isabela Rocha dos Santos
Jennifer Santos Lima
Maria Eduarda de Moraes dos Santos
Thamires Gomes Cezar
Vitória Gonçalves de Abreu Lopes
Fatec Franco da Rocha, Gestão da Tecnologia da Informação
RESUMO
Este estudo analisa o processo de destinação de resíduos recicláveis na Fatec Franco da
Rocha e visa incentivar a educação ambiental na comunidade acadêmica, com o
objetivo de realizar a modelagem de software e do banco de dados de uma solução
tecnológica voltada ao gerenciamento deste fluxo e ao apoio ao trabalho de catadores
autônomos. A pesquisa justifica-se pela necessidade de aprimoramento do processo
institucional de coleta e destinação de materiais recicláveis, uma vez que no cenário
inicial é feita manualmente. Metodologicamente, esta pesquisa caracteriza-se como
qualitativa, desenvolvida por meio de estudo de caso, pesquisa de campo e revisão
bibliográfica, com aplicação de entrevistas e questionários para levantamento de
requisitos e compreensão do contexto analisado. A análise evidencia aspectos
relacionados à separação, armazenamento e comunicação para coleta, bem como à
ausência de controle sistematizado das informações. Para a modelagem da solução
proposta, aplicam-se conceitos de engenharia de software, como definição de requisitos,
elaboração de diagramas de casos de uso e de classes e desenvolvimento de protótipo
não funcional, em conjunto com princípios de modelagem de banco de dados, por meio
da estruturação de entidades, atributos e relacionamentos, visando garantir organização,
integridade e confiabilidade das informações. Como resultado, propõe-se uma
plataforma tecnológica capaz de registrar a disponibilidade de resíduos, facilitar a
comunicação entre os envolvidos e apoiar a gestão das coletas. Espera-se, portanto, que
a solução proposta contribua para a melhoria do processo, o fortalecimento de práticas
sustentáveis e a valorização do trabalho dos catadores.
Palavras-chave: Gestão de Resíduos Recicláveis. Modelagem de Banco de Dados.
Engenharia de Software. Catadores Autônomos. Educação Ambiental.
ABSTRACT
This study analyzes the process of recyclable waste disposal at Fatec Franco da Rocha
and aims to encourage environmental education within the academic community, with
the objective of modeling the software and database of a technological solution focused
on managing this flow and supporting the work of independent waste pickers. The
research is justified by the need to improve the institutional process of collecting and
disposing of recyclable materials, since no initial scenario is done manually.
Methodologically, this research is characterized as qualitative, developed through a case
study, field research, and literature review, with the application of interviews and
questionnaires to gather requirements and understand the analyzed context. The analysis
highlights aspects related to separation, storage, and communication for collection, as
well as the lack of systematized information control. For the modeling of the proposed
1
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
solution, software engineering concepts are applied, such as requirements definition,
elaboration of use case and class diagrams, and development of a non-functional
prototype, in conjunction with database modeling principles, through the structuring of
entities, attributes, and relationships, ensuring the organization, integrity, and reliability
of the information. As a result, a technological platform is proposed that can register the
availability of waste, facilitate communication between those involved, and support the
management of collections. It is expected, therefore, that the proposal will contribute to
improving the process, strengthening sustainable practices, and valuing the work of
waste pickers.
Key-words: Recyclable Waste Management. Database Modeling. Software
Engineering. Independent Waste Pickers. Environmental Education.
1. INTRODUÇÃO
Segundo a Política Nacional de Resíduos Sólidos, a destinação adequada de resíduos
```
recicláveis (como plástico, papel, vidro e metal) é o processo de dar o destino correto a
```
esses materiais, que são separados do lixo comum e enviados para processos de
reciclagem ou outras formas de tratamento e aproveitamento. Esse processo é
fundamental para reduzir o volume de resíduos enviados para aterros, de modo que o
```
que seria lixo se transforma em novos produtos ou matéria-prima (Brasil, 2010).
```
Esse processo é um desafio em instituições que buscam demonstrar compromisso
com a sustentabilidade. É o caso da Fatec Franco da Rocha, uma faculdade pública de
tecnologia do estado de São Paulo, onde a separação de resíduos para reciclagem ocorre
de forma voluntária pelos funcionários, sem um procedimento formal ou padronizado.
Nesse contexto, torna-se necessário investigar como a destinação de resíduos recicláveis
pode ser aprimorada diante das limitações estruturais e legais da instituição.
Além disso, a venda de materiais recicláveis por parte de qualquer colaborador na
instituição pública estudada não é permitida por lei. O Estatuto dos Funcionários
Públicos de São Paulo proíbe que o servidor use o cargo ou os bens da instituição para
```
ter lucro pessoal (São Paulo, 1968, art. 243). Como os materiais são descartados por
```
toda a comunidade acadêmica, a apropriação individual desse lucro seria injusta, o que
limita as alternativas para a destinação correta desses resíduos. Essa limitação evidencia
a necessidade de compreender os fatores que impedem a adoção de práticas mais
eficazes e sustentáveis para o descarte desses materiais.
Diante desse cenário, surge a oportunidade de apoiar catadores autônomos,
empreendedores informais que coletam e comercializam materiais recicláveis, para
gerar renda própria e contribuir com a destinação adequada dos resíduos. Mostra-se
2
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
necessário então, entender quais os fatores da reciclagem que podem gerar renda para a
comunidade local.
Portanto, a pesquisa visa mapear o processo de coleta, separação, armazenamento e
descarte de resíduos recicláveis na Fatec Franco da Rocha, para identificar
oportunidades de melhoria na comunicação entre a instituição e os catadores. A partir
desse levantamento, realiza-se a modelagem das funcionalidades e do banco de dados
de uma solução tecnológica voltada à organização dessas atividades e ao apoio aos
catadores autônomos.
1.1 Objetivos
Este estudo tem como objetivo geral realizar a modelagem de software e do banco
de dados de uma solução tecnológica voltada ao gerenciamento e à destinação de
resíduos recicláveis na Fatec de Franco da Rocha e ao apoio ao trabalho de catadores
autônomos.
Os objetivos específicos são:
▪ Realizar levantamento de dados por meio de entrevistas e questionários junto aos
```
envolvidos no processo para compreender as necessidades do negócio;
```
```
▪ Identificar os prováveis usuários da solução e elaborar o mapa de personas;
```
```
▪ Elaborar o mapa de empatia para a principal persona identificada;
```
▪ Realizar a modelagem de software da aplicação a fim de atender às necessidades do
```
negócio;
```
```
▪ Realizar a modelagem do banco de dados;
```
▪ Desenvolver o protótipo não funcional para atender ao negócio estudado.
1.2 Justificativa
A escolha do tema nasceu a partir de entrevistas e questionários realizados com os
envolvidos, onde se observou o acúmulo de resíduos recicláveis gerados pela Fatec
Franco da Rocha e a presença, no município, de profissionais que dependem da coleta
seletiva para gerar renda. Diante desse cenário, identificou-se a oportunidade de analisar
o gerenciamento desses materiais e propor uma aplicação tecnológica capaz de apoiar o
trabalho dos catadores autônomos, bem como incentivar a educação ambiental e práticas
sustentáveis na comunidade acadêmica.
Embora já existam soluções voltadas à gestão de resíduos e ao apoio aos catadores,
nenhuma atende às condições específicas da Fatec Franco da Rocha, ao considerar suas
3
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
restrições legais, estruturais e operacionais. Por isso, é necessário desenvolver uma
solução adaptada à realidade local, que contemple as particularidades da instituição e da
comunidade envolvida.
O estudo também se destaca pela relevância social, ao reconhecer o trabalho dos
catadores independentes, que comercializam os materiais coletados em centros
autorizados e contribuem para a economia circular. Além disso, a realização do
levantamento de informações junto aos envolvidos na coleta e destinação de resíduos
recicláveis possibilita identificar necessidades relacionadas à organização da coleta e da
destinação dos materiais, bem como funcionalidades capazes de apoiar essa atividade.
Com base nisso, a pesquisa se justifica por contribuir para a estruturação dos
requisitos do sistema e dos dados necessários para uma solução tecnológica relacionada
ao processo de coleta e destinação de resíduos recicláveis na instituição. Dessa forma,
considera-se a integração entre a Fatec e os catadores autônomos no processo de
destinação dos materiais, o incentivo a práticas de sustentabilidade na comunidade
acadêmica e o alinhamento do projeto aos Objetivos de Desenvolvimento Sustentável
```
(ODS) da Agenda 2030.
```
1.3 Metodologia da Pesquisa
A fim de aprofundar a análise do objeto de estudo, os seguintes métodos foram
adotados para o desenvolvimento deste projeto:
▪ Pesquisa bibliográfica:
```
De acordo com Gil (2010), a pesquisa bibliográfica é desenvolvida a partir de
```
material já elaborado como livros, artigos e publicações acadêmicas, e tem por
finalidade fornecer uma base teórica que sustente e oriente o estudo. Assim, realizou-se
um levantamento de literatura, artigos acadêmicos e materiais online relacionados à
gestão de resíduos recicláveis, à engenharia de software e bancos de dados. As buscas
foram realizadas em portais institucionais, como os do Centro Paula Souza e da Fatec
Franco da Rocha, além de repositórios universitários, como os da Universidade de São
Paulo, da Universidade Federal do Rio Grande do Sul e da Universidade Federal de
Alagoas, a fim de fundamentar teoricamente a pesquisa.
▪ Estudo de caso:
```
Conforme definido por Yin (2015), o estudo de caso é uma estratégia de pesquisa que
```
investiga um fenômeno contemporâneo dentro de seu contexto real, especialmente
quando as fronteiras entre o fenômeno e o contexto não são claramente delimitadas.
4
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
Assim, optou-se pela análise do contexto real da Fatec Franco da Rocha, necessária para
compreender como a gestão de resíduos recicláveis impacta os processos dentro da
instituição e no município.
▪ Pesquisa de campo:
```
Segundo Lakatos e Marconi (2017), a pesquisa de campo caracteriza-se pela
```
observação direta dos fatos no local em que ocorrem, com objetivo de buscar
informações junto às pessoas envolvidas no fenômeno estudado. Dessa forma, foram
aplicadas entrevistas e questionários a funcionários da instituição diretamente ligados ao
processo de gestão de resíduos recicláveis, bem como a uma catadora que atua na coleta
desses materiais, com o objetivo de identificar as necessidades dos envolvidos e
compreender como ocorre o processo na prática.
```
A abordagem metodológica de uma pesquisa, conforme a classificação de Gil (2010),
```
pode ser dividida entre quantitativa, focada na mensuração de dados numéricos e
análises estatísticas, ou qualitativa, que prioriza a compreensão profunda de fenômenos,
comportamentos e opiniões. Para este projeto, a metodologia utilizada foi
predominantemente qualitativa, escolha que se justifica pela ausência de registros
históricos formais sobre o descarte de resíduos na instituição e pela delimitação do
escopo, que buscou compreender a realidade e o fluxo de trabalho de uma catadora
autônoma local. Essa abordagem permitiu alinhar o estudo de caso na Fatec de Franco
da Rocha e a pesquisa de campo às necessidades reais dos envolvidos, trazendo os
subsídios práticos necessários para o levantamento de requisitos, a modelagem das
funcionalidades e a estruturação do banco de dados da aplicação.
2. REVISÃO DA LITERATURA
Este capítulo apresenta os conceitos teóricos necessários para embasar o
mapeamento dos processos e a modelagem do sistema proposto, servindo como base
para o estudo de caso realizado na Fatec Franco da Rocha.
Para estruturar a pesquisa, o capítulo aborda inicialmente a Gestão de Resíduos
Recicláveis, Soluções Tecnológicas Existentes e A Importância do Entendimento do
Negócio, explicando como funciona o descarte de materiais, o trabalho dos catadores e
as soluções tecnológicas já existentes no mercado. Na sequência, apresentam-se os
fundamentos de Engenharia de Software e Banco de Dados, que servem como base
técnica para o levantamento de requisitos e a modelagem da aplicação.
5
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
2.1 Sobre a Gestão de Resíduos Recicláveis
A gestão de resíduos recicláveis se tornou indispensável para a preservação do meio
ambiente e do ser humano. Conforme as sociedades cresceram e se desenvolveram
industrialmente, a geração de resíduos sólidos também aumentou, mas o seu descarte
incorreto trouxe consequências negativas para a saúde pública e para a natureza. Para
minimizar os impactos, foi criada no Brasil a Política Nacional de Resíduos Sólidos
```
(PNRS), instituída pela Lei nº 12.305/2010, com objetivo de reduzir, reciclar, fazer com
```
que ocorra o descarte para os locais corretos e promover a inclusão social de catadores.
Alinhada a essa legislação, a gestão eficiente também depende da educação
ambiental para conscientizar a comunidade sobre a hierarquia dos 5 Rs, metodologia
que se divide em cinco diretrizes ordenadas por prioridade: Repensar, que propõe a
reflexão sobre os hábitos de consumo e a real necessidade de aquisição de novos
```
produtos; Recusar, que orienta a rejeição de produtos que gerem impactos ambientais
```
```
significativos ou embalagens desnecessárias; Reduzir, focado na diminuição da
```
```
quantidade de matéria-prima e energia consumidas no cotidiano; Reutilizar, que
```
```
incentiva o aumento da vida útil dos objetos antes de seu descarte; e, por fim, Reciclar,
```
técnica que transforma os materiais descartados em novos insumos, sendo adotada
```
como etapa final para o volume de resíduos que não pôde ser evitado (Brasil, 2010).
```
```
Segundo dados da ABREMA (2025), o Brasil gerou cerca de 81,6 milhões de
```
toneladas de resíduos sólidos urbanos. Desse total, os serviços públicos de coleta
regular foram responsáveis por cerca de 88% do volume gerado, enquanto a coleta
informal, realizada por catadores autônomos sem vínculo com associações ou
```
cooperativas, respondeu por 5,7% (aproximadamente 4,6 milhões de toneladas).
```
Destaca-se que essa atuação informal representa a base da reciclagem no país, sendo
responsável por 64,8% de todos os materiais secos efetivamente encaminhados para a
recuperação.
```
Diante da relevância da coleta informal no país, estudos como os de Jacobi (2006),
```
```
Waldman (2008) e Dias (2009) destacam que os catadores de materiais recicláveis
```
desempenham papel fundamental na sociedade. Os autores ressaltam que, mesmo diante
da frequente ausência de estrutura, segurança e de condições de vulnerabilidade, o
esforço desses profissionais para a geração de renda pessoal atua como agente
ambiental, fortalecendo a integração entre os envolvidos no processo e contribuindo
6
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
diretamente para a saúde coletiva, a qualidade do meio ambiente e o reaproveitamento
de materiais.
Diante desse cenário, é importante que instituições de ensino incentivem a
sustentabilidade e a gestão adequada dos resíduos, ao mostrar a importância do trabalho
dos catadores e promover práticas responsáveis entre seus públicos. Ao implantar ações
educativas, ambientais e sociais, essas instituições podem exercer um papel
transformador em suas comunidades.
Nesse sentido, a economia circular visa diminuir os impactos ambientais e fortalecer
a participação da sociedade em práticas de reciclagem e no uso de novas tecnologias
```
(Brasil, 2025). Comprometida com esse objetivo, a Fatec Franco da Rocha, promove a
```
sustentabilidade no ambiente acadêmico, ao realizar projetos, palestras e atividades
curriculares sobre desenvolvimento sustentável.
Além disso, a instituição pública se destaca por desenvolver iniciativas de educação
```
ambiental que, conforme aponta Jacobi (2006), são essenciais para a conscientização
```
sobre a redução de resíduos e a prática da coleta seletiva. Tais ações estão alinhadas à
política ambiental da instituição, que orienta seu compromisso com a sustentabilidade
```
(Fatec Franco da Rocha, 2025).
```
Nesse sentido, a Fatec Franco da Rocha, que iniciou suas atividades no segundo
semestre de 2018, implementa práticas voltadas à separação e destinação correta de
materiais. Essas iniciativas fortalecem o desenvolvimento sustentável local ao
conscientizar o público acadêmico, estimulando mudanças de hábito que se estendem
para a comunidade externa e promovem a reflexão sobre os problemas socioambientais
do município.
Apesar das práticas de separação e destinação de resíduos existentes na Fatec Franco
da Rocha, ainda não há soluções tecnológicas específicas que permitam registrar a
quantidade de materiais coletados e facilitar a comunicação entre a instituição e os
catadores. Tal lacuna evidencia a necessidade de alternativas adaptadas à realidade
local, que considerem tanto o impacto ambiental quanto o incentivo à geração de renda
para os catadores autônomos.
2.1.1 Soluções Tecnológicas Existentes
Ao analisar soluções tecnológicas que visam favorecer a reciclagem, destacam-se o
Cataki, aplicativo que visa aproximar os profissionais da reciclagem dos geradores de
7
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
resíduos, e o Ecoari, aplicativo que incentiva a doação de recicláveis por meio do
acúmulo de pontos para troca por benefícios.
No caso do Cataki, a proposta é que o solicitante da coleta remunere diretamente o
catador pelo serviço prestado, o que gera renda e inclusão social para trabalhadores da
```
reciclagem (Cataki, 2025). Já o Ecoari adota um modelo baseado em recompensas, no
```
qual os doadores de resíduos recicláveis acumulam pontos que podem ser trocados por
```
prêmios ou pagamento via PIX, o que estimula o engajamento da população (Ecoari,
```
```
2025).
```
Por outro lado, na Fatec Franco da Rocha, por se tratar de uma instituição pública
vinculada ao Centro Paula Souza, a implementação de iniciativas como a destinação de
verba para remunerar catadores autônomos ou permitir que funcionários se cadastrem
em aplicativos para obter benefício financeiro com a doação de materiais recicláveis
está em desacordo com as restrições orçamentárias e regulamentações estabelecidas
```
pelo Regimento das Faculdades de Tecnologia do Centro Paula Souza (Centro Paula
```
```
Souza, 2016). Além disso, o Estatuto dos Funcionários Públicos de São Paulo proíbe
```
```
que o servidor use o cargo ou os bens da instituição para ter lucro pessoal (São Paulo,
```
```
1968, art. 243).
```
Nota-se que, apesar da existência de soluções tecnológicas voltadas à reciclagem,
plataformas como Cataki e Ecoari ainda não atendem à realidade da Fatec Franco da
Rocha, o que evidencia a necessidade de alternativas adaptadas ao contexto local. O
diferencial da proposta deste estudo reside em viabilizar uma modelagem voltada à
gestão interna, adequada às restrições de uma instituição pública. Ao contrário das
ferramentas de mercado, o sistema proposto não envolve transações financeiras ou
recompensas, de modo que o lucro dos catadores permanece associado à
comercialização externa desses recicláveis em pontos de venda.
Outro ponto relevante no campo da gestão de resíduos é que o uso de plataformas de
comunicação para aproximar pessoas que separam recicláveis de catadores é
comumente denominado “uberização”, que é uma forma de trabalho frequentemente
considerada negativa por desestimular a associação dos catadores às cooperativas
```
solidárias (Cardoso, 2020).
```
No entanto, durante o desenvolvimento deste estudo, constatou-se que em Franco da
Rocha não existem cooperativas ou associações de catadores consolidadas em atividade,
conforme aponta o diagnóstico oficial do Plano Municipal de Gestão Integrada de
8
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
Resíduos Sólidos do município, o qual também destaca o desconhecimento sobre o
```
quantitativo de catadores atuantes na região (Franco da Rocha, 2015). Desse modo, a
```
aproximação direta viabilizada pela tecnologia, além de representar uma oportunidade
para os trabalhadores autônomos locais ampliarem sua demanda e favorecer melhores
condições de trabalho, permite iniciar a identificação e a mensuração do número de
catadores em atividade no município.
2.1.2 A importância do entendimento do negócio
O sucesso de uma empresa ou projeto está diretamente relacionado à compreensão de
```
seu funcionamento e propósito. Drucker (1999) ressalta a importância do entendimento
```
do próprio negócio para atender expectativas e superar resultados. No contexto deste
projeto, esse entendimento envolve conhecer o fluxo de atividades ligadas à coleta e
destinação de resíduos recicláveis e compreender o papel dos catadores na execução
dessas ações, permitindo identificar gargalos, melhorar a comunicação entre os
envolvidos e organizar as atividades de maneira clara.
```
No campo socioambiental, Silva et al. (2023) destacam que o trabalho dos catadores
```
de materiais recicláveis é muito importante para a economia circular, pois ajuda a
reduzir impactos ambientais e apoiar o desenvolvimento da comunidade. No caso do
gerenciamento de resíduos, essa perspectiva significa ajustar etapas como descarte,
armazenamento e registro de materiais com base nos recursos disponíveis e na
participação ativa desses profissionais. Dessa forma, percebe-se que a atuação dos
catadores contribui tanto para proteger o meio ambiente quanto para criar oportunidades
de trabalho e colaboração entre as pessoas envolvidas.
Com base nesse contexto, compreende-se que a análise dos processos relacionados à
gestão de resíduos na instituição, bem como do papel desempenhado pelos catadores, é
importante para o levantamento de requisitos e a identificação das informações
necessárias à modelagem de um sistema de gerenciamento. A compreensão de como os
materiais são descartados, armazenados e coletados contribui para a estruturação dos
dados e para o planejamento de ações que auxiliem na redução de impactos ambientais,
incentivem a colaboração entre os envolvidos e aprimorem a organização do processo
de gestão de resíduos.
9
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
2.2 Sobre Engenharia de Software
A engenharia de software é uma área da computação voltada ao desenvolvimento
```
organizado e sistemático de sistemas. De acordo com Domínguez (2010), essa
```
disciplina busca aplicar princípios da engenharia ao desenvolvimento de aplicações, o
que torna o processo mais eficiente, confiável e capaz de atender às necessidades dos
usuários ao reduzir erros e elevar a qualidade do produto final.
Diante desse contexto, esses princípios servem como base para a organização da
proposta de coleta de resíduos recicláveis. Para isso, são realizadas entrevistas com o
objetivo de identificar as necessidades a serem atendidas e as funcionalidades
necessárias para supri-las. Essa etapa de levantamento permite alinhar as expectativas
dos usuários com as regras de negócio e os requisitos funcionais, não funcionais e de
segurança que o sistema deve executar.
```
Com base nessas informações e nas diretrizes da UML (Unified Modeling
```
```
Language), que padroniza a representação visual da estrutura e do comportamento de
```
um software, são elaborados o Diagrama de Casos de Uso e o Diagrama de Classes. De
```
acordo com Sommerville (2011), o diagrama de caso de uso demonstra as
```
funcionalidades sob a ótica do usuário, enquanto o diagrama de classes descreve a
estrutura lógica e os relacionamentos do sistema.
A padronização desses elementos pela engenharia de software favorece a construção
de soluções consistentes e seguras. Sendo assim, esta disciplina é fundamental na
modelagem das funcionalidades do sistema de comunicação entre a Fatec Franco da
Rocha e os catadores, pois fornece métodos que contribuem para uma proposta mais
estruturada. Assim, torna-se possível desenvolver uma modelagem mais alinhada às
necessidades dos usuários e aos requisitos do sistema.
2.3 Sobre Banco de Dados
Os sistemas de banco de dados são fundamentais para o gerenciamento eficiente de
grandes volumes de informações em ambientes computacionais. De acordo com Elmasri
```
e Navathe (2019), um banco de dados consiste em uma coleção organizada de dados
```
inter-relacionados que representam aspectos do mundo real. Nesse cenário, os dados
não são armazenados de maneira aleatória, mas estruturados segundo modelos e regras
que facilitam o acesso, a atualização e a elaboração de relatórios de análise.
10
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
```
De acordo com Heuser (2010), a modelagem de dados tem como objetivo
```
representar, de forma abstrata, os aspectos relevantes de um domínio por meio da
identificação de entidades, atributos e relacionamentos. Essa representação,
```
materializada no Modelo Entidade-Relacionamento (MER) e no seu respectivo
```
```
diagrama (DER), permite estruturar o banco de dados, definir os tipos de dados e as
```
conexões entre as diferentes tabelas, o que orienta a definição da estrutura necessária
para o sistema proposto.
O gerenciamento dessas informações é realizado por meio de um Sistema
```
Gerenciador de Banco de Dados (SGBD), que atua como intermediário entre os
```
usuários e os dados armazenados. Além de permitir operações de manutenção dos
dados, o SGBD oferece mecanismos de segurança e controle de acesso para que apenas
usuários autorizados possam manipular determinadas informações. Conforme destacam
```
Elmasri e Navathe (2019), sua utilização contribui para a redução de redundâncias e
```
inconsistências, proporcionando maior confiabilidade no armazenamento.
Neste projeto, os conceitos de modelagem e gerenciamento de dados serviram como
base para conectar e estruturar as informações relativas à disponibilização de resíduos
recicláveis pela Fatec Franco da Rocha e à realização das coletas pelos catadores. A
aplicação desses fundamentos favorece a organização dos dados e a definição das
conexões necessárias para o gerenciamento de todo o processo de coleta, o que permite
o controle dos usuários e o registro ordenado das atividades para fins de consulta e
análise.
3. ESTUDO DE CASO - DESENVOLVIMENTO
Mediante a aplicação de questionário realizado com a coordenadora do curso de
```
Gestão da Tecnologia da Informação (GTI) e com a responsável pela Secretaria
```
Acadêmica da Fatec Franco da Rocha, foi identificado que a destinação adequada dos
resíduos recicláveis na instituição depende da comunicação com pessoas ou
organizações dispostas a coletar esses materiais na unidade.
Mais comumente, a responsável pela Secretaria Acadêmica aciona uma empresa de
reciclagem local, que realiza a retirada apenas quando há grandes volumes disponíveis.
A responsável pela Secretaria Acadêmica informou em entrevista que os resíduos
chegam a permanecer armazenados por cerca de três meses até que a empresa considere
11
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
o volume adequado para a coleta, o que dificulta a reinserção dos materiais na cadeia de
reciclagem.
A autorização da Fatec Franco da Rocha para citação do nome neste trabalho pode
ser vista no ANEXO A.
```
3.1 Sobre a Descrição do Negócio da Empresa (Descrição e Mapa de Processos
```
```
cenário inicial e cenário proposto)
```
O levantamento do processo de coleta e destinação de resíduos recicláveis na Fatec
Franco da Rocha foi realizado por meio de um questionário aplicado à coordenadora do
curso de GTI e à responsável pela Secretaria Acadêmica, que será representada no Mapa
de Processos e na descrição do mapa como “secretária”. As informações obtidas
permitiram compreender as etapas gerais e identificar oportunidades de melhoria por
meio de uma solução tecnológica.
O questionário utilizado pode ser visualizado no APÊNDICE A.
O mapa de processos da figura 1 ilustra a verificação, separação, armazenamento e
destinação desses resíduos na instituição no cenário inicial.
12
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
Figura 1. Mapa de Processos - Cenário inicial do fluxo de resíduos recicláveis.
```
Fonte: próprias autoras (2026).
```
Os envolvidos nesse processo incluem os funcionários da instituição, como o diretor,
coordenadores e professores, a equipe de limpeza, a secretária, que é responsável pelo
contato com a empresa de reciclagem, e a empresa terceirizada responsável pela retirada
dos materiais.
Na rotina da instituição, a equipe de limpeza verifica os sacos de lixo posicionados
em áreas comuns. Quando estão cheios, são substituídos e descartados no lixo comum,
já que as lixeiras disponíveis não são destinadas à coleta seletiva. Como consequência,
resíduos recicláveis descartados nesses pontos são enviados diretamente para o descarte
tradicional, sem reaproveitamento.
Paralelamente, alguns funcionários realizam, por iniciativa própria, a separação de
materiais recicláveis em sacolas específicas. Essas sacolas são armazenadas
inicialmente na cozinha da unidade.
13
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
Quando há um número elevado de sacolas, a secretária transfere os resíduos para
uma sala de depósito, onde permanecem até que se acumule uma quantidade
considerada suficiente para solicitar a coleta externa.
Nesse momento, a secretária entra em contato com a empresa terceirizada,
geralmente por meio do aplicativo WhatsApp, e realiza o envio de imagens do material
acumulado.
A empresa analisa a imagem e avalia se o volume é suficiente para justificar o
deslocamento até a unidade. Este ponto representa uma das principais limitações do
```
processo: caso a empresa entenda que a quantidade não compensa o custo com
```
combustível e logística, a coleta é recusada, e os resíduos permanecem armazenados no
depósito até que se acumule um volume maior e seja feito um novo contato.
Quando essa coleta é acatada, a Fatec define o dia e horário para a retirada dos
materiais e aguarda confirmação da empresa terceirizada. No momento combinado, os
resíduos são recolhidos e encaminhados para a destinação adequada, por meio da
reciclagem.
As fotografias que mostram como os resíduos ficam acumulados na instituição,
fornecidas por funcionários da Fatec Franco da Rocha, encontram-se no ANEXO B.
Como forma de representar a solução proposta, foi elaborado um mapa de processos
que descreve o fluxo de comunicação entre a Fatec e os catadores autônomos por meio
de uma aplicação tecnológica, conforme apresentado na figura 2.
O mapa de processos com a solução tecnológica proposta apresenta as etapas da
interação entre a comunidade acadêmica da Fatec, a equipe de limpeza, a secretaria e os
catadores autônomos de materiais recicláveis. Inicialmente, os resíduos são descartados
nas lixeiras de coleta seletiva e a equipe verifica se estão cheias. Caso positivo, a
secretaria é acionada e registra o tipo, volume e fotos dos resíduos na plataforma, além
de informar os dias e horários disponíveis para a retirada. Os catadores recebem a
notificação, agendam o melhor dia e horário e coletam os materiais para destinação à
reciclagem. Por fim, a secretaria confirma a realização da retirada no sistema e
acompanha o histórico de coletas da unidade, encerrando o processo.
14
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
Figura 2. Mapa de Processos - Cenário do fluxo de resíduos recicláveis com a solução proposta.
```
Fonte: próprias autoras (2026).
```
3.1.1 Definição de Personas
```
Segundo Cooper (1999), a persona é uma representação fictícia, baseada em dados
```
reais, de um usuário típico de um sistema. Essa ferramenta ajuda a entender quem vai
utilizar a solução, quais são suas dificuldades e expectativas para permitir a criação de
algo realmente útil e fácil de usar. As personas deste projeto foram desenvolvidas com
15
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
base em questionários aplicados aos usuários, no qual o questionário aplicado à persona
I pode ser visualizado no APÊNDICE B e o das personas II e III, no APÊNDICE C.
A primeira persona identificada foi Maria C. Souza Silva, catadora autônoma de 53
anos que trabalha em Franco da Rocha. Ela utiliza o celular para combinar retiradas de
materiais recicláveis com os comerciantes, mas enfrenta dificuldades de comunicação e
depende que entrem em contato com ela. Maria busca mais praticidade e autonomia
para organizar suas coletas e aumentar sua renda, conforme mostra a figura 3.
Figura 3. Persona 1 – Maria, catadora
```
Fonte: próprias autoras (2026).
```
A catadora é vista como potencial usuária do sistema proposto. Além dela, foram
mapeadas duas outras personas que podem ser vistas em detalhes no APÊNDICE D.
3.1.2 Mapa de Empatia
O mapa de empatia é uma ferramenta desenvolvida por Dave Gray que auxilia na
compreensão profunda dos usuários, visto que permite explorar não apenas o que eles
fazem, mas também o que pensam, sentem, veem, ouvem e dizem. Essa abordagem
facilita a identificação de necessidades, dores e desejos e serve como base para o
```
desenvolvimento de soluções centradas no usuário (Gray, Brown e Macanufo, 2010).
```
Para este projeto, o mapa de empatia foi elaborado com base na comunidade
acadêmica da Fatec Franco da Rocha, que inclui alunos, gestores e funcionários. O
objetivo foi compreender suas experiências, percepções, dificuldades e expectativas
relacionadas ao descarte e à coleta de resíduos recicláveis.
16
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
O questionário utilizado como apoio para elaboração do mapa de empatia pode ser
visualizado no APÊNDICE C.
As perguntas utilizadas nas entrevistas com alunos, gestores e funcionários podem
ser visualizadas no APÊNDICE E.
O mapa de empatia da comunidade acadêmica da Fatec Franco da Rocha pode ser
visualizado na figura 4.
Figura 4. Mapa de Empatia – Comunidade Acadêmica da Fatec Franco da Rocha.
```
Fonte: próprias autoras (2026).
```
A análise revelou aspectos como orgulho em participar de uma instituição
sustentável, interesse em fortalecer a relação com a comunidade e os catadores,
incentivos à prática de boas ações ambientais ligadas à educação ambiental, dificuldades
em agilizar a retirada dos resíduos e a necessidade de maior organização e relatórios
sobre as coletas. Com base nesse entendimento, é possível propor soluções que
promovam maior eficiência no processo de coleta, melhor comunicação entre os
envolvidos e aproveitamento dos materiais recicláveis, o que beneficia toda a
comunidade acadêmica e os catadores.
3.2 Ferramentas utilizadas no Projeto
Esse capítulo apresenta a utilização e a descrição das ferramentas usadas neste
estudo. No decorrer do projeto as ferramentas auxiliaram no desenvolvimento do estudo
de caso mediante planejamento das etapas, análise de resultados, visualização das
informações, e a execução das atividades de forma organizada e eficiente.
17
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
▪ Bizagi Modeler:
É uma plataforma de modelagem e automação de processos de negócio, usada para
desenhar e simular as atividades de destinação de resíduos recicláveis. Foi utilizada para
modelar o mapa de processos apresentado anteriormente neste projeto.
▪ Brmodelo web:
É um site para modelar um banco de dados, utilizado para elaborar o modelo
conceitual e o modelo lógico da modelagem de banco de dados deste trabalho.
▪ Canva Design:
O Canva Design permite criar e editar imagens de forma prática, além de possibilitar
a edição simultânea entre os membros do grupo. Ele foi utilizado na montagem do mapa
de empatia e na criação das personas.
▪ Corel Draw:
O Corel Draw é uma ferramenta para criação e edição de imagens que foi utilizada
na elaboração do desenho das telas para o protótipo não funcional.
▪ Draw.io:
É uma ferramenta online de diagramação utilizada para a criação de representações
visuais de sistemas. Neste projeto, foi utilizada para a elaboração do diagrama de caso
de uso macro, permitindo a visualização das interações principais entre os atores e o
sistema proposto.
▪ E-mail:
O E-mail é um correio eletrônico, uma forma de enviar e receber mensagens pela
internet. Neste projeto foi utilizado para estabelecer a comunicação e apoio com os
professores orientadores e a gestão da instituição pública estudada.
▪ Google Forms:
É uma ferramenta do Google para elaboração de formulários, utilizada para coletar as
respostas das personas identificadas no projeto através de questionários eletrônicos.
▪ Google Scholar:
É uma ferramenta do Google utilizada para pesquisas de artigos, livros, teses e
trabalhos acadêmicos, com o intuito de aprofundar o desenvolvimento do projeto
acadêmico com bases teóricas que sustentam a relevância e reconhecimento social do
trabalho autônomo do catador e dos benefícios da destinação correta dos resíduos
recicláveis.
18
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
▪ Microsoft Word:
É um programa usado para criar, editar e formatar textos, colocado em prática para
documentar e desenvolver o corpo textual deste projeto.
▪ SciELO:
É uma biblioteca virtual de artigos científicos voltada para estudantes que buscam
conteúdos acadêmicos confiáveis. Foi exercido por meio de pesquisa e conhecimento
gerado através da observação e leitura de outros projetos e artigos.
▪ Trello:
O Trello é um gerenciador de projetos online, explorado para organizar tarefas e
projetos de forma visual para o acompanhamento contínuo das tarefas, ou seja, permite
identificar e organizar o que precisa ser feito, quem executa e o que foi concluído.
Trata-se também de uma ferramenta que possibilita o compartilhamento de arquivos e
um roteiro de etapas do projeto.
▪ WhatsApp:
É um aplicativo de mensagem instantânea, aplicado como principal meio de
comunicação interna do grupo para compartilhamento de arquivos e informações para a
organização do projeto.
```
3.3 Descrição da aplicação proposta (Solução Proposta)
```
Com base no mapeamento do cenário atual, a solução proposta consiste em uma
plataforma tecnológica para organizar a interação entre a Fatec Franco da Rocha e os
catadores autônomos. A ferramenta visa funcionar como um canal direto para notificar a
disponibilidade de resíduos e organizar as retiradas, a fim de evitar o acúmulo de
materiais e a falta de padronização nas coletas.
A aplicação deve permitir o registro dos materiais disponíveis para coleta e o
agendamento das retiradas de forma autônoma pelos coletores. Para detalhar o
funcionamento desse sistema, as seções seguintes apresentam os Requisitos Funcionais
```
(ações do sistema), os Requisitos Não Funcionais (qualidade e desempenho) e os
```
```
Requisitos de Segurança (proteção de acesso e dados).
```
As entrevistas e os questionários utilizados como base para a definição dos
Requisitos podem ser visualizados no APÊNDICE F.
19
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
```
3.3.1 Requisitos Funcionais (RF)
```
A partir da definição da solução proposta, torna-se necessário identificar as
funcionalidades que deverão ser atendidas pelo sistema. Nesse contexto, são definidos
os requisitos funcionais, que descrevem as ações e operações que a aplicação deverá
executar para apoiar o registro, o controle e a disponibilização das informações
relacionadas aos materiais recicláveis gerados na instituição.
A figura 5 apresenta os requisitos funcionais identificados para o sistema e suas
descrições. Em alguns casos, será usada a palavra “manter” como uma simplificação de
CRUD, que é um acrônimo para as quatro operações fundamentais em sistemas de
```
software: Create (Criar), Read (Ler), Update (Atualizar) e Delete (Excluir).
```
Figura 5. Requisitos Funcionais - sistema reciclagem solidária.
REQUISITOS
```
FUNCIONAIS (RF)
```
COMENTÁRIOS
Manter Usuários
Permite que o cidadão consciente e o catador realizem o próprio cadastro e
editem seus dados. O administrador possui permissão total para consultar,
editar e desabilitar o acesso de todos os perfis.
Permitir Comunicação
Facilita a troca de informações entre os usuários para alinhar detalhes dos
agendamentos. Possibilita também que o administrador publique conteúdos
educativos e campanhas de educação ambiental.
Manter Materiais
Permite que o administrador e o cidadão consciente cadastrem, consultem,
```
editem e excluam os materiais disponíveis (tipo, quantidade, foto e
```
```
localização).
```
Notificar Coleta O sistema envia notificações automáticas aos catadores sempre que novosmateriais forem disponibilizados na plataforma.
Agendar Retirada Permite que o catador visualize materiais e solicite o agendamento dacoleta, escolhendo o horário desejado dentro da disponibilidade do sistema.
```
Manter Agenda Permite ao administrador gerenciar (cadastrar, consultar, editar e excluir)os dias e horários de funcionamento e disponibilidade para a coleta.
```
Manter Coletas Retiradas
Permite que o cidadão consciente confirme a retirada e edite informações
```
(como data, horário e status) do que cadastrou. O administrador possui
```
acesso ampliado, podendo editar ou confirmar qualquer coleta pendente e
editar a lista de status, garantindo a atualização dos dados e a gestão de
possíveis cancelamentos e reagendamentos.
Gerar Relatórios
Permite ao administrador extrair dados consolidados de resíduos, usuários
e rankings de desempenho. Ao catador, disponibiliza apenas seu histórico
individual e métricas de coletas realizadas.
```
Fonte: próprias autoras (2026).
```
A partir dos requisitos funcionais apresentados, observa-se que o sistema deve operar
através da integração entre os perfis de Administrador, Cidadão Consciente e Catador. A
```
aplicação deve permitir que cidadãos (pessoas que disponibilizam materiais recicláveis)
```
```
e catadores (profissionais da coleta) realizem seus cadastros e editem seus dados
```
pessoais de forma autônoma.
20
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
No entanto, para evitar que usuários não autorizados se cadastrem como
administradores, o acesso do administrador inicial deve ser configurado diretamente no
banco de dados pelos desenvolvedores, sem interface pública de cadastro, acessando o
sistema pela mesma tela do cidadão. Este administrador poderá gerenciar os demais
perfis, com permissão para criar administradores, editar dados cadastrais de todos os
usuários e desabilitar acessos para manter o controle da plataforma.
Caso haja necessidade de alinhar detalhes, informar atrasos ou desistências, o contato
deve ser realizado diretamente entre as partes por meio da funcionalidade de
comunicação da plataforma. Além disso, o administrador pode publicar conteúdos
educativos e campanhas favorecendo a educação ambiental.
O fluxo de trabalho deve possibilitar que o administrador e o cidadão consciente
registrem os materiais disponíveis, detalhando o tipo de material, quantidade
aproximada, local de retirada e fotos. Para garantir a agilidade do processo, o sistema
deve notificar automaticamente os catadores sobre a disponibilização de novos
materiais.
Os catadores poderão visualizar os materiais cadastrados e solicitar o agendamento
da coleta escolhendo, dentro dos períodos previamente estipulados na agenda do
sistema, o horário que melhor atenda a sua preferência. A gestão da agenda, no entanto,
é de responsabilidade exclusiva do administrador, que define os dias e horários de
funcionamento e disponibilidade do local para as retiradas.
A etapa de encerramento deve exigir que o cidadão consciente confirme a retirada
dos materiais que ele próprio disponibilizou, podendo atualizar o status da coleta ou
editar informações conforme o que foi acordado com o catador. O administrador, por
sua vez, deve possuir permissão para confirmar qualquer coleta pendente no sistema,
bem como editar as informações dos agendamentos de qualquer usuário e editar a lista
de status possíveis das coletas, garantindo a precisão e a atualização constante dos
dados da plataforma.
Por fim, a aplicação deve gerar relatórios detalhados para o administrador,
permitindo o acesso a dados consolidados sobre o volume de resíduos, usuários
cadastrados e seus respectivos perfis, além de indicadores de desempenho, como o
ranking de catadores e cidadãos conscientes. Já o catador terá acesso restrito ao seu
próprio histórico de atividades, permitindo a consulta das métricas relacionadas às suas
coletas individuais.
21
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
```
3.3.2 Requisitos Não Funcionais (RNF)
```
Os Requisitos Não Funcionais definem as restrições e características relacionadas ao
funcionamento do sistema proposto, ao estabelecer como o sistema deve se comportar
em termos de desempenho, usabilidade, segurança e disponibilidade. Diferentemente
dos requisitos funcionais, que descrevem as ações do sistema, os requisitos não
funcionais especificam condições que devem ser atendidas para garantir seu adequado
funcionamento.
A figura 6 apresenta os requisitos não funcionais identificados para a aplicação, bem
como suas descrições.
Figura 6. Requisitos Não Funcionais - sistema reciclagem solidária.
REQUISITOS NÃO
```
FUNCIONAIS (RNF)
```
COMENTÁRIOS
Compatibilidade O sistema deve ser acessível por meio de navegadores web emcomputadores e celulares.
Disponibilidade O sistema deve estar disponível para acesso sempre quehouver conexão com a internet.
Usabilidade O sistema deve apresentar interface simples, com elementosvisuais de fácil identificação e navegação.
Responsividade O sistema deve se adaptar a diferentes tamanhos de tela,garantindo boa visualização em computadores e celulares.
Desempenho
O sistema deve apresentar tempo de resposta inferior a 5
segundos para operações de cadastro de usuários e materiais,
consulta de informações e agendamento de coletas.
Segurança O sistema deve exigir autenticação por login e senha,garantindo o controle de acesso conforme o perfil do usuário.
Integridade dos Dados O sistema deve garantir o armazenamento correto e consistentedas informações cadastradas.
```
Fonte: próprias autoras (2026).
```
Os requisitos não funcionais apresentados estabelecem as condições necessárias para
o funcionamento do sistema. Nesse sentido, o sistema deve ser acessível em diferentes
dispositivos, como computadores e celulares e garantir compatibilidade e adaptação a
diferentes tamanhos de tela.
O sistema deve apresentar uma interface simples e de fácil utilização, para permitir
que usuários com diferentes níveis de familiaridade com tecnologia consigam utilizá-lo
sem dificuldades. Além disso, deve estar disponível para acesso sempre que houver
conexão com a internet.
Em relação ao desempenho, o sistema deve apresentar tempo de resposta inferior a 5
segundos para operações de cadastro, consulta e agendamento. Quanto à segurança, o
22
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
sistema deve exigir autenticação por login e senha, com o login sendo o e-mail e a senha
sendo numérica de até 6 dígitos, para garantir que cada usuário tenha acesso apenas às
funcionalidades permitidas ao seu perfil, impedindo, por exemplo, que usuários comuns
acessem ferramentas restritas aos administradores.
Por fim, o sistema deve assegurar o armazenamento correto das informações
cadastradas, para evitar inconsistências e garantir a confiabilidade dos dados.
3.3.3 Requisitos de Segurança da Aplicação
Os requisitos de segurança da aplicação definem os mecanismos utilizados para
proteger o acesso ao sistema e garantir o controle das informações cadastradas. Esses
requisitos estão relacionados à autenticação de usuários, controle de acesso e proteção
dos dados.
A figura 7 apresenta os requisitos de segurança definidos para a aplicação proposta,
bem como suas descrições.
Figura 7. Requisitos de Segurança – sistema reciclagem solidária.
REQUISITOS DE SEGURANÇA COMENTÁRIOS
Autenticação O sistema deve exigir login e senha para acesso àsfuncionalidades.
Controle de Acesso
O sistema deve restringir o acesso às funcionalidades de acordo
```
com o perfil do usuário (Administrador, Cidadão Consciente e
```
```
Catador).
```
Proteção de Senhas O sistema deve armazenar as senhas de forma segura, nãopermitindo sua visualização em formato legível.
Uso de Cookies
O sistema pode utilizar cookies para armazenamento de
informações de navegação, respeitando as configurações do
navegador e a política de privacidade.
Política de Privacidade O sistema deve apresentar um termo que informa quais dadossão coletados e como são utilizados.
```
Fonte: próprias autoras (2026).
```
Os requisitos de segurança apresentados estabelecem as condições necessárias para
garantir o acesso controlado e a proteção das informações no sistema. Nesse sentido, o
acesso às funcionalidades deve ser realizado por meio de autenticação com login e
senha.
Além disso, o sistema deve aplicar controle de acesso com base no perfil do usuário,
para garantir que cada tipo de usuário tenha acesso apenas às funcionalidades
permitidas. As informações de autenticação devem ser armazenadas de forma segura,
para evitar a exposição de dados sensíveis.
23
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
O sistema também pode utilizar cookies para auxiliar na navegação, conforme as
configurações do navegador do usuário. Por fim, deve disponibilizar um termo de
política de privacidade, para informar de forma clara quais dados são coletados e como
serão utilizados na aplicação.
3.4 Modelagem do Sistema Proposto
Esta seção apresenta a estruturação técnica da solução por meio dos princípios da
engenharia de software e da modelagem de banco de dados. O detalhamento a seguir
descreve a organização das funcionalidades, os relacionamentos entre os objetos do
sistema e a configuração lógica das informações necessárias para suportar o fluxo entre
a instituição e os catadores.
```
3.4.1 Diagrama de Caso de Uso (Use Case)
```
O diagrama de caso de uso é utilizado para destacar as interações entre os atores e o
sistema, permitindo a representação visual das funcionalidades e a validação dos
```
requisitos funcionais (Sommerville, 2011). No contexto deste projeto, ele evidencia
```
como os usuários interagem com o sistema denominado Reciclagem Solidária.
A figura 8 apresenta o diagrama de caso de uso em sua visão macro.
Figura 8. Diagrama de Caso de Uso – visão macro.
```
Fonte: próprias autoras (2026).
```
24
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
A funcionalidade Manter Usuários permite que o Cidadão Consciente e o Catador
realizem seu cadastro e atualizem seus dados pessoais. O Administrador possui acesso
ampliado, podendo gerenciar todos os usuários, incluindo edição de dados, desativação
de contas e criação de novos administradores.
A funcionalidade Permitir Comunicação possibilita a interação direta entre o
Cidadão Consciente, o Administrador e o Catador, permitindo a troca de mensagens
para alinhamento de detalhes da coleta, como confirmação de horários, atrasos,
cancelamentos ou orientações sobre a retirada. Adicionalmente, contempla um espaço
informativo no qual o Administrador pode publicar campanhas, orientações e ações
relacionadas à educação ambiental, acessíveis aos demais usuários.
Na funcionalidade Manter Materiais, tanto o Cidadão Consciente quanto o
Administrador podem cadastrar os materiais recicláveis disponíveis, informando suas
características. A partir desse cadastro, ocorre automaticamente a inclusão da
funcionalidade Notificar Coleta, responsável por enviar notificações aos Catadores
cadastrados sempre que novos materiais forem disponibilizados.
A funcionalidade Notificar Coleta atua exclusivamente como um mecanismo de
aviso, não permitindo interação direta por parte do Catador.
Na funcionalidade Agendar Retirada, o Catador pode visualizar as coletas
disponíveis e solicitar a retirada dos materiais, informando o dia e horário desejados.
Para isso, essa funcionalidade inclui Manter Materiais, de onde são obtidas as
informações dos materiais cadastrados, e Manter Agenda, que fornece os dias e horários
disponíveis definidos pelo Administrador.
A funcionalidade Manter Agenda permite que o Administrador cadastre e gerencie os
dias e horários de funcionamento do local de disponibilização dos materiais,
contemplando também períodos de indisponibilidade, como feriados.
A funcionalidade Manter Coletas Retiradas permite que o Cidadão Consciente
confirme a retirada dos materiais por ele disponibilizados, bem como editar as
informações dessas coletas, como o horário de retirada e a identificação do Catador
responsável. Para isso, essa funcionalidade inclui Manter Agenda, uma vez que utiliza
os dados de data e horário previamente definidos no agendamento realizado pelo
Catador. O Administrador possui acesso ampliado, podendo confirmar e editar coletas
cadastradas por qualquer usuário e editar os status possíveis das coletas.
25
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
Além disso, em situações de atraso, remarcação ou cancelamento informadas por
meio da funcionalidade Permitir Comunicação, o Cidadão Consciente ou o
Administrador podem atualizar o status da coleta para “em aberto”, por exemplo, para
possibilitar que outros Catadores sejam notificados e assumam a retirada.
Por fim, a funcionalidade Gerar Relatórios permite ao Administrador acessar dados
consolidados do sistema, como usuários cadastrados, perfis atribuídos, coletas
realizadas e indicadores de desempenho, como ranking de Catadores e Cidadãos
Conscientes. Já o Catador pode consultar seu próprio histórico de coletas.
O detalhamento de cada caso de uso encontrado no diagrama pode ser visualizado no
APÊNDICE G.
3.4.2 Diagrama de Classes
O diagrama de classes é utilizado para representar a estrutura estática do sistema,
evidenciando as classes, seus atributos, métodos e os relacionamentos entre elas
```
(Sommerville, 2011). No contexto deste projeto, ele descreve a organização dos dados e
```
as entidades que compõem o sistema Reciclagem Solidária.
A figura 9 apresenta o diagrama de classes modelado para a aplicação proposta.
Figura 9. Diagrama de Classes.
```
Fonte: próprias autoras (2026).
```
O diagrama de classes é composto pelas classes Cidadao, Administrador, Catador,
Material, Status e Coleta, sendo esta última a classe central do sistema, responsável por
26
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
concentrar as informações relacionadas às coletas e estabelecer a integração entre as
demais classes.
A classe Administrador herda as características da classe Cidadao, diferenciando-se
pelas permissões adicionais no sistema. Dessa forma, também participa dos mesmos
relacionamentos da classe Cidadao.
Em relação aos relacionamentos, observa-se que:
1. O Cidadao está associado à Coleta em uma relação do tipo um para muitos,
indicando que um cidadão pode estar vinculado a várias coletas.
2. O Catador está associado à Coleta em uma relação do tipo zero ou muitos, uma
vez que um catador pode não estar vinculado a nenhuma ou estar associado a
diversas coletas.
3. A classe Material está associada à Coleta em uma relação do tipo um para
muitos, indicando que um mesmo tipo de material pode estar presente em várias
coletas.
4. A classe Status está associada à Coleta em uma relação do tipo um para muitos,
indicando que um mesmo status pode estar presente em várias coletas.
No Diagrama de Classes, funcionalidades como comunicação entre usuários,
notificação de coleta, geração de relatórios e gerenciamento de agenda não foram
representadas como classes independentes, pois, na modelagem orientada a objetos,
essas funcionalidades não correspondem a entidades do mundo real, mas sim a
operações realizadas sobre as classes existentes.
Essas operações foram associadas às classes responsáveis por sua execução. Por
```
exemplo:
```
```
▪ O envio de mensagens foi representado como método das classes de usuário;
```
▪ A notificação de coleta foi associada à classe Material, ocorrendo a partir do
```
cadastro de novos materiais;
```
▪ A geração de relatórios foi atribuída ao perfil Administrador, que possui acesso aos
dados gerais do sistema, e ao Catador, que pode consultar seu histórico individual de
```
coletas;
```
▪ O gerenciamento da agenda foi atribuído ao perfil Administrador.
3.4.3 Modelo Conceitual
Diante da necessidade de estruturar e organizar as informações do sistema proposto,
foi realizada a modelagem de dados com base nos conceitos de entidades, atributos e
27
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
```
relacionamentos. Nesse contexto, o Modelo Entidade-Relacionamento (MER) e o
```
```
Diagrama Entidade-Relacionamento (DER) foram utilizados para representar, de forma
```
clara, a estrutura lógica do banco de dados.
No Sistema de Gerenciamento de Coletas de Resíduos Recicláveis, o MER foi
elaborado para descrever as entidades e seus relacionamentos, servindo como base para
a implementação do banco de dados relacional, em que as entidades correspondem às
tabelas, os atributos às colunas e os relacionamentos são definidos por meio de chaves
primárias e estrangeiras. Sendo assim:
1. Entidades
Foram identificadas as entidades principais: Cidadao, Catador, Materiais, Status e
Coleta.
Cada entidade foi detalhada com seus respectivos atributos e chaves primárias.
2. Atributos
```
Os atributos de cada entidade foram definidos, incluindo chaves primárias (PK) e
```
```
chaves estrangeiras (FK), com o objetivo de estabelecer os relacionamentos entre as
```
entidades.
▪ Cidadao:
```
Cod_Cidadao (PK), Nome, Telefone, Email, Senha, Situacao, Nivel_Acesso.
```
▪ Catador:
```
Cod_Catador (PK), Nome, Telefone, Email, Senha, Situacao.
```
▪ Materiais:
```
Cod_Material (PK), Tipo.
```
▪ Status:
```
Cod_Status (PK), Status.
```
▪ Coleta:
```
Cod_Coleta (PK), Cod_Cidadao (FK), Cod_Catador (FK), Cod_Material (FK),
```
```
Cod_Status (FK), Data, Hora, Local, Rua, Numero, Complemento, Bairro, Cidade,
```
Estado, CEP.
3. Relacionamentos
Os relacionamentos entre as entidades foram mapeados da seguinte forma:
```
Cidadao – Coleta (1:N): Um cidadão pode disponibilizar várias coletas.
```
```
Catador – Coleta (0:N): Um catador pode estar associado a nenhuma ou várias
```
coletas.
28
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
```
Materiais – Coleta (1:N): Um material pode estar presente em várias coletas.
```
```
Status – Coleta (1:N): Um status pode ser aplicado a várias coletas.
```
A figura 10 apresenta o DER, que detalha essa estrutura de maneira mais próxima da
implementação, destacando as entidades, seus atributos e os relacionamentos
estabelecidos entre elas.
Figura 10. Modelo Conceitual – DER.
```
Fonte: próprias autoras (2026).
```
3.4.4 Modelo Lógico
A partir da definição do modelo conceitual, foi elaborado o modelo lógico do banco
de dados, etapa em que a estrutura anteriormente representada de forma abstrata é
traduzida para um formato compatível com a implementação em um Sistema
```
Gerenciador de Banco de Dados (SGBD). Nesse nível, as entidades são convertidas em
```
tabelas, os atributos em campos e os relacionamentos em chaves primárias e
estrangeiras, garantindo a integridade e a consistência dos dados. Esse processo permite
uma visão mais detalhada da organização das informações, servindo como base direta
para a criação do banco de dados do sistema.
A figura 11 apresenta o modelo lógico para o projeto proposto.
29
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
Figura 11. Modelo Lógico – Reciclagem Solidária.
```
Fonte: próprias autoras (2026).
```
No modelo lógico, é possível observar a estrutura das tabelas e suas respectivas
relações. A tabela COLETA atua como entidade central, concentrando as chaves
estrangeiras que a conectam às tabelas CIDADAO, CATADOR, MATERIAIS e
STATUS, permitindo o registro completo das informações relacionadas às coletas
realizadas.
Cada tabela possui uma chave primária responsável por sua identificação única,
enquanto as chaves estrangeiras garantem a integridade referencial entre os dados.
30
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
Também são definidos atributos de identificação dos usuários, do material e da coleta,
incluindo data, horário e endereço, necessários para o registro das coletas no sistema.
```
Na tabela CIDADAO, o campo de nível de acesso (nivel_acesso) é utilizado para
```
controlar o tipo de usuário no sistema, diferenciando cidadãos comuns e
administradores, enquanto o campo de status indica a situação do cadastro, podendo
assumir valores como “ativo”, “desabilitado” ou “bloqueado”.
A tabela STATUS representa a situação da coleta, permitindo indicar seu andamento
por meio de estados como “disponível”, “agendado” e “retirado”.
3.4.5 Protótipo Não Funcional
O protótipo não funcional contempla diferentes tipos de usuários e funcionalidades, o
que permite organizar a comunicação entre catadores de materiais recicláveis e
empresas ou cidadãos que disponibilizam os materiais.
O público-alvo inclui catadores, autônomos ou associados a cooperativas, e empresas
ou cidadãos conscientes. Para os catadores, a plataforma permite visualizar ofertas
disponíveis, agendar coletas e visualizar os locais de retirada. Para empresas e cidadãos,
é possível cadastrar tipos e quantidades de materiais, disponibilizar coletas e gerar
relatórios sobre retiradas realizadas, com dados que podem possibilitar o monitoramento
do volume gerado e fornecer indicadores para auxiliar na redução do desperdício.
A aplicação deve ter interface simples e intuitiva, acessível via dispositivos móveis
```
(Android e iOS) e web, com proteção de dados pessoais e desempenho ágil mesmo com
```
grande volume de usuários e informações.
O protótipo inclui as seguintes telas principais:
▪ Tela Inicial: Interface simples com logomarca da aplicação.
```
▪ Tela de Cadastro: Criação de perfil (Catador ou Cidadão Consciente/Empresa) e
```
inserção de dados básicos.
▪ Tela de Login: Campos para e-mail, telefone e senha, com botões para entrar
```
(Login), cadastrar-se ou recuperar senha.
```
As telas descritas acima podem ser visualizadas na figura 12.
31
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
Figura 12. Tela Inicial, Tela de Cadastro e Tela de Login.
```
Fonte: próprias autoras (2026).
```
Também estão contempladas na aplicação outras funcionalidades como seguem:
▪ Painel do Catador: Visualização de materiais disponíveis, locais e horários de
coleta, e opção de contatar o ponto de retirada.
▪ Painel do Cidadão Consciente: Inserção e edição de materiais, acompanhamento do
calendário de coletas, opção de contatar catadores e acesso à rede de usuários
cadastrados.
▪ Logomarca: Identidade visual que representa o projeto e transmite seus valores de
sustentabilidade e colaboração.
As telas descritas acima podem ser visualizadas na figura 13.
32
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
Figura 13. Painel do Catador, Painel do Cidadão Consciente e Logomarca.
```
Fonte: próprias autoras (2026).
```
A versão web do sistema será composta por um conjunto de telas voltadas à
organização, controle e acompanhamento das coletas de materiais recicláveis,
oferecendo uma interface intuitiva e acessível para administradores e usuários
envolvidos no processo. A tela inicial da versão web pode ser visualizada na figura 14.
Figura 14. Tela inicial – versão web.
```
Fonte: próprias autoras (2026).
```
33
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
Depois de realizar o login ou o cadastro, o usuário deve ter acesso às funcionalidades
do sistema, de acordo com seu perfil de acesso. A figura 15 mostra como seria a tela de
acesso do administrador, que possui acesso ampliado ao sistema, podendo visualizar os
usuários cadastrados, definir o calendário para retirada, editar as informações do local,
alimentar a página de “Quem somos. Saiba Mais” e visualizar ou extrair relatórios.
Os demais usuários, cidadãos conscientes e catadores, deverão visualizar as
funcionalidades permitidas para seu perfil.
Figura 15. Tela com as funcionalidades do administrador.
```
Fonte: Próprias autoras (2026).
```
A tela para inserir materiais para retirada permite informar o tipo de material, a
quantidade aproximada, o local de retirada, as imagens do material e a agenda de dias e
horários possíveis para os catadores agendarem a retirada, conforme mostra a figura 16.
Além disso, as telas da versão web referentes ao cadastro de usuários, definição de
agenda e edição de localização podem ser visualizadas no APÊNDICE H.
34
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
Figura 16. Tela para inserir materiais.
```
Fonte: Próprias autoras (2026).
```
```
3.5 Sobre os Objetivos de Desenvolvimento Sustentável (ODS) atendidos neste
```
projeto
```
Os Objetivos de Desenvolvimento Sustentável (ODS) fazem parte de uma proposta
```
global que convida governos, empresas, organizações e indivíduos a agir em prol de um
mundo mais justo, equilibrado e sustentável. Criados em 2015 pela Organização das
```
Nações Unidas (ONU), os 17 objetivos da Agenda 2030 representam um compromisso
```
coletivo para enfrentar problemas urgentes, como a pobreza extrema, as desigualdades
```
sociais, as crises ambientais e os desafios econômicos (ONU BRASIL, 2025).
```
Ao estudar e aplicar os ODS, percebe-se que essas metas vão além de políticas
públicas ou grandes projetos internacionais. Elas dialogam com a realidade cotidiana de
milhares de pessoas e comunidades, especialmente em ações voltadas à inclusão social,
geração de renda, educação ambiental e preservação dos recursos naturais. Nesse
contexto, iniciativas de reciclagem e reaproveitamento de resíduos assumem papel
relevante, ao aproximar as metas globais das necessidades locais.
No Brasil, projetos alinhados aos ODS têm se expandido como formas de
transformação concreta em bairros, cidades e regiões. Esse movimento evidencia que
todos podem contribuir para a construção de um futuro mais sustentável, mesmo por
meio de pequenas ações, desde que conectadas a valores como responsabilidade,
35
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
cooperação e justiça social. A Agenda 2030, portanto, reforça que o desenvolvimento
```
sustentável não é apenas um ideal, mas uma tarefa coletiva (ONU BRASIL, 2018).
```
Assim, estudos e iniciativas de reciclagem podem se relacionar diretamente a alguns
dos Objetivos de Desenvolvimento Sustentável, ao demonstrar como práticas locais
contribuem para metas globais.
A Fatec Franco da Rocha reafirma seu compromisso com os Objetivos de
```
Desenvolvimento Sustentável (ODS) ao incorporá-los em suas atividades de ensino,
```
pesquisa e extensão.
O objetivo central da iniciativa consiste em mapear os processos institucionais para
orientar a implementação de um ponto de coleta e triagem de materiais recicláveis na
comunidade de Franco da Rocha e assim apoiar o trabalho de catadores que dependem
da reciclagem como fonte de geração de renda.
```
A ação está diretamente relacionada aos ODS 1 (Erradicação da Pobreza), ODS 8
```
```
(Trabalho Decente e Crescimento Econômico) e ODS 12 (Consumo e Produção
```
```
Responsáveis), ao promover a integração entre sustentabilidade ambiental e inclusão
```
social.
ODS 1 – Erradicação da Pobreza: a iniciativa contribui para ampliar a participação
dos catadores de materiais recicláveis em atividades econômicas e promove o
reconhecimento e a valorização de seu trabalho na comunidade local.
ODS 8 – Trabalho Decente e Crescimento Econômico: ao organizar a coleta e o
manejo adequado dos materiais recicláveis, a ação favorece a criação de oportunidades
de trabalho digno e o incentivo ao empreendedorismo, o que impulsiona o crescimento
econômico sustentável e a inclusão social.
ODS 12 – Consumo e Produção Responsáveis: a proposta atua como ferramenta de
educação ambiental ao estimular a separação correta dos resíduos, o que promove o
consumo consciente e a redução do desperdício. Isso reforça a importância da
sustentabilidade nas práticas cotidianas e o uso responsável dos recursos naturais.
4. RESULTADOS E DISCUSSÕES
No decorrer do desenvolvimento deste projeto, levantamentos e interações com a
comunidade acadêmica contribuíram para compreender o cenário da coleta de resíduos
na Fatec Franco da Rocha e possibilitar a implementação de ações voltadas à
organização desse processo.
36
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
Como parte da implementação, a Fatec passou a contar com lixeiras para a separação
```
de resíduos (papel, plástico, vidro, metal e lixo orgânico). Nesse contexto, destaca-se a
```
intermediação das autoras do presente projeto na doação de lixeiras com adesivos de
coleta seletiva à Fatec Franco da Rocha, provenientes de uma construtora que realizaria
o descarte desses materiais. A disponibilização dessas lixeiras contribui diretamente
para o incentivo da separação de resíduos na instituição.
Além disso, foram confeccionadas lixeiras de coleta seletiva utilizando recursos
internos disponíveis, como caixas de papelão que estavam sem uso na instituição. Essas
lixeiras foram disponibilizadas no térreo da unidade, ampliando o acesso a pontos de
descarte e reforçando a separação de resíduos pela comunidade acadêmica.
As fotografias que apresentam as lixeiras de coleta seletiva disponibilizadas na Fatec
Franco da Rocha podem ser visualizadas no ANEXO C. Como complemento às ações
de incentivo à coleta seletiva, destaca-se a possibilidade de confecção de cartazes
informativos para orientar quanto à separação dos resíduos e ampliar a conscientização
ambiental no ambiente institucional.
A coordenadora do curso de GTI realizou contato com a proprietária de uma empresa
de reciclagem, que possui vínculo com catadores da região. Essa articulação representa
um potencial de ampliação do alcance da iniciativa, pois possibilita que mais pessoas
aumentem sua renda e contribui para a destinação adequada de materiais recicláveis.
Paralelamente às ações práticas implementadas, o desenvolvimento deste projeto
também envolveu atividades de análise e modelagem do processo de gestão de resíduos.
Essas etapas permitiram compreender de forma estruturada o fluxo de descarte,
separação e coleta dos resíduos recicláveis dentro da instituição, servindo como base
para a proposição de uma solução tecnológica.
A partir desse entendimento, foi possível identificar pontos de melhoria no processo,
principalmente relacionados à comunicação entre a instituição e os catadores
autônomos, além da organização das informações sobre os resíduos gerados. Nesse
contexto, a modelagem das funcionalidades e do banco de dados contribuiu para
estruturar uma solução que pudesse apoiar a gestão dessas informações de forma mais
eficiente.
Dessa forma, os resultados evidenciam que a integração entre ações práticas de
sustentabilidade e a análise tecnológica do processo contribui para a melhoria da gestão
de resíduos na instituição, ao mesmo tempo em que reforça a importância da
37
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
modelagem de sistemas como etapa fundamental no desenvolvimento de soluções
tecnológicas.
4.1 Problemas Encontrados
Durante o desenvolvimento do projeto, algumas dificuldades foram identificadas e
impactaram o andamento da pesquisa.
A primeira delas foi a limitação na realização da pesquisa de campo, uma vez que foi
possível estabelecer contato direto apenas com uma catadora do município, a qual
representou o grupo de profissionais da área. Por esse motivo, não foi viável realizar
uma pesquisa quantitativa, o que impossibilitou mensurar quantas pessoas tiveram
acesso à proposta ou a consideraram positiva. Assim, a análise dos resultados
manteve-se em um caráter predominantemente qualitativo.
Outro ponto relevante é a dificuldade em encontrar referências acadêmicas
específicas sobre o contexto local, especialmente acerca da atuação de catadores
autônomos em Franco da Rocha. Dessa forma, foi necessário utilizar dados de
abrangência nacional para evidenciar a importância do trabalho dos catadores, diante da
ausência de informações mais precisas sobre o município.
Além disso, destaca-se a ausência de dados institucionais consolidados sobre a
quantidade de resíduos gerados pela Fatec, uma vez que não existem registros formais
quanto ao volume produzido, à frequência de descarte ou ao histórico das coletas. Essa
limitação dificulta a obtenção de informações precisas para uma análise comparativa do
processo antes e após a implementação da solução proposta.
Como sugestão para pesquisas futuras, recomenda-se o aperfeiçoamento e a
implementação prática do protótipo desenvolvido, permitindo testar suas
funcionalidades em um ambiente real e possibilitar o monitoramento quantitativo dos
resíduos recicláveis gerados. Isso viabiliza a geração de relatórios e indicadores para
apoio a ações de sustentabilidade e tomada de decisão.
Por fim, mesmo diante das limitações apresentadas, o projeto atingiu seus objetivos,
modelando uma solução tecnológica adequada à realidade estudada.
5. CONSIDERAÇÕES FINAIS
Conclui-se que o objetivo geral deste projeto foi atingido uma vez que a modelagem
de software e do banco de dados foi desenvolvida de forma estruturada, considerando as
38
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
necessidades levantadas junto aos envolvidos no processo e os requisitos do negócio
proposto.
Quanto aos objetivos específicos, todos foram atendidos de forma satisfatória:
▪ Realizar levantamento de dados por meio de entrevistas e questionários junto aos
envolvidos no processo para compreender as necessidades do negócio: Esse processo
possibilitou a identificação das necessidades da solução, servindo como base para o
desenvolvimento das demais etapas do projeto.
▪ Identificar os prováveis usuários da solução e elaborar o mapa de personas: Essa
etapa permitiu a construção do mapa de personas, contribuindo para a compreensão dos
perfis envolvidos no sistema.
▪ Elaborar o mapa de empatia para a principal persona identificada: A construção
desse mapa possibilitou uma análise mais aprofundada de suas necessidades,
dificuldades e expectativas.
▪ Realizar a modelagem de software da aplicação a fim de atender às necessidades do
negócio: A modelagem foi realizada de forma a atender o processo de gestão de
resíduos recicláveis.
▪ Realizar a modelagem do banco de dados: Esta etapa garantiu a organização e
estruturação das informações necessárias ao sistema.
▪ Desenvolver o protótipo não funcional para atender ao negócio estudado: Por fim, o
desenvolvimento do protótipo permitiu a representação da solução proposta,
possibilitando uma visualização prática do sistema e a validação conceitual do modelo
desenvolvido.
Os resultados obtidos evidenciam a integração entre ações práticas e a análise do
processo de gestão de resíduos na Fatec Franco da Rocha, voltadas à organização e ao
incentivo da coleta seletiva. Também evidenciam a relevância da organização de
requisitos e da estruturação de dados no desenvolvimento de soluções tecnológicas,
reforçando o papel da tecnologia como apoio à sustentabilidade, à melhoria dos
processos institucionais e ao fortalecimento do trabalho dos catadores autônomos.
REFERÊNCIAS
ABREMA – Associação Brasileira de Resíduos e Meio Ambiente. Panorama dos
resíduos sólidos no Brasil 2025. São Paulo: ABREMA, 2025. Disponível em:
```
https://www.abrema.org.br/panorama/. Acesso em: 11 mar. 2026.
```
39
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
BRASIL. Lei nº 12.305, de 2 de agosto de 2010. Institui a Política Nacional de
```
Resíduos Sólidos; altera a Lei nº 9.605, de 12 de fevereiro de 1998; e dá outras
```
providências. Disponível em: https://www.planalto.gov.br/ccivil_03/_ato2007-
2010/2010/lei/l12305.htm. Acesso em: 11 mar. 2026.
BRASIL. Ministério da Educação. Economia Circular. Brasília, 13 mar. 2025.
Disponível em:
```
https://www.gov.br/mec/pt-br/assuntos/ept/profissionais-futuro/economia-circular.
```
Acesso em: 11 mar. 2026.
CARDOSO, Alexandro. A uberização da coleta seletiva: reflexões sobre as novas
formas de trabalho na era da economia digital. Revista Contraponto, Edição Especial
VIII Seminário Discente, v. 7, n. 2, 2020. Disponível em:
```
https://seer.ufrgs.br/index.php/contraponto/article/view/108672/59036. Acesso em: 11
```
mar. 2026.
CATAKI. Como funciona. Disponível em: https://www.cataki.org/#como_funciona.
Acesso em: 11 mar. 2026.
CENTRO PAULA SOUZA. Deliberação CEETEPS nº 31, de 27 de setembro de 2016.
Aprova o Regimento das Faculdades de Tecnologia do Centro Estadual de Educação
Tecnológica Paula Souza. Diário Oficial do Estado de São Paulo, Poder Executivo I,
São Paulo, 27 set. 2016. Disponível em: https://fatecregistro.cps.sp.gov.br/regimento/.
Acesso em: 11 mar. 2026.
COOPER, Alan. The Inmates Are Running the Asylum: Why High-Tech Products
Drive Us Crazy and How to Restore the Sanity. Indianapolis: Sams Publishing, 1999.
Disponível em: https://archive.org/details/inmatesarerunnin00coop/mode/2up. Acesso
```
em: 11 mar. 2026.
```
DIAS, Sylmara Lopes Francelino Gonçalves. Catadores: uma perspectiva de sua
```
inserção no campo da indústria de reciclagem (Tese de Doutorado). Universidade de
```
São Paulo, São Paulo, 2009. Disponível em:
```
https://www.teses.usp.br/teses/disponiveis/90/90131/tde-25102010-
```
231013/publico/teseSylmaraprocamusp.pdf. Acesso em: 11 mar. 2026.
DOMÍNGUEZ, Arturo Hernández. Engenharia de software: material didático. Maceió:
Universidade Federal de Alagoas, 2010. Disponível em:
```
https://educapes.capes.gov.br/bitstream/capes/177122/2/Material%20Didatico-Engenhar
```
ia%20de%20Software.pdf. Acesso em: 14 mar. 2026.
DRUCKER, Peter F. Desafios gerenciais para o século XXI. São Paulo: Pioneira, 1999.
ECOARI. Disponível em: https://ecoari.com.br. Acesso em: 11 mar. 2026.
```
ELMASRI, R.; NAVATHE, S. B. Sistemas de Banco de Dados: Fundamentos e
```
Aplicações. 7 ed. São Paulo: Pearson, 2019. Acesso em: 14 mar. 2026.
FATEC FRANCO DA ROCHA. Política Ambiental da Fatec Franco da Rocha.
Disponível em: https://fatecfrancodarocha.cps.sp.gov.br/politica-ambiental/. Acesso em:
11 mar. 2026.
40
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
```
FRANCO DA ROCHA (Município). Plano Municipal de Gestão Integrada de Resíduos
```
Sólidos de Franco da Rocha – PMGIRS/FR: Volume 1 - Relatório Final. São Paulo:
Secretaria de Estado do Meio Ambiente / Coordenadoria de Planejamento Ambiental
```
(CPLA), 2015. Disponível em:
```
```
https://smastr16.blob.core.windows.net/cpla/2017/05/franco-da-rocha-vol.-1.pdf.
```
Acesso em: 6 jun. 2026.
GIL, Antonio Carlos. Como elaborar projetos de pesquisa. 6. ed. São Paulo: Atlas,
2010. Disponível em:
```
https://files.cercomp.ufg.br/weby/up/150/o/Anexo_C1_como_elaborar_projeto_de_pesq
```
uisa_-_antonio_carlos_gil.pdf. Acesso em: 11 mar. 2026.
```
GRAY, Dave; BROWN, Sunni; MACANUFO, James. Gamestorming: A Playbook for
```
Innovators, Rulebreakers, and Changemakers. Sebastopol: O’Reilly Media, 2010.
Disponível em:
```
https://webmemo.ch/wp-content/uploads/2010/05/Gamestormingplaybook-for-innovato
```
rs-rulebreakers-changemakers.pdf. Acesso em: 11 mar. 2026.
HEUSER, Carlos Alberto Heuser. Projeto de banco de dados. 6. ed. Porto Alegre:
Bookman, 2010.
JACOBI, Pedro Roberto. Educação ambiental e o desafio da sustentabilidade
socioambiental. O Mundo da Saúde, São Paulo, v. 30, n. 4, p. 524–531, 2006.
Disponível em:
```
https://bvsms.saude.gov.br/bvs/periodicos/mundo_saude_artigos/educacao_ambiental.p
```
df. Acesso em: 11 mar. 2026.
```
LAKATOS, Eva Maria; MARCONI, Marina de Andrade. Fundamentos de metodologia
```
científica. 8. ed. São Paulo: Atlas, 2017. Disponível em:
```
https://ia804601.us.archive.org/7/items/Fundamentos_de_metodologia_cientfica_8._ed.
```
_-_www.meulivro.biz/Fundamentos_de_metodologia_cientfica_8._ed._-
_www.meulivro.biz.pdf. Acesso em: 11 mar. 2026.
ONU BRASIL. Objetivos de Desenvolvimento Sustentável. NAÇÕES UNIDAS NO
BRASIL, 2025. Disponível em: https://brasil.un.org/pt-br/sdgs. Acesso em: 11 mar.
2026.
ONU BRASIL. Transformando Nosso Mundo: A Agenda 2030 para o Desenvolvimento
Sustentável. NAÇÕES UNIDAS NO BRASIL, 2018. Disponível em:
```
https://brasil.un.org/sites/default/files/2020-09/agenda2030-pt-br.pdf. Acesso em: 11
```
mar. 2026.
```
SÃO PAULO (Estado). Lei nº 10.261, de 28 de outubro de 1968. Dispõe sobre o
```
Estatuto dos Funcionários Públicos Civis do Estado. Disponível em:
```
https://www.al.sp.gov.br/repositorio/legislacao/lei/1968/lei-10261-28.10.1968.html.
```
Acesso em: 6 jun. 2026.
```
SILVA, D. da; SOUZA, L. R. de; MERA, C. M. P. de; BRUTTI, T. A. Sustentabilidade
```
socioambiental e inclusão social: o papel dos catadores na economia circular e a
contribuição das associações para a formação cidadã. Revista Missioneira, Cruz Alta, v.
25, n. 2, p. 51–59, 2023. Disponível em:
41
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
```
https://san.uri.br/revistas/index.php/missioneira/article/view/1479. Acesso em: 11 mar.
```
2026.
SOMMERVILLE, Ian. Engenharia de Software. 9. ed. São Paulo: Pearson Prentice
Hall, 2011. Disponível em:
```
https://www.facom.ufu.br/~william/Disciplinas%202018-2/BSI-GSI030-EngenhariaSof
```
tware/Livro/engenhariaSoftwareSommerville.pdf. Acesso em: 28 mar. 2026.
WALDMAN, Ricardo Libel. Fundamentos Epistemológicos para uma Teoria da Justiça
Internacional Ambiental: uma análise a partir do conflito entre comércio e meio
```
ambiente (Tese de Doutorado). 2008. Disponível em:
```
```
https://lume.ufrgs.br/bitstream/handle/10183/14802/000669406.pdf?sequence=1&isAllo
```
```
wed=y. Acesso em: 11 mar. 2026.
```
YIN, Robert K. Estudo de caso: planejamento e métodos. 5. ed. Porto Alegre:
Bookman, 2015. Disponível em:
```
http://maratavarespsictics.pbworks.com/w/file/fetch/74304716/3-YIN-planejamento_me
```
todologia.pdf. Acesso em: 11 mar. 2026.
42
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
APÊNDICE A – QUESTIONÁRIO UTILIZADO PARA
ELABORAÇÃO DO MAPA DE PROCESSOS
1
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
APÊNDICE B – QUESTIONÁRIO UTILIZADO PARA DESCRIÇÃO
DA PERSONA MARIA
2
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
3
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
APÊNDICE C – QUESTIONÁRIO UTILIZADO PARA DESCRIÇÃO
DAS PERSONAS MICHELE E SILVIA E APOIO NA
ELABORAÇÃO DO MAPA DE EMPATIA
4
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
5
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
APÊNDICE D – MAPAS DAS PERSONAS MICHELE E SILVIA
A segunda persona identificada foi Michele, responsável pela secretaria acadêmica.
Ela realiza a comunicação com a empresa de reciclagem para a retirada de resíduos
recicláveis, mas enfrenta dificuldades devido à falta de alinhamento entre os horários da
instituição e a disponibilidade da empresa. Além disso, a necessidade de juntar uma
quantidade mínima de material antes de solicitar a coleta e a falta de agendamento
prévio tornam o processo mais demorado. Para Michelle, soluções que facilitem a
comunicação com os catadores, permitam acionar vários profissionais disponíveis,
disponibilizem agendamentos e relatórios de gestão seriam fundamentais para tornar o
processo mais eficiente.
```
Fonte: próprias autoras (2026).
```
A terceira persona é Silvia, professora e coordenadora do curso de GTI. Silvia busca
incentivar práticas de reciclagem na instituição, mas enfrenta desafios como o fato de o
processo não ser formal ou organizado, a necessidade de juntar grandes quantidades
antes da coleta, a dificuldade de comunicação com os catadores e a ausência de lixeiras
adequadas. Para ela, soluções como organizar e estimular a separação de recicláveis
entre alunos, professores e demais funcionários, acionar catadores com disponibilidade,
facilitar a comunicação, eliminar a necessidade de acumular grandes volumes de
resíduos e acessar relatórios para planejar ações, incluindo a instalação de lixeiras
adequadas, seriam importantes para melhorar o processo de reciclagem na Fatec.
6
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
```
Fonte: próprias autoras (2026).
```
7
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
APÊNDICE E – PERGUNTAS UTILIZADAS PARA ELABORAÇÃO
DO MAPA DE EMPATIA
8
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
APÊNDICE F – ROTEIRO E ATAS DAS ENTREVISTAS E
FORMULÁRIOS UTILIZADOS PARA LEVANTAMENTO DOS
REQUISITOS
9
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
10
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
11
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
12
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
APÊNDICE G - DIAGRAMAS DE CASO DE USO
UC01 – Manter Usuários
Visualização do Caso de Uso:
Resumo/Sumário: Esse caso de uso permite que o usuário realize o cadastro e altere as informações
cadastrais.
Ator principal: Cidadão Consciente ou Catador
```
Ator(es) Secundário(s): Administrador
```
Pré-condição: Para se cadastrar, o usuário não pode ter cadastro no sistema. Para alterar informações
cadastrais, o usuário precisa ter cadastro no sistema.
Fluxo Principal: Usuário solicita o cadastro no sistema e informa os dados cadastrais.
Ações do Ator
1- Usuário solicita o cadastro no sistema.
```
3- Usuário informa os dados (nome, e-mail,
```
```
telefone e senha).
```
```
5- Usuário seleciona o tipo de perfil (Catador ou
```
```
Cidadão Consciente).
```
7- Usuário acessa o sistema.
Ações do Sistema
2- Sistema disponibiliza um formulário para o
cadastro.
4- Sistema valida os dados informados.
6- Sistema registra o cadastro.
8- Sistema permite a alteração dos dados
cadastrais.
Fluxos Alternativos: Cadastro realizado pelo administrador
Ações do Ator
1.1- Administrador conectado ao sistema pode
realizar cadastro do catador ou cidadão
consciente.
1.3- Administrador informa os dados do usuário.
1.5- Administrador seleciona o tipo de perfil
```
(Catador ou Cidadão Consciente).
```
1.7- Administrador informa as credenciais ao
usuário e ele acessa o sistema.
Ações do Sistema
1.2- Sistema disponibiliza um formulário para o
cadastro.
1.4- Sistema valida os dados informados.
1.6- Sistema registra o cadastro.
1.8- Sistema permite a alteração dos dados
cadastrais pelo próprio usuário ou pelo
administrador.
Fluxos de Exceção:
```
(Passo 3 do fluxo principal) O e-mail informado é inválido ou a senha escolhida não possui, no mínimo,
```
6 dígitos numéricos. O sistema exibe mensagem de erro e então permite nova tentativa de login.
```
(Passo 4 do fluxo principal) No momento do cadastro o sistema de gerenciamento de banco de dados
```
```
estava indisponível (“Erro de conexão com o Banco de Dados”).
```
Pós-condição: Usuário cadastrado com sucesso.
```
Fonte: próprias autoras (2026).
```
13
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
UC02 - Permitir Comunicação
Visualização do Caso de Uso:
Resumo/Sumário: Permite a comunicação entre Catador e Cidadão Consciente, possibilitando também
ao Administrador monitorar e gerenciar as interações.
Ator principal: Cidadão Consciente ou Catador.
```
Ator(es) Secundário(s): Administrador.
```
Pré-condição: Usuários autenticados no sistema.
Fluxo Principal: Usuário inicia conversa pela funcionalidade de comunicação.
Ações do Ator
1- Usuário acessa a funcionalidade de
comunicação.
3- Usuário seleciona um contato ou conversa.
5- Usuário envia uma mensagem.
7- Destinatário visualiza a mensagem.
Ações do Sistema
2- Sistema exibe lista de contatos e mensagens
disponíveis.
4- Sistema exibe a interface de mensagens.
6- Sistema encaminha a mensagem ao destinatário.
8- Sistema registra a comunicação.
Fluxos Alternativos: 3- Publicação de conteúdo informativo pelo Administrador.
Ações do Ator
3.1- Administrador acessa a área de publicações.
3.3- Administrador insere informações
```
(campanhas, orientações, etc.).
```
3.5 Administrador confirma a publicação.
Ações do Sistema
3.2- Sistema exibe opções de criação de
conteúdo.
3.4- Sistema valida os dados.
3.6- Sistema disponibiliza o conteúdo aos
usuários.
Fluxos de Exceção:
```
(Passo 5 do fluxo principal) Caso a mensagem esteja vazia ou inválida, o sistema solicita correção.
```
```
(Passo 6 do fluxo principal) Caso ocorra falha no envio da mensagem, o sistema informa o erro
```
```
(Passo 3.3 do fluxo alternativo) Caso os dados da publicação estejam incompletos, o sistema solicita
```
ajuste.
Pós-condição: Mensagens trocadas entre usuários e conteúdos informativos disponibilizados no
sistema.
```
Fonte: próprias autoras (2026).
```
14
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
UC03 - Manter Materiais
Visualização do Caso de Uso:
Resumo/Sumário: Esse caso de uso permite que o usuário cadastre e altere os materiais para a coleta.
Ator principal: Cidadão Consciente.
```
Ator(es) Secundário(s): Administrador.
```
Pré-condição: Usuário deve possuir cadastro no sistema.
Fluxo Principal: Usuário informa tipo e quantidade dos materiais.
Ações do Ator
1- Usuário seleciona opção “Inserir material para
retirada”
3- Usuário insere as informações dos materiais
Ações do Sistema
2- Sistema direciona para página.
4- Sistema registra os materiais.
Fluxos Alternativos: 1- Se o usuário necessitar mudar as informações dos materiais.
Ações do Ator
1.1- Caso o usuário deseje alterar um material,
seleciona a opção “Editar material para retirada”.
1.3- Usuário altera as informações.
1.5- Usuário confirma a edição.
Ações do Sistema
1.2- Sistema exibe os dados do material
1.4- Sistema valida os dados atualizados.
1.6- Sistema registra a atualização.
Fluxos de Exceção:
```
(Passo 5 do fluxo principal) Caso os dados do material não sejam informados corretamente, o sistema
```
solicita a correção.
```
(Passo 6 do fluxo principal) Caso os dados informados sejam inválidos, o sistema exibe mensagem de
```
erro e não permite o cadastro.
```
(Passo 8 do fluxo principal) Caso ocorra falha no sistema, o material não é registrado.
```
```
(Passo 3.9 do fluxo alternativo) Caso ocorra erro ao excluir o material, o sistema informa a falha e
```
mantém os dados inalterados.
Pós-condição: Material cadastrado, atualizado ou removido com sucesso.
```
Fonte: próprias autoras (2026).
```
15
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
UC04 - Notificar Coleta
Visualização do Caso de Uso:
Resumo/Sumário: Permite ao sistema notificar automaticamente os catadores quando novos materiais
são disponibilizados para coleta.
Ator principal: Catador.
```
Ator(es) Secundário(s): Não se aplica.
```
Pré-condição: Existir materiais cadastrados disponíveis para coleta.
Fluxo Principal: Sistema envia notificação ao Catador sobre novos materiais disponíveis.
Ações do Ator
1- Catador mantém o aplicativo ativo ou habilita
notificações.
6- Catador visualiza a notificação.
Ações do Sistema
2- Sistema monitora a inserção de novos
materiais.
3- Sistema identifica novos materiais disponíveis.
4- Sistema verifica os catadores cadastrados.
5- Sistema envia notificação aos catadores .
Fluxos Alternativos: Catador com notificações desativadas
Ações do Ator
5.1- Catador não possui notificações ativas
Ações do Sistema
5.2- Sistema não envia notificação e mantém o
registro disponível para consulta manual
Fluxos de Exceção:
```
(Passo 5 do fluxo principal) Caso ocorra falha no envio da notificação, o sistema registra o erro e tenta
```
reenviar posteriormente.
```
(Passo 2 do fluxo principal) Caso o sistema não consiga identificar novos materiais, nenhuma
```
notificação é enviada.
Pós-condição: Catadores notificados sobre novos materiais disponíveis para coleta.
```
Fonte: próprias autoras (2026).
```
16
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
UC05 – Agendar Retirada
Visualização do Caso de Uso:
Resumo/Sumário: Permite ao catador agendar a retirada de materiais disponíveis no ponto de coleta.
Ator principal: Catador.
```
Ator(es) Secundário(s): Não aplica.
```
Pré-condição: Usuário autenticado.
Existir materiais disponíveis para coleta na Fatec Franco da Rocha.
Fluxo Principal:
Ações do Ator
1- Catador seleciona a opção “Verificar material
disponível para retirada”.
3- Catador seleciona um material.
5- Catador escolhe data e horário.
7- Catador confirma.
Ações do Sistema
2- Sistema exibe materiais disponíveis.
4- Sistema exibe datas e horários disponíveis na
Fatec.
6- Sistema registra a retirada.
8- Sistema registra o agendamento para retirada
na Fatec.
Fluxos Alternativos: Alterar agendamento.
Ações do Ator
5.1 Catador seleciona outra data/horário.
Ações do Sistema
5.2 Sistema atualiza as opções disponíveis.
Fluxos de Exceção:
```
(Passo 3 do fluxo principal) Caso não existam materiais disponíveis, o sistema informa ao usuário
```
```
(Passo 6 do fluxo principal) Caso o horário selecionado esteja indisponível, o sistema solicita nova
```
escolha.
```
(Passo 8 do fluxo principal) Caso ocorra falha no sistema, o agendamento não é registrado.
```
Pós-condição: Retirada agendada para o ponto de coleta definido.
```
Fonte: próprias autoras (2026).
```
17
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
UC06 – Manter Agenda
Visualização do Caso de Uso:
Resumo/Sumário: Permite ao administrador gerenciar datas e horários disponíveis para coleta de
materiais.
Ator principal: Administrador.
```
Ator(es) Secundário(s): Não aplica.
```
Pré-condição: Administrador autenticado.
Fluxo Principal: Administrador informa datas e horários disponíveis para coleta.
Ações do Ator
1- Administrador seleciona a opção “Calendário
para retirada”.
3- Administrador informa as datas e horários
disponíveis para coleta.
5- Administrador confirma o cadastro.
Ações do Sistema
2- O sistema direciona para página.
4- Sistema valida os dados informados.
6- Sistema registra as informações.
Fluxos Alternativos: Alterar datas e horários.
Ações do Ator
3.1- Administrador seleciona uma data/horário
já cadastrado.
3.3- Administrador altera as informações.
3.5- Administrador confirma a alteração.
Ações do Sistema
3.2- Sistema exibe os dados cadastrados.
3.4- Sistema valida os dados atualizados.
3.6- Sistema registra a atualização.
Fluxos Alternativos: Excluir datas e horários.
Ações do Ator
3.7- Administrador seleciona a opção “Excluir”.
3.9- Administrador confirma a exclusão.
Ações do Sistema
3.8- Sistema solicita confirmação.
3.10- Sistema remove os dados.
Fluxos de Exceção:
```
(Passo 3 do fluxo principal) Caso as datas e horários não sejam informados, o sistema solicita o
```
preenchimento.
```
(Passo 4 do fluxo principal) Caso os dados informados sejam inválidos (ex: horário inconsistente), o
```
sistema exibe mensagem de erro.
```
(Passo 6 do fluxo principal) Caso ocorra falha no sistema, as informações não são registradas.
```
```
(Passo 3.9 do fluxo principal) Caso ocorra erro ao excluir um horário, o sistema informa a falha.
```
Pós-condição: Datas e horários cadastrados, atualizados ou removidos com sucesso.
```
Fonte: próprias autoras (2026).
```
18
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
UC07 – Manter Coletas Retiradas
Visualização do Caso de Uso:
Resumo/Sumário: Permite que o usuário confirme a retirada e edite informações do que cadastrou.
Ator principal: Cidadão Consciente.
```
Ator(es) Secundário(s): Administrador.
```
Pré-condição: Ter coletas registradas.
Fluxo Principal: Cidadão Consciente realiza a confirmação de coleta.
Ações do Ator
1- Cidadão Consciente acessa a opção de coletas.
3- Cidadão Consciente seleciona uma coleta.
5- Cidadão Consciente confirma a retirada.
Ações do Sistema
2- O sistema direciona para página.
4- Sistema exibe os detalhes da coleta.
6- Sistema atualiza o status para “realizada”.
Fluxos Alternativos: Edição de coleta.
Ações do Ator
3.1- Cidadão Consciente seleciona editar coleta.
3.3- Cidadão Consciente altera informações.
3.5- Cidadão Consciente confirma.
Ações do Sistema
3.2- Sistema exibe os dados.
3.4- Sistema valida.
3.6- Sistema resgistra atualização.
Fluxos Alternativos: Gerenciamento de coleta.
Ações do Ator
3.7- Administrador acessa a lista de coletas.
3.9- Administrador seleciona uma coleta.
3.11- Administrador edita, confirma ou cancela a
coleta.
Ações do Sistema
3.8- Sistema exibe todas as coletas cadastradas.
3.10- Sistema exibe os detalhes.
3.12- Sistema atualiza o status ou dados.
Fluxos de Exceção:
```
(Passo 3 do fluxo principal) Caso não existam coletas cadastradas, o sistema informa ao usuário e não
```
permite a continuidade do processo.
```
(Passo 3.3 do fluxo principal e 3.11 do fluxo alternativo) Caso os dados informados na edição sejam
```
inválidos, o sistema solicita correção antes de prosseguir.
Pós-condição: Coleta confirmada, editada, reagendada ou cancelada com sucesso no sistema.
```
Fonte: próprias autoras (2026).
```
19
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
UC08 – Gerar Relatórios
Visualização do Caso de Uso:
Resumo/Sumário: Permite ao administrador e catador visualizar relatórios sobre coletas realizadas,
materiais cadastrados e desempenho dos usuários.
Ator principal: Administrador.
```
Ator(es) Secundário(s): Catador.
```
Pré-condição: Administrador autenticado no sistema.
Fluxo Principal: Administrador solicita a visualização do relatório.
Ações do Ator
1- Administrador acessa a opção “Gerar
relatórios”.
3- Administrador seleciona o tipo de relatório.
5- Administrador informa os critérios desejados.
7- Administrador solicita a visualização.
Ações do Sistema
2- Sistema exibe opções de relatórios
disponíveis.
```
4- Sistema solicita filtros (período, tipo, etc.).
```
6- Sistema processa os dados.
8- Sistema exibe o relatório.
Fluxos Alternativos: Catador solicita a visualização do relatório.
Ações do Ator
1.1- Catador acessa a opção “Gerar relatórios”.
Ações do Sistema
1.2- Sistema exibe o relatório.
Fluxos de Exceção:
```
(Passo 5 do fluxo principal) Caso os filtros não sejam informados corretamente, o sistema solicita
```
ajuste.
```
(Passo 6 do fluxo principal) Caso não existam dados para o relatório, o sistema informa ao usuário.
```
```
(Passo 8 do fluxo principal) Caso ocorra falha no sistema, o relatório não é exibido.
```
Pós-condição: Relatório gerado e disponibilizado ao administrador e catador.
```
Fonte: próprias autoras (2026).
```
20
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
APÊNDICE H – TELAS DE CADASTRO, DEFINIR AGENDA E
EDITAR LOCAL DE RETIRADA
Como na versão mobile, a tela de cadastro na versão web deve solicitar nome, e-mail,
telefone, senha de 6 dígitos, a confirmação de que o usuário é humano e se ele deseja
criar um acesso de Catador ou Cidadão Consciente.
```
Fonte: Próprias autoras (2026).
```
Ao clicar em “Definir Agenda”, deve ser possível cadastrar os dias e horários
disponíveis para que os catadores realizem o agendamento da retirada dos materiais.
Essas informações devem ser apresentadas ao catador no momento do agendamento da
coleta.
21
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
```
Fonte: Próprias autoras (2026).
```
Ao clicar em “Editar Local da Retirada” deve ser possível selecionar o local no mapa
ou digitar o endereço. Esse será o endereço exibido ao catador quando as coletas forem
disponibilizadas.
```
Fonte: Próprias autoras (2026).
```
22
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
ANEXO A – AUTORIZAÇÃO DA INSTITUIÇÃO
1
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
ANEXO B – FOTOGRAFIAS DOS RESÍDUOS ARMAZENADOS
NA FATEC FRANCO DA ROCHA
2
V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026
ANEXO C – FOTOGRAFIAS DAS LIXEIRAS PARA COLETA
SELETIVA DISPONIBILIZADAS NA FATEC FRANCO DA ROCHA
3
##### V SIMBAJU – FATEC FRANCO DA ROCHA – JUNHO DE 2026